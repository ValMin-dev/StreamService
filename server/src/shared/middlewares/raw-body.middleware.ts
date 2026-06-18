import {
	BadRequestException,
	Injectable,
	type NestMiddleware
} from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import * as getRawBody from 'raw-body'
@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		if (!req.readable) {
			return next(new BadRequestException('Request body is not readable'))
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
						'Failed to read raw body: ' + err.message
					)
				)
			})
	}
}
