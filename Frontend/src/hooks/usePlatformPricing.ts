import { useQuery } from '@tanstack/react-query'
import api, { unwrap } from '@/services/api'
import type { PlatformPricingSettings } from '@/types'
import { PLATFORM } from '@/data/platform-content'

export const DEFAULT_PRICING: PlatformPricingSettings = {
  paymentPromoPercent: PLATFORM.membership.flatDiscount,
  paymentPromoActive: true,
  paymentPromoApplyToAllUsers: true,
  promoLabel: `Extra ${PLATFORM.membership.flatDiscount}% off special price at payment`,
}

export function usePlatformPricing() {
  const query = useQuery({
    queryKey: ['platform-pricing'],
    queryFn: async () => unwrap<PlatformPricingSettings>((await api.get('/settings/pricing')).data),
    staleTime: 60_000,
  })

  const settings = query.data ?? DEFAULT_PRICING
  const activePercent = settings.paymentPromoActive ? settings.paymentPromoPercent : 0

  return {
    ...query,
    settings,
    activePercent,
    isPromoActive: settings.paymentPromoActive && activePercent > 0,
  }
}
