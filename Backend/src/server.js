import { createApp } from './app.js'
import { config } from './config/index.js'
import { sequelize, queryOne } from './config/database.js'
import { info, error } from './utils/logger.js'
import { startReminderScheduler } from './services/reminders.service.js'

const pingDatabase = async () => {
  try {
    await sequelize.authenticate()
    const row = await queryOne('SELECT 1 AS ok, DATABASE() AS db')
    info(`MySQL connected (Sequelize) → database=${row?.db ?? config.db.database}`)
    return true
  } catch (err) {
    error('MySQL connection failed:', err.message)
    return false
  }
}

const start = async () => {
  info(`starting HealthCart API (env=${config.nodeEnv})`)
  info(`db host=${config.db.host}:${config.db.port} user=${config.db.user}`)

  const dbOk = await pingDatabase()
  if (!dbOk) {
    error('server will still listen, but DB calls will fail until MySQL is reachable')
  }

  const app = createApp()
  startReminderScheduler()
  info('reminder scheduler started')

  app.listen(config.port, () => {
    info(`HealthCart API listening on http://localhost:${config.port}/api`)
    info(`CORS origins: ${config.corsOrigin.join(', ')}`)
    info('request logging enabled')
  })
}

start().catch((err) => {
  error('fatal startup error', err)
  process.exit(1)
})
