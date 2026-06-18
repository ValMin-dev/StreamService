import { PrismaService } from '@/src/core/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateUserInput } from './inputs/create-user.input'
import { hash, verify } from 'argon2'
import { VerificationService } from '../verification/verification.service'
import type { User } from '@prisma/client'
import { ChangeEmailInput } from './inputs/change-email.input'
import { ChangePasswordInput } from './inputs/change-password.input'
@Injectable()
export class AccountService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly verificationService: VerificationService
	) {}

	async findAll() {
		const users = await this.prismaService.user.findMany({
			include: {
				socialLinks: true
			}
		})
		return users
	}

	async findSocialLinks(userId: string) {
		const socialLinks = await this.prismaService.socialLink.findMany({
			where: {
				userId
			},
			orderBy: {
				position: 'asc'
			}
		})
		return socialLinks
	}

	async findProfile(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			},
			include: {
				socialLinks: true
			}
		})
		return user
	}

	async create(dto: CreateUserInput) {
		const { email, username, password } = dto

		const existingUser = await this.prismaService.user.findUnique({
			where: {
				email: email
			}
		})

		if (existingUser) {
			throw new BadRequestException('User with this email already exists')
		}

		const existingUsername = await this.prismaService.user.findUnique({
			where: {
				username: username
			}
		})

		if (existingUsername) {
			throw new BadRequestException(
				'User with this username already exists'
			)
		}

		const user = await this.prismaService.user.create({
			data: {
				email,
				username: username || email.split('@')[0],
				displayName: username || email.split('@')[0],
				password: await hash(password),
				stream: {
					create: {
						title: `${username || email.split('@')[0]}'s Stream`,
						isLive: false
					}
				}
			}
		})
		await this.verificationService.sendVerificationToken(user)
		return true
	}

	async changeEmail(user: User, input: ChangeEmailInput) {
		const { email } = input

		const existingUser = await this.prismaService.user.findUnique({
			where: {
				email: email
			}
		})
		if (existingUser) {
			throw new BadRequestException('User with this email already exists')
		}
		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				email,
				isVerified: false
			}
		})
		await this.verificationService.sendVerificationToken(user)
		return true
	}

	async changePassword(user: User, input: ChangePasswordInput) {
		const { password, newPassword } = input

		const isValidPassword = await verify(user.password, password)
		if (!isValidPassword) {
			throw new BadRequestException('Invalid current password')
		}

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				password: await hash(newPassword)
			}
		})
		return true
	}
}
