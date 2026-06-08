import {
	DeviceInfo,
	LocationInfo,
	SessionMetadata
} from '@/src/shared/types/session-metadata.types'
import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class LocationModel implements LocationInfo {
	@Field(() => String)
	country: string

	@Field(() => String)
	city: string

	@Field(() => Number)
	latitude: number

	@Field(() => Number)
	longitude: number
}

@ObjectType()
export class DeviceModel implements DeviceInfo {
	@Field(() => String)
	type: string

	@Field(() => String)
	os: string

	@Field(() => String)
	browser: string
}

@ObjectType()
export class SessionMetadataModel implements SessionMetadata {
	@Field(() => String)
	ip: string

	@Field(() => LocationModel, { nullable: true })
	location: LocationModel | null

	@Field(() => DeviceModel, { nullable: true })
	device: DeviceModel | null
}

@ObjectType()
export class SessionModel {
	@Field(() => ID)
	id: string

	@Field(() => String)
	userId: string

	@Field(() => String)
	createdAt: string

	@Field(() => SessionMetadataModel, { nullable: true })
	metadata: SessionMetadataModel | null
}
