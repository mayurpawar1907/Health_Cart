import { Router } from 'express'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { getWalletSummary } from '../services/wallet.service.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    ok(res, await getWalletSummary(req.user.id))
  }),
)

export default router
