import { PrismaService } from '@/src/core/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { encode } from 'hi-base32'
import { randomBytes } from 'crypto'
import { TOTP } from 'otpauth'
import * as QRCode from 'qrcode'
import { EnableTotpInput } from './inputs/enable-totp.input'
@Injectable()
export class TotpService {
	constructor(private readonly prisma: PrismaService) {}

	async generate(user: User) {
		const secret = encode(randomBytes(15))
			.replace(/=/g, '')
			.substring(0, 24)

		const totp = new TOTP({
			issuer: 'TwitchCopy',
			label: `${user.email}`,
			algorithm: 'SHA1',
			digits: 6,
			secret
		})
		const otpauthUrl = totp.toString()
		const qrCodeUrl = await QRCode.toDataURL(otpauthUrl)
		return {
			qrCodeUrl,
			secret
		}
	}

	async enable(user: User, input: EnableTotpInput) {
		const { secret, pin } = input

		const totp = new TOTP({
			issuer: 'TwitchCopy',
			label: `${user.email}`,
			algorithm: 'SHA1',
			digits: 6,
			secret
		})

		const delta = totp.validate({ token: pin })

		if (delta === null) {
			throw new Error('Invalid PIN')
		}

		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				isTotpEnabled: true,
				totpSecret: secret
			}
		})

		return true
	}

	async disable(user: User) {
		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				isTotpEnabled: false,
				totpSecret: null
			}
		})
		return true
	}
}
