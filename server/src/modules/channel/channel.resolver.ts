import { Args, Query, Resolver } from '@nestjs/graphql'
import { ChannelService } from './channel.service'
import { UserModel } from '../auth/account/models/user.model'

@Resolver('Channel')
export class ChannelResolver {
	constructor(private readonly channelService: ChannelService) {}

	@Query(() => [UserModel], { name: 'findRecommended' })
	async findRecommended() {
		return this.channelService.findRecommended()
	}

	@Query(() => UserModel, { name: 'channelChannelByUsername' })
	async channelChannelByUsername(@Args('username') username: string) {
		return this.channelService.findByUserName(username)
	}

	@Query(() => Number, { name: 'channelFollowersCount' })
	async channelFollowersCount(@Args('channelId') channelId: string) {
		return this.channelService.findFollowersCountByChannel(channelId)
	}
}
