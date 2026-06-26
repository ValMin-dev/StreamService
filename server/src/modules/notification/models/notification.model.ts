import { ObjectType, Field, registerEnumType } from '@nestjs/graphql'
import { NotificationType, Notification } from '@prisma/client'
import { UserModel } from '../../auth/account/models/user.model'

registerEnumType(NotificationType, {
	name: 'NotificationType',
	description: 'The type of notification'
})

@ObjectType()
export class NotificationModel implements Notification {
	@Field(() => String)
	id: string

	@Field(() => UserModel)
	user: UserModel

	@Field(() => String)
	userId: string

	@Field(() => String)
	message: string

	@Field(() => NotificationType)
	type: NotificationType

	@Field(() => Boolean)
	isRead: boolean

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
