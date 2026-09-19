import { query, queryOne, execute, bool } from '../config/database.js'
import { notFound } from '../utils/errors.js'

export const list = async (userId) => {
  const rows = await query(
    `SELECT * FROM Notification WHERE userId = :userId ORDER BY createdAt DESC`,
    { userId },
  )
  return rows.map((r) => ({ ...r, isRead: bool(r.isRead) }))
}

export const unreadCount = async (userId) => {
  const row = await queryOne(
    `SELECT COUNT(*) AS cnt FROM Notification WHERE userId = :userId AND isRead = 0`,
    { userId },
  )
  return Number(row?.cnt ?? 0)
}

export const markRead = async (userId, id) => {
  const item = await queryOne(`SELECT * FROM Notification WHERE id = :id AND userId = :userId`, {
    id,
    userId,
  })
  if (!item) throw notFound('Notification not found')
  await execute(`UPDATE Notification SET isRead = 1 WHERE id = :id`, { id })
  return { ...item, isRead: true }
}

export const markAll = async (userId) => {
  await execute(`UPDATE Notification SET isRead = 1 WHERE userId = :userId AND isRead = 0`, {
    userId,
  })
  return { message: 'All marked read' }
}
