import { BadRequestException, Injectable } from '@nestjs/common'
import { MailService } from '../../libs/mail/mail.service'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { ResetPasswordInput } from './inputs/reset-password.input'
import { generateToken } from '@/src/shared/utils/generate-token.util'
import { TokenType } from '@prisma/client'
import type { Request } from 'express'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { NewPasswordInput } from './inputs/new-password.input'
import { hash } from 'argon2'
// Сервіс обробляє відновлення пароля: створює токен, надсилає лист і встановлює новий пароль.
@Injectable()
export class PasswordRecoveryService {
	constructor(
		private readonly mailService: MailService,
		private readonly prisma: PrismaService
	) {}

	async newPassword(input: NewPasswordInput) {
		const { password, token } = input
		const existingToken = await this.prisma.token.findUnique({
			where: {
				token,
				type: TokenType.PASSWORD_RESET
			},
			include: {
				user: true
			}
		})
		if (!existingToken) {
			throw new BadRequestException('Неправильний токен')
		}

		const hasExpired = existingToken.expiresIn < new Date()
		if (hasExpired) {
			throw new BadRequestException('Термін дії токена минув')
		}

		await this.prisma.user.update({
			where: {
				id: existingToken.user.id
			},
			data: {
				password: await hash(password)
			}
		})
		await this.prisma.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.PASSWORD_RESET
			}
		})
		return true
	}

	async resetPassword(
		req: Request,
		input: ResetPasswordInput,
		userAgent: string
	) {
		const { email } = input
		const user = await this.prisma.user.findUnique({
			where: {
				email
			}
		})
		if (!user) {
			throw new BadRequestException(
				'Користувача з такою електронною поштою не існує'
			)
		}
		const resetToken = await generateToken(
			this.prisma,
			user,
			TokenType.PASSWORD_RESET
		)
		const metadata = getSessionMetadata(req, userAgent)

		await this.mailService.sendPasswordRecoveryEmail(
			user.email,
			resetToken.token,
			metadata
		)
		return true
	}
}
