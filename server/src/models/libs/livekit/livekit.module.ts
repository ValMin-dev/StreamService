import { type DynamicModule, Module } from '@nestjs/common'
import {
	TypeLiveKitOptions,
	LiveKitOptionsSymbol,
	TypeLivekitAsyncOptions
} from './types/livekit.types'
import { LivekitService } from './livekit.service'

@Module({})
export class LivekitModule {
	static register(options: TypeLiveKitOptions): DynamicModule {
		return {
			module: LivekitModule,
			providers: [
				{
					provide: LiveKitOptionsSymbol,
					useValue: options
				},
				LivekitService
			],
			exports: [LivekitService],
			global: true
		}
	}
	static registerAsync(options: TypeLivekitAsyncOptions): DynamicModule {
		return {
			module: LivekitModule,
			imports: options.imports || [],
			providers: [
				{
					provide: LiveKitOptionsSymbol,
					useFactory: options.useFactory,
					inject: options.inject || []
				},
				LivekitService
			],
			exports: [LivekitService],
			global: true
		}
	}
}
