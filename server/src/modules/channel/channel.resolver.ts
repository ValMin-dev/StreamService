import { Args, Query, Resolver } from '@nestjs/graphql'
import { ChannelService } from './channel.service'
import { UserModel } from '../auth/account/models/user.model'

// GraphQL-резолвер віддає дані каналу клієнту.
@Resolver('Channel')
export class ChannelResolver {
	constructor(private readonly channelService: ChannelService) {}

	@Query(() => [UserModel], { name: 'findRecommended' })
	async findRecommended() {
		return this.channelService.findRecommended()
	}

	@Query(() => UserModel, { name: 'findChannelByUsername' })
	async findChannelByUsername(@Args('username') username: string) {
		return this.channelService.findByUserName(username)
	}

	@Query(() => Number, { name: 'channelFollowersCount' })
	async channelFollowersCount(@Args('channelId') channelId: string) {
		return this.channelService.findFollowersCountByChannel(channelId)
	}
}
