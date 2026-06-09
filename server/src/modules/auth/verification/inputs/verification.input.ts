import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsUUID } from 'class-validator'

@InputType()
export class VerificationInput {
	@IsNotEmpty()
	@IsUUID('4')
	@Field(() => String)
	token: string
}
