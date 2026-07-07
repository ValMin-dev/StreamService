import { PrismaService } from '@/src/core/prisma/prisma.service'
import { LivekitService } from '@/src/models/libs/livekit/livekit.service'
import { Injectable } from '@nestjs/common'
import { NotificationService } from '../notification/notification.service'
import Stripe from 'stripe'
import { TransactionStatus } from '@prisma/client'
import { TelegramService } from '../libs/telegram/telegram.service'
import { ConfigService } from '@nestjs/config'
import { StripeService } from '../libs/stripe/stripe.service'

// Сервіс приймає вебхуки від LiveKit, перемикає стан стріму та створює нотифікації.
@Injectable()
export class WebhookService {
	constructor(
		private readonly livekitService: LivekitService,
		private readonly prismaService: PrismaService,
		private readonly notificationService: NotificationService,
		private readonly telegranService: TelegramService,
		private readonly configService: ConfigService,
		private readonly stripeService: StripeService
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

	async receiveWebhookStripe(event: Stripe.Event) {
		const session = event.data.object as Stripe.Checkout.Session

		if (event.type === 'checkout.session.expired') {
			await this.prismaService.transaction.updateMany({
				where: {
					stripeSubscriptionId: session.id,
					status: TransactionStatus.PENDING
				},
				data: {
					status: TransactionStatus.EXPIRED
				}
			})
		}

		if (event.type === 'checkout.session.async_payment_failed') {
			await this.prismaService.transaction.updateMany({
				where: {
					stripeSubscriptionId: session.id,
					status: TransactionStatus.PENDING
				},
				data: {
					status: TransactionStatus.FAILED
				}
			})
		}

		if (
			event.type === 'checkout.session.completed' ||
			event.type === 'checkout.session.async_payment_succeeded'
		) {
			const { planId, userId, channelId } = session.metadata || {}

			if (!planId || !userId || !channelId) {
				console.warn(
					'Missing metadata for checkout session success event',
					session.id,
					session.metadata
				)
				return
			}

			const expiresAt = new Date()
			expiresAt.setDate(expiresAt.getDate() + 30)
			const sponsorshipSubscription =
				await this.prismaService.sponsorshipSubscription.create({
					data: {
						expiresAt,
						planId,
						userId,
						channelId
					},
					include: {
						plan: true,
						user: true,
						channel: {
							include: {
								notificationSettings: true
							}
						}
					}
				})

			const updateResult =
				await this.prismaService.transaction.updateMany({
					where: {
						stripeSubscriptionId: session.id,
						status: TransactionStatus.PENDING
					},
					data: {
						status: TransactionStatus.COMPLETED
					}
				})

			if (updateResult.count === 0) {
				console.warn(
					'No matching transaction found for checkout.session success event',
					session.id
				)
			}

			if (
				sponsorshipSubscription.channel.notificationSettings
					.siteNotifications
			) {
				await this.notificationService.createNewSponsorship(
					sponsorshipSubscription.channel.id,
					sponsorshipSubscription.plan,
					sponsorshipSubscription.user
				)
			}

			if (
				sponsorshipSubscription.channel.notificationSettings
					.telegramNotifications &&
				sponsorshipSubscription.channel.telegramId
			) {
				await this.telegranService.newSponsorship(
					sponsorshipSubscription.channel.telegramId,
					sponsorshipSubscription.user,
					sponsorshipSubscription.plan
				)
			}
		}
	}
	constructStripeEvent(payload: any, signature: any) {
		return this.stripeService.webhooks.constructEvent(
			payload,
			signature,
			this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET')
		)
	}
}
