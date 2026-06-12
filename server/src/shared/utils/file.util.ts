import { ReadStream } from 'fs'

export function validateFileFormat(
	filename: string,
	allowedFormats: string[]
): boolean {
	const fileExtension = filename.split('.')
	const lastSegment = fileExtension[fileExtension.length - 1]?.toLowerCase()
	return allowedFormats.includes(lastSegment || '')
}

export async function validateFileSize(
	fileStream: ReadStream,
	maxSizeInBytes: number
) {
	return new Promise((resolve, reject) => {
		let fileSizeInBytes = 0
		fileStream
			.on('data', (data: Buffer) => {
				fileSizeInBytes += data.length
			})
			.on('end', () => {
				resolve(fileSizeInBytes <= maxSizeInBytes)
			})
			.on('error', err => {
				reject(err)
			})
	})
}
