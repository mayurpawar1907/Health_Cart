import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { param } from '../utils/params.js'
import * as familyService from '../services/family.service.js'

const router = Router()

router.use(requireAuth)

const createSchema = z.object({
  name: z.string().min(1),
  relation: z.enum(['SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'OTHER']),
  age: z.number().int().min(1).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  mobile: z.string().optional(),
})

router.get(
  '/',
  asyncHandler(async (req, res) => {
    ok(res, await familyService.list(req.user.id))
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    ok(res, await familyService.create(req.user.id, createSchema.parse(req.body)), 201)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    ok(res, await familyService.remove(req.user.id, param(req, 'id')))
  }),
)

export default router
