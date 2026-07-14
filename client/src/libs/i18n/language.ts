'use server'

import { cookies } from 'next/headers'
import { COOKIE_NAME, type Language, defaultLanguage } from './config'

export async function getCurrentLanguage(): Promise<Language> {
	const cookieStore = await cookies()
	const language = cookieStore.get(COOKIE_NAME)?.value as Language | undefined
	return language ?? defaultLanguage
}

export async function setCurrentLanguage(language: Language): Promise<void> {
	const cookieStore = await cookies()
	cookieStore.set(COOKIE_NAME, language)
}
