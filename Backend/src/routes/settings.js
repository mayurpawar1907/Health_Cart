import { Router } from 'express'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { getPricingSettings } from '../services/platform-settings.service.js'

const router = Router()

router.get(
  '/pricing',
  asyncHandler(async (_req, res) => {
    const s = await getPricingSettings()
    ok(res, {
      paymentPromoPercent: s.paymentPromoPercent,
      paymentPromoActive: s.paymentPromoActive,
      paymentPromoApplyToAllUsers: s.paymentPromoApplyToAllUsers,
      promoLabel: s.promoLabel,
      updatedAt: s.updatedAt,
    })
  }),
)

export default router
