import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Headers,
	BadRequestException,
	RawBody
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

	@Post('stripe')
	@HttpCode(HttpStatus.OK)
	async receiveWebhookStripe(
		@RawBody() rawBody: string,
		@Headers('stripe-signature') sig: string
	) {
		if (!sig) {
			throw new BadRequestException('Відсутній Stripe у заголовку ')
		}
		const event = await this.webhookService.constructStripeEvent(
			rawBody,
			sig
		)

		await this.webhookService.receiveWebhookStripe(event)
	}
}
