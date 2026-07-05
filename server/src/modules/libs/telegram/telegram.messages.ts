import { SessionMetadata } from '@/src/shared/types/session-metadata.types'
import type { User } from '@prisma/client'

// Набір текстів Telegram-бота: привітання, допомога, профіль і службові повідомлення.
export const MESSAGES = {
	START: (username: string) =>
		`👋 Вітаємо, ${username}, у TwitchCopy від @valmin_dev! Використайте /help, щоб побачити доступні команди.`,
	CONNECT_SUCCESS: '✅ Ваш акаунт успішно підключено!',
	WELCOME_BACK: (username: string) =>
		`👋 Ласкаво просимо знову, ${username}, у TwitchCopy від @valmin_dev! Використайте /help, щоб побачити доступні команди.`,
	CONNECT_FAILURE: '❌ Невірний або прострочений токен. Спробуйте ще раз.',
	ALREADY_CONNECTED: 'ℹ️ Ваш акаунт уже підключено.',
	HELP: '📚 Доступні команди:\n/connect <token> - Підключити акаунт\n/me - Показати інформацію про акаунт\n/help - Показати це повідомлення довідки',
	ME: (username: string, email: string) =>
		`👤 Інформація про ваш акаунт:\nІм’я користувача: ${username}\nЕлектронна пошта: ${email}`,
	NOT_CONNECTED: (username: string) =>
		`👋 Вітаємо, ${username}, у TwitchCopy від @valmin_dev! Будь ласка, підключіть бота до свого акаунта TwitchCopy за посиланням.`,
	NO_FOLLOWS:
		'🔔 Ви ще ні на кого не підписані. Почніть підписуватись на стрімерів, щоб отримувати сповіщення!',
	FOLLOWS_LIST: (user: User) =>
		`<a href="https://twitchcopy.com/${user.username}">${user.username}</a>`,
	INVALID_COMMAND:
		'❌ Невідома команда. Використайте /help, щоб побачити доступні команди.',
	ERROR: '⚠️ Сталася помилка. Спробуйте ще раз пізніше.',
	PROFILE: (user: User, followersCount: number) =>
		`📄 Інформація профілю:\nІм’я користувача: <b>${user.username}</b>\n` +
		`Підписники: <b>${followersCount}</b>\n` +
		`Email: <b>${user.email}</b>\n` +
		`Про мене: <b>${user.bio || 'Не вказано'}</b>\n`,
	RESET_PASSWORD: (token: string, metadata: SessionMetadata) =>
		`� Ви запросили скидання пароля.\n\n` +
		`🔗 Перейдіть за посиланням <a href="https://twitchcopy.com/account/recovery/${token}">Скидання пароля</a>\n` +
		`⏰ Токен дійсний протягом 15 хвилин.\n\n` +
		`<b>📅 Дата запиту:</b> ${new Date().toLocaleDateString()} о ${new Date().toLocaleTimeString()}\n` +
		`<b>🌐 IP-адреса:</b> ${metadata.ip}\n` +
		`<b>📍 Локація:</b> ${metadata.location?.city || 'Не визначено'}, ${metadata.location?.country || 'Не визначено'}\n` +
		`<b>📱 Пристрій:</b> ${metadata.device?.type || 'Не визначено'}, ${metadata.device?.os || 'Не визначено'}\n\n` +
		`<b>⚠️ Якщо це не ви, ігноруйте це повідомлення.</b> \n\n` +
		`🙏 Дякуємо, що користуєтесь TwitchCopy!`,
	DEACTIVATE_ACCOUNT: (token: string, metadata: SessionMetadata) =>
		`🚨 Ви запросили деактивацію акаунта.\n\n` +
		`🔢 Введіть код для підтвердження <b>${token}</b> деактивації акаунта\n` +
		`⏰ Токен дійсний протягом 15 хвилин.\n\n` +
		`<b>📅 Дата запиту:</b> ${new Date().toLocaleDateString()} о ${new Date().toLocaleTimeString()}\n` +
		`<b>🌐 IP-адреса:</b> ${metadata.ip}\n` +
		`<b>📍 Локація:</b> ${metadata.location?.city || 'Не визначено'}, ${metadata.location?.country || 'Не визначено'}\n` +
		`<b>📱 Пристрій:</b> ${metadata.device?.type || 'Не визначено'}, ${metadata.device?.os || 'Не визначено'}\n\n` +
		`<b>⚠️ Якщо це не ви, ігноруйте це повідомлення.</b> \n\n` +
		`🙏 Дякуємо, що користуєтесь TwitchCopy!`,
	SUCCESS_DEACTIVATION:
		`✅ Ваш акаунт успішно деактивовано.\n\n` +
		`<b>🔄 Якщо ви передумаєте, ви можете відновити свій акаунт протягом 30 днів.</b>\n\n` +
		`<a href="https://twitchcopy.com/account/recovery">🛟 Відновити акаунт</a>\n\n` +
		`<b>🗓️ Після 30 днів акаунт буде остаточно видалено.</b>`,

	FULL_DEACTIVATION:
		`🗑️ Ваш акаунт був остаточно видалений.\n\n` +
		`<b>🚫 Ви більше не зможете відновити свій акаунт.</b>\n\n` +
		`📝 Зареєструйтесь знову, щоб створити новий акаунт на TwitchCopy.\n\n` +
		`<a href="https://twitchcopy.com/register">✍️ Зареєструватися</a>`,
	SUCCESS_PASSWORD_RESET: `🔐 Ваш пароль успішно скинуто. Ви можете увійти з новим паролем.`,

	STREAM_START: (channel: User) =>
		`📺 ${channel.username} щойно розпочав трансляцію!\n\n` +
		`<a href="https://twitchcopy.com/${channel.username}">🔗 Перейти до трансляції</a>`,
	NEW_FOLLOW: (follower: User, followerCount: number) =>
		`💙 У вас новий підписник!\n\n` +
		`<a href="https://twitchcopy.com/${follower.username}">${follower.username}</a> підписався на вас!` +
		`\n\n👥 У вас тепер ${followerCount} підписників.`
}
