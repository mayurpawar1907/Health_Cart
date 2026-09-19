import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { config } from './config/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './utils/logger.js'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import testsRoutes from './routes/tests.js'
import appointmentsRoutes from './routes/appointments.js'
import membershipRoutes from './routes/membership.js'
import familyRoutes from './routes/family.js'
import notificationsRoutes from './routes/notifications.js'
import remindersRoutes from './routes/reminders.js'
import dashboardRoutes from './routes/dashboard.js'
import adminRoutes from './routes/admin.js'
import walletRoutes from './routes/wallet.js'
import settingsRoutes from './routes/settings.js'
import paymentsRoutes from './routes/payments.js'
import historyRoutes from './routes/history.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(requestLogger)
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 80,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  const uploadsDir = path.resolve(__dirname, '../uploads')
  fs.mkdirSync(uploadsDir, { recursive: true })
  app.use('/uploads', express.static(uploadsDir))

  const api = express.Router()
  api.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        service: 'healthcart-api',
        env: config.nodeEnv,
        time: new Date().toISOString(),
      },
    })
  })

  api.use('/auth', authRoutes)
  api.use('/users', usersRoutes)
  api.use('/tests', testsRoutes)
  api.use('/appointments', appointmentsRoutes)
  api.use('/membership', membershipRoutes)
  api.use('/family', familyRoutes)
  api.use('/notifications', notificationsRoutes)
  api.use('/reminders', remindersRoutes)
  api.use('/dashboard', dashboardRoutes)
  api.use('/admin', adminRoutes)
  api.use('/wallet', walletRoutes)
  api.use('/settings', settingsRoutes)
  api.use('/payments', paymentsRoutes)
  api.use(historyRoutes)

  app.use('/api', api)
  app.use(errorHandler)

  return app
}
