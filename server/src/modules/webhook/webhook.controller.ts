import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Headers,
	BadRequestException
} from '@nestjs/common'
import { WebhookService } from './webhook.service'

// Контролер приймає HTTP-вебхук від LiveKit і передає його в сервіс обробки.
@Controller('webhook')
export class WebhookController {
	constructor(private readonly webhookService: WebhookService) {}

	@Post('livekit')
	@HttpCode(HttpStatus.OK)
	async receiveLivekitWebhook(
		@Body() body: string,
		@Headers('Authorization') authorization: string
	) {
		if (!authorization) {
			throw new BadRequestException(
				'🔐 Відсутній заголовок Authorization'
			)
		}
		return this.webhookService.receiveLivekitWebhook(body, authorization)
	}
}
