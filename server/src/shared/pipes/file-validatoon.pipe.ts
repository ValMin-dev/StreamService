import {
	Injectable,
	type PipeTransform,
	type ArgumentMetadata
} from '@nestjs/common'

import { validateFileFormat, validateFileSize } from '../utils/file.util'
import { ReadStream } from 'fs'
@Injectable()
export class FileValidationPipe implements PipeTransform {
	async transform(value: any, metadata: ArgumentMetadata) {
		if (!value || !value.file) {
			throw new Error('No file provided')
		}
		const { filename, createReadStream } = value
		const fileStream = createReadStream() as ReadStream
		const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
		const isValidFormat = validateFileFormat(filename, allowedFormats)
		if (!isValidFormat) {
			throw new Error(
				'Invalid file format. Allowed formats: jpg, jpeg, png, gif, webp'
			)
		}
		const isValidSize = await validateFileSize(fileStream, 10 * 1024 * 1024) //  10MB
		if (!isValidSize) {
			throw new Error('File size exceeds the maximum limit of 10MB')
		}
		return value
	}
}
