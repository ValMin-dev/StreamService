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
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types'

interface DeactivateTemplateProps {
	token: string
	metadata: SessionMetadata
}

export function DeactivateTemplate({
	token,
	metadata
}: DeactivateTemplateProps) {
	const deactivateLink = `/account/deactivate/${token}`

	return (
		<Html>
			<Head />
			<Preview>Deactivate your account</Preview>
			<Tailwind>
				<Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
					<Section className='text-center mb-8'>
						<Heading className='text-3xl text-black font-bold mb-4'>
							Request Deactivation of Your Account
						</Heading>
						<div className='text-center mb-8'>
							<Heading className='text-2xl text-black font-bold mb-4'>
								Request Information
							</Heading>
							<Text className='text-base text-black'>
								If you did not request to deactivate your
								account, someone may be trying to access your
								account. Here is some information about the
								session that initiated the request:
							</Text>
							<ul className='text-left text-black mt-4'>
								<li>
									<strong>IP Address:</strong> {metadata.ip}
								</li>
								<li>
									<strong>Device:</strong>{' '}
									{metadata.device.os}
								</li>
								<li>
									<strong>Browser:</strong>
									{metadata.device.browser}
								</li>
								<li>
									<strong>Location:</strong>
									{metadata.location.city} |
									{metadata.location.country}
								</li>
							</ul>
						</div>
						<Text className='text-base text-black'>
							Please click the button below to deactivate your
							account.
						</Text>

						<Link
							href={deactivateLink}
							className='inline-flex justify-center items-center rounded-md text-sm font-medium text-white bg-[#18B9AE] px-4 py-2 mt-4'
						>
							Deactivate Account
						</Link>
					</Section>

					<Section className='bg-gray-100 p-4 rounded-md mb-8 text-center'>
						<Heading className='text-2xl text-black font-semibold'>
							Verification Code:
						</Heading>
						<Heading className='text-3xl text-black font-semibold'>
							{token}
						</Heading>
						<Heading className='text'>
							{' '}
							this code for 5 minutes
						</Heading>
					</Section>

					<Section className='text-center mt-8'>
						<Text className='text-sm text-gray-500'>
							If you did not request to deactivate your account,
							no further action is required.
						</Text>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	)
}
