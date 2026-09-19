import { useQuery } from '@tanstack/react-query'
import api, { unwrap } from '@/api/client'

export const DEFAULT_PRICING = {
  paymentPromoPercent: 30,
  paymentPromoActive: true,
  paymentPromoApplyToAllUsers: true,
  promoLabel: 'Extra off special price at payment',
}

export function usePlatformPricing() {
  const query = useQuery({
    queryKey: ['platform-pricing'],
    queryFn: async () => unwrap((await api.get('/settings/pricing')).data),
    staleTime: 60000,
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

/** Live counts from SQL via API (tests / packages / membership plan). */
export function useCatalogStats() {
  const pricing = usePlatformPricing()
  const testsQ = useQuery({
    queryKey: ['catalog-stats-tests'],
    queryFn: async () => unwrap((await api.get('/tests')).data),
    staleTime: 60000,
  })
  const plansQ = useQuery({
    queryKey: ['catalog-stats-plans'],
    queryFn: async () => unwrap((await api.get('/membership/plans')).data),
    staleTime: 60000,
  })

  const tests = testsQ.data ?? []
  const testCount = tests.filter((t) => !t.isPackage).length
  const packageCount = tests.filter((t) => t.isPackage).length
  const plan = plansQ.data?.[0]
  const familyMembers = plan?.maxFamilyMembers ?? 5
  const flatDiscount = pricing.isPromoActive
    ? pricing.activePercent
    : Number(plan?.flatDiscountPercent ?? pricing.settings.paymentPromoPercent ?? 30)

  return {
    testCount,
    packageCount,
    familyMembers,
    flatDiscount,
    reportHours: '24–48',
    isLoading: testsQ.isLoading || plansQ.isLoading || pricing.isLoading,
  }
}
