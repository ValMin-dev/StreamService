import { Field, ObjectType } from '@nestjs/graphql'

// Модель повертає користувачу QR-код і секрет для підключення TOTP.
@ObjectType()
export class TotpModel {
	@Field(() => String)
	qrCodeUrl: string

	@Field(() => String)
	secret: string
}
