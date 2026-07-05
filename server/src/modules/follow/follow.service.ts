import { TelegramService } from './../libs/telegram/telegram.service'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { FollowInput } from './inputs/follow.input'
import { NotificationService } from '../notification/notification.service'

// Сервіс керує підписками: показує підписників/підписки, створює follow-зв'язок і за потреби генерує нотифікацію.
@Injectable()
export class FollowService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationService: NotificationService,
		private readonly telegramService: TelegramService
	) {}

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
			throw new BadRequestException('Не можна підписатися на самого себе')
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
			throw new BadRequestException('Ви вже підписані на цей канал')
		}

		// Створюємо запис про підписку та забираємо дані автора каналу разом із налаштуваннями нотифікацій.
		const follow = await this.prisma.follow.create({
			data: {
				follower: { connect: { id: user.id } },
				following: { connect: { id: followingId } }
			},
			include: {
				follower: true,
				following: {
					include: {
						notificationSettings: true
					}
				}
			}
		})
		// Якщо у власника каналу увімкнені site-нотифікації, створюємо повідомлення про нового підписника.
		if (follow.following.notificationSettings?.siteNotifications) {
			await this.notificationService.createNewFollowing(
				follow.following,
				follow.follower
			)
		}

		if (
			follow.following.notificationSettings?.telegramNotifications &&
			follow.following.telegramId
		) {
			await this.telegramService.newFollowMessage(
				follow.following.telegramId,
				follow.follower
			)
		}

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
			throw new BadRequestException('Ви не підписані на цей канал')
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
