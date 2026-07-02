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
		`Про мене: <b>${user.bio || 'Не вказано'}</b>\n` +
		`⚙️ Налаштування: <b>Налаштування</b>`
}
