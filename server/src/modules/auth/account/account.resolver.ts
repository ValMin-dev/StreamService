import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AccountService } from './account.service'
import { UserModel } from './models/user.model'
import { CreateUserInput } from './inputs/create-user.input'
import { ChangeEmailInput } from './inputs/change-email.input'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { ChangePasswordInput } from './inputs/change-password.input'

@Resolver('Account')
export class AccountResolver {
	constructor(private readonly accountService: AccountService) {}

	@Query(() => [UserModel], { name: 'findAllUsers' })
	async findAll() {
		return this.accountService.findAll()
	}

	@Mutation(() => Boolean, { name: 'createUser' })
	async create(@Args('data') input: CreateUserInput) {
		return this.accountService.create(input)
	}
	@Authorization()
	@Mutation(() => Boolean, { name: 'changeEmail' })
	async changeEmail(
		@Authorized() user: UserModel,
		@Args('data') input: ChangeEmailInput
	) {
		return this.accountService.changeEmail(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changePassword' })
	async changePassword(
		@Authorized() user: UserModel,
		@Args('data') input: ChangePasswordInput
	) {
		return this.accountService.changePassword(user, input)
	}
}
