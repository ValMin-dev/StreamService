import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import type { Request } from 'express'
import { PrismaService } from 'src/core/prisma/prisma.service'
import { LoginInput } from './inputs/login.input'
import { getSessionMetadata } from 'src/shared/utils/session-metadata.util'
import { RedisService } from 'src/core/redis/redis.service'
import { SessionData } from 'express-session'

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly redisService: RedisService
	) {}

	async findCurrent(req: Request) {
		const sessionId = req.session.id
		const sessionData = await this.redisService.get(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
		)
		if (!sessionData) {
			return null
		}
		const session = JSON.parse(sessionData) as SessionData
		return { ...session, id: sessionId }
	}

	async findByUser(req: Request) {
		const userId = req.session.userId
		if (!userId) {
			return null
		}
		const keys = await this.redisService.get('*')
		const sessions: SessionData[] = []
		if (!keys) {
			return []
		}
		for (const key of keys) {
			const session = await this.redisService.get(key)
			if (session) {
				const parsedSession = JSON.parse(session) as Omit<SessionData, 'id'> & {
					userId?: string
				}
				if (parsedSession.userId === userId) {
					sessions.push({
						...parsedSession,
						id: key.split(':')[1] // Extract session ID from the Redis key
					})
				}
			}
		}
		sessions.sort((a, b) => {
			const left = a.createdAt ? new Date(a.createdAt).getTime() : 0
			const right = b.createdAt ? new Date(b.createdAt).getTime() : 0
			return right - left
		})
		return sessions.filter(session => session.userId !== req.session.userId) // Exclude current session
	}

	async login(req: Request, input: LoginInput, userAgent: string) {
		const { login, password } = input
		const user = await this.prismaService.users.findFirst({
			where: {
				OR: [{ username: { equals: login } }, { email: { equals: login } }]
			}
		})
		if (!user) {
			throw new InternalServerErrorException('Invalid credentials')
		}

		const isValidPassword = await verify(user.password, password)
		if (!isValidPassword) {
			throw new InternalServerErrorException('Invalid credentials')
		}

		const metadata = getSessionMetadata(req, userAgent)

		return new Promise((resolve, reject) => {
			req.session.userId = user.id
			req.session.createdAt = new Date()
			req.session.metadata = metadata
			req.session.save(err => {
				if (err) {
					return reject(
						new InternalServerErrorException('Failed to save session')
					)
				}
				resolve(user)
			})
		})
	}

	async logout(req: Request) {
		return new Promise((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					return reject(
						new InternalServerErrorException('Failed to destroy session')
					)
				}
				req.res?.clearCookie(
					this.configService.getOrThrow<string>('SESSION_NAME')
				)
				resolve(true)
			})
		})
	}

	async clearSession(req: Request) {
		req.res?.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
		return true
	}

	async removeOtherSessions(req: Request, id: string) {
		if (req.session.id === id) {
			throw new InternalServerErrorException('Cannot remove current session')
		}
		await this.redisService.del(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`
		)
		return true
	}
}
