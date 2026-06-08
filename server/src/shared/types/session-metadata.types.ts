export interface LocationInfo {
	city: string
	country: string
	latitude: number
	longitude: number
}

export interface DeviceInfo {
	type: string
	os: string
	browser: string
}

export interface SessionMetadata {
	ip: string
	location: LocationInfo | null
	device: DeviceInfo | null
}
