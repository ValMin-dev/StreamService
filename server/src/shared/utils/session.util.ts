import type { User } from '@prisma/client'
import type { SessionMetadata } from '../types/session-metadata.types'
import type { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { BadRequestException } from '@nestjs/common'

// Утиліти зберігають і знищують сесію користувача в express-session та Redis store.
export function saveSession(
	req: Request,
	user: User,
	metadata: SessionMetadata
) {
	return new Promise((resolve, reject) => {
		req.session.userId = user.id
		req.session.createdAt = new Date()
		req.session.metadata = metadata
		req.session.save(err => {
			if (err) {
				return reject(
					new BadRequestException('Не вдалося зберегти сесію')
				)
			}
			console.log('Сесію успішно збережено:', user)
			resolve(user)
		})
	})
}

export function destroySession(req: Request, configService: ConfigService) {
	return new Promise((resolve, reject) => {
		req.session.destroy(err => {
			if (err) {
				return reject(
					new BadRequestException('Не вдалося знищити сесію')
				)
			} else {
				const cookieName = configService.getOrThrow<string>(
					'SESSION_COOKIE_NAME'
				)
				const cookieDomain = configService.getOrThrow<string>(
					'SESSION_COOKIE_DOMAIN'
				)
				req.res?.clearCookie(cookieName, {
					domain: cookieDomain,
					path: '/',
					httpOnly: true,
					sameSite: 'lax',
					secure: req.secure
				})
				resolve(true)
			}
		})
	})
}
