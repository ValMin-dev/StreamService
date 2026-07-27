import { PropsWithChildren } from 'react'

interface AuthWrapperProps {}

export function AuthWrapper({ children }: PropsWithChildren<AuthWrapperProps>) {
	return (
		<>
			<div>{children}</div>
			<div>AuthWrapper</div>
		</>
	)
}
