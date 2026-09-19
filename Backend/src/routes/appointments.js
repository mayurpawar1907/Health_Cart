import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { param } from '../utils/params.js'
import * as appointmentsService from '../services/appointments.service.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/slots',
  asyncHandler(async (req, res) => {
    ok(res, appointmentsService.slots(String(req.query.date ?? '')))
  }),
)

router.get(
  '/serviceability',
  asyncHandler(async (req, res) => {
    ok(res, appointmentsService.checkServiceability(String(req.query.pincode ?? '')))
  }),
)

router.get(
  '/quote',
  asyncHandler(async (req, res) => {
    const testId = String(req.query.testId ?? '')
    const useWallet = req.query.useWallet !== 'false'
    const useReferral = req.query.useReferral !== 'false'
    ok(res, await appointmentsService.quote(req.user.id, testId, { useWallet, useReferral }))
  }),
)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    ok(res, await appointmentsService.list(req.user.id, req.query.status))
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        testId: z.string().min(1),
        date: z.string().min(1),
        timeSlot: z.string().min(1),
        patientName: z.string().min(1),
        patientAge: z.number().int().optional(),
        notes: z.string().optional(),
        collectionType: z.enum(['LAB', 'HOME']).optional(),
        addressId: z.string().optional(),
        familyMemberId: z.string().optional(),
        deliveryAddress: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        paymentMethod: z.enum(['UPI', 'CARD', 'COD', 'WALLET']).optional(),
        useWallet: z.boolean().optional(),
        useReferral: z.boolean().optional(),
        reminderEnabled: z.boolean().optional(),
      })
      .parse(req.body)
    ok(res, await appointmentsService.create(req.user.id, dto))
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    ok(res, await appointmentsService.get(req.user.id, param(req, 'id')))
  }),
)

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const dto = z.object({ date: z.string(), timeSlot: z.string() }).parse(req.body)
    ok(res, await appointmentsService.reschedule(req.user.id, param(req, 'id'), dto))
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    ok(res, await appointmentsService.cancel(req.user.id, param(req, 'id')))
  }),
)

export default router
