import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config/dist/config.service'
import Redis from 'ioredis'

// Redis-сервіс ініціалізує клієнт кешу та сесій з URL із конфігурації.
@Injectable()
export class RedisService extends Redis {
	constructor(private readonly configService: ConfigService) {
		super(configService.getOrThrow<string>('REDIS_URI'))
	}
}
