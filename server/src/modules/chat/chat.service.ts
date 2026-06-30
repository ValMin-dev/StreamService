import { PrismaService } from '@/src/core/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { SendMessageInput } from './inputs/send-message.input'
import { User } from '@prisma/client'
import { ChangeChatSettingsInput } from './inputs/change-chat-settings.input'

// Сервіс відповідає за чат стріму: читання повідомлень, відправку і зміну параметрів чату.
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

	async createMessage(user: User, input: SendMessageInput) {
		const { text, streamId } = input
		if (!text || text.trim() === '') {
			throw new BadRequestException(
				'Текст повідомлення не може бути порожнім'
			)
		}
		const stream = await this.prisma.stream.findUnique({
			where: { id: streamId }
		})
		if (!stream) {
			throw new BadRequestException('Стрім не знайдено')
		}

		if (!stream.isLive) {
			throw new BadRequestException('Стрім не запущено')
		}

		const message = await this.prisma.chatMessage.create({
			data: {
				stream: { connect: { id: streamId } },
				user: { connect: { id: user.id } },
				text
			},
			include: { stream: true }
		})
		return message
	}

	async changeSettings(user: User, input: ChangeChatSettingsInput) {
		const { isChatEnabled, isChatFollowersOnly, isChatPremiumOnly } = input

		const stream = await this.prisma.stream.findUnique({
			where: { userId: user.id }
		})

		if (!stream) {
			throw new BadRequestException('Стрім не знайдено')
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
