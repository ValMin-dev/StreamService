import { PrismaService } from '@/src/core/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { LoginInput } from './inputs/login.input'
import { verify } from 'argon2'
import type { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { RedisService } from '@/src/core/redis/redis.service'
import { destroySession, saveSession } from '@/src/shared/utils/session.util'
import { VerificationService } from '../verification/verification.service'
import { TOTP } from 'otpauth'

@Injectable()
export class SessionService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
		private readonly redisService: RedisService,
		private readonly verificationService: VerificationService
	) {}

	async findByUser(req: Request) {
		const userId = req.session?.userId
		if (!userId) {
			throw new BadRequestException('Unauthorized')
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
			throw new BadRequestException('Session not found')
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
			throw new BadRequestException(
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
		const { login, password, pin } = input

		const user = await this.prisma.user.findFirst({
			where: {
				OR: [
					{ email: { equals: login } },
					{ username: { equals: login } }
				]
			}
		})
		if (!user) {
			throw new BadRequestException('Invalid login credentials')
		}

		if (!user.isEmailVerified) {
			await this.verificationService.sendVerificationToken(user)
			throw new BadRequestException(
				'Email not verified. A new verification email has been sent.'
			)
		}

		const isPasswordValid = await verify(user.password, password)
		if (!isPasswordValid) {
			throw new BadRequestException('Invalid login credentials')
		}

		if (user.isTotpEnabled) {
			if (!pin) {
				return {
					user: null,
					message: 'TOTP code required'
				}
			}
			const totp = new TOTP({
				issuer: 'TwitchCopy',
				label: `${user.email}`,
				algorithm: 'SHA1',
				digits: 6,
				secret: user.totpSecret
			})
			const delta = totp.validate({ token: pin })
			if (delta === null) {
				throw new BadRequestException('Invalid TOTP code')
			}
		}

		const metadata = getSessionMetadata(req, userAgent)

		const savedUser = await saveSession(req, user, metadata)
		return {
			user: savedUser,
			message: null
		}
	}

	async logout(req: Request) {
		return destroySession(req, this.configService)
	}
}
