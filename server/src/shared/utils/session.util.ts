import type { User } from '@prisma/client'
import type { SessionMetadata } from '../types/session-metadata.types'
import type { Request } from 'express'
import { ConfigService } from '@nestjs/config'

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
				return reject(new Error('Failed to save session'))
			}
			console.log('Session saved successfully:', user)
			resolve(user)
		})
	})
}

export function destroySession(req: Request, configService: ConfigService) {
	return new Promise((resolve, reject) => {
		req.session.destroy(err => {
			if (err) {
				return reject(new Error('Failed to destroy session'))
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
