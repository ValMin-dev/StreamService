import { Field, ObjectType } from '@nestjs/graphql'
import { UserModel } from '../../auth/account/models/user.model'
import { NotificationSettings } from '@prisma/client'

@ObjectType()
export class NotificationSettingsModel implements NotificationSettings {
	@Field(() => String)
	id: string

	@Field(() => UserModel)
	user: UserModel

	@Field(() => String)
	userId: string

	@Field(() => Boolean, { nullable: true })
	siteNotifications: boolean

	@Field(() => Boolean, { nullable: true })
	telegramNotifications: boolean

	@Field(() => Date)
	createdAt: Date
	@Field(() => Date)
	updatedAt: Date
}

@ObjectType()
export class ChangeNotificationSettingsResponse {
	@Field(() => String, { nullable: true })
	telegramToken?: string

	@Field(() => NotificationSettingsModel)
	notificationSettings: NotificationSettingsModel
}
