import { Field, ID, ObjectType } from '@nestjs/graphql'
import { SocialLink } from '@prisma/client'

@ObjectType()
export class SocialLinkModel implements SocialLink {
	@Field(() => ID)
	id: string

	@Field(() => String)
	title: string

	@Field(() => String)
	url: string

	@Field(() => String)
	userId: string

	@Field(() => Number)
	position: number

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
