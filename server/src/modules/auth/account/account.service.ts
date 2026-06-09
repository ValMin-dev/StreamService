import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { CreateUserInput } from './inputs/create-user.input'
import { hash } from 'argon2'
import { VerificationService } from '../verification/verification.service'
@Injectable()
export class AccountService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly verificationService: VerificationService
	) {}

	async findAll() {
		const users = await this.prismaService.user.findMany()
		return users
	}

	async create(dto: CreateUserInput) {
		const { email, username, password } = dto

		const existingUser = await this.prismaService.user.findUnique({
			where: {
				email: email
			}
		})

		if (existingUser) {
			throw new Error('User with this email already exists')
		}

		const existingUsername = await this.prismaService.user.findUnique({
			where: {
				username: username
			}
		})

		if (existingUsername) {
			throw new Error('User with this username already exists')
		}

		const user = await this.prismaService.user.create({
			data: {
				email,
				username: username || email.split('@')[0],
				displayName: username || email.split('@')[0],
				password: await hash(password)
			}
		})
		await this.verificationService.sendVerificationToken(user)
		return true
	}
}
