import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ProfileService } from './profile.service'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { ChangeProfileInfoInput } from './inputs/change-profile-info.input'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import type { User } from '@prisma/client'
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import * as Upload from 'graphql-upload/Upload.js'
import { FileValidationPipe } from '@/src/shared/pipes/file-validatoon.pipe'
import { SocialLinkInput } from './inputs/social-link.input'
import { SocialLinkRemoveInput } from './inputs/social-link-remove.input'
@Resolver('Profile')
export class ProfileResolver {
	constructor(private readonly profileService: ProfileService) {}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeProfileInfo' })
	async changeProfile(
		@Args('data') input: ChangeProfileInfoInput,
		@Authorized() user: User
	) {
		return this.profileService.changeProfile(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'removeSocialLink' })
	async removeSocialLink(
		@Args('data') input: SocialLinkRemoveInput,
		@Authorized() user: User
	) {
		return this.profileService.removeSocialLink(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'createSocialLink' })
	async createSocialLink(
		@Args('data') input: SocialLinkInput,
		@Authorized() user: User
	) {
		return this.profileService.createSocialLink(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeAvatar' })
	async changeAvatar(
		@Args('avatarUrl', { type: () => GraphQLUpload }, FileValidationPipe)
		avatarUrl: Upload,
		@Authorized() user: User
	) {
		return this.profileService.changeAvatar(user, avatarUrl)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'removeAvatar' })
	async removeAvatar(@Authorized() user: User) {
		return this.profileService.removeAvatar(user)
	}
}
