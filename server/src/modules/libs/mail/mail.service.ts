import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config/dist/config.service'
import { VerificationTemplate } from './templates/verification.template'
import { render } from '@react-email/components'

@Injectable()
export class MailService {
	constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}
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
