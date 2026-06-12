import { Injectable } from '@nestjs/common'
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand
} from '@aws-sdk/client-s3'
import {
	PutObjectCommandInput,
	DeleteObjectCommandInput
} from '@aws-sdk/client-s3/dist-types/commands'
import { ConfigService } from '@nestjs/config'
@Injectable()
export class StorageService {
	private readonly client: S3Client
	private readonly bucket: string

	constructor(private readonly configService: ConfigService) {
		this.client = new S3Client({
			endpoint: this.configService.get<string>('S3_ENDPOINT'),
			region: this.configService.get<string>('S3_REGION'),
			credentials: {
				accessKeyId:
					this.configService.getOrThrow<string>('S3_ACCESS_KEY'),
				secretAccessKey:
					this.configService.getOrThrow<string>('S3_SECRET_KEY')
			}
		})
		this.bucket = this.configService.getOrThrow<string>('S3_BUCKET')
	}

	async upload(buffer: Buffer, key: string, mimeType: string) {
		const command: PutObjectCommandInput = {
			Bucket: this.bucket,
			Key: String(key),
			Body: buffer,
			ContentType: mimeType
		}
		try {
			await this.client.send(new PutObjectCommand(command))
			return `${this.configService.get<string>('S3_ENDPOINT')}/${this.bucket}/${key}`
		} catch (error) {
			console.error('Error uploading file to S3:', error)
		}
	}

	async remove(key: string) {
		const command: DeleteObjectCommandInput = {
			Bucket: this.bucket,
			Key: String(key)
		}
		try {
			await this.client.send(new DeleteObjectCommand(command))
		} catch (error) {
			console.error('Error deleting file from S3:', error)
		}
	}
}
