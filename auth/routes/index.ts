import { Router } from 'express'

import { Controller } from '../controllers'

const router = Router()

router.get('/auth/verify-access-token', Controller.auth.handleVerifyAccessToken)

router.get('/auth/refresh-token', Controller.auth.handleRefreshToken)
router.post('/auth/register', Controller.auth.handleRegister)
router.post('/auth/login', Controller.auth.handleLogin)

export { router }
