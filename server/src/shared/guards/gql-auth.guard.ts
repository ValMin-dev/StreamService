import { PrismaService } from '@/src/core/prisma/prisma.service'
import {
	type CanActivate,
	type ExecutionContext,
	Injectable
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql/dist/services/gql-execution-context'

@Injectable()
export class GqlAuthGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = GqlExecutionContext.create(context)
		const { req } = ctx.getContext()

		if (typeof req.session?.userId === 'undefined') {
			throw new Error('Unauthorized')
		}
		const user = this.prisma.user.findUnique({
			where: {
				id: req.session.userId
			}
		})
		req.user = user
		return Promise.resolve(true)
	}
}
