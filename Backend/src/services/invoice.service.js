import { queryOne, execute, parseJson, num } from '../config/database.js'
import { notFound } from '../utils/errors.js'

export const nextInvoiceNumber = async () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const prefix = `HC-INV-${y}${m}${d}`
  const row = await queryOne(
    `SELECT COUNT(*) AS cnt FROM PaymentTransaction WHERE invoiceNumber LIKE :prefix`,
    { prefix: `${prefix}%` },
  )
  const count = Number(row?.cnt ?? 0)
  return `${prefix}-${String(count + 1).padStart(4, '0')}`
}

const mapBreakdown = (raw) => {
  const b = parseJson(raw, {})
  const mrp = Number(b.mrp ?? 0)
  const specialPrice = Number(b.specialPrice ?? 0)
  const listDiscountFromMrp = Number(b.listDiscountFromMrp ?? 0)
  const paymentDiscountAmount = Number(b.paymentDiscountAmount ?? 0)
  const referralCreditApplied = Number(b.referralCreditApplied ?? 0)
  const walletCreditApplied = Number(b.walletCreditApplied ?? 0)
  const amountDue = Number(b.amountDue ?? 0)
  return {
    mrp,
    specialPrice,
    listDiscountFromMrp,
    priceBeforePaymentDiscount: Number(b.priceBeforePaymentDiscount ?? specialPrice),
    paymentDiscountPercent: Number(b.paymentDiscountPercent ?? 0),
    paymentDiscountAmount,
    subtotalAfterPaymentDiscount: Number(b.subtotalAfterPaymentDiscount ?? amountDue),
    referralCreditApplied,
    walletCreditApplied,
    amountDue,
    isFreeForMember: Boolean(b.isFreeForMember),
    totalDiscount:
      listDiscountFromMrp + paymentDiscountAmount + referralCreditApplied + walletCreditApplied,
  }
}

export const buildInvoice = (row) => {
  const pricing = mapBreakdown(row.breakdown)
  const apptDate =
    row.appointment?.date instanceof Date
      ? row.appointment.date.toISOString()
      : row.appointment?.date
        ? new Date(row.appointment.date).toISOString()
        : undefined
  return {
    invoiceNumber: row.invoiceNumber ?? `HC-DRAFT-${row.id.slice(0, 8).toUpperCase()}`,
    issuedAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : new Date(row.createdAt).toISOString(),
    bookingCode: row.bookingCode,
    testName: row.testName,
    patientName: row.appointment?.patientName ?? undefined,
    customer: {
      name: row.user.fullName,
      email: row.user.email,
      mobile: row.user.mobile ?? undefined,
    },
    payment: {
      id: row.id,
      method: row.method,
      status: row.status,
      amount: num(row.amount),
      currency: row.currency,
    },
    pricing,
    appointment: row.appointment
      ? {
          id: row.appointment.id,
          code: row.appointment.code,
          date: apptDate,
          timeSlot: row.appointment.timeSlot ?? undefined,
        }
      : undefined,
  }
}

export const ensureInvoiceNumber = async (transactionId) => {
  const row = await queryOne(`SELECT id, invoiceNumber FROM PaymentTransaction WHERE id = :id`, {
    id: transactionId,
  })
  if (!row) throw notFound('Payment not found', 'NOT_FOUND')
  if (row.invoiceNumber) return String(row.invoiceNumber)
  const invoiceNumber = await nextInvoiceNumber()
  await execute(`UPDATE PaymentTransaction SET invoiceNumber = :invoiceNumber WHERE id = :id`, {
    invoiceNumber,
    id: transactionId,
  })
  return invoiceNumber
}

export const getForUser = async (userId, transactionId) => {
  await ensureInvoiceNumber(transactionId)
  const row = await queryOne(
    `SELECT pt.*,
            u.fullName AS userFullName, u.email AS userEmail, u.mobile AS userMobile,
            a.id AS apptId, a.code AS apptCode, a.date AS apptDate, a.timeSlot AS apptTimeSlot,
            a.patientName AS apptPatientName
     FROM PaymentTransaction pt
     JOIN User u ON u.id = pt.userId
     LEFT JOIN Appointment a ON a.id = pt.appointmentId
     WHERE pt.id = :id AND pt.userId = :userId
     LIMIT 1`,
    { id: transactionId, userId },
  )
  if (!row) throw notFound('Invoice not found', 'NOT_FOUND')
  return buildInvoice({
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    bookingCode: row.bookingCode,
    testName: row.testName,
    amount: row.amount,
    currency: row.currency,
    method: row.method,
    status: row.status,
    breakdown: row.breakdown,
    createdAt: row.createdAt,
    user: { fullName: row.userFullName, email: row.userEmail, mobile: row.userMobile },
    appointment: row.apptId
      ? {
          id: row.apptId,
          code: row.apptCode,
          date: row.apptDate,
          timeSlot: row.apptTimeSlot,
          patientName: row.apptPatientName,
        }
      : null,
  })
}

export const getForAdmin = async (transactionId) => {
  await ensureInvoiceNumber(transactionId)
  const row = await queryOne(
    `SELECT pt.*,
            u.fullName AS userFullName, u.email AS userEmail, u.mobile AS userMobile,
            a.id AS apptId, a.code AS apptCode, a.date AS apptDate, a.timeSlot AS apptTimeSlot,
            a.patientName AS apptPatientName
     FROM PaymentTransaction pt
     JOIN User u ON u.id = pt.userId
     LEFT JOIN Appointment a ON a.id = pt.appointmentId
     WHERE pt.id = :id
     LIMIT 1`,
    { id: transactionId },
  )
  if (!row) throw notFound('Invoice not found', 'NOT_FOUND')
  return buildInvoice({
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    bookingCode: row.bookingCode,
    testName: row.testName,
    amount: row.amount,
    currency: row.currency,
    method: row.method,
    status: row.status,
    breakdown: row.breakdown,
    createdAt: row.createdAt,
    user: { fullName: row.userFullName, email: row.userEmail, mobile: row.userMobile },
    appointment: row.apptId
      ? {
          id: row.apptId,
          code: row.apptCode,
          date: row.apptDate,
          timeSlot: row.apptTimeSlot,
          patientName: row.apptPatientName,
        }
      : null,
  })
}
