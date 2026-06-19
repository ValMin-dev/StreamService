import { CategoryService } from './category.service'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { CategoryModel } from './models/category.model'

@Resolver('Category')
export class CategoryResolver {
	constructor(private readonly categoryService: CategoryService) {}

	@Query(() => [CategoryModel], { name: 'findAllCategories' })
	async findAll() {
		return this.categoryService.findAll()
	}

	@Query(() => [CategoryModel], { name: 'findRandomCategories' })
	async findRandomCategories() {
		return this.categoryService.findRandomCategory()
	}

	@Query(() => CategoryModel, { name: 'getCategoryBySlug' })
	async getCategoryBySlug(@Args('slug') slug: string) {
		return this.categoryService.getCategoryBySlug(slug)
	}
}
