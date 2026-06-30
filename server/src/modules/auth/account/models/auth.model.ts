import { Field, ObjectType } from '@nestjs/graphql'
import { UserModel } from './user.model'

// Модель відповіді для auth-операцій містить користувача та сервісне повідомлення.
@ObjectType()
export class AuthModel {
	@Field(() => UserModel, { nullable: true })
	user?: UserModel

	@Field(() => String, { nullable: true })
	message?: string
}
