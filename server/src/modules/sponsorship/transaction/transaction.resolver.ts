import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { TransactionService } from './transaction.service'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { User } from '@prisma/client'
import { TransactionModel } from './models/transaction.model'
import { MakePaymentModel } from './models/make-payment.model'

@Resolver('Transaction')
export class TransactionResolver {
	constructor(private readonly transactionService: TransactionService) {}

	@Authorization()
	@Query(() => [TransactionModel], { name: 'findMyTransactions' })
	async findMyTransactions(@Authorized() user: User) {
		return this.transactionService.findMyTransactions(user)
	}

	@Authorization()
	@Mutation(() => MakePaymentModel, { name: 'makeTransaction' })
	async makeTransaction(
		@Authorized() user: User,
		@Args('planId') planId: string
	) {
		return this.transactionService.makeTransaction(user, planId)
	}
}
