import { Field, InputType } from '@nestjs/graphql'
import { IsString, IsOptional, IsNumber } from 'class-validator'

@InputType()
export class StreamFiltersInput {
	@Field(() => Number, { nullable: true })
	@IsNumber()
	@IsOptional()
	take?: number

	@Field(() => Number, { nullable: true })
	@IsNumber()
	@IsOptional()
	skip?: number

	@Field(() => String, { nullable: true })
	@IsString()
	@IsOptional()
	searchTerm?: string
}
