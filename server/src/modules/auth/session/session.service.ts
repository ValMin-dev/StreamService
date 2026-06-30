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

// Сервіс керує входом, сесіями, TOTP-перевіркою та списком активних сесій користувача.
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
			throw new BadRequestException('Неавторизований доступ')
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
			throw new BadRequestException('Сесію не знайдено')
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
				'Неможливо видалити поточну сесію цим ендпоінтом. Використайте clearSession.'
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
			throw new BadRequestException('Невірні дані для входу')
		}

		if (!user.isEmailVerified) {
			await this.verificationService.sendVerificationToken(user)
			throw new BadRequestException(
				'Електронну пошту не підтверджено. Новий лист для підтвердження надіслано.'
			)
		}

		const isPasswordValid = await verify(user.password, password)
		if (!isPasswordValid) {
			throw new BadRequestException('Невірні дані для входу')
		}

		if (user.isTotpEnabled) {
			if (!pin) {
				return {
					user: null,
					message: 'Потрібен код TOTP'
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
				throw new BadRequestException('Невірний код TOTP')
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
