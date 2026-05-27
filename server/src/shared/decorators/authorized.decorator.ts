import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import type { Users } from '@prisma/client'

export const Authorized = createParamDecorator(
	(data: keyof Users, ctx: ExecutionContext) => {
		let user: Users

		if (ctx.getType() === 'http') {
			const request = ctx.switchToHttp().getRequest()
			user = request.user
		} else {
			const context = GqlExecutionContext.create(ctx)
			user = context.getContext().req.user
		}
		return data ? user?.[data] : user
	}
)
