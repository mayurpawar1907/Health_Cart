import { QueryTypes } from 'sequelize'
import { sequelize } from '../orm/sequelize.js'
import { models } from '../models/index.js'

export { sequelize, models }

/** @deprecated use sequelize.authenticate() */
export const getPool = () => {
  return sequelize.connectionManager.pool
}

export const query = async (sql, params) => {
  return sequelize.query(sql, {
    replacements: params ?? {},
    type: QueryTypes.SELECT,
  })
}

export const queryOne = async (sql, params) => {
  const rows = await query(sql, params)
  return rows[0] ?? null
}

export const execute = async (sql, params) => {
  const [, metadata] = await sequelize.query(sql, {
    replacements: params ?? {},
  })
  return metadata
}

export const withTransaction = async (fn) => {
  return sequelize.transaction(async (transaction) => fn(transaction))
}

export const connQuery = async (transaction, sql, params) => {
  return sequelize.query(sql, {
    replacements: params ?? {},
    type: QueryTypes.SELECT,
    transaction,
  })
}

export const connExecute = async (transaction, sql, params) => {
  const [, metadata] = await sequelize.query(sql, {
    replacements: params ?? {},
    transaction,
  })
  return metadata
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
  await sequelize.close()
}
