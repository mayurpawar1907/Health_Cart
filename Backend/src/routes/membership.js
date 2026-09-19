import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { param } from '../utils/params.js'
import * as membershipService from '../services/membership.service.js'

const router = Router()

const subscribeSchema = z.object({
  planId: z.string().min(1),
})

const familyLinkSchema = z.object({
  familyMemberId: z.string().min(1),
})

router.get(
  '/plans',
  asyncHandler(async (_req, res) => {
    ok(res, await membershipService.plans())
  }),
)

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    ok(res, await membershipService.current(req.user.id))
  }),
)

router.get(
  '/card',
  requireAuth,
  asyncHandler(async (req, res) => {
    ok(res, await membershipService.card(req.user.id))
  }),
)

router.get(
  '/benefits',
  requireAuth,
  asyncHandler(async (req, res) => {
    ok(res, await membershipService.benefits(req.user.id))
  }),
)

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const dto = subscribeSchema.parse(req.body)
    ok(res, await membershipService.subscribe(req.user.id, dto.planId), 201)
  }),
)

router.post(
  '/family',
  requireAuth,
  asyncHandler(async (req, res) => {
    const dto = familyLinkSchema.parse(req.body)
    ok(res, await membershipService.addFamilyToCard(req.user.id, dto.familyMemberId), 201)
  }),
)

router.delete(
  '/family/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    ok(res, await membershipService.removeFromCard(req.user.id, param(req, 'id')))
  }),
)

export default router
