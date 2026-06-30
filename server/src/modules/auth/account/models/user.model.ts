import { Field, ID, ObjectType } from '@nestjs/graphql'
import { User } from '@prisma/client'
import { SocialLinkModel } from '../../profile/model/social-link.model'
import { StreamModel } from '@/src/modules/stream/models/stream.model'
import { FollowModel } from '@/src/modules/follow/models/follow.model'
import { NotificationSettingsModel } from '@/src/modules/notification/models/notification-settings.model'
import { NotificationModel } from '@/src/modules/notification/models/notification.model'

// GraphQL-модель користувача описує всі поля профілю, зв'язки та додаткові дані акаунта.
@ObjectType()
export class UserModel implements User {
	@Field(() => ID)
	id: string

	@Field(() => String)
	username: string

	@Field(() => String)
	displayName: string

	@Field(() => String)
	email: string

	@Field(() => String)
	password: string

	@Field(() => String, { nullable: true })
	avatarUrl: string | null

	@Field(() => String, { nullable: true })
	bio: string | null

	@Field(() => String, { nullable: true })
	telegramId: string | null

	@Field(() => [SocialLinkModel], { nullable: true })
	socialLinks: SocialLinkModel[] | null

	@Field(() => StreamModel, { nullable: true })
	stream: StreamModel | null

	@Field(() => Boolean)
	isVerified: boolean

	@Field(() => Boolean)
	isEmailVerified: boolean

	@Field(() => Boolean)
	isTotpEnabled: boolean

	@Field(() => String, { nullable: true })
	totpSecret: string | null

	@Field(() => Boolean)
	isDeactivated: boolean

	@Field(() => Date, { nullable: true })
	deactivatedAt: Date | null

	@Field(() => [FollowModel], { nullable: true })
	followers: FollowModel[] | null

	@Field(() => [FollowModel], { nullable: true })
	followings: FollowModel[] | null

	@Field(() => NotificationSettingsModel, { nullable: true })
	notificationSettings: NotificationSettingsModel | null

	@Field(() => [NotificationModel], { nullable: true })
	notifications: NotificationModel[] | null

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
