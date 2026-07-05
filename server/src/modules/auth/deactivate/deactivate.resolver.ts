import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { DeactivateService } from './deactivate.service'
import { DeactivateAccountInput } from './inputs/deactivate-account.input'
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator'
import { GqlContext } from '@/src/shared/types/gql-context.types'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { User } from '@prisma/client'
import { AuthModel } from '../account/models/auth.model'
@Resolver('Deactivate')
export class DeactivateResolver {
	constructor(private readonly deactivateService: DeactivateService) {}

	@Authorization()
	@Mutation(() => AuthModel, { name: 'deactivateAccount' })
	async deactivate(
		@Authorized() user: User,
		@Context()
		{ req }: GqlContext,
		@Args('data') input: DeactivateAccountInput,
		@UserAgent() userAgent: string
	) {
		return this.deactivateService.deactivate(req, input, user, userAgent)
	}
}
