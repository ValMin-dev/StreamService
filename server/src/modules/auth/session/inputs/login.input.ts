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
export class LoginInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	login: string

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	password: string
}
