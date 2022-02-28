import { Router } from 'express'

import { Controller } from '../controllers'

const publicRouter = Router()

publicRouter.post('/user/register', Controller.user.handleRegister)
publicRouter.post('/user/login', Controller.user.handleLogin)

export { publicRouter }
