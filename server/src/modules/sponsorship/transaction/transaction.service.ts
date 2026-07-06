import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { StripeService } from '../../libs/stripe/stripe.service'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { ConfigService } from '@nestjs/config/dist/config.service'
import { TransactionStatus, User } from '@prisma/client'

@Injectable()
export class TransactionService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly stripeService: StripeService,
		private readonly configService: ConfigService
	) {}

	async findMyTransactions(user: User) {
		const transactions = await this.prisma.transaction.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' }
		})
		return transactions
	}

	async makeTransaction(user: User, planId: string) {
		const plan = await this.prisma.sponsorshipPlan.findUnique({
			where: { id: planId }
		})

		if (!plan) {
			throw new NotFoundException('План не знайдено')
		}

		if (plan.channelId === user.id) {
			throw new ConflictException('Не можна купити власний план')
		}

		const existingSubscription =
			await this.prisma.sponsorshipSubscription.findFirst({
				where: {
					userId: user.id,
					planId: plan.id
				}
			})

		if (existingSubscription) {
			throw new ConflictException(
				'Ви вже маєте активну підписку на цей план'
			)
		}

		const customer = await this.stripeService.customers.create({
			name: user.username,
			email: user.email
		})

		const session = await this.stripeService.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'subscription',
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: plan.title,
							description: plan.description
						},
						unit_amount: Math.round(plan.price * 100), // Додаємо ціну в центах
						recurring: {
							interval: 'month'
						}
					},
					quantity: 1
				}
			],
			customer: customer.id,
			metadata: {
				userId: user.id,
				planId: plan.id,
				channelId: plan.channelId
			},
			success_url: `${this.configService.get('ALLOWED_ORIGIN')}/success?price=${plan.price}&username=${plan.channelId} }`,
			cancel_url: `${this.configService.get('ALLOWED_ORIGIN')}`
		})

		await this.prisma.transaction.create({
			data: {
				amount: plan.price,
				currency: session.currency,
				stripeSubscriptionId: session.id,
				user: {
					connect: {
						id: user.id
					}
				}
			}
		})
		return { url: session.url }
	}
}
