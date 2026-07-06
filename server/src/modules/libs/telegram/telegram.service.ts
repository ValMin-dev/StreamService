import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SponsorshipPlan, TokenType, User } from '@prisma/client'
import { Action, Command, Ctx, Start, Update } from 'nestjs-telegraf'
import { Context, Telegraf } from 'telegraf'
import { MESSAGES } from './telegram.messages'
import { BUTTONS } from './telegram.buttons'
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types'

// Сервіс Telegram-бота обробляє /start, підписки, профіль і прив'язку акаунта.
@Update()
@Injectable()
export class TelegramService extends Telegraf {
	private readonly _token: string

	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService
	) {
		super(configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'))
		this._token = configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN')
	}

	@Start()
	async onStart(@Ctx() ctx: any) {
		const username = ctx.from.username
		const chatId = ctx.chat.id.toString()
		const token = ctx.message.text.split(' ')[1] // Дістаємо токен з тексту повідомлення
		const user = await this.findUserByChatId(chatId)

		if (token) {
			const authToken = await this.prisma.token.findUnique({
				where: {
					token: token,
					type: TokenType.TELEGRAM_AUTH
				}
			})
			if (!authToken) {
				await ctx.reply(MESSAGES.CONNECT_FAILURE)
				return
			}
			const hasExpired = new Date(authToken.expiresIn) < new Date()
			if (!authToken || hasExpired) {
				await ctx.reply(MESSAGES.CONNECT_FAILURE)
				return
			}
			await this.connectTelegram(authToken.userId, chatId)
			await this.prisma.token.delete({
				where: {
					id: authToken.id
				}
			})
			console.log(`Користувач ${username} запустив бота.`)
			await ctx.replyWithHTML(
				MESSAGES.START(username),
				BUTTONS.authSuccess
			)
		}
		if (user) {
			return await ctx.replyWithHTML(
				MESSAGES.WELCOME_BACK(user.username),
				BUTTONS.authSuccess,
				BUTTONS.profile
			)
		} else {
			console.log(`Користувач ${username} запустив бота без токена.`)
			await ctx.replyWithHTML(
				MESSAGES.NOT_CONNECTED(username),
				BUTTONS.profile
			)
		}
	}

	@Command('follows')
	@Action('follows')
	async onFollows(@Ctx() ctx: Context) {
		const chatId = ctx.chat.id.toString()
		const user = await this.findUserByChatId(chatId)
		if (!user) {
			await ctx.replyWithHTML(
				MESSAGES.NOT_CONNECTED(ctx.from.username),
				BUTTONS.profile
			)
			return
		}
		const follows = await this.prisma.follow.findMany({
			where: { followerId: user.id },
			include: { following: true }
		})
		if (follows.length === 0) {
			await ctx.replyWithHTML(MESSAGES.NO_FOLLOWS, BUTTONS.profile)
			return
		}
		const followsList = follows
			.map(follow => MESSAGES.FOLLOWS_LIST(follow.following))
			.join('\n')

		const message = `📌 Ви підписані на:\n${followsList}`
		await ctx.replyWithHTML(message, BUTTONS.profile)
	}

	@Command('me')
	@Action('me')
	async onMe(@Ctx() ctx: Context) {
		const chatId = ctx.chat.id.toString()
		const user = await this.findUserByChatId(chatId)
		const followersCount = await this.prisma.follow.count({
			where: {
				followingId: user.id
			}
		})
		if (user) {
			await ctx.replyWithHTML(
				MESSAGES.PROFILE(user, followersCount),
				BUTTONS.profile
			)
		} else {
			await ctx.replyWithHTML(
				MESSAGES.NOT_CONNECTED(ctx.from.username),
				BUTTONS.profile
			)
		}
	}

	async sendPassResetToken(
		chatId: string,
		token: string,
		metadata: SessionMetadata
	) {
		await this.telegram.sendMessage(
			chatId,
			MESSAGES.RESET_PASSWORD(token, metadata),
			{ parse_mode: 'HTML' }
		)
	}

	async sendDeactivateAccountToken(
		chatId: string,
		token: string,
		metadata: SessionMetadata
	) {
		await this.telegram.sendMessage(
			chatId,
			MESSAGES.DEACTIVATE_ACCOUNT(token, metadata),
			{ parse_mode: 'HTML' }
		)
	}

	async sendSuccessDeactivationMessage(chatId: string) {
		await this.telegram.sendMessage(chatId, MESSAGES.SUCCESS_DEACTIVATION, {
			parse_mode: 'HTML'
		})
	}

	async streamStart(chatId: string, channel: User) {
		await this.telegram.sendMessage(
			chatId,
			MESSAGES.STREAM_START(channel),
			{
				parse_mode: 'HTML'
			}
		)
	}

	async newFollowMessage(chatId: string, follower: User) {
		const user = await this.findUserByChatId(chatId)

		await this.telegram.sendMessage(
			chatId,
			MESSAGES.NEW_FOLLOW(follower, user.followings.length),
			{
				parse_mode: 'HTML'
			}
		)
	}

	async newSponsorship(chatId: string, sponsor: User, plan: SponsorshipPlan) {
		await this.telegram.sendMessage(
			chatId,
			MESSAGES.NEW_SPONSORSHIP(sponsor, plan),
			{
				parse_mode: 'HTML'
			}
		)
	}

	private async connectTelegram(userId: string, chatId: string) {
		await this.prisma.user.update({
			where: { id: userId },
			data: { telegramId: chatId }
		})
	}

	private async findUserByChatId(chatId: string) {
		const user = await this.prisma.user.findUnique({
			where: { telegramId: chatId },
			include: { followers: true, followings: true }
		})
		return user
	}
}
