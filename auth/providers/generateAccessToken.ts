import { sign } from 'jsonwebtoken'

export const generateAccessToken = (userId: string) => {
  return sign({}, process.env.TOKEN_SECRET!, {
    subject: userId,
    expiresIn: 3600
  })
}
