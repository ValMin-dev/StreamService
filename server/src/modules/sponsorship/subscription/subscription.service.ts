import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'

@Injectable()
export class SubscriptionService {
	constructor(private readonly prisma: PrismaService) {}

	async findMySponsors(user: User) {
		const sponsors = await this.prisma.sponsorshipSubscription.findMany({
			where: {
				channelId: user.id
			},
			include: {
				plan: true,
				user: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
		return sponsors
	}

	async findSponsorByChannel(channelId: string) {
		const sponsors = await this.prisma.sponsorshipSubscription.findMany({
			where: {
				channelId
			},
			include: {
				plan: true,
				user: true,
				channel: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
		return sponsors
	}
}
