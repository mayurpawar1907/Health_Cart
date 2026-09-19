/**
 * Applies table SQL files from sql/tables/ in dependency order.
 * Does NOT use a single monolithic schema.sql.
 *
 * Warning: this drops existing tables. Only use on a fresh DB.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { parseDatabaseUrl, config } from '../config/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Create order — parents before children */
const CREATE_ORDER = [
  'User',
  'UserProfile',
  'Address',
  'FamilyMember',
  'RefreshToken',
  'PasswordResetToken',
  'AuditLog',
  'TestCategory',
  'Test',
  'TestParameter',
  'HealthPackageTest',
  'MembershipPlan',
  'MembershipBenefit',
  'Membership',
  'MembershipMember',
  'Appointment',
  'MembershipUsage',
  'TestReport',
  'TestReminder',
  'Notification',
  'WhatsAppMessage',
  'Wallet',
  'WalletTransaction',
  'Referral',
  'PlatformSettings',
  'PaymentTransaction',
]

/** Drop order — children before parents */
const DROP_ORDER = [...CREATE_ORDER].reverse()

const main = async () => {
  const db = parseDatabaseUrl()
  const tablesDir = path.resolve(__dirname, '../../sql/tables')

  console.log(`[schema] connecting ${db.user}@${db.host}:${db.port}`)
  const conn = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    multipleStatements: true,
  })

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  await conn.changeUser({ database: db.database })
  console.log(`[schema] database: ${db.database}`)

  await conn.query('SET NAMES utf8mb4')
  await conn.query('SET FOREIGN_KEY_CHECKS = 0')

  for (const table of DROP_ORDER) {
    await conn.query(`DROP TABLE IF EXISTS \`${table}\``)
    console.log(`[schema] dropped ${table}`)
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 1')

  for (const table of CREATE_ORDER) {
    const file = path.join(tablesDir, `${table}.sql`)
    if (!fs.existsSync(file)) {
      throw new Error(`Missing table file: ${file}`)
    }
    const sql = fs.readFileSync(file, 'utf8')
    await conn.query(sql)
    console.log(`[schema] created ${table}`)
  }

  await conn.end()
  console.log(`[schema] done (env=${config.nodeEnv})`)
}

main().catch((err) => {
  console.error('[schema] failed', err)
  process.exit(1)
})
