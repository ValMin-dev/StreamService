import * as React from 'react'
import { Html } from '@react-email/html'
import {
	Head,
	Body,
	Link,
	Preview,
	Section,
	Heading,
	Text,
	Tailwind
} from '@react-email/components'

interface AccountDeletionTemplateProps {
	domain: string
}

export function AccountDeletionTemplate({
	domain
}: AccountDeletionTemplateProps) {
	const registrationLink = `${domain}/account/create`
	return (
		<Html>
			<Head />
			<Preview>Your account deleted</Preview>
			<Tailwind>
				<Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
					<Section className='text-center mb-8'>
						<Heading className='text-3xl text-black font-bold mb-4'>
							Your Account Deletion Request
						</Heading>
						<div className='text-center mb-8'>
							<Text className='text-base text-black'>
								Your account has been successfully deleted. If
								you did not request this action, please contact
								our support team immediately. All information
								associated with your account has been removed
								from our system.
							</Text>
						</div>
					</Section>
					<Section className='text-center mt-8'>
						<Text className='text-sm text-gray-500'>
							If you want to create a new account, you can do so
							by visiting our website and signing up again.
						</Text>
					</Section>
					<Link
						href={registrationLink}
						className='inline-flex justify-center items-center rounded-md text-sm font-medium text-white bg-[#18B9AE] px-4 py-2 mt-4'
					>
						Create New Account
					</Link>

					<Text className='text-xs text-gray-400 mt-4'>
						Thank you for being with us. If you have any questions
						or need assistance, please don't hesitate to contact our
						support team.
					</Text>
				</Body>
			</Tailwind>
		</Html>
	)
}
