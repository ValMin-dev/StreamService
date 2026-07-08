require('dotenv').config()
const path = require('path')

// Prefer a local schema file (used by VS Code extensions) and fall back to the
// runtime URL from env when available.
const localSchemaFile = path.resolve(
	__dirname,
	'../server/src/core/graphql/schema.gql'
)

module.exports = {
	service: {
		url: process.env.NEXT_PUBLIC_SERVER_URL || undefined,
		// extension tooling (and apollo codegen) can use this local schema file
		localSchemaFile,
		name: 'CopyTwitch',
		skipSSLValidation: true
	}
}
