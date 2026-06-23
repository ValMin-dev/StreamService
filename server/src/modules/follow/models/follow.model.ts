import { Field, ObjectType } from '@nestjs/graphql'
import { Follow } from '@prisma/client'
import { UserModel } from '../../auth/account/models/user.model'

@ObjectType()
export class FollowModel implements Follow {
	@Field(() => String)
	id: string

	@Field(() => UserModel)
	follower: UserModel

	@Field(() => String)
	followerId: string

	@Field(() => UserModel)
	following: UserModel

	@Field(() => String)
	followingId: string

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
