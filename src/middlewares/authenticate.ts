import { NextFunction, Request, Response } from 'express'
import { verify } from 'jsonwebtoken'

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const bearerToken = req.headers.authorization

    if(!bearerToken)
        return res
            .status(403)
            .json({
                message: 'Authentication token is missing.'
            })

    const [, accessToken] = bearerToken.split(' ')
            
    try {
        verify(accessToken, process.env.TOKEN_SECRET)
        return next()
    } catch(e) {
        return res
            .status(401)
            .json({
                message: 'Authentication token is invalid.'
            })
    }
}