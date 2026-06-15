import { Injectable } from '@nestjs/common'
import { StorageService } from '../../libs/storage/storage.service'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { User } from '@prisma/client'
import * as Upload from 'graphql-upload/Upload.js'
import * as sharp from 'sharp'
import { ChangeProfileInfoInput } from './inputs/change-profile-info.input'
import {
	SocialLinkInput,
	SocialLinkOrderInput,
	SocialLinkRemoveInput
} from './inputs/social-link.input'

@Injectable()
export class ProfileService {
	constructor(
		private readonly storageService: StorageService,
		private readonly prisma: PrismaService
	) {}

	async getAllSocialLinks(user: User) {
		return this.prisma.socialLink.findMany({
			where: {
				userId: user.id
			},
			orderBy: { position: 'asc' }
		})
	}

	async updateSocialLink(id: string, input: SocialLinkInput, user: User) {
		const { title, url } = input
		await this.prisma.socialLink.update({
			where: { id, userId: user.id },
			data: {
				title,
				url
			}
		})
		return true
	}

	async reorderSocialLinks(user: User, input: SocialLinkOrderInput[]) {
		if (!input.length) {
			return
		}
		const updatePromises = input.map(link =>
			this.prisma.socialLink.updateMany({
				where: {
					id: link.id,
					userId: user.id
				},
				data: {
					position: link.position
				}
			})
		)
		await Promise.all(updatePromises)
		return true
	}

	async removeSocialLink(user: User, input: SocialLinkRemoveInput) {
		const { url } = input
		const socialLink = await this.prisma.socialLink.findFirst({
			where: {
				userId: user.id,
				url: url
			}
		})
		if (!socialLink) {
			throw new Error('Social link not found')
		}
		await this.prisma.socialLink.delete({
			where: {
				id: socialLink.id
			}
		})
		return true
	}

	async createSocialLink(user: User, input: SocialLinkInput) {
		const { title, url } = input

		const lastSocialLink = await this.prisma.socialLink.findFirst({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' }
		})
		const lastPosition = lastSocialLink ? lastSocialLink.position + 1 : 1

		await this.prisma.socialLink.create({
			data: {
				title,
				url,
				position: lastPosition,
				user: { connect: { id: user.id } }
			}
		})
		return true
	}

	async changeProfile(user: User, input: ChangeProfileInfoInput) {
		const { username, displayName, bio } = input
		console.log('Changing profile for user:', user.id, 'with input:', input)

		const existingUser = await this.prisma.user.findUnique({
			where: { username: username }
		})
		if (existingUser && existingUser.id !== user.id) {
			throw new Error('Username is already taken')
		}

		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				username: username || user.username,
				displayName: displayName || user.displayName,
				bio: bio || user.bio,
				updatedAt: new Date()
			}
		})
		return true
	}

	async changeAvatar(user: User, file: Upload) {
		if (user.avatarUrl) {
			await this.storageService.remove(user.avatarUrl)
			const chunks: Buffer[] = []
			for await (const chunk of file.createReadStream()) {
				chunks.push(chunk)
			}

			const buffer = Buffer.concat(chunks)
			const fileName = `/channels/${user.id}/avatar/${Date.now()}-${user.username}.webp`

			if (file.filename && file.filename.endsWith('.gif')) {
				const processedBuffer = await sharp(buffer, { animated: true })
					.resize(256, 256, {
						fit: 'cover'
					})
					.webp({ quality: 80, effort: 6 })
					.toBuffer()

				await this.storageService.upload(
					processedBuffer,
					fileName,
					'image/webp'
				)
			} else {
				const processedBuffer = await sharp(buffer)
					.resize(256, 256, {
						fit: 'cover'
					})
					.webp({ quality: 80, effort: 6 })
					.toBuffer()

				await this.storageService.upload(
					processedBuffer,
					fileName,
					'image/webp'
				)
			}

			await this.prisma.user.update({
				where: { id: user.id },
				data: { avatarUrl: fileName }
			})
		}
		return true
	}

	async removeAvatar(user: User) {
		if (user.avatarUrl) {
			await this.storageService.remove(user.avatarUrl)
			await this.prisma.user.update({
				where: { id: user.id },
				data: { avatarUrl: null }
			})
		}
		if (!user.avatarUrl) {
			return Error('User does not have an avatar to remove')
		}

		return true
	}
}
