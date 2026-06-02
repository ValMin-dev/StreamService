import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { IS_DEV_ENV } from '../shared/utils/is-dev.util'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import { getGraphQLConfig } from './config/graphql.config'
import { RedisModule } from './redis/redis.module'
import { AccountModule } from '../modules/auth/account/account.module'

@Module({
	imports: [
		PrismaModule,
		AccountModule,
		GraphQLModule.forRootAsync({
			driver: ApolloDriver,
			useFactory: getGraphQLConfig,
			imports: [ConfigModule],
			inject: [ConfigService]
		}),
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		RedisModule
	]
})
export class CoreModule {}
