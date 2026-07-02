import { PrismaService } from '@/src/core/prisma/prisma.service'
import { LivekitService } from '@/src/models/libs/livekit/livekit.service'
import { Injectable } from '@nestjs/common'
import { NotificationService } from '../notification/notification.service'

// Сервіс приймає вебхуки від LiveKit, перемикає стан стріму та створює нотифікації.
@Injectable()
export class WebhookService {
	constructor(
		private readonly livekitService: LivekitService,
		private readonly prismaService: PrismaService,
		private readonly notificationService: NotificationService
	) {}

	async receiveLivekitWebhook(body: string, authorization: string) {
		const event = this.livekitService.receiver.receive(
			body,
			authorization,
			true
		)
		console.log('Отримано подію вебхука LiveKit:', event)

		const roomName = event.room?.name
		console.log('Назва кімнати:', roomName)
		if (!roomName) {
			console.warn('Вебхук LiveKit отримано без назви кімнати', event)
			return
		}

		if (
			// event.event === 'track_published' ||
			event.event === 'ingress.started'
		) {
			console.log('Позначаємо стрім як онлайн для кімнати:', roomName)
			const stream = await this.prismaService.stream.update({
				where: { userId: roomName },
				data: {
					isLive: true
				},
				include: {
					user: true
				}
			})

			const followers = await this.prismaService.follow.findMany({
				where: {
					followingId: stream.userId,
					follower: { isDeactivated: false }
				},
				include: {
					follower: {
						include: {
							notificationSettings: true
						}
					}
				}
			})

			for (const follow of followers) {
				const follower = follow.follower
				if (follower.notificationSettings?.siteNotifications) {
					const streamerName =
						stream.user?.username ?? 'Невідомий стрімер'
					await this.notificationService.createStreamStart(
						follower,
						streamerName
					)
				}
			}
		}

		if (
			event.event === 'track_unpublished' ||
			event.event === 'ingress.ended'
		) {
			console.log('Позначаємо стрім як офлайн для кімнати:', roomName)
			const stream = await this.prismaService.stream.update({
				where: { userId: roomName },
				data: {
					isLive: false
				}
			})
			await this.prismaService.chatMessage.deleteMany({
				where: { streamId: stream.id }
			})
		}
	}
}
