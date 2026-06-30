import { PrismaService } from '@/src/core/prisma/prisma.service'
import { LivekitService } from '@/src/models/libs/livekit/livekit.service'
import { Injectable } from '@nestjs/common'

// Сервіс приймає вебхуки від LiveKit і перемикає стан стріму в базі.
@Injectable()
export class WebhookService {
	constructor(
		private readonly livekitService: LivekitService,
		private readonly prismaService: PrismaService
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
			event.event === 'track_published' ||
			event.event === 'ingress.started'
		) {
			console.log('Позначаємо стрім як онлайн для кімнати:', roomName)
			await this.prismaService.stream.updateMany({
				where: { userId: roomName },
				data: {
					isLive: true
				}
			})
		}

		if (
			event.event === 'track_unpublished' ||
			event.event === 'ingress.ended'
		) {
			console.log('Позначаємо стрім як офлайн для кімнати:', roomName)
			await this.prismaService.stream.updateMany({
				where: { userId: roomName },
				data: {
					isLive: false
				}
			})
		}
	}
}
