import Joi from 'joi'
import { compare } from 'bcryptjs'

import { PASSWORD_STRENGTH } from '../constants'
import { client } from '../../prisma/client'

export class AuthValidation {
  static register = Joi.object({
    username: Joi
      .string()
      .required(),
    email: Joi
      .string()
      .email()
      .max(254)
      .external(AuthValidation.checkEmailUniqueness)
      .required(),
    password: Joi
      .string()
      .pattern(PASSWORD_STRENGTH)
      .min(8)
      .max(32)
      .required(),
    confirmPassword: Joi
      .string()
      .required()
      .valid(Joi.ref('password'))
  }).custom((data) => ({
    username: data.username,
    email: data.email,
    password: data.password
  }))

  static login = Joi.object({
    email: Joi
      .string()
      .email()
      .required(),
    password: Joi
      .string()
      .required()
  }).external(AuthValidation.checkCredentials)

  static async checkCredentials (data: any) {
    const user = await client.user.findFirst({
      where: { email: data.email }
    })

    const passwordMatches = user ? await compare(data.password, user.password) : false

    if (!passwordMatches) {
      throw new Joi.ValidationError(
        '"email" or "password" is incorrect',
        [
          {
            message: '"email" or "password" is incorrect',
            path: ['email', 'password'],
            type: 'login.unauthorized',
            context: {
              key: null,
              label: 'login',
              value: data
            }
          }
        ],
        { value: data }
      )
    }

    return user?.id
  }

  static async checkEmailUniqueness (email: string) {
    const user = await client.user.findUnique({
      where: { email }
    })

    if (user) {
      throw new Joi.ValidationError(
        '"email" is already registered',
        [
          {
            message: '"email" is already registered',
            path: ['email'],
            type: 'email.alreadyRegistered',
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
}
