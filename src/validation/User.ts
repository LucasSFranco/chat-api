import Joi from 'joi'

import { PASSWORD_STRENGTH } from '../constants'
import { client } from '../prisma/client'

export class UserValidation {
	static create = Joi.object({
		name: Joi
			.string()
			.required()
			.messages({
				'string.base': 'name/invalid',
				'string.empty': 'name/required',
				'any.required': 'name/required'
			}),
		email: Joi
			.string()
			.email()
			.max(254)
			.external(UserValidation.verifyEmailUniqueness)
			.required()
			.messages({
				'string.base': 'email/invalid',
				'string.email': 'email/invalid',
				'string.max': 'email/max-length',
				'string.empty': 'email/required',
				'any.required': 'email/required'
			}),
		password: Joi
			.string()
			.pattern(PASSWORD_STRENGTH)
			.min(8)
			.max(32)
			.required()
			.messages({
				'string.base': 'password/invalid',
				'string.pattern.base': 'password/too-weak',
				'string.empty': 'password/required',
				'string.min': 'password/min-length',
				'string.max': 'password/max-length',
				'any.required': 'password/required'
			}),
		confirmPassword: Joi
			.any()
			.valid(Joi.ref('password'))
			.required()
			.messages({
				'string.base': 'confirm-password/not-match',
				'string.ref': 'confirm-password/not-match',
				'any.only': 'confirm-password/not-match',
				'string.empty': 'confirm-password/required',
				'any.required': 'confirm-password/required'
			})
	}).custom((value) => ({
		name: value.name,
		email: value.email,
		password: value.password
	}))

	static async verifyEmailUniqueness(email: string) {
		const user = await client.user.findFirst({
			where: { email}
		})

		if (user)
			throw new Joi.ValidationError(
				'email.alreadyExists',
				[
					{
						message: 'email/already-exists',
						path: ['email'],
						type: 'email.alreadyExists',
						context: {
							key: 'email',
							label: 'email',
							value: email
						}
					}
				],
				{ value: email }
			)
	}
}

