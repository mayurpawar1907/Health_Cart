import mysql from 'mysql2/promise'
import { config } from './index.js'

let pool = null

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      ...config.db,
      waitForConnections: true,
      connectionLimit: 20,
      namedPlaceholders: true,
      dateStrings: false,
      timezone: 'Z',
    })
  }
  return pool
}

export const query = async (sql, params) => {
  const [rows] = await getPool().query(sql, params)
  return rows
}

export const queryOne = async (sql, params) => {
  const rows = await query(sql, params)
  return rows[0] ?? null
}

export const execute = async (sql, params) => {
  const [result] = await getPool().execute(sql, params)
  return result
}

export const withTransaction = async (fn) => {
  const conn = await getPool().getConnection()
  try {
    await conn.beginTransaction()
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export const connQuery = async (conn, sql, params) => {
  const [rows] = await conn.query(sql, params)
  return rows
}

export const connExecute = async (conn, sql, params) => {
  const [result] = await conn.execute(sql, params)
  return result
}

export const bool = (v) => v === true || v === 1 || v === '1'

export const num = (v) => (v == null ? 0 : Number(v))

export const parseJson = (v, fallback) => {
  if (v == null) return fallback
  if (typeof v === 'object') return v
  try {
    return JSON.parse(String(v))
  } catch {
    return fallback
  }
}

export const closePool = async () => {
  if (pool) {
    await pool.end()
    pool = null
  }
}
//test