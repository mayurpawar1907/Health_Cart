import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { param } from '../utils/params.js'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import { badRequest } from '../utils/errors.js'
import * as admin from '../services/admin.service.js'
import { saveReportFile } from '../services/storage.service.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

router.use(requireAuth, requireRoles('ADMIN', 'SUPER_ADMIN'))

const upsertTestSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  preparation: z.string().min(1),
  sampleType: z.string().min(1),
  reportHours: z.coerce.number().optional(),
  price: z.coerce.number(),
  specialPrice: z.coerce.number().optional(),
  discountPercent: z.coerce.number().optional(),
  membershipEligible: z.boolean().optional(),
  membershipFree: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

router.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    ok(res, await admin.dashboard())
  }),
)

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    ok(
      res,
      await admin.listUsers({
        q: req.query.q,
        role: req.query.role,
        active: req.query.active,
        page: req.query.page,
        limit: req.query.limit,
      }),
    )
  }),
)

router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    ok(res, await admin.getUser(param(req, 'id')))
  }),
)

router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        mobile: z.string().optional(),
        isActive: z.boolean().optional(),
        role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
        gender: z.string().optional(),
      })
      .parse(req.body)
    ok(res, await admin.updateUser(req.user, param(req, 'id'), dto))
  }),
)

router.patch(
  '/users/:id/active',
  asyncHandler(async (req, res) => {
    const body = z.object({ isActive: z.boolean() }).parse(req.body)
    ok(res, await admin.updateUser(req.user, param(req, 'id'), { isActive: body.isActive }))
  }),
)

router.get(
  '/tests',
  asyncHandler(async (req, res) => {
    ok(
      res,
      await admin.listTests({
        q: req.query.q,
        categoryId: req.query.categoryId,
        active: req.query.active,
      }),
    )
  }),
)

router.post(
  '/tests',
  asyncHandler(async (req, res) => {
    ok(res, await admin.createTest(req.user.id, upsertTestSchema.parse(req.body)))
  }),
)

router.patch(
  '/tests/:id',
  asyncHandler(async (req, res) => {
    ok(res, await admin.updateTest(req.user.id, param(req, 'id'), req.body))
  }),
)

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    ok(res, await admin.listCategories())
  }),
)

router.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const body = z
      .object({ name: z.string().min(1), description: z.string().optional() })
      .parse(req.body)
    ok(res, await admin.createCategory(req.user.id, body))
  }),
)

router.patch(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(req.body)
    ok(res, await admin.updateCategory(req.user.id, param(req, 'id'), body))
  }),
)

router.get(
  '/appointments',
  asyncHandler(async (req, res) => {
    ok(
      res,
      await admin.listAppointments({
        status: req.query.status,
        q: req.query.q,
        payment: req.query.payment,
      }),
    )
  }),
)

router.patch(
  '/appointments/:id/status',
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        status: z.enum(['PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED']),
      })
      .parse(req.body)
    ok(res, await admin.updateAppointmentStatus(req.user.id, param(req, 'id'), dto.status))
  }),
)

router.patch(
  '/appointments/:id/payment',
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
        paymentMethod: z.string().optional(),
      })
      .parse(req.body)
    ok(res, await admin.updateAppointmentPayment(req.user.id, param(req, 'id'), dto))
  }),
)

router.get(
  '/memberships',
  asyncHandler(async (req, res) => {
    ok(res, await admin.listMemberships({ active: req.query.active }))
  }),
)

router.get(
  '/membership-plans',
  asyncHandler(async (_req, res) => {
    ok(res, await admin.listPlans())
  }),
)

router.post(
  '/memberships/grant',
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        userId: z.string().min(1),
        planId: z.string().min(1),
        months: z.coerce.number().optional(),
      })
      .parse(req.body)
    ok(res, await admin.grantMembership(req.user.id, dto))
  }),
)

router.get(
  '/reports',
  asyncHandler(async (req, res) => {
    ok(res, await admin.listReports({ status: req.query.status }))
  }),
)

router.post(
  '/reports/upload',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        appointmentId: z.string().min(1),
        summary: z.string().optional(),
      })
      .parse(req.body)
    const file = req.file
    if (!file) {
      throw badRequest('Report file is required', 'FILE_REQUIRED')
    }
    const saved = saveReportFile(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      dto.appointmentId,
    )
    ok(
      res,
      await admin.uploadReport({
        appointmentId: dto.appointmentId,
        summary: dto.summary,
        storagePath: saved.storagePath,
        fileName: saved.fileName,
        fileMimeType: saved.fileMimeType,
        fileSize: saved.fileSize,
      }),
    )
  }),
)

router.get(
  '/reports/:id/file',
  asyncHandler(async (req, res) => {
    const { stream, fileName, mimeType } = await admin.getReportFile(param(req, 'id'))
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${String(fileName).replace(/"/g, '')}"`)
    stream.pipe(res)
  }),
)

router.get(
  '/audit-logs',
  asyncHandler(async (req, res) => {
    ok(
      res,
      await admin.listAuditLogs({
        entity: req.query.entity,
        page: req.query.page,
      }),
    )
  }),
)

router.get(
  '/whatsapp',
  asyncHandler(async (_req, res) => {
    ok(res, await admin.listWhatsAppMessages())
  }),
)

router.get(
  '/settings/pricing',
  asyncHandler(async (_req, res) => {
    ok(res, await admin.getPricingSettings())
  }),
)

router.patch(
  '/settings/pricing',
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        paymentPromoPercent: z.coerce.number().optional(),
        paymentPromoActive: z.boolean().optional(),
        paymentPromoApplyToAllUsers: z.boolean().optional(),
        promoLabel: z.string().optional(),
      })
      .parse(req.body)
    ok(res, await admin.updatePricingSettings(req.user, dto))
  }),
)

router.get(
  '/payments',
  asyncHandler(async (req, res) => {
    ok(
      res,
      await admin.listPayments({
        q: req.query.q,
        status: req.query.status,
        method: req.query.method,
        page: req.query.page,
        limit: req.query.limit,
      }),
    )
  }),
)

router.get(
  '/payments/:id',
  asyncHandler(async (req, res) => {
    ok(res, await admin.getPayment(param(req, 'id')))
  }),
)

router.patch(
  '/payments/:id/status',
  asyncHandler(async (req, res) => {
    const dto = z
      .object({ status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']) })
      .parse(req.body)
    ok(res, await admin.updatePaymentStatus(req.user.id, param(req, 'id'), dto.status))
  }),
)

router.get(
  '/payments/:id/invoice',
  asyncHandler(async (req, res) => {
    ok(res, await admin.getPaymentInvoice(param(req, 'id')))
  }),
)

export default router
