import { hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { Request, Response } from 'express'
import { ValidationError } from 'joi'

import { client } from '../prisma/client'
import { Schema } from '../validation'

export class UsersController {
	static async handleRegister(req: Request, res: Response) {
		try {
			const entry = await Schema.user.register
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
				.json(errors)
		}
	}

	static async handleLogin(req: Request, res: Response) {
		try {
			const entry = await Schema.user.login
				.validateAsync(req.body, { abortEarly: false })

			const token = sign({}, process.env.TOKEN_SECRET, {
				subject: entry,
				expiresIn: "20s"
			})

			return res
				.status(200)
				.json({ accessToken: token })
		} catch(e) {
			const validationErrors: ValidationError = e
			const errors = validationErrors.details.map((validationError) => ({
				field: validationError.context.key,
				code: validationError.message
			}))

			return res
				.status(400)
				.json(errors)
		}
	}
}