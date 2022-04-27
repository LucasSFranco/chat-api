import { NextFunction, Request, Response } from 'express'
import { ValidationError } from 'joi'
import { JsonWebTokenError } from 'jsonwebtoken'

export function errorHandler (error: any, req: Request, res: Response, next: NextFunction) {
  if (error.isJoi) {
    const validationError: ValidationError = error

    return res
      .status(400)
      .json(validationError.details)
  }

  console.error(error)

  if (error instanceof JsonWebTokenError) {
    const jwtError: JsonWebTokenError = error

    return res
      .status(403)
      .json({ message: jwtError.message })
  }

  return res
    .status(500)
    .json({ message: 'unexpected error occurred' })
}
