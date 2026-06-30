import { Request, Response } from 'express'

// Тип контексту GraphQL зберігає request і response для guard'ів та декораторів.
export interface GqlContext {
	req: Request
	res: Response
}
