import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import * as usersService from '../services/users.service.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    ok(res, await usersService.getProfile(req.user.id))
  }),
)

router.patch(
  '/profile',
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        fullName: z.string().min(2).optional(),
        dateOfBirth: z.string().optional(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
        avatarUrl: z.string().optional(),
        language: z.string().optional(),
        theme: z.string().optional(),
        notificationsOn: z.boolean().optional(),
        whatsappOn: z.boolean().optional(),
        locationLat: z.number().optional(),
        locationLng: z.number().optional(),
        line1: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
      })
      .parse(req.body)
    ok(res, await usersService.updateProfile(req.user.id, dto))
  }),
)

router.post(
  '/change-password',
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      })
      .parse(req.body)
    ok(res, await usersService.changePassword(req.user.id, dto))
  }),
)

export default router
