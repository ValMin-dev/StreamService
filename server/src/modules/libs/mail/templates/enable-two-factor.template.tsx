import * as React from 'react'
import {
	Body,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Tailwind,
	Text
} from '@react-email/components'

interface EnableTwoFactorTemplateProps {
	domain: string
}

export function EnableTwoFactorTemplate({
	domain
}: EnableTwoFactorTemplateProps) {
	const settingsLink = `${domain}/dashboard/settings`

	return (
		<Html>
			<Head />
			<Preview>Потурбуйтесь про безпеку акаунта</Preview>
			<Tailwind>
				<Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
					<Section className='text-center mb-8'>
						<Heading className='text-3xl text-black font-bold'>
							Захистіть свій акаунт за допомогою двофакторної
							аутентифікації
						</Heading>
						<Text className='text-black text-base mt-2'>
							Увімкніть двофакторну аутентифікацію, щоб підвищити
							безпеку вашого акаунта.
						</Text>
					</Section>

					<Section className='bg-white rounded-lg shadow-md p-6 text-center mb-6'>
						<Heading className='text-2xl text-black font-semibold'>
							Чому це важливо?
						</Heading>
						<Text className='text-base text-black mt-2'>
							Двофакторна аутентифікація додає додатковий рівень
							захисту, вимагаючи код, який відомий лише вам.
						</Text>
						<Link
							href={settingsLink}
							className='inline-flex justify-center items-center rounded-md text-sm font-medium text-white bg-[#18B9AE] px-5 py-2 rounded-full'
						>
							Перейти в налаштування акаунта
						</Link>
					</Section>

					<Section className='text-center mt-8'>
						<Text className='text-gray-600'>
							Якщо у вас виникли питання, звертайтесь у службу
							підтримки за адресою
							<Link
								href='mailto:help@copy_twitch.com'
								className='text-[#18b9ae] underline'
							>
								help@copy_twitch.com
							</Link>
							.
						</Text>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	)
}
