import { Field, InputType } from '@nestjs/graphql'
import { IsBoolean } from 'class-validator'

@InputType()
export class ChangeNotificationsSettingsInput {
	@Field(() => Boolean, { nullable: true })
	@IsBoolean()
	siteNotifications: boolean

	@Field(() => Boolean, { nullable: true })
	@IsBoolean()
	telegramNotifications: boolean
}
