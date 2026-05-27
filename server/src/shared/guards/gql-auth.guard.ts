import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { PrismaService } from 'src/core/prisma/prisma.service'

@Injectable()
export class GqlAuthGuard implements CanActivate {
	constructor(private readonly prismaService: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = GqlExecutionContext.create(context)
		const req = ctx.getContext().req
		if (!req.session || !req.session.userId) {
			return false
		}
		const user = await this.prismaService.users.findUnique({
			where: {
				id: req.session.userId
			}
		})
		req.user = user
		return !!user
	}
}
