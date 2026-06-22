import { Mutation, Resolver } from '@nestjs/graphql'
import { ChatService } from './chat.service'
import { ChangeChatSettingsInput } from './inputs/change-chat-settings.input'
import { User } from '@prisma/client'
import { SendMessageInput } from './inputs/send-message.input'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'

@Resolver('Chat')
export class ChatResolver {
	constructor(private readonly chatService: ChatService) {}

	@Mutation(() => Boolean, { name: 'changeChatSettings' })
	@Authorization()
	async changeSettings(
		@Authorized() user: User,
		input: ChangeChatSettingsInput
	) {
		return this.chatService.changeSettings(user, input)
	}

	@Mutation(() => Boolean, { name: 'sendMessage' })
	@Authorization()
	async sendMessage(
		@Authorized() user: User,
		streamId: string,
		input: SendMessageInput
	) {
		return this.chatService.createMessage(streamId, user, input)
	}

	@Mutation(() => Boolean, { name: 'findMessagesByStream' })
	async findMessagesByStream(streamId: string) {
		return this.chatService.findMessagesByStream(streamId)
	}
}
