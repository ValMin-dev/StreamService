import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'
import { PrismaService } from 'src/core/prisma/prisma.service'

import { CreateUserInput } from './inputs/create-user.input'

@Injectable()

export class AccountService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findAll() {
		const users = await this.prismaService.users.findMany()
		return users
	}

	public async create(input: CreateUserInput) {
		const { username, email, password } = input
		const isUsernameExists = await this.prismaService.users.findUnique({
			where: {
				username
			}
		})
		if (isUsernameExists) {
			throw new Error("Це ім'я користувача вже використовується")
		}
		const isEmailExists = await this.prismaService.users.findUnique({
			where: {
				email
			}
		})
		if (isEmailExists) {
			throw new Error('Ця електронна адреса вже використовується')
		}

		await this.prismaService.users.create({
			data: {
				username,
				email,
				password: await hash(password),
				name: username
			}
		})
		return true
	}

	public async findById(id: string) {
		const user = await this.prismaService.users.findUnique({
			where: {
				id
			}
		})
		return user
	}
}
