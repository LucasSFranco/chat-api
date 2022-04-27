import 'dotenv/config'
import 'express-async-errors'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { errorHandler } from './middlewares/errorHandler'
import { router } from './routes'

const app = express()

app.use(cookieParser())

app.use(express.json())

app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use(router)

app.use(errorHandler)

app.listen(8080)
