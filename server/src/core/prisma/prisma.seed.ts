import { BadRequestException, Logger } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { CATEGORIES } from './data/categories.data'
import { USERNAMES } from './data/users.data'
import { hash } from 'argon2'
import { STREAMS } from './data/streams.data'

const prisma = new PrismaClient({
	transactionOptions: {
		maxWait: 5000, // 5 seconds
		timeout: 10000, // 10 seconds
		isolationLevel: Prisma.TransactionIsolationLevel.Serializable // Highest isolation level
	}
})
async function main() {
	try {
		Logger.log('Starting database seeding...')

		await prisma.user.deleteMany()
		await prisma.category.deleteMany()
		await prisma.stream.deleteMany()
		Logger.log('Existing data cleared.')

		await prisma.category.createMany({
			data: CATEGORIES,
			skipDuplicates: true
		})
		Logger.log('Categories seeded successfully.')
		const categoriesBySlug = Object.fromEntries(
			(await prisma.category.findMany()).map(category => [
				category.slug,
				category
			])
		)
		const uniqueUsernames = [
			...new Set(USERNAMES.map(username => username.toLowerCase()))
		]
		const passwordHash = await hash('password123')

		await prisma.$transaction(async tx => {
			for (const username of uniqueUsernames) {
				const randomCategory =
					categoriesBySlug[
						Object.keys(categoriesBySlug)[
							Math.floor(
								Math.random() *
									Object.keys(categoriesBySlug).length
							)
						]
					]
				const userExists = await tx.user.findUnique({
					where: {
						username
					}
				})
				if (!userExists) {
					const createdUser = await tx.user.create({
						data: {
							username,
							displayName: username,
							email: `${username}@example.com`,
							password: passwordHash,
							avatarUrl: `/channels/${username}.png`,
							isDeactivated: false,
							isEmailVerified: false,
							socialLinks: {
								create: [
									{
										title: 'telegram',
										url: 'https://telegram.me/',
										position: 1
									},
									{
										title: 'facebook',
										url: 'https://facebook.com/',
										position: 2
									}
								]
							}
						}
					})

					const randomTitles = STREAMS[randomCategory.slug]
					if (!randomTitles || randomTitles.length === 0) {
						throw new BadRequestException(
							`No stream titles found for category ${randomCategory.slug}`
						)
					}
					const randomTitle =
						randomTitles[
							Math.floor(Math.random() * randomTitles.length)
						]
					await tx.stream.create({
						data: {
							title: randomTitle,
							category: {
								connect: { id: randomCategory.id }
							},
							thumbnailUrl: `/streams/${createdUser.username.toLowerCase()}.png`,
							user: {
								connect: { id: createdUser.id }
							}
						}
					})
				}
			}
		})

		Logger.log('Users seeded successfully.')
	} catch (e) {
		Logger.log(e)
		throw new BadRequestException('Failed to seed database')
	} finally {
		Logger.log('Seeding completed, disconnecting from database...')
		await prisma.$disconnect()
		Logger.log('Disconnected from database, exiting process.')
	}
}

main()
