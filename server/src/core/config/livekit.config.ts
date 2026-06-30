import { TypeLiveKitOptions } from '@/src/models/libs/livekit/types/livekit.types'
import { ConfigService } from '@nestjs/config'

// Конфігурація збирає параметри підключення до LiveKit із змінних середовища.
export function getLiveKitConfig(
	configService: ConfigService
): TypeLiveKitOptions {
	return {
		apiUrl: configService.get<string>('LIVEKIT_API_URL'),
		apiKey: configService.get<string>('LIVEKIT_API_KEY'),
		apiSecret: configService.get<string>('LIVEKIT_API_SECRET')
	}
}
