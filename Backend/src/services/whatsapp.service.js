import { queryOne, execute, bool } from '../config/database.js'
import { id } from '../utils/id.js'

export const send = async (userId, template, body) => {
  const user = await queryOne(
    `SELECT u.id, u.mobile, p.whatsappOn
     FROM User u
     LEFT JOIN UserProfile p ON p.userId = u.id
     WHERE u.id = :userId
     LIMIT 1`,
    { userId },
  )
  if (!user) return null
  if (user.whatsappOn != null && !bool(user.whatsappOn)) return null
  const messageId = id()
  await execute(
    `INSERT INTO WhatsAppMessage (id, userId, mobile, template, body, status)
     VALUES (:id, :userId, :mobile, :template, :body, 'SENT')`,
    {
      id: messageId,
      userId,
      mobile: user.mobile,
      template,
      body,
    },
  )
  console.log(`WhatsApp → ${user.mobile} [${template}]: ${body.slice(0, 120)}`)
  return { id: messageId, userId, mobile: user.mobile, template, body, status: 'SENT' }
}

export const notify = async (userId, template, title, body) => {
  const user = await queryOne(
    `SELECT u.id, p.notificationsOn
     FROM User u
     LEFT JOIN UserProfile p ON p.userId = u.id
     WHERE u.id = :userId
     LIMIT 1`,
    { userId },
  )
  if (!user || (user.notificationsOn != null && !bool(user.notificationsOn))) return
  await execute(
    `INSERT INTO Notification (id, userId, type, title, body)
     VALUES (:id, :userId, 'PROMOTIONAL', :title, :body)`,
    { id: id(), userId, title, body },
  )
  await send(userId, template, `${title}\n\n${body}`)
}
