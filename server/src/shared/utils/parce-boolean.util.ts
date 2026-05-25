export function parseBoolean(value: string | boolean | undefined): boolean {
	if (typeof value === 'boolean') {
		return value
	}
	if (typeof value === 'string') {
		const lowerValue = value.toLowerCase()
		if (lowerValue === 'true') {
			return true
		}
		if (lowerValue === 'false') {
			return false
		}
	}
	throw new Error(`Invalid boolean value: ${value}`)
}
