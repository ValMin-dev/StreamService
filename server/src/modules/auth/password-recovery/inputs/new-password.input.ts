import { IsPasswordMatchingConstraint } from '@/src/shared/decorators/is-password-matching-constraint'
import { Field, InputType } from '@nestjs/graphql'
import {
	IsNotEmpty,
	IsString,
	IsUUID,
	MinLength,
	Validate
} from 'class-validator'

@InputType()
export class NewPasswordInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	@MinLength(6, { message: 'Password must be at least 6 characters long' })
	password: string

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	@Validate(IsPasswordMatchingConstraint)
	confirmPassword: string

	@Field(() => String)
	@IsUUID('4')
	@IsNotEmpty()
	token: string
}
