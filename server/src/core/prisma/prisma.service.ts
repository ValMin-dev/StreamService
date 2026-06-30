import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

// Prisma-сервіс керує життєвим циклом підключення до бази даних у межах Nest-модуля.
@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	public async onModuleInit() {
		await this.$connect()
	}

	public async onModuleDestroy() {
		await this.$disconnect()
	}
}
