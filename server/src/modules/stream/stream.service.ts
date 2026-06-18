import { PrismaService } from '@/src/core/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { StreamFiltersInput } from './inputs/filters.input'
import type { Prisma, User } from '@prisma/client'
import { ChangeStreamInfoInput } from './inputs/change-stream.input'
import * as Upload from 'graphql-upload/Upload.js'
import * as sharp from 'sharp'
import { StorageService } from '../libs/storage/storage.service'
@Injectable()
export class StreamService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly storageService: StorageService
	) {}

	async findAll(input: StreamFiltersInput = {}) {
		const { take, skip, searchTerm } = input
		const whereClause = searchTerm
			? this.findBySearchTermFilter(searchTerm)
			: undefined
		const streams = await this.prisma.stream.findMany({
			take: take ?? 12,
			skip: skip ?? 0,

			where: {
				user: {
					isDeactivated: false
				},
				...whereClause
			},
			include: {
				user: true
			},
			orderBy: { createdAt: 'desc' }
		})
		return streams
	}

	async findRandomStreams() {
		const total = await this.prisma.stream.count({
			where: {
				user: {
					isDeactivated: false
				}
			}
		})

		const randomIndexes = new Set<number>()
		while (randomIndexes.size < 4 && randomIndexes.size < total) {
			randomIndexes.add(Math.floor(Math.random() * total))
		}

		const streams = await this.prisma.stream.findMany({
			where: {
				user: {
					isDeactivated: false
				}
			},
			include: {
				user: true
			},
			orderBy: { createdAt: 'desc' },
			skip: 0,
			take: total
		})
		return Array.from(randomIndexes).map(index => streams[index])
	}

	async updateStreamInfo(user: User, input: ChangeStreamInfoInput) {
		const { title } = input

		const usersStream = await this.prisma.stream.findFirst({
			where: {
				userId: user.id
			}
		})
		if (!usersStream) {
			throw new BadRequestException(
				'Stream not found or you do not have permission to update it.'
			)
		}

		await this.prisma.stream.update({
			where: { userId: user.id },
			data: {
				title
			}
		})

		return true
	}

	async changeThumbnail(user: User, file: Upload) {
		const stream = await this.findByUserId(user)

		if (stream.thumbnailUrl) {
			await this.storageService.remove(stream.thumbnailUrl)
			const chunks: Buffer[] = []
			for await (const chunk of file.createReadStream()) {
				chunks.push(chunk)
			}

			const buffer = Buffer.concat(chunks)
			const fileName = `/streams/${user.id}/${Date.now()}-${user.username}.webp`

			if (file.filename && file.filename.endsWith('.gif')) {
				const processedBuffer = await sharp(buffer, { animated: true })
					.resize(1280, 720, {
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
					.resize(1280, 720, {
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

			await this.prisma.stream.update({
				where: { userId: user.id },
				data: { thumbnailUrl: fileName }
			})
		}
		return true
	}

	async removeThumbnail(user: User) {
		const stream = await this.findByUserId(user)
		if (stream.thumbnailUrl) {
			await this.storageService.remove(stream.thumbnailUrl)
			await this.prisma.stream.update({
				where: { userId: user.id },
				data: { thumbnailUrl: null }
			})
		}
		if (!stream.thumbnailUrl) {
			return Error('Stream does not have a thumbnail to remove')
		}

		return true
	}

	private async findByUserId(user: User) {
		const stream = await this.prisma.stream.findFirst({
			where: {
				userId: user.id
			}
		})
		if (!stream) {
			throw new BadRequestException(
				'Stream not found or you do not have permission to update it.'
			)
		}
		return stream
	}

	private findBySearchTermFilter(
		searchTerm: string
	): Prisma.StreamWhereInput {
		return {
			OR: [
				{ title: { contains: searchTerm, mode: 'insensitive' } },
				{
					user: {
						username: { contains: searchTerm, mode: 'insensitive' }
					}
				}
			]
		}
	}
}
