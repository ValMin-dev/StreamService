import { PrismaService } from '@/src/core/prisma/prisma.service'
import { LivekitService } from '@/src/models/libs/livekit/livekit.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import {
	CreateIngressOptions,
	IngressAudioEncodingPreset,
	IngressInput,
	IngressVideoEncodingPreset
} from 'livekit-server-sdk'
@Injectable()
export class IngressService {
	constructor(
		private readonly livekitService: LivekitService,
		private readonly prismaService: PrismaService
	) {}

	async create(user: User, ingressType: IngressInput) {
		await this.resetIngresses(user)

		const options: CreateIngressOptions = {
			name: user.username,
			roomName: user.id,
			participantName: user.username,
			participantIdentity: user.id
		}

		if (ingressType === IngressInput.WHIP_INPUT) {
			options.bypassTranscoding = true
		} else {
			options.video = {
				source: 1,
				preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS
			}
			options.audio = {
				source: 2,
				preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS
			}
		}
		const ingress = await this.livekitService.ingress.createIngress(
			ingressType,
			options
		)
		if (!ingress || !ingress.url || !ingress.streamKey) {
			throw new BadRequestException('Failed to create ingress')
		}
		await this.prismaService.stream.update({
			where: { userId: user.id },
			data: {
				serverUrl: ingress.url,
				ingressId: ingress.ingressId,
				streamKey: ingress.streamKey
			}
		})
		return true
	}

	async resetIngresses(user: User) {
		const ingresses = await this.livekitService.ingress.listIngress({
			roomName: user.id
		})
		const rooms = await this.livekitService.room.listRooms([user.id])
		for (const room of rooms) {
			if (room.name === user.id) {
				await this.livekitService.room.deleteRoom(room.name)
			}
		}
		for (const ingress of ingresses) {
			if (ingress.ingressId) {
				await this.livekitService.ingress.deleteIngress(
					ingress.ingressId
				)
			}
		}
	}
}
