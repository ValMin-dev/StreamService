import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsNotEmpty, IsNumber } from 'class-validator'

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
