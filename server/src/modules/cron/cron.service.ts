import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { MailService } from '../libs/mail/mail.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import { StorageService } from '../libs/storage/storage.service'
import { TelegramService } from '../libs/telegram/telegram.service'
import { NotificationService } from '../notification/notification.service'

// Сервіс виконує фонові завдання по розкладу, зокрема очищення деактивованих акаунтів.
@Injectable()
export class CronService {
	constructor(
		private readonly mailService: MailService,
		private readonly prisma: PrismaService,
		private readonly storageService: StorageService,
		private readonly notificationService: NotificationService,
		private readonly telegramService: TelegramService
	) {}

	// @Cron('0 0 * * *') // Runs every day at midnight
	// @Cron('*/10 * * * * *') // Runs every 10 seconds (for testing purposes)
	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Runs every day at midnight
	async deleteDeactivatedAccounts() {
		const now = new Date()
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
		// sevenDaysAgo.setSeconds(sevenDaysAgo.getSeconds() - 5) // Set to the start of the day
		const deactivatedUsers = await this.prisma.user.findMany({
			where: {
				isDeactivated: true,
				deactivatedAt: {
					lte: sevenDaysAgo // 7 днів тому
				}
			},
			include: {
				notificationSettings: true,
				stream: true
			}
		})
		for (const user of deactivatedUsers) {
			await this.mailService.sendAccountDeletionEmail(user.email)

			if (
				user.telegramId &&
				user.notificationSettings?.telegramNotifications
			) {
				await this.telegramService.sendSuccessDeactivationMessage(
					user.telegramId
				)
			}

			if (user.avatarUrl) {
				await this.storageService.remove(user.avatarUrl)
			}
			if (user.stream?.thumbnailUrl) {
				await this.storageService.remove(user.stream.thumbnailUrl)
			}
		}
		console.log(
			`Видалено ${deactivatedUsers.length} деактивованих акаунтів: ${deactivatedUsers.map(user => user.email).join(', ')}`
		)
		await this.prisma.user.deleteMany({
			where: {
				isDeactivated: true,
				deactivatedAt: {
					lte: sevenDaysAgo
				}
			}
		})
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Runs every day at midnight
	// @Cron(CronExpression.EVERY_10_SECONDS) // Runs every 10 seconds (for testing purposes)
	async verifyChannelEmails() {
		const users = await this.prisma.user.findMany({
			include: { notificationSettings: true }
		})

		for (const user of users) {
			const followersCount = await this.prisma.follow.count({
				where: { followingId: user.id }
			})
			if (followersCount >= 2 && !user.isVerified) {
				await this.prisma.user.update({
					where: { id: user.id },
					data: { isVerified: true }
				})
				await this.mailService.sendChannelVerificationEmail(user.email)
				if (
					user.telegramId &&
					user.notificationSettings?.telegramNotifications
				) {
					await this.telegramService.sendVerifyChannelMessage(
						user.telegramId
					)
				}
				if (user.notificationSettings?.siteNotifications) {
					await this.notificationService.createVerifyChannelNotification(
						user
					)
				}
			}
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Runs every day at midnight
	async deleteAllNotifications() {
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
		await this.prisma.notification.deleteMany({
			where: {
				createdAt: {
					lte: sevenDaysAgo
				}
			}
		})
		console.log('Всі сповіщення видалено.')
	}

	@Cron(CronExpression.EVERY_YEAR) // Runs every weekend
	async notifyUserEnabledTwoFactor() {
		const users = await this.prisma.user.findMany({
			where: {
				isTotpEnabled: false
			},
			include: {
				notificationSettings: true
			}
		})

		for (const user of users) {
			// await this.mailService.sendEnableTwoFactorEmail(
			// 	user.email,
			// 	'your-token-here'
			// )
			if (
				user.telegramId &&
				user.notificationSettings?.telegramNotifications
			) {
				await this.telegramService.sendEnableTwoFactorMessage(
					user.telegramId
				)
			}
			if (user.notificationSettings?.siteNotifications) {
				await this.notificationService.createEnableTwoFactorNotification(
					user
				)
			}
		}
	}
}
