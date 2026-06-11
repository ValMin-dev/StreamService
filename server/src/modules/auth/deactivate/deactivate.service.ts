import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { MailService } from '../../libs/mail/mail.service'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import { TokenType, type User } from '@prisma/client'
import { destroySession } from '@/src/shared/utils/session.util'
import { generateToken } from '@/src/shared/utils/generate-token.util'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { DeactivateAccountInput } from './inputs/deactivate-account.input'
import { verify } from 'argon2'
@Injectable()
export class DeactivateService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService
	) {}

	async deactivate(
		req: Request,
		input: DeactivateAccountInput,
		user: User,
		userAgent: string
	) {
		const { email, password, pin } = input

		if (email !== user.email) {
			throw new Error('Email does not match')
		}
		const isValidPassword = await verify(user.password, password)
		if (!isValidPassword) {
			throw new Error('Password does not match')
		}

		if (!pin) {
			await this.sendDeactivateToken(req, user, userAgent)
			return { message: 'Deactivation token sent to email' }
		}
		await this.validateDeactivateToken(req, pin)
		return { user }
	}

	async validateDeactivateToken(req: Request, token: string) {
		const existingToken = await this.prisma.token.findUnique({
			where: {
				token,
				type: TokenType.DEACTIVATE_ACCOUNT
			}
		})
		if (!existingToken) {
			throw new Error('Invalid token')
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()
		if (hasExpired) {
			throw new Error('Token has expired')
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
		return true
	}
}
