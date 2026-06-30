import { applyDecorators, UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '../guards/gql-auth.guard'

// Декоратор підключає guard авторизації до GraphQL-резолверів і мутацій.
export function Authorization() {
	return applyDecorators(UseGuards(GqlAuthGuard))
}
