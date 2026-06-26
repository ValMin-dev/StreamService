import { InputType, Field } from '@nestjs/graphql'
import { NotificationType } from '@prisma/client'
import { IsString } from 'class-validator'

@InputType()
export class NotificationInput {
	@Field(() => String)
	@IsString()
	userId: string

	@Field(() => String)
	@IsString()
	message: string

	@Field(() => NotificationType)
	type: NotificationType
}
