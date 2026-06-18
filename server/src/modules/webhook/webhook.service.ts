import { PrismaService } from '@/src/core/prisma/prisma.service'
import { LivekitService } from '@/src/models/libs/livekit/livekit.service'
import { Injectable } from '@nestjs/common'

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
		console.log('Received Livekit Webhook Event:', event)

		const roomName = event.room?.name
		console.log('Room name:', roomName)
		if (!roomName) {
			console.warn('Livekit webhook received without room name', event)
			return
		}

		if (
			event.event === 'track_published' ||
			event.event === 'ingress.started'
		) {
			console.log('Marking stream live for room:', roomName)
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
			console.log('Marking stream offline for room:', roomName)
			await this.prismaService.stream.updateMany({
				where: { userId: roomName },
				data: {
					isLive: false
				}
			})
		}
	}
}
