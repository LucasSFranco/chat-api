import 'dotenv/config'
import 'express-async-errors'
import express from 'express'

const app = express()

app.use(express.json())

import { publicRouter } from './routes/public'
import { authenticate } from './middlewares/authenticate'

app.use(publicRouter)
app.use(authenticate)

export { app }
