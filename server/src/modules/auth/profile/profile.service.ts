import { Injectable } from '@nestjs/common'
import { StorageService } from '../../libs/storage/storage.service'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { User } from '@prisma/client'
import * as Upload from 'graphql-upload/Upload.js'
import * as sharp from 'sharp'

@Injectable()
export class ProfileService {
	constructor(
		private readonly storageService: StorageService,
		private readonly prisma: PrismaService
	) {}

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
