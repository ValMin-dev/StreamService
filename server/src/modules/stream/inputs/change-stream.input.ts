import { Field, InputType } from '@nestjs/graphql'
import { IsString, IsOptional, IsNotEmpty } from 'class-validator'

@InputType()
export class ChangeStreamInfoInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	title?: string

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	categoryId?: string
}
