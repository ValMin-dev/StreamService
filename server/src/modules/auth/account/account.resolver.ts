import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AccountService } from './account.service'
import { UserModel } from './models/user.model'
import { CreateUserInput } from './inputs/create-user.input'
import { ChangeEmailInput } from './inputs/change-email.input'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { ChangePasswordInput } from './inputs/change-password.input'
import { SocialLinkModel } from '../profile/model/social-link.model'
import { User } from '@prisma/client'

// GraphQL-резолвер відкриває акаунтні операції для клієнта.
@Resolver('Account')
export class AccountResolver {
	constructor(private readonly accountService: AccountService) {}

	@Query(() => [UserModel], { name: 'findAllUsers' })
	async findAll() {
		return this.accountService.findAll()
	}

	@Authorization()
	@Query(() => UserModel, { name: 'findProfile' })
	async findProfile(@Authorized() user: User) {
		return this.accountService.findProfile(user.id)
	}
	@Authorization()
	@Query(() => [SocialLinkModel], { name: 'findSocialLinks' })
	async findSocialLinks(@Authorized() user: User) {
		return this.accountService.findSocialLinks(user.id)
	}

	@Mutation(() => Boolean, { name: 'createUser' })
	async create(@Args('data') input: CreateUserInput) {
		return this.accountService.create(input)
	}
	@Authorization()
	@Mutation(() => Boolean, { name: 'changeEmail' })
	async changeEmail(
		@Authorized() user: User,
		@Args('data') input: ChangeEmailInput
	) {
		return this.accountService.changeEmail(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changePassword' })
	async changePassword(
		@Authorized() user: User,
		@Args('data') input: ChangePasswordInput
	) {
		return this.accountService.changePassword(user, input)
	}
}
