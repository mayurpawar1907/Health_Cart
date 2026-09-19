import { Router } from 'express'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { param } from '../utils/params.js'
import * as ledger from '../services/payment-ledger.service.js'
import * as invoice from '../services/invoice.service.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/transactions',
  asyncHandler(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20
    ok(res, await ledger.listForUser(req.user.id, page, limit))
  }),
)

router.get(
  '/transactions/:id',
  asyncHandler(async (req, res) => {
    ok(res, await ledger.getForUser(req.user.id, param(req, 'id')))
  }),
)

router.get(
  '/transactions/:id/invoice',
  asyncHandler(async (req, res) => {
    ok(res, await invoice.getForUser(req.user.id, param(req, 'id')))
  }),
)

export default router
