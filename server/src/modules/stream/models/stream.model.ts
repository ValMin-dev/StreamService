import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Stream } from '@prisma/client'
import { CategoryModel } from '../../category/models/category.model'
import { ChatMessageModel } from '../../chat/models/chat.model'
import { UserModel } from '../../auth/account/models/user.model'
@ObjectType()
export class StreamModel implements Stream {
	@Field(() => ID)
	id: string

	@Field(() => String)
	title: string

	@Field(() => String, { nullable: true })
	thumbnailUrl: string

	@Field(() => String, { nullable: true })
	serverUrl: string | null

	@Field(() => String, { nullable: true })
	streamKey: string | null

	@Field(() => String, { nullable: true })
	ingressId: string | null

	@Field(() => Boolean)
	isLive: boolean

	@Field(() => CategoryModel, { nullable: true })
	category: CategoryModel | null

	@Field(() => String, { nullable: true })
	categoryId: string | null

	@Field(() => UserModel)
	user: UserModel

	@Field(() => String)
	userId: string

	@Field(() => Boolean)
	isChatEnabled: boolean

	@Field(() => Boolean)
	isChatFollowersOnly: boolean

	@Field(() => Boolean)
	isChatPremiumOnly: boolean

	@Field(() => [ChatMessageModel], { nullable: true })
	chatMessages?: ChatMessageModel[]

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
