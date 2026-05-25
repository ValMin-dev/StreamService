import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IS_DEV_ENV } from '../shared/utils/is-dev.utils';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { getGraphQLConfig } from './config/graphql.config';
import { ApolloDriver} from '@nestjs/apollo';
import { RedisModule } from './redis/redis.module';
@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
    ignoreEnvFile: !IS_DEV_ENV,
    isGlobal: true,
  }),
  GraphQLModule.forRootAsync({
    driver: ApolloDriver,
    useFactory: getGraphQLConfig,
    inject: [ConfigService],
    imports: [ConfigModule],
  }),
  RedisModule,
],
})
export class CoreModule {}
