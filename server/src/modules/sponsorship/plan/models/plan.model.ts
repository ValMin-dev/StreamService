import { UserModel } from '@/src/modules/auth/account/models/user.model'
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { SponsorshipPlan } from '@prisma/client'

@ObjectType()
export class PlanModel implements SponsorshipPlan {
	@Field(() => ID)
	id: string

	@Field(() => String)
	title: string

	@Field(() => String, { nullable: true })
	description: string

	@Field(() => Number)
	price: number

	@Field(() => String)
	stripePlanId: string

	@Field(() => String)
	stripeProductId: string

	@Field(() => UserModel)
	channel: UserModel

	@Field(() => String)
	channelId: string

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
