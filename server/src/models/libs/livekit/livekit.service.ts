import {
	Inject,
	Injectable,
	InternalServerErrorException
} from '@nestjs/common'
import {
	IngressClient,
	RoomServiceClient,
	WebhookReceiver
} from 'livekit-server-sdk'
import { LiveKitOptionsSymbol, TypeLiveKitOptions } from './types/livekit.types'

// Обгортка над LiveKit SDK: створює клієнти для кімнат, ingress і перевірки вебхуків.
@Injectable()
export class LivekitService {
	private roomService: RoomServiceClient
	private ingressClient: IngressClient
	private webhookReceiver: WebhookReceiver

	constructor(
		@Inject(LiveKitOptionsSymbol)
		private readonly options: TypeLiveKitOptions
	) {
		if (!options.apiUrl || !options.apiKey || !options.apiSecret) {
			throw new InternalServerErrorException(
				'LiveKit config is missing. Set LIVEKIT_API_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET.'
			)
		}

		this.roomService = new RoomServiceClient(
			this.options.apiUrl,
			this.options.apiKey,
			this.options.apiSecret
		)
		this.ingressClient = new IngressClient(this.options.apiUrl)
		this.webhookReceiver = new WebhookReceiver(
			this.options.apiKey,
			this.options.apiSecret
		)
	}
	get ingress(): IngressClient {
		return this.createProxy(this.ingressClient)
	}
	get room(): RoomServiceClient {
		return this.createProxy(this.roomService)
	}
	get receiver(): WebhookReceiver {
		return this.createProxy(this.webhookReceiver)
	}

	private createProxy<T extends object>(target: T) {
		return new Proxy(target, {
			get: (obj, prop) => {
				const value = obj[prop as keyof T]
				if (typeof value === 'function') {
					return value.bind(obj)
				}
				return value
			}
		})
	}
}
