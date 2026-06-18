import type { GqlContext } from './../../../shared/types/gql-context.types'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { SessionService } from './session.service'
import { UserModel } from '../account/models/user.model'
import { LoginInput } from './inputs/login.input'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator'
import { SessionModel } from './models/session.model'
import { AuthModel } from '../account/models/auth.model'
import { BadRequestException } from '@nestjs/common'

@Resolver('Session')
export class SessionResolver {
	constructor(private readonly sessionService: SessionService) {}

	@Authorization()
	@Query(() => UserModel, { name: 'findProfile' })
	async me(@Authorized('id') id: string, @Context() { req }: GqlContext) {
		const userId = req.session?.userId
		if (!userId) {
			throw new BadRequestException('Unauthorized')
		}
		console.log('Fetching user with ID:', userId)
		return this.sessionService.me(userId)
	}

	@Authorization()
	@Query(() => [SessionModel], { name: 'findSessionsByUser' })
	async findByUser(@Context() { req }: GqlContext) {
		return this.sessionService.findByUser(req)
	}

	@Authorization()
	@Query(() => SessionModel, { name: 'findCurrentSession' })
	async findCurrent(@Context() { req }: GqlContext) {
		return this.sessionService.findCurrent(req)
	}

	@Mutation(() => Boolean, { name: 'clearSessionCookie' })
	async clearSession(@Context() { req }: GqlContext) {
		return this.sessionService.clearSession(req)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'removeSession' })
	async remove(
		@Context() { req }: GqlContext,
		@Args('sessionId') sessionId: string
	) {
		return this.sessionService.remove(req, sessionId)
	}

	@Mutation(() => AuthModel, { name: 'loginUser' })
	async login(
		@Context() { req }: GqlContext,
		@Args('data') input: LoginInput,
		@UserAgent() userAgent: string
	) {
		return this.sessionService.login(req, input, userAgent)
	}

	@Mutation(() => Boolean, { name: 'logoutUser' })
	async logout(@Context() { req }: GqlContext) {
		return this.sessionService.logout(req)
	}
}
