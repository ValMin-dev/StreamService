import { Metadata } from 'next'
import { AuthWrapper } from '../AuthWrapper'

export const metadata: Metadata = {
	title: 'Створити обліковий запис',
	description: 'Сторінка для створення облікового запису користувача'
}

export default function CreateAccountForm() {
	return (
		<AuthWrapper>
			<div>Create Account Form</div>
		</AuthWrapper>
	)
}
