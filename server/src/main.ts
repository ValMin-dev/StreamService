import { NestFactory } from '@nestjs/core'
import { CoreModule } from './core/core.module'
import cookieParser = require('cookie-parser')
import { ConfigService } from '@nestjs/config'
import session = require('express-session')
import { ms, type StringValue } from './shared/utils/ms.util'
import { parseBoolean } from './shared/utils/parse-boolean.util'
import redisStore from 'connect-redis'
import { RedisService } from './core/redis/redis.service'
import { ValidationPipe } from '@nestjs/common'
async function bootstrap() {
	const app = await NestFactory.create(CoreModule)
	const config = app.get(ConfigService)
	const redis = app.get(RedisService)

	app.use(cookieParser(config.getOrThrow<string>('COOKIE_SECRET')))

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)
	app.use(
		session({
			secret: config.getOrThrow<string>('SESSION_SECRET'),
			name: config.getOrThrow<string>('SESSION_COOKIE_NAME'),
			resave: false,
			saveUninitialized: false,
			cookie: {
				domain: config.getOrThrow<string>('SESSION_COOKIE_DOMAIN'),
				maxAge: ms(
					config.getOrThrow<StringValue>('SESSION_COOKIE_MAX_AGE')
				),
				httpOnly: parseBoolean(
					config.getOrThrow<string>('SESSION_COOKIE_HTTP_ONLY')
				),
				secure: parseBoolean(
					config.getOrThrow<string>('SESSION_COOKIE_SECURE')
				),
				sameSite: 'lax'
			},
			store: new redisStore({
				client: redis,
				prefix: config.getOrThrow<string>('SESSION_FOLDER')
			})
		})
	)
	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
		credentials: true,
		exposedHeaders: ['Set-Cookie']
	})
	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
bootstrap()
