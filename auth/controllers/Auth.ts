import { hash } from 'bcryptjs'
import { Request, Response } from 'express'
import { verify } from 'jsonwebtoken'

import { client } from '../../prisma/client'
import { Schema } from '../validations'
import { generateAccessToken } from '../providers/generateAccessToken'
import { generateRefreshToken } from '../providers/generateRefreshToken'

export class AuthController {
  static async handleRegister (req: Request, res: Response) {
    const data = await Schema.auth.register
      .validateAsync(req.body, { abortEarly: false })

    const passwordHash = await hash(data.password, 8)
    const createdUser = await client.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: passwordHash
      }
    })

    const refreshToken = generateRefreshToken(createdUser.id)

    // maxAge: 120960000
    res.cookie('refreshToken', refreshToken, { maxAge: 30000, httpOnly: true })

    const accessToken = generateAccessToken(createdUser.id)

    return res
      .status(201)
      .json({ accessToken })
  }

  static async handleLogin (req: Request, res: Response) {
    const data = await Schema.auth.login
      .validateAsync(req.body, { abortEarly: false })

    const refreshToken = generateRefreshToken(data)

    res.cookie('refreshToken', refreshToken, { maxAge: 1209600000, httpOnly: true })

    const accessToken = generateAccessToken(data)

    return res
      .status(200)
      .json({ accessToken })
  }

  static async handleRefreshToken (req: Request, res: Response) {
    const { refreshToken } = req.cookies

    const decoded: any = verify(refreshToken, process.env.TOKEN_SECRET!)

    const accessToken = generateAccessToken(decoded.sub)

    return res
      .status(200)
      .json({ accessToken })
  }

  static async handleVerifyAccessToken (req: Request, res: Response) {
    const bearerToken: any = req.headers.authorization

    // const [, accessToken] = bearerToken.split(' ')

    verify(bearerToken, process.env.TOKEN_SECRET!)

    return res
      .status(200)
      .json({ message: 'access granted' })
  }
}
