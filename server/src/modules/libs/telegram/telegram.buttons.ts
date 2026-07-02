import { Markup } from 'telegraf'

// Кнопки Telegram-бота для швидкої навігації після авторизації та в профілі.
export const BUTTONS = {
	authSuccess: Markup.inlineKeyboard([
		[
			Markup.button.callback('📺 Мої підписки', 'follows'),
			Markup.button.callback('👤 Мій профіль', 'me')
		],
		[Markup.button.url('🌐 TwitchCopy', 'https://twitchcopy.com')]
	]),
	profile: Markup.inlineKeyboard([
		Markup.button.url(
			'⚙️ Налаштування профілю',
			'https://twitchcopy.com/dashboard/settings'
		)
	])
}
