import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsNotEmpty, IsNumber } from 'class-validator'

@InputType()
export class SocialLinkInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	title: string

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	url: string
}
@InputType()
export class SocialLinkOrderInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	id: string

	@Field(() => Number)
	@IsNotEmpty()
	@IsNumber()
	position: number
}

@InputType()
export class SocialLinkRemoveInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	url: string
}
