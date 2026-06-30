import 'express-session'
import type { SessionMetadata } from './session-metadata.types'

// Розширення типів express-session додає поля, які ми зберігаємо в сесії користувача.
declare module 'express-session' {
	interface SessionData {
		userId?: string
		createdAt?: Date | string
		metadata?: SessionMetadata
	}
}
