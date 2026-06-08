import { Field, InputType } from '@nestjs/graphql'

import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	Min,
	MinLength
} from 'class-validator'

@InputType()
export class CreateUserInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-zA-Z0-9_]+$/, {
		message: 'Username can only contain letters, numbers, and underscores'
	})
	username: string

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email: string

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	password: string
}
