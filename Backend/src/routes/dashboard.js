import { Router } from 'express'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import * as dashboardService from '../services/dashboard.service.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    ok(res, await dashboardService.overview(req.user.id))
  }),
)

export default router
