import { PrismaService } from '@/src/core/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { SendMessageInput } from './inputs/send-message.input'
import { User } from '@prisma/client'
import { ChangeChatSettingsInput } from './inputs/change-chat-settings.input'

@Injectable()
export class ChatService {
	constructor(private readonly prisma: PrismaService) {}

	async findMessagesByStream(streamId: string) {
		const messages = await this.prisma.chatMessage.findMany({
			where: { streamId },
			orderBy: { createdAt: 'asc' },
			include: {
				user: true
			}
		})
		return messages
	}

	async createMessage(streamId: string, user: User, input: SendMessageInput) {
		const { text } = input
		if (!text || text.trim() === '') {
			throw new BadRequestException('Message text cannot be empty')
		}
		const stream = await this.prisma.stream.findUnique({
			where: { id: streamId }
		})
		if (!stream) {
			throw new BadRequestException('Stream not found')
		}

		if (!stream.isLive) {
			throw new BadRequestException('Stream is not live')
		}

		await this.prisma.chatMessage.create({
			data: {
				stream: { connect: { id: streamId } },
				user: { connect: { id: user.id } },
				text
			}
		})
		return true
	}

	async changeSettings(user: User, input: ChangeChatSettingsInput) {
		const { isChatEnabled, isChatFollowersOnly, isChatPremiumOnly } = input

		const stream = await this.prisma.stream.findUnique({
			where: { userId: user.id }
		})

		if (!stream) {
			throw new BadRequestException('Stream not found')
		}

		await this.prisma.stream.update({
			where: { id: stream.id },
			data: {
				isChatEnabled,
				isChatFollowersOnly,
				isChatPremiumOnly
			}
		})

		return true
	}
}
