import { Field, ObjectType } from '@nestjs/graphql'
import { ChatMessage } from '@prisma/client'
import { UserModel } from '../../auth/account/models/user.model'
import { StreamModel } from '../../stream/models/stream.model'

@ObjectType()
export class ChatMessageModel implements ChatMessage {
	@Field(() => String)
	id: string

	@Field(() => StreamModel)
	stream: StreamModel

	@Field(() => String)
	streamId: string

	@Field(() => UserModel)
	user: UserModel

	@Field(() => String)
	userId: string

	@Field(() => String)
	text: string

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
