'use client'
import { useTranslations } from 'next-intl'
import { useFindChannelByUsernameQuery } from '../graphql/generated/output'
import { Button } from '@/components/ui/common/button'
export default function Home() {
	const t = useTranslations('home')

	const { data, loading } = useFindChannelByUsernameQuery({
		variables: {
			username: 'samuel'
		}
	})
	// return <div>{loading ? 'Loading...' : JSON.stringify(data)}</div>
	return (
		<div>
			{loading ? 'Loading...' : t('title')}
			<Button variant='default' onClick={() => alert('Button clicked!')}>
				Click Me
			</Button>
			<Button variant='outline' onClick={() => alert('Button clicked!')}>
				Click Me
			</Button>
			<Button
				variant='secondary'
				onClick={() => alert('Button clicked!')}
			>
				Click Me
			</Button>
			<Button variant='ghost' onClick={() => alert('Button clicked!')}>
				Click Me
			</Button>
			<Button
				variant='destructive'
				onClick={() => alert('Button clicked!')}
			>
				Click Me
			</Button>
			<Button variant='link' onClick={() => alert('Button clicked!')}>
				Click Me
			</Button>
		</div>
	)
}
