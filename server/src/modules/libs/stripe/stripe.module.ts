import { DynamicModule, Module } from '@nestjs/common'
import { StripeService } from './stripe.service'
import {
	TypeStripeOptions,
	StripeOptionsSymbol,
	TypeStripeAsyncOptions
} from './types/stripe.types'

@Module({})
export class StripeModule {
	static register(options: TypeStripeOptions): DynamicModule {
		return {
			module: StripeModule,
			providers: [
				{
					provide: StripeOptionsSymbol,
					useValue: options
				},
				StripeService
			],
			exports: [StripeService],
			global: true
		}
	}

	static registerAsync(options: TypeStripeAsyncOptions): DynamicModule {
		return {
			module: StripeModule,
			imports: options.imports || [],
			providers: [
				{
					provide: StripeOptionsSymbol,
					useFactory: options.useFactory,
					inject: options.inject || []
				},
				StripeService
			],
			exports: [StripeService],
			global: true
		}
	}
}
