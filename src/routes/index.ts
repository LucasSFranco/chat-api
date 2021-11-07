import { Router } from 'express'

import { Controller } from '../controllers'

const router = Router()

router.post('/user/register', Controller.user.handleRegister)

export { router }
