import { queryOne, execute, num, bool } from '../config/database.js'
import { PROMO_FLAT_DISCOUNT_PERCENT } from '../constants/pricing.js'

const DEFAULT_SETTINGS = {
  paymentPromoPercent: PROMO_FLAT_DISCOUNT_PERCENT,
  paymentPromoActive: true,
  paymentPromoApplyToAllUsers: true,
  promoLabel: 'Extra off special price at payment',
}

let cache = null
let cacheAt = 0
const ttlMs = 30000

const mapRow = (row) => ({
  paymentPromoPercent: num(row.paymentPromoPercent),
  paymentPromoActive: bool(row.paymentPromoActive),
  paymentPromoApplyToAllUsers: bool(row.paymentPromoApplyToAllUsers),
  promoLabel: String(row.promoLabel),
  updatedAt: row.updatedAt,
})

export const getPricingSettings = async () => {
  const now = Date.now()
  if (cache && now - cacheAt < ttlMs) return cache
  const row = await queryOne(`SELECT * FROM PlatformSettings WHERE id = 'default'`)
  if (!row) {
    cache = DEFAULT_SETTINGS
    cacheAt = now
    return DEFAULT_SETTINGS
  }
  cache = mapRow(row)
  cacheAt = now
  return cache
}

export const updatePricingSettings = async (actorUserId, dto) => {
  const existing = await queryOne(`SELECT * FROM PlatformSettings WHERE id = 'default'`)
  if (!existing) {
    await execute(
      `INSERT INTO PlatformSettings
        (id, paymentPromoPercent, paymentPromoActive, paymentPromoApplyToAllUsers, promoLabel, updatedByUserId)
       VALUES ('default', :pct, :active, :allUsers, :label, :actor)`,
      {
        pct: dto.paymentPromoPercent ?? DEFAULT_SETTINGS.paymentPromoPercent,
        active: (dto.paymentPromoActive ?? DEFAULT_SETTINGS.paymentPromoActive) ? 1 : 0,
        allUsers: (dto.paymentPromoApplyToAllUsers ?? DEFAULT_SETTINGS.paymentPromoApplyToAllUsers) ? 1 : 0,
        label: dto.promoLabel ?? DEFAULT_SETTINGS.promoLabel,
        actor: actorUserId,
      },
    )
  } else {
    await execute(
      `UPDATE PlatformSettings SET
        paymentPromoPercent = COALESCE(:pct, paymentPromoPercent),
        paymentPromoActive = COALESCE(:active, paymentPromoActive),
        paymentPromoApplyToAllUsers = COALESCE(:allUsers, paymentPromoApplyToAllUsers),
        promoLabel = COALESCE(:label, promoLabel),
        updatedByUserId = :actor
       WHERE id = 'default'`,
      {
        pct: dto.paymentPromoPercent ?? null,
        active: dto.paymentPromoActive == null ? null : dto.paymentPromoActive ? 1 : 0,
        allUsers: dto.paymentPromoApplyToAllUsers == null ? null : dto.paymentPromoApplyToAllUsers ? 1 : 0,
        label: dto.promoLabel ?? null,
        actor: actorUserId,
      },
    )
  }
  const row = await queryOne(`SELECT * FROM PlatformSettings WHERE id = 'default'`)
  cache = mapRow(row)
  cacheAt = Date.now()
  return cache
}

export const invalidatePricingCache = () => {
  cache = null
  cacheAt = 0
}
