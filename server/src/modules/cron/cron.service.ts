import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { MailService } from '../libs/mail/mail.service'
import { Cron } from '@nestjs/schedule'
import { StorageService } from '../libs/storage/storage.service'

@Injectable()
export class CronService {
	constructor(
		private readonly mailService: MailService,
		private readonly prisma: PrismaService,
		private readonly storageService: StorageService
	) {}

	@Cron('0 0 * * *') // Runs every day at midnight
	// @Cron('*/10 * * * * *') // Runs every 10 seconds (for testing purposes)
	async deleteDeactivatedAccounts() {
		const now = new Date()
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(sevenDaysAgo.getDay() - 7)
		// sevenDaysAgo.setSeconds(sevenDaysAgo.getSeconds() - 5) // Set to the start of the day
		const deactivatedUsers = await this.prisma.user.findMany({
			where: {
				isDeactivated: true,
				deactivatedAt: {
					lte: sevenDaysAgo // 7 days ago
				}
			}
		})
		for (const user of deactivatedUsers) {
			await this.mailService.sendAccountDeletionEmail(user.email)
			if (user.avatarUrl) {
				await this.storageService.remove(
					`channels/${user.id}/avatar/${user.avatarUrl}`
				)
			}
		}
		console.log(
			`Deleted ${deactivatedUsers.length} deactivated accounts names: ${deactivatedUsers.map(user => user.email).join(', ')}`
		) // Log the number of deleted accounts
		await this.prisma.user.deleteMany({
			where: {
				isDeactivated: true,
				deactivatedAt: {
					lte: sevenDaysAgo
				}
			}
		})
	}
}
