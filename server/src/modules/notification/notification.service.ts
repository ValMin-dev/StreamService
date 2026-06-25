import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { NotificationType, User } from '@prisma/client'

@Injectable()
export class NotificationService {
	constructor(private readonly prisma: PrismaService) {}

	async findNotificationsByUserId(user: User) {
		const { id } = user
		const notifications = await this.prisma.notification.findMany({
			where: { userId: id, isRead: false },
			orderBy: { createdAt: 'desc' }
		})
		return notifications
	}
	async createNotification(userId: string, message: string) {
		const notification = await this.prisma.notification.create({
			data: {
				userId,
				type: NotificationType.STREAM_START,
				message,
				isRead: false
			}
		})
		return notification
	}

	async findAllNotificationsByUserId(user: User) {
		const { id } = user
		const notifications = await this.prisma.notification.findMany({
			where: { userId: id },
			orderBy: { createdAt: 'desc' }
		})
		return notifications
	}

	async markNotificationAsRead(user: User, notificationId: string) {
		const { id } = user
		const notification = await this.prisma.notification.update({
			where: { id: notificationId, userId: id },

			data: { isRead: true }
		})
		return notification
	}
}
