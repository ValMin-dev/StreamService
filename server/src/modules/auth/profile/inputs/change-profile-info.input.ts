import { Field, InputType } from '@nestjs/graphql'

import {
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxLength
} from 'class-validator'

@InputType()
export class ChangeProfileInfoInput {
	@Field(() => String, { nullable: true })
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	@Matches(/^[a-zA-Z0-9_]+$/, {
		message: 'Username can only contain letters, numbers, and underscores'
	})
	username?: string

	@Field(() => String, { nullable: true })
	@IsString()
	@IsOptional()
	@Matches(/^[a-zA-Z0-9_]+$/, {
		message:
			'Display name can only contain letters, numbers, and underscores'
	})
	displayName?: string

	@Field(() => String, { nullable: true })
	@IsString()
	@IsOptional()
	@MaxLength(300)
	bio?: string
}
