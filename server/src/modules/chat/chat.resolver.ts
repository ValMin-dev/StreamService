import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql'
import { ChatService } from './chat.service'
import { ChangeChatSettingsInput } from './inputs/change-chat-settings.input'
import { User } from '@prisma/client'
import { SendMessageInput } from './inputs/send-message.input'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { PubSub } from 'graphql-subscriptions'
import { ChatMessageModel } from './models/chat.model'

// GraphQL-резолвер підключає чат до мутацій, запитів і підписки на нові повідомлення.
@Resolver('Chat')
export class ChatResolver {
	private readonly pubSub: PubSub

	constructor(private readonly chatService: ChatService) {
		this.pubSub = new PubSub()
	}

	@Mutation(() => Boolean, { name: 'changeChatSettings' })
	@Authorization()
	async changeSettings(
		@Authorized() user: User,
		@Args('data') input: ChangeChatSettingsInput
	) {
		return this.chatService.changeSettings(user, input)
	}

	@Mutation(() => ChatMessageModel, { name: 'sendMessage' })
	@Authorization()
	async sendMessage(
		@Authorized() user: User,
		@Args('data') input: SendMessageInput
	) {
		const message = await this.chatService.createMessage(user, input)
		this.pubSub.publish(`CHAT_MESSAGE_ADDED:${input.streamId}`, {
			chatMessageAdded: message
		})
		return message
	}

	@Subscription(() => ChatMessageModel, {
		name: 'chatMessageAdded',
		filter: (payload, variables) => {
			return payload.chatMessageAdded.streamId === variables.streamId
		}
	})
	async chatMessageAdded(@Args('streamId') streamId: string) {
		return this.pubSub.asyncIterableIterator(
			`CHAT_MESSAGE_ADDED:${streamId}`
		)
	}

	@Query(() => Boolean, { name: 'findMessagesByStream' })
	async findMessagesByStream(@Args('streamId') streamId: string) {
		return this.chatService.findMessagesByStream(streamId)
	}
}
