import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { StripeService } from '../../libs/stripe/stripe.service'
import { User } from '@prisma/client'
import { CreatePlanInput } from './inputs/create-plan.input'

@Injectable()
export class PlanService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly stripeService: StripeService
	) {}

	async findMyPlans(user: User) {
		const plans = await this.prisma.sponsorshipPlan.findMany({
			where: {
				channelId: user.id
			}
		})
		return plans
	}

	async createPlan(user: User, input: CreatePlanInput) {
		const { title, description, price } = input

		const channelId = await this.prisma.user.findUnique({
			where: {
				id: user.id
			}
		})

		if (!channelId.isVerified) {
			throw new Error(
				'Канал не верифікований. Створення плану неможливе.'
			)
		}

		const stripePlan = await this.stripeService.plans.create({
			amount: price * 100, // Stripe expects the amount in cents
			currency: 'usd', // You can change this to your desired currency
			interval: 'month', // You can change this to 'year' or other intervals if needed,
			product: {
				name: title
			}
		})

		await this.prisma.sponsorshipPlan.create({
			data: {
				title,
				description,
				price,
				stripePlanId: stripePlan.id.toString(),
				stripeProductId: stripePlan.product.toString(),
				channel: {
					connect: {
						id: user.id
					}
				}
			}
		})
		return true
	}

	async deletePlan(user: User, planId: string) {
		const plan = await this.prisma.sponsorshipPlan.findUnique({
			where: {
				id: planId,
				channelId: user.id
			}
		})

		if (!plan) {
			throw new Error(
				'План не знайдено або ви не маєте доступу до нього.'
			)
		}
		// Видаляємо план у Stripe
		await this.stripeService.plans.del(plan.stripePlanId)
		await this.stripeService.products.del(plan.stripeProductId)

		// Видаляємо план з бази даних
		await this.prisma.sponsorshipPlan.delete({
			where: {
				id: planId
			}
		})

		return true
	}
}
