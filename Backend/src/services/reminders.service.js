import { query, queryOne, execute, bool } from '../config/database.js'
import { id } from '../utils/id.js'
import { badRequest, notFound } from '../utils/errors.js'
import * as whatsapp from './whatsapp.service.js'

export const list = async (userId) => {
  const rows = await query(
    `SELECT r.*,
            t.id AS t_id, t.name AS t_name, t.slug AS t_slug,
            a.id AS a_id, a.code AS a_code, a.date AS a_date, a.timeSlot AS a_timeSlot,
            at.id AS at_id, at.name AS at_name
     FROM TestReminder r
     LEFT JOIN Test t ON t.id = r.testId
     LEFT JOIN Appointment a ON a.id = r.appointmentId
     LEFT JOIN Test at ON at.id = a.testId
     WHERE r.userId = :userId AND r.isActive = 1
     ORDER BY r.remindAt ASC`,
    { userId },
  )
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    testId: r.testId,
    appointmentId: r.appointmentId,
    label: r.label,
    remindAt: r.remindAt,
    notifiedAt: r.notifiedAt,
    createdAt: r.createdAt,
    isActive: bool(r.isActive),
    test: r.t_id ? { id: r.t_id, name: r.t_name, slug: r.t_slug } : null,
    appointment: r.a_id
      ? {
          id: r.a_id,
          code: r.a_code,
          date: r.a_date,
          timeSlot: r.a_timeSlot,
          test: r.at_id ? { id: r.at_id, name: r.at_name } : null,
        }
      : null,
  }))
}

export const create = async (userId, dto) => {
  if (!dto.testId && !dto.appointmentId) {
    throw badRequest('Link a test or appointment', 'INVALID_REMINDER')
  }
  const reminderId = id()
  await execute(
    `INSERT INTO TestReminder (id, userId, testId, appointmentId, label, remindAt, isActive)
     VALUES (:id, :userId, :testId, :appointmentId, :label, :remindAt, 1)`,
    {
      id: reminderId,
      userId,
      testId: dto.testId ?? null,
      appointmentId: dto.appointmentId ?? null,
      label: dto.label,
      remindAt: new Date(dto.remindAt),
    },
  )
  const items = await list(userId)
  return items.find((i) => String(i.id) === reminderId)
}

export const remove = async (userId, reminderId) => {
  const item = await queryOne(`SELECT * FROM TestReminder WHERE id = :id AND userId = :userId`, {
    id: reminderId,
    userId,
  })
  if (!item) throw notFound('Reminder not found', 'NOT_FOUND')
  await execute(`UPDATE TestReminder SET isActive = 0 WHERE id = :id`, { id: reminderId })
  return { message: 'Reminder removed' }
}

export const processDueReminders = async () => {
  const due = await query(
    `SELECT r.*, t.name AS testName, at.name AS appointmentTestName
     FROM TestReminder r
     LEFT JOIN Test t ON t.id = r.testId
     LEFT JOIN Appointment a ON a.id = r.appointmentId
     LEFT JOIN Test at ON at.id = a.testId
     WHERE r.isActive = 1 AND r.notifiedAt IS NULL AND r.remindAt <= NOW(3)`,
  )
  for (const r of due) {
    const testName = r.testName ?? r.appointmentTestName ?? 'Health test'
    const body = `Reminder: ${r.label}. ${testName} is scheduled. Open HealthID Card to view details.`
    await execute(
      `INSERT INTO Notification (id, userId, type, title, body)
       VALUES (:id, :userId, 'APPOINTMENT_REMINDER', 'Test reminder', :body)`,
      { id: id(), userId: r.userId, body },
    )
    await whatsapp.send(String(r.userId), 'test_reminder', body)
    await execute(`UPDATE TestReminder SET notifiedAt = NOW(3) WHERE id = :id`, { id: r.id })
  }
  return due.length
}

export const processAppointmentReminders = async () => {
  const upcoming = await query(
    `SELECT a.*, t.name AS testName
     FROM Appointment a
     JOIN Test t ON t.id = a.testId
     WHERE a.deletedAt IS NULL
       AND a.reminderEnabled = 1
       AND a.reminderSentAt IS NULL
       AND a.status IN ('CONFIRMED', 'RESCHEDULED')
       AND a.date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`,
  )
  for (const a of upcoming) {
    const body = `Your ${a.testName} home collection is tomorrow at ${a.timeSlot}. Phlebotomist will visit: ${a.deliveryAddress ?? a.location}.`
    await execute(
      `INSERT INTO Notification (id, userId, type, title, body)
       VALUES (:id, :userId, 'APPOINTMENT_REMINDER', 'Appointment tomorrow', :body)`,
      { id: id(), userId: a.userId, body },
    )
    await whatsapp.send(String(a.userId), 'appointment_reminder', body)
    await execute(`UPDATE Appointment SET reminderSentAt = NOW(3) WHERE id = :id`, { id: a.id })
  }
  return upcoming.length
}

let schedulerStarted = false

export const startReminderScheduler = () => {
  if (schedulerStarted) return
  schedulerStarted = true
  setInterval(() => {
    processDueReminders()
      .then((count) => {
        if (count) console.log(`Sent ${count} custom test reminders`)
      })
      .catch((err) => console.error('reminder job failed', err))
  }, 60 * 60 * 1000)
  const runDaily = () => {
    processAppointmentReminders()
      .then((count) => {
        if (count) console.log(`Sent ${count} appointment reminders`)
      })
      .catch((err) => console.error('appointment reminder job failed', err))
  }
  const scheduleNext9am = () => {
    const now = new Date()
    const next = new Date(now)
    next.setHours(9, 0, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    setTimeout(() => {
      runDaily()
      setInterval(runDaily, 24 * 60 * 60 * 1000)
    }, next.getTime() - now.getTime())
  }
  scheduleNext9am()
}
