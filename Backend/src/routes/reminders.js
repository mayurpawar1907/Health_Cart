import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { param } from '../utils/params.js'
import * as remindersService from '../services/reminders.service.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    ok(res, await remindersService.list(req.user.id))
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        testId: z.string().optional(),
        appointmentId: z.string().optional(),
        label: z.string().min(1),
        remindAt: z.string().min(1),
      })
      .parse(req.body)
    ok(res, await remindersService.create(req.user.id, dto))
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    ok(res, await remindersService.remove(req.user.id, param(req, 'id')))
  }),
)

export default router
