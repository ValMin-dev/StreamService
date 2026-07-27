import { cn } from '@/utils/tw-merge'

import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Створити обліковий запис',
	description: 'Сторінка для створення облікового запису користувача'
}

export default function CreateAccountPage() {
	return (
		<div
			className={cn(
				'flex min-h-screen flex-col items-center justify-center'
			)}
		>
			<h1 className='text-3xl font-bold'>Create Account</h1>
		</div>
	)
}
