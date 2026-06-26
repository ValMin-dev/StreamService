import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { NotificationService } from './notification.service'
import { User } from '@prisma/client'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { NotificationModel } from './models/notification.model'
import { NotificationInput } from './inputs/notification.input'
import { ChangeNotificationsSettingsInput } from './inputs/change-notifications-settings.input'
import {
	ChangeNotificationSettingsResponse,
	NotificationSettingsModel
} from './models/notification-settings.model'

@Resolver('Notification')
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@Authorization()
	@Query(() => Number, { name: 'findUnreadCount' })
	async findUnreadCount(@Authorized() user: User) {
		return this.notificationService.findUnreadCount(user)
	}

	@Authorization()
	@Query(() => [NotificationModel], { name: 'findNotificationsByUserId' })
	async findNotificationsByUserId(@Authorized() user: User) {
		return this.notificationService.findNotificationsByUserId(user)
	}

	@Mutation(() => NotificationModel, { name: 'createNotification' })
	async createNotification(@Args('data') input: NotificationInput) {
		return this.notificationService.createNotification(input)
	}

	@Authorization()
	@Mutation(() => ChangeNotificationSettingsResponse, {
		name: 'changeNotificationSettings'
	})
	async changeNotificationSettings(
		@Authorized() user: User,
		@Args('data') input: ChangeNotificationsSettingsInput
	) {
		return this.notificationService.changeNotificationSettings(user, input)
	}
}
