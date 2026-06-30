import { ConfigService } from '@nestjs/config'
import { MailerOptions } from '@nestjs-modules/mailer'

// Конфігурація описує SMTP-підключення та стандартного відправника для листів.
export function getMailerConfig(configService: ConfigService): MailerOptions {
	return {
		transport: {
			host: configService.getOrThrow<string>('MAIL_HOST'),
			port: configService.getOrThrow<number>('MAIL_PORT'),
			auth: {
				user: configService.getOrThrow<string>('MAIL_LOGIN'),
				pass: configService.getOrThrow<string>('MAIL_PASS')
			},
			secure: false
		},
		defaults: {
			from: `"No Reply" <${configService.getOrThrow<string>('MAIL_LOGIN')}>`
		}
	}
}
