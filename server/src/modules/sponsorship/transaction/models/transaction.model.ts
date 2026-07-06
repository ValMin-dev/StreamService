import { UserModel } from '@/src/modules/auth/account/models/user.model'
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { Transaction, TransactionStatus } from '@prisma/client'

registerEnumType(TransactionStatus, {
	name: 'TransactionStatus',
	description: 'The type of Transaction Status'
})

@ObjectType()
export class TransactionModel implements Transaction {
	@Field(() => ID)
	id: string

	@Field(() => Number)
	amount: number

	@Field(() => String)
	currency: string

	@Field(() => Number)
	price: number

	@Field(() => TransactionStatus)
	status: TransactionStatus

	@Field(() => String)
	stripeProductId: string

	@Field(() => String)
	stripeSubscriptionId: string

	@Field(() => UserModel)
	user: UserModel

	@Field(() => String)
	userId: string

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
