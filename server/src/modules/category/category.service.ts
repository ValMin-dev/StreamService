import { PrismaService } from '@/src/core/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'

// Сервіс працює з категоріями: повертає всі категорії, випадкові добірки та категорію за slug.
@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll() {
		const categories = await this.prisma.category.findMany({
			orderBy: { createdAt: 'asc' },
			include: {
				streams: {
					include: {
						category: true,
						user: true
					}
				}
			}
		})
		if (!categories) {
			throw new BadRequestException('Категорії не знайдено')
		}
		return categories
	}

	async findRandomCategory() {
		const total = await this.prisma.category.count()

		const randomIndexes = new Set<number>()
		while (randomIndexes.size < 7 && randomIndexes.size < total) {
			randomIndexes.add(Math.floor(Math.random() * total))
		}

		const categories = await this.prisma.category.findMany({
			take: total,
			skip: 0,
			include: {
				streams: {
					include: {
						category: true,
						user: true
					}
				}
			}
		})

		return Array.from(randomIndexes).map(index => categories[index])
	}

	async getCategoryBySlug(slug: string) {
		const category = await this.prisma.category.findUnique({
			where: { slug },
			include: {
				streams: {
					where: {
						user: { isDeactivated: false }
					},
					include: { user: true, category: true }
				}
			}
		})
		if (!category) {
			throw new BadRequestException('Категорію не знайдено')
		}
		return category
	}
}
