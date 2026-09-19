import { query, queryOne, execute, num, parseJson } from '../config/database.js'
import { id } from '../utils/id.js'
import { notFound } from '../utils/errors.js'
import * as invoiceService from './invoice.service.js'

const serialize = (row) => {
  const appointment =
    row.appointment ??
    (row.apptId
      ? {
          id: row.apptId,
          code: row.apptCode,
          date: row.apptDate,
          timeSlot: row.apptTimeSlot,
          patientName: row.apptPatientName,
          paymentStatus: row.apptPaymentStatus,
          payableAmount: row.apptPayableAmount != null ? num(row.apptPayableAmount) : undefined,
          finalPrice: row.apptFinalPrice != null ? num(row.apptFinalPrice) : undefined,
          test: row.testName_rel ? { name: row.testName_rel, slug: row.testSlug } : undefined,
        }
      : undefined)
  const user =
    row.user ??
    (row.userFullName
      ? {
          id: row.userId_user ?? row.ptUserId ?? row.userId,
          fullName: row.userFullName,
          email: row.userEmail,
          mobile: row.userMobile,
        }
      : undefined)
  return {
    id: row.id,
    appointmentId: row.appointmentId,
    userId: row.userId,
    bookingCode: row.bookingCode,
    testName: row.testName,
    invoiceNumber: row.invoiceNumber ?? null,
    amount: num(row.amount),
    currency: row.currency,
    method: row.method,
    status: row.status,
    breakdown: parseJson(row.breakdown, {}),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user,
    appointment,
  }
}

export const recordBookingPayment = async (params) => {
  const { appointmentId, userId, bookingCode, testName, quote, method, status } = params
  const breakdown = {
    mrp: quote.originalPrice,
    specialPrice: quote.listPrice,
    listDiscountFromMrp: quote.listDiscountFromMrp,
    priceBeforePaymentDiscount: quote.priceBeforePaymentDiscount,
    paymentDiscountPercent: quote.paymentDiscountPercent,
    paymentDiscountAmount: quote.paymentDiscountAmount,
    subtotalAfterPaymentDiscount: quote.subtotalAfterPaymentDiscount,
    referralCreditApplied: quote.referralCreditApplied,
    walletCreditApplied: quote.walletCreditApplied,
    amountDue: quote.amountDue,
    isFreeForMember: quote.isFreeForMember,
  }
  const invoiceNumber = await invoiceService.nextInvoiceNumber()
  const paymentId = id()
  await execute(
    `INSERT INTO PaymentTransaction
      (id, appointmentId, userId, bookingCode, testName, invoiceNumber, amount, method, status, breakdown)
     VALUES
      (:id, :appointmentId, :userId, :bookingCode, :testName, :invoiceNumber, :amount, :method, :status, :breakdown)`,
    {
      id: paymentId,
      appointmentId,
      userId,
      bookingCode,
      testName,
      invoiceNumber,
      amount: quote.amountDue,
      method,
      status,
      breakdown: JSON.stringify(breakdown),
    },
  )
  return queryOne(`SELECT * FROM PaymentTransaction WHERE id = :id`, { id: paymentId })
}

export const listForUser = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit
  const items = await query(
    `SELECT pt.*,
            a.id AS apptId, a.code AS apptCode, a.date AS apptDate, a.timeSlot AS apptTimeSlot,
            a.patientName AS apptPatientName, a.paymentStatus AS apptPaymentStatus
     FROM PaymentTransaction pt
     LEFT JOIN Appointment a ON a.id = pt.appointmentId
     WHERE pt.userId = :userId
     ORDER BY pt.createdAt DESC
     LIMIT :limit OFFSET :skip`,
    { userId, limit, skip },
  )
  const countRow = await queryOne(
    `SELECT COUNT(*) AS cnt FROM PaymentTransaction WHERE userId = :userId`,
    { userId },
  )
  const total = Number(countRow?.cnt ?? 0)
  return {
    items: items.map((t) => serialize(t)),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  }
}

export const listForAdmin = async (filters) => {
  const page = filters.page ?? 1
  const limit = filters.limit ?? 25
  const skip = (page - 1) * limit
  const clauses = []
  const params = { limit, skip }
  if (filters.status) {
    clauses.push('pt.status = :status')
    params.status = filters.status
  }
  if (filters.method) {
    clauses.push('pt.method = :method')
    params.method = filters.method
  }
  if (filters.q?.trim()) {
    clauses.push(
      `(pt.bookingCode LIKE :q OR pt.testName LIKE :q OR u.fullName LIKE :q OR u.email LIKE :q OR u.mobile LIKE :q)`,
    )
    params.q = `%${filters.q.trim()}%`
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const items = await query(
    `SELECT pt.*,
            u.id AS userId_user, u.fullName AS userFullName, u.email AS userEmail, u.mobile AS userMobile,
            a.id AS apptId, a.code AS apptCode, a.date AS apptDate,
            a.payableAmount AS apptPayableAmount, a.finalPrice AS apptFinalPrice,
            a.paymentStatus AS apptPaymentStatus
     FROM PaymentTransaction pt
     JOIN User u ON u.id = pt.userId
     LEFT JOIN Appointment a ON a.id = pt.appointmentId
     ${where}
     ORDER BY pt.createdAt DESC
     LIMIT :limit OFFSET :skip`,
    params,
  )
  const countRow = await queryOne(
    `SELECT COUNT(*) AS cnt
     FROM PaymentTransaction pt
     JOIN User u ON u.id = pt.userId
     ${where}`,
    params,
  )
  const total = Number(countRow?.cnt ?? 0)
  const stats = await query(
    `SELECT status, COUNT(*) AS cnt, COALESCE(SUM(amount), 0) AS amount
     FROM PaymentTransaction
     GROUP BY status`,
  )
  return {
    items: items.map((t) => serialize(t)),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    stats: stats.map((s) => ({
      status: s.status,
      count: Number(s.cnt),
      amount: num(s.amount),
    })),
  }
}

export const getForUser = async (userId, paymentId) => {
  const row = await queryOne(
    `SELECT pt.*,
            a.id AS apptId, a.code AS apptCode, a.date AS apptDate, a.timeSlot AS apptTimeSlot,
            a.patientName AS apptPatientName, a.paymentStatus AS apptPaymentStatus,
            t.name AS testName_rel, t.slug AS testSlug
     FROM PaymentTransaction pt
     LEFT JOIN Appointment a ON a.id = pt.appointmentId
     LEFT JOIN Test t ON t.id = a.testId
     WHERE pt.id = :id AND pt.userId = :userId
     LIMIT 1`,
    { id: paymentId, userId },
  )
  if (!row) throw notFound('Payment not found', 'NOT_FOUND')
  return serialize(row)
}

export const getForAdmin = async (paymentId) => {
  const row = await queryOne(
    `SELECT pt.*,
            u.id AS userId_user, u.fullName AS userFullName, u.email AS userEmail, u.mobile AS userMobile,
            a.id AS apptId, a.code AS apptCode, a.date AS apptDate, a.timeSlot AS apptTimeSlot,
            a.patientName AS apptPatientName, a.paymentStatus AS apptPaymentStatus,
            t.name AS testName_rel, t.slug AS testSlug
     FROM PaymentTransaction pt
     JOIN User u ON u.id = pt.userId
     LEFT JOIN Appointment a ON a.id = pt.appointmentId
     LEFT JOIN Test t ON t.id = a.testId
     WHERE pt.id = :id
     LIMIT 1`,
    { id: paymentId },
  )
  if (!row) throw notFound('Payment not found', 'NOT_FOUND')
  return serialize(row)
}

export const updateStatus = async (paymentId, status) => {
  await execute(`UPDATE PaymentTransaction SET status = :status WHERE id = :id`, {
    status,
    id: paymentId,
  })
  const row = await queryOne(
    `SELECT pt.*,
            u.id AS userId_user, u.fullName AS userFullName, u.email AS userEmail,
            a.id AS apptId, a.code AS apptCode
     FROM PaymentTransaction pt
     JOIN User u ON u.id = pt.userId
     LEFT JOIN Appointment a ON a.id = pt.appointmentId
     WHERE pt.id = :id`,
    { id: paymentId },
  )
  if (!row) throw notFound('Payment not found', 'NOT_FOUND')
  await execute(`UPDATE Appointment SET paymentStatus = :status WHERE id = :appointmentId`, {
    status,
    appointmentId: row.appointmentId,
  })
  return serialize(row)
}
