import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

@InputType()
export class CreatePlanInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	title: string

	@Field(() => String, { nullable: true })
	@IsString()
	description?: string

	@Field(() => Number)
	@IsNumber()
	@IsNotEmpty()
	price: number
}
