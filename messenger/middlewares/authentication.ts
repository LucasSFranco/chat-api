import { verify } from 'jsonwebtoken'

export function authentication (socket: any, next: any) {
  const bearerToken = socket.handshake.auth.bearerToken

  const [, accessToken] = bearerToken.split(' ')

  try {
    const decodedToken = verify(accessToken, process.env.TOKEN_SECRET!)

    socket.id = decodedToken.sub

    next()
  } catch (error) {
    next(error)
  }
}
