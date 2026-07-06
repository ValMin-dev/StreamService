import { TotpModule } from './../modules/auth/totp/totp.module'
import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { IS_DEV_ENV } from '../shared/utils/is-dev.util'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import { getGraphQLConfig } from './config/graphql.config'
import { RedisModule } from './redis/redis.module'
import { AccountModule } from '../modules/auth/account/account.module'
import { SessionModule } from '../modules/auth/session/session.module'
import { VerificationModule } from '../modules/auth/verification/verification.module'
import { MailModule } from '../modules/libs/mail/mail.module'
import { PasswordRecoveryModule } from '../modules/auth/password-recovery/password-recovery.module'
import { DeactivateModule } from '../modules/auth/deactivate/deactivate.module'
import { CronModule } from '../modules/cron/cron.module'
import { StorageModule } from '../modules/libs/storage/storage.module'
import { ProfileModule } from '../modules/auth/profile/profile.module'
import { StreamModule } from '../modules/stream/stream.module'
import { LivekitModule } from '../models/libs/livekit/livekit.module'
import { getLiveKitConfig } from './config/livekit.config'
import { IngressModule } from '../modules/stream/ingress/ingress.module'
import { WebhookModule } from '../modules/webhook/webhook.module'
import { CategoryModule } from '../modules/category/category.module'
import { ChatModule } from '../modules/chat/chat.module'
import { FollowModule } from '../modules/follow/follow.module'
import { ChannelModule } from '../modules/channel/channel.module'
import { NotificationModule } from '../modules/notification/notification.module'
import { TelegramModule } from '../modules/libs/telegram/telegram.module'
import { StripeModule } from '../modules/libs/stripe/stripe.module'
import { getStripeConfig } from './config/stripe.config'
import { SubscriptionModule } from '../modules/sponsorship/subscription/subscription.module'
import { TransactionModule } from '../modules/sponsorship/transaction/transaction.module'
import { PlanModule } from '../modules/sponsorship/plan/plan.module'
@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		PrismaModule,
		AccountModule,
		SessionModule,
		VerificationModule,
		MailModule,
		PasswordRecoveryModule,
		TotpModule,
		DeactivateModule,
		CronModule,
		StorageModule,
		ProfileModule,
		StreamModule,
		WebhookModule,
		IngressModule,
		CategoryModule,
		ChatModule,
		ChannelModule,
		NotificationModule,
		PlanModule,
		TransactionModule,
		SubscriptionModule,
		FollowModule,
		TelegramModule,
		StripeModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getStripeConfig
		}),

		LivekitModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getLiveKitConfig
		}),
		GraphQLModule.forRootAsync({
			driver: ApolloDriver,
			useFactory: getGraphQLConfig,
			imports: [ConfigModule],
			inject: [ConfigService]
		}),
		RedisModule
	]
})
export class CoreModule {}
