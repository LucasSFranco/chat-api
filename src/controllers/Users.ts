import { hash } from 'bcryptjs'
import { Request, Response } from 'express'
import { ValidationError } from 'joi'

import { client } from '../prisma/client'
import { Schema } from '../validation'

export class UsersController {
	static async handleRegister(req: Request, res: Response) {
		try {
			const entry = await Schema.user.create
				.validateAsync(req.body, { abortEarly: false })

			const passwordHash = await hash(entry.password, 8)
			const createdUser = await client.user.create({
				data: {
					name: entry.name,
					email: entry.email,
					password: passwordHash
				}
			})

			return res
				.status(201)
				.json({ id: createdUser.id })
		} catch(e) {
			const validationErrors: ValidationError = e
			const errors = validationErrors.details.map((validationError) => ({
				field: validationError.context.key,
				code: validationError.message
			}))

			return res
				.status(400)
				.json({ errors })
		}
	}
}
