import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { FollowService } from './follow.service'
import { FollowInput } from './inputs/follow.input'
import { User } from '@prisma/client'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { UserModel } from '../auth/account/models/user.model'

@Resolver('Follow')
export class FollowResolver {
	constructor(private readonly followService: FollowService) {}

	@Mutation(() => Boolean, { name: 'follow' })
	@Authorization()
	async followUser(
		@Authorized() user: User,
		@Args('data') input: FollowInput
	) {
		return this.followService.follow(user, input)
	}
	@Mutation(() => Boolean, { name: 'unFollow' })
	@Authorization()
	async unFollowUser(
		@Authorized() user: User,
		@Args('data') input: FollowInput
	) {
		return this.followService.unFollow(user, input)
	}

	@Mutation(() => [UserModel], { name: 'findMyFollowers' })
	@Authorization()
	async findMyFollowers(@Authorized() user: User) {
		return this.followService.findMyFollowers(user)
	}

	@Mutation(() => [UserModel], { name: 'findMyFollowings' })
	@Authorization()
	async findMyFollowings(@Authorized() user: User) {
		return this.followService.findMyFollowings(user)
	}
}
