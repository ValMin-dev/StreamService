import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Stream } from '@prisma/client'
@ObjectType()
export class StreamModel implements Stream {
	@Field(() => ID)
	id: string

	@Field(() => String)
	title: string

	@Field(() => String, { nullable: true })
	thumbnailUrl: string | null

	@Field(() => String, { nullable: true })
	serverUrl: string | null

	@Field(() => String, { nullable: true })
	streamKey: string | null

	@Field(() => String, { nullable: true })
	ingressId: string | null

	@Field(() => Boolean)
	isLive: boolean

	@Field(() => String)
	userId: string

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
