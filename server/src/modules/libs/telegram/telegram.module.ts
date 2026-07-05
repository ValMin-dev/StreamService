import { Global, Module } from '@nestjs/common'
import { TelegramService } from './telegram.service'
import { ConfigService } from '@nestjs/config'
import { ConfigModule } from '@nestjs/config'
import { getTelegrafConfig } from '@/src/core/config/telegraf.config'
import { TelegrafModule } from 'nestjs-telegraf'
@Global()
@Module({
	imports: [
		TelegrafModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getTelegrafConfig
		})
	],
	providers: [TelegramService],
	exports: [TelegramService]
})
export class TelegramModule {}
