import { type MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { WebhookService } from './webhook.service'
import { WebhookController } from './webhook.controller'
import { RawBodyMiddleware } from '@/src/shared/middlewares/raw-body.middleware'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { NotificationService } from '../notification/notification.service'

@Module({
	controllers: [WebhookController],
	providers: [WebhookService, NotificationService, PrismaService]
})
export class WebhookModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RawBodyMiddleware).forRoutes({
			path: 'webhook/livekit',
			method: RequestMethod.POST
		})
	}
}
