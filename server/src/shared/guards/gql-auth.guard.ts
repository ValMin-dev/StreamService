import { PrismaService } from '@/src/core/prisma/prisma.service'
import {
	BadRequestException,
	type CanActivate,
	type ExecutionContext,
	Injectable
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql/dist/services/gql-execution-context'

// Гард перевіряє GraphQL-сесію, дістає користувача з БД і кладе його в req.user для декораторів авторизації.
@Injectable()
export class GqlAuthGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = GqlExecutionContext.create(context)
		const { req } = ctx.getContext()

		if (typeof req.session?.userId === 'undefined') {
			throw new BadRequestException('Неавторизований доступ')
		}
		const user = await this.prisma.user.findUnique({
			where: {
				id: req.session.userId
			}
		})
		if (!user) {
			throw new BadRequestException('Неавторизований доступ')
		}
		req.user = user
		return true
	}
}
