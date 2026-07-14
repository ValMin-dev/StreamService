'use client'
import { useTranslations } from 'next-intl'
import { useFindChannelByUsernameQuery } from '../graphql/generated/output'
export default function Home() {
	const t = useTranslations('home')

	const { data, loading } = useFindChannelByUsernameQuery({
		variables: {
			username: 'samuel'
		}
	})
	// return <div>{loading ? 'Loading...' : JSON.stringify(data)}</div>
	return <div>{loading ? 'Loading...' : t('title')}</div>
}
