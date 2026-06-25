import { PrismaService } from '@/src/core/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'

@Injectable()
export class ChannelService {
	constructor(private readonly prisma: PrismaService) {}

	async findRecommended() {
		const channels = await this.prisma.user.findMany({
			where: {
				isDeactivated: false
			},
			orderBy: {
				followers: {
					_count: 'desc'
				}
			},
			include: { stream: true },
			take: 7
		})
		return channels
	}

	async findByUserName(username: string) {
		const channel = await this.prisma.user.findUnique({
			where: { username },
			include: {
				socialLinks: { orderBy: { position: 'desc' } },
				stream: {
					include: {
						category: true
					}
				},
				followings: true
			}
		})

		if (!channel) {
			throw new BadRequestException(
				`Channel with username ${username} not found.`
			)
		}

		return channel
	}

	async findFollowersCountByChannel(channelId: string) {
		const followersCount = await this.prisma.follow.count({
			where: { followingId: channelId }
		})
		return followersCount
	}
}
