import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { NotificationType, TokenType, User } from '@prisma/client'
import { ChangeNotificationsSettingsInput } from './inputs/change-notifications-settings.input'
import { generateToken } from '@/src/shared/utils/generate-token.util'
import { NotificationInput } from './inputs/notification.input'

@Injectable()
export class NotificationService {
	constructor(private readonly prisma: PrismaService) {}

	async createStreamStart(user: User) {
		const notification = await this.prisma.notification.create({
			data: {
				message: `${user.username} has started streaming!`,
				type: NotificationType.STREAM_START,
				user: { connect: { id: user.id } }
			}
		})
		return notification
	}

	async createNewFollowing(user: User, follower: User) {
		const notification = await this.prisma.notification.create({
			data: {
				message: `${follower.username} has started following ${user.username}!`,
				type: NotificationType.NEW_FOLLOWER,
				user: { connect: { id: user.id } }
			}
		})
		return notification
	}

	async findUnreadCount(user: User) {
		const count = await this.prisma.notification.count({
			where: { userId: user.id, isRead: false }
		})
		return count
	}
	async findNotificationsByUserId(user: User) {
		await this.prisma.notification.updateMany({
			where: { userId: user.id, isRead: false },
			data: { isRead: true }
		})
		const notifications = await this.prisma.notification.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' }
		})
		return notifications
	}

	async changeNotificationSettings(
		user: User,
		input: ChangeNotificationsSettingsInput
	) {
		const { siteNotifications, telegramNotifications } = input

		const notificationSettings =
			await this.prisma.notificationSettings.upsert({
				where: { userId: user.id },
				update: {
					siteNotifications: siteNotifications ?? false,
					telegramNotifications: telegramNotifications ?? false
				},
				create: {
					user: { connect: { id: user.id } },
					siteNotifications: siteNotifications,
					telegramNotifications: telegramNotifications
				},
				include: { user: true }
			})

		if (
			notificationSettings.telegramNotifications &&
			!notificationSettings.user.telegramId
		) {
			const telegramToken = await generateToken(
				this.prisma,
				user,
				TokenType.TELEGRAM_AUTH
			)
			return { telegramToken: telegramToken.token, notificationSettings }
		}

		if (
			!notificationSettings.telegramNotifications &&
			notificationSettings.user.telegramId
		) {
			await this.prisma.user.update({
				where: { id: user.id },
				data: { telegramId: null }
			})
			return notificationSettings
		}

		return notificationSettings
	}

	async createNotification(input: NotificationInput) {
		const { message, type, userId } = input
		const notification = await this.prisma.notification.create({
			data: { message, type, userId }
		})
		return notification
	}
}
