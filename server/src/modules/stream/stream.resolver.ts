import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import { StreamService } from './stream.service'
import { StreamModel } from './models/stream.model'
import { StreamFiltersInput } from './inputs/filters.input'
import { ChangeStreamInfoInput } from './inputs/change-stream.input'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { User } from '@prisma/client'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import * as Upload from 'graphql-upload/Upload.js'
import { FileValidationPipe } from '@/src/shared/pipes/file-validatoon.pipe'

@Resolver('Stream')
export class StreamResolver {
	constructor(private readonly streamService: StreamService) {}

	@Query(() => [StreamModel], { name: 'findAllStreams' })
	async findAll(@Args('data') input: StreamFiltersInput) {
		return this.streamService.findAll(input)
	}

	@Query(() => [StreamModel], { name: 'findRandomStreams' })
	async findRandomStreams() {
		return this.streamService.findRandomStreams()
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeStreamInfo' })
	async changeStreamInfo(
		@Args('data') input: ChangeStreamInfoInput,
		@Authorized() user: User
	) {
		return this.streamService.updateStreamInfo(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeStreamThumbnail' })
	async changeThumbnail(
		@Args('thumbnail', { type: () => GraphQLUpload }, FileValidationPipe)
		thumbnail: Upload,
		@Authorized() user: User
	) {
		return this.streamService.changeThumbnail(user, thumbnail)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'removeStreamThumbnail' })
	async removeStreamThumbnail(@Authorized() user: User) {
		return this.streamService.removeThumbnail(user)
	}
}
