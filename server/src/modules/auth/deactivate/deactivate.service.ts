import { PrismaService } from '@/src/core/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { MailService } from '../../libs/mail/mail.service'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import { TokenType, type User } from '@prisma/client'
import { destroySession } from '@/src/shared/utils/session.util'
import { generateToken } from '@/src/shared/utils/generate-token.util'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { DeactivateAccountInput } from './inputs/deactivate-account.input'
import { verify } from 'argon2'
import { TelegramService } from '../../libs/telegram/telegram.service'

// Сервіс керує деактивацією акаунта: перевіряє дані користувача, надсилає токен і завершує сесію після підтвердження.
@Injectable()
export class DeactivateService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService,
		private readonly telegramService: TelegramService
	) {}

	async deactivate(
		req: Request,
		input: DeactivateAccountInput,
		user: User,
		userAgent: string
	) {
		const { email, password, pin } = input

		const notificationSettings =
			await this.prisma.notificationSettings.findUnique({
				where: {
					userId: user.id
				}
			})

		if (email !== user.email) {
			throw new BadRequestException('Електронна пошта не збігається')
		}
		const isValidPassword = await verify(user.password, password)
		if (!isValidPassword) {
			throw new BadRequestException('Пароль не збігається')
		}

		if (!pin) {
			await this.sendDeactivateToken(req, user, userAgent)
			return { message: 'Токен для деактивації надіслано на пошту' }
		}
		await this.validateDeactivateToken(req, pin)

		if (user.telegramId && notificationSettings?.telegramNotifications) {
			await this.telegramService.sendSuccessDeactivationMessage(
				user.telegramId
			)
		}

		return { user }
	}

	// Перевіряє токен деактивації, змінює стан користувача і завершує активну сесію.
	async validateDeactivateToken(req: Request, token: string) {
		const existingToken = await this.prisma.token.findUnique({
			where: {
				token,
				type: TokenType.DEACTIVATE_ACCOUNT
			}
		})
		if (!existingToken) {
			throw new BadRequestException('Неправильний токен')
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()
		if (hasExpired) {
			throw new BadRequestException('Термін дії токена минув')
		}

		await this.prisma.user.update({
			where: {
				id: existingToken.userId
			},
			data: {
				isDeactivated: true,
				deactivatedAt: new Date()
			}
		})

		await this.prisma.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.DEACTIVATE_ACCOUNT
			}
		})

		return destroySession(req, this.configService)
	}

	// Генерує токен деактивації та відправляє лист із підтвердженням.
	async sendDeactivateToken(req: Request, user: User, userAgent: string) {
		const deactivateToken = await generateToken(
			this.prisma,
			user,
			TokenType.DEACTIVATE_ACCOUNT,
			false
		)
		const metadata = getSessionMetadata(req, userAgent)

		await this.mailService.sendAccountDeactivationEmail(
			user.email,
			deactivateToken.token,
			metadata
		)

		if (
			deactivateToken.user?.telegramId &&
			deactivateToken.user?.notificationSettings?.telegramNotifications
		) {
			await this.telegramService.sendDeactivateAccountToken(
				deactivateToken.user.telegramId,
				deactivateToken.token,
				metadata
			)
		}

		return true
	}
}
