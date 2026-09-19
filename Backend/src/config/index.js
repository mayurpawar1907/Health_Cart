'use strict'

import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const required = (key) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env: ${key}`)
  return value
}

export const parseDatabaseUrl = (url = process.env.DATABASE_URL) => {
  if (!url) throw new Error('DATABASE_URL is required')
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
  }
}

export const config = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(','),
  get jwtAccessSecret() {
    return required('JWT_ACCESS_SECRET')
  },
  get jwtRefreshSecret() {
    return required('JWT_REFRESH_SECRET')
  },
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  get db() {
    return parseDatabaseUrl()
  },
}
