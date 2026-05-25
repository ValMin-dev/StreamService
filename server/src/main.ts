import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'

import { CoreModule } from './core/core.module'

async function bootstrap() {
	const app = await NestFactory.create(CoreModule)
	const config = app.get(ConfigService)
	app.enableCors({
		origin: config.get('ALLOW_ORIGIN'),
		credentials: true,
		exposedHeaders: ['Set-Cookie']
	})
	app.use(cookieParser(config.getOrThrow<string>('COOKIE_SECRET')))
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true
		})
	)

	await app.listen(config.get('APP_PORT') ?? 3000)
}
bootstrap()
