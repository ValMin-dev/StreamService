import { ModuleMetadata, FactoryProvider } from '@nestjs/common'
import Stripe from 'stripe'
export const StripeOptionsSymbol = Symbol('StripeOptionsSymbol')

type StripeConfig = ConstructorParameters<typeof Stripe>[1]
export type TypeStripeOptions = {
	apiKey: string
	config?: StripeConfig
}

export type TypeLiveKitOptions = {
	apiUrl: string
	apiKey: string
	apiSecret: string
}

export type TypeStripeAsyncOptions = Pick<ModuleMetadata, 'imports'> &
	Pick<FactoryProvider<TypeStripeOptions>, 'useFactory' | 'inject'>
