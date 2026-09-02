import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import taskRoutes from './routes/task.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

const corsOrigin = process.env.CORS_ORIGIN || '*'
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',') }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is up and running.' })
})

app.use('/api/tasks', taskRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
