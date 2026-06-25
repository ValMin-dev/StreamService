import { Args, Query, Resolver } from '@nestjs/graphql'
import { NotificationService } from './notification.service'
import { User } from '@prisma/client'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'

@Resolver('Notification')
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@Authorization()
	@Query(() => [Notification], { name: 'findNotificationsByUserId' })
	async findNotificationsByUserId(@Authorized() user: User) {
		return this.notificationService.findNotificationsByUserId(user)
	}

	@Authorization()
	@Query(() => [Notification], { name: 'findAllNotificationsByUserId' })
	async findAllNotificationsByUserId(@Authorized() user: User) {
		return this.notificationService.findAllNotificationsByUserId(user)
	}

	@Authorization()
	@Query(() => Notification, { name: 'markNotificationAsRead' })
	async markNotificationAsRead(
		@Authorized() user: User,
		@Args('notificationId') notificationId: string
	) {
		return this.notificationService.markNotificationAsRead(
			user,
			notificationId
		)
	}
}
