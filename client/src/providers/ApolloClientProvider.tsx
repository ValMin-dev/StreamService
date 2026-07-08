'use client'

import { client } from '@/libs/apollo-client'
import { ApolloProvider } from '@apollo/client/react'
import { PropsWithChildren } from 'react'

export function ApolloClientProvider({ children }: PropsWithChildren<unknown>) {
	return <ApolloProvider client={client}>{children}</ApolloProvider>
}
