import { sign } from 'jsonwebtoken'

export const generateRefreshToken = (userId: string) => {
  return sign({}, process.env.TOKEN_SECRET!, {
    subject: userId,
    expiresIn: 1209600
  })
}
