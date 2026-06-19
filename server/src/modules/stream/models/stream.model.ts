import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Stream } from '@prisma/client'
import { CategoryModel } from '../../category/models/category.model'
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

	@Field(() => String)
	userId: string

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
