'use client'
import { useFindChannelByUsernameQuery } from '../graphql/generated/output'
export default function Home() {
	const { data, loading } = useFindChannelByUsernameQuery({
		variables: {
			username: 'samuel'
		}
	})
	return <div>{loading ? 'Loading...' : JSON.stringify(data)}</div>
}
