import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config/dist/config.service'
import { VerificationTemplate } from './templates/verification.template'
import { render } from '@react-email/components'
import { PasswordRecoveryTemplate } from './templates/password-recovery.template'
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types'
import { DeactivateTemplate } from './templates/deactivate.template'
import { AccountDeletionTemplate } from './templates/account-deletion.template'

@Injectable()
export class MailService {
	constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	async sendAccountDeletionEmail(email: string) {
		// const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const domain = this.configService.getOrThrow<string>('MAIL_DOMAIN')
		const html = await render(AccountDeletionTemplate({ domain }))
		return this.sendMail(email, 'Account Deletion Confirmation', html)
	}

	async sendAccountDeactivationEmail(
		email: string,
		token: string,
		metadata: SessionMetadata
	) {
		const html = await render(DeactivateTemplate({ token, metadata }))
		return this.sendMail(email, 'Account Deactivation', html)
	}

	async sendPasswordRecoveryEmail(
		email: string,
		token: string,
		metadata: SessionMetadata
	) {
		const domain = this.configService.getOrThrow<string>('MAIL_DOMAIN')
		const html = await render(
			PasswordRecoveryTemplate({ domain, token, metadata })
		)
		return this.sendMail(email, 'Password Recovery', html)
	}

	async sendVerificationEmail(email: string, token: string) {
		// const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const domain = this.configService.getOrThrow<string>('MAIL_DOMAIN')
		const html = await render(VerificationTemplate({ domain, token }))

		return this.sendMail(email, 'Email Verification', html)
	}

	private sendMail(email: string, subject: string, html: string) {
		return this.mailerService.sendMail({
			to: email,
			subject,
			html
		})
	}
}
