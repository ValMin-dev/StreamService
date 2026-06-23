import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

@InputType()
export class FollowInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	followingId: string
}
