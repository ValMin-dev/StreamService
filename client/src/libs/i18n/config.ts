export const COOKIE_NAME = 'language'
export const languages = ['ua', 'en'] as const
export const defaultLanguage: Language = 'ua'

export type Language = (typeof languages)[number]
