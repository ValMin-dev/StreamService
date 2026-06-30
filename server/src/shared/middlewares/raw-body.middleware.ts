import {
	BadRequestException,
	Injectable,
	type NestMiddleware
} from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import getRawBody from 'raw-body'

// Middleware читає сире тіло запиту повністю, щоб вебхуки можна було валідовувати підписом.
@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		if (!req.readable) {
			return next(
				new BadRequestException('Тіло запиту неможливо прочитати')
			)
		}
		getRawBody(req, {
			encoding: 'utf8'
		})
			.then(rawBody => {
				req.body = rawBody
				next()
			})
			.catch(err => {
				next(
					new BadRequestException(
						'Не вдалося прочитати сире тіло запиту: ' + err.message
					)
				)
			})
	}
}
