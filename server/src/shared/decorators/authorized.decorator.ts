import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { User } from '@prisma/client'

export const Authorized = createParamDecorator(
	(data: keyof User, ctx: ExecutionContext) => {
		let user: User

		if (ctx.getType() === 'http') {
			const { user } = ctx.switchToHttp().getRequest().req
		} else {
			const context = GqlExecutionContext.create(ctx)
			const { user } = context.getContext().req
		}
		return data ? user?.[data] : user
	}
)
