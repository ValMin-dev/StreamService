import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { PlanService } from './plan.service'
import { User } from '@prisma/client'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { PlanModel } from './models/plan.model'
import { CreatePlanInput } from './inputs/create-plan.input'

@Resolver('Plan')
export class PlanResolver {
	constructor(private readonly planService: PlanService) {}

	@Authorization()
	@Query(() => [PlanModel], { name: 'myPlans' })
	async findMyPlans(@Authorized() user: User) {
		return this.planService.findMyPlans(user)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'createPlan' })
	async createPlan(
		@Authorized() user: User,
		@Args('data') input: CreatePlanInput
	) {
		return this.planService.createPlan(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'deletePlan' })
	async deletePlan(@Authorized() user: User, @Args('planId') planId: string) {
		return this.planService.deletePlan(user, planId)
	}
}
