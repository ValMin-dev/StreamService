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

interface VerificationTemplateProps {
	domain: string
	token: string
}

export function VerificationTemplate({
	domain,
	token
}: VerificationTemplateProps) {
	const verificationLink = `${domain}/verify?token=${token}`

	return (
		<Html>
			<Head />
			<Preview>Verify your email address</Preview>
			<Tailwind>
				<Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
					<Section className='text-center mb-8'>
						<Heading className='text-3xl text-black font-bold mb-4'>
							Verify Your Email Address
						</Heading>
						<Text className='text-base text-black'>
							Please click the button below to verify your email
							address and complete your registration.
						</Text>
						<Link
							href={verificationLink}
							className='inline-flex justify-center items-center rounded-md text-sm font-medium text-white bg-[#18B9AE] px-4 py-2 mt-4'
						>
							Verify Email
						</Link>
					</Section>

					<Section className='text-center mt-8'>
						<Text className='text-sm text-gray-500'>
							If you did not create an account, no further action
							is required.
						</Text>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	)
}
