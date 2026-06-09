import { PrismaService } from '@/src/core/prisma/prisma.service'
import { type User, TokenType } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

export async function generateToken(
	prisma: PrismaService,
	user: User,
	type: TokenType,
	isUUID: boolean = false
) {
	let token: string
	if (isUUID) {
		token = uuidv4()
	} else {
		token = Math.floor(
			Math.random() * (1000000 - 100000) + 100000
		).toString()
	}
	const expiresIn = new Date(Date.now() + 60 * 5 * 1000)
	const existingToken = await prisma.token.findFirst({
		where: {
			user: { id: user.id },
			type
		}
	})
	if (existingToken) {
		return prisma.token.delete({
			where: {
				id: existingToken.id
			}
		})
	}

	const newToken = await prisma.token.create({
		data: {
			token,
			user: { connect: { id: user.id } },
			type,
			expiresIn
		},
		include: { user: true }
	})
	return newToken
}
