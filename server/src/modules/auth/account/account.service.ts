import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AccountService {
	constructor(private readonly prismaService: PrismaService) {}

	async findAll() {
		const users = await this.prismaService.user.findMany()
		return users
	}
}
