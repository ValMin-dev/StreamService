import 'express-session'
import type { SessionMetadata } from './session-metadata.types'

declare module 'express-session' {
	export interface SessionData {
		id?: string
		userId?: string
		createdAt?: string | Date
		metadata?: SessionMetadata
	}
}
