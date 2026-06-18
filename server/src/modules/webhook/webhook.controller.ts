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
			throw new BadRequestException('Missing Authorization header')
		}
		return this.webhookService.receiveLivekitWebhook(body, authorization)
	}
}
