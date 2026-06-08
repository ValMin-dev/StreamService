import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { LoginInput } from './inputs/login.input'
import { verify } from 'argon2'
import type { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { RedisService } from '@/src/core/redis/redis.service'

@Injectable()
export class SessionService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
		private readonly redisService: RedisService
	) {}

	async findByUser(req: Request) {
		const userId = req.session?.userId
		if (!userId) {
			throw new Error('Unauthorized')
		}
		const keys = await this.redisService.keys('*')
		const userSessions = []
		for (const key of keys) {
			const session = await this.redisService.get(key)
			if (session) {
				const sessions = JSON.parse(session)
				if (sessions.userId === userId) {
					userSessions.push({ ...sessions, id: key.split(':')[1] })
				}
			}
		}

		userSessions.sort((a, b) => b.createdAt - a.createdAt)
		return userSessions.filter(session => session.id !== req.session.id)
	}

	async findCurrent(req: Request) {
		const sessionId = req.session.id
		const session = await this.redisService.get(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
		)

		if (!session) {
			throw new Error('Session not found')
		}
		const sessionData = JSON.parse(session)
		return { ...sessionData, id: sessionId }
	}

	async clearSession(req: Request) {
		req.res?.clearCookie(
			this.configService.getOrThrow<string>('SESSION_COOKIE_NAME')
		)
		return true
	}

	async remove(req: Request, sessionId: string) {
		if (sessionId === req.session.id) {
			throw new Error(
				'Cannot remove current session using this endpoint. Use clearSession instead.'
			)
		}

		await this.redisService.del(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
		)
		return true
	}

	async me(id: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: id
			}
		})
		return user
	}

	async login(req: Request, input: LoginInput, userAgent: string) {
		const { login, password } = input

		const user = await this.prisma.user.findFirst({
			where: {
				OR: [
					{ email: { equals: login } },
					{ username: { equals: login } }
				]
			}
		})
		if (!user) {
			throw new Error('Invalid login credentials')
		}

		const isPasswordValid = await verify(user.password, password)
		if (!isPasswordValid) {
			throw new Error('Invalid login credentials')
		}
		const metadata = getSessionMetadata(req, userAgent)

		return new Promise((resolve, reject) => {
			req.session.userId = user.id
			req.session.createdAt = new Date()
			req.session.metadata = metadata
			req.session.save(err => {
				if (err) {
					return reject(new Error('Failed to save session'))
				}
				console.log('Session saved successfully:', user)
				resolve(user)
			})
		})
	}

	async logout(req: Request) {
		return new Promise((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					return reject(new Error('Failed to destroy session'))
				} else {
					const cookieName = this.configService.getOrThrow<string>(
						'SESSION_COOKIE_NAME'
					)
					const cookieDomain = this.configService.getOrThrow<string>(
						'SESSION_COOKIE_DOMAIN'
					)
					req.res?.clearCookie(cookieName, {
						domain: cookieDomain,
						path: '/',
						httpOnly: true,
						sameSite: 'lax',
						secure: req.secure
					})
					resolve(true)
				}
			})
		})
	}
}
