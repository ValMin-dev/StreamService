import {
	Injectable,
	type PipeTransform,
	type ArgumentMetadata,
	BadRequestException
} from '@nestjs/common'

import { validateFileFormat, validateFileSize } from '../utils/file.util'
import { ReadStream } from 'fs'

// Pipe перевіряє наявність файлу, його формат і розмір перед подальшою обробкою.
@Injectable()
export class FileValidationPipe implements PipeTransform {
	async transform(value: any, metadata: ArgumentMetadata) {
		if (!value || !value.file) {
			throw new BadRequestException('Файл не передано')
		}
		const { filename, createReadStream } = value
		const fileStream = createReadStream() as ReadStream
		const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
		const isValidFormat = validateFileFormat(filename, allowedFormats)
		if (!isValidFormat) {
			throw new BadRequestException(
				'Неприпустимий формат файлу. Дозволені формати: jpg, jpeg, png, gif, webp'
			)
		}
		const isValidSize = await validateFileSize(fileStream, 10 * 1024 * 1024) //  10MB
		if (!isValidSize) {
			throw new BadRequestException(
				'Розмір файлу перевищує максимальне обмеження 10 МБ'
			)
		}
		return value
	}
}
