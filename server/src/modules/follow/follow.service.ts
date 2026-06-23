import { PrismaService } from '@/src/core/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { FollowInput } from './inputs/follow.input'

@Injectable()
export class FollowService {
	constructor(private readonly prisma: PrismaService) {}

	async findMyFollowers(user: User) {
		const followers = await this.prisma.follow.findMany({
			where: { followingId: user.id },
			orderBy: { createdAt: 'desc' },
			include: {
				follower: true
			}
		})
		return followers.map(follow => follow.follower)
	}

	async findMyFollowings(user: User) {
		const followings = await this.prisma.follow.findMany({
			where: { followerId: user.id },
			orderBy: { createdAt: 'desc' },
			include: {
				following: true
			}
		})
		return followings.map(follow => follow.following)
	}

	async follow(user: User, input: FollowInput) {
		const { followingId } = input
		if (user.id === followingId) {
			throw new BadRequestException('You cannot follow yourself.')
		}
		const existingFollow = await this.prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId: user.id,
					followingId: followingId
				}
			}
		})

		if (existingFollow) {
			throw new BadRequestException(
				'You are already following this channel.'
			)
		}

		await this.prisma.follow.create({
			data: {
				follower: { connect: { id: user.id } },
				following: { connect: { id: followingId } }
			}
		})
		return true
	}

	async unFollow(user: User, input: FollowInput) {
		const { followingId } = input
		const existingFollow = await this.prisma.follow.findFirst({
			where: {
				followerId: user.id,
				followingId: followingId
			}
		})
		if (!existingFollow) {
			throw new BadRequestException('You are not following this channel.')
		}
		await this.prisma.follow.delete({
			where: {
				id: existingFollow.id,
				followerId: user.id,
				followingId: followingId
			}
		})
		return true
	}
}
