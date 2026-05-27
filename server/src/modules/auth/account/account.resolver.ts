import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AccountService } from './account.service'
import { UserModel } from './models/user.model'
import { CreateUserInput } from './inputs/create-user.input'
import { Authorized } from 'src/shared/decorators/authorized.decorator'
import { Authorization } from 'src/shared/decorators/auth.decorator'

@Resolver('Account')
export class AccountResolver {
	public constructor(private readonly accountService: AccountService) {}

	@Authorization()
	@Query(() => UserModel, { name: 'findMe' })
	async me(@Authorized('id') id: string) {
		return this.accountService.me(id)
	}

	@Query(() => [UserModel], { name: 'findAllUsers' })
	public async findAll() {
		return this.accountService.findAll()
	}

	@Mutation(() => Boolean, { name: 'createUser' })
	public async create(@Args('data') input: CreateUserInput) {
		return this.accountService.create(input)
	}

	@Query(() => Boolean, { name: 'findUserById' })
	public async findById(@Args('id') id: string) {
		return this.accountService.findById(id)
	}
}
