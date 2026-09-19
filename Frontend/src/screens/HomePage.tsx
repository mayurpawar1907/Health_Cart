import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api, { unwrap } from '@/services/api'
import type { RootState } from '@/store'
import type { Appointment, Category, LabTest, UserProfile } from '@/types'
import { formatDate } from '@/lib/utils'
import { HomeTopSection } from '@/components/home/HomeTopSection'
import { HomeExplore } from '@/components/home/SmartDashboard'
import { HomePackages } from '@/components/home/HomePackages'
import { HomeBannerSlider } from '@/components/home/HomeBannerSlider'
import { HomeHealthIdCard } from '@/components/home/HomeHealthIdCard'
import { PaymentDiscountBanner } from '@/components/brand/PaymentDiscountOffer'
import { UserPage } from '@/components/user/UserUi'
import { Loading } from '@/components/ui/Loading'

export function HomePage() {
  const user = useSelector((s: RootState) => s.auth.user)!
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const editCard = params.get('edit') === 'card'

  function scrollToCardSection() {
    window.requestAnimationFrame(() => {
      document.getElementById('healthid-card-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => unwrap<UserProfile>((await api.get('/users/profile')).data),
  })
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => unwrap<Category[]>((await api.get('/tests/categories')).data),
  })
  const popularQuery = useQuery({
    queryKey: ['tests', 'popular'],
    queryFn: async () => unwrap<LabTest[]>((await api.get('/tests', { params: { popular: 'true' } })).data),
  })
  const dashQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () =>
      unwrap<{ upcomingAppointment: Appointment | null; membership: { id: string } | null }>(
        (await api.get('/dashboard')).data,
      ),
  })

  useEffect(() => {
    if (params.get('edit') === 'card' || location.hash === '#healthid-card-section') {
      scrollToCardSection()
    }
  }, [params, location.hash])

  const loading = profileQuery.isLoading || popularQuery.isLoading
  if (loading) return <Loading label="Loading your home" />

  const upcoming = dashQuery.data?.upcomingAppointment
  const membership = dashQuery.data?.membership
  const address = profileQuery.data?.addresses[0]
  const hasMembership = !!membership
  const hasAddress = Boolean(address?.line1 && address?.pincode)
  const firstName = user.fullName.split(' ')[0]

  return (
    <UserPage className="space-y-8">
      <HomeTopSection
        firstName={firstName}
        city={address?.city}
        hasMembership={hasMembership}
        hasAddress={hasAddress}
        onSearch={(q) => {
          const value = q.trim()
          if (!value) return
          const recent = JSON.parse(localStorage.getItem('hc_recent_searches') || '[]') as string[]
          localStorage.setItem(
            'hc_recent_searches',
            JSON.stringify([value, ...recent.filter((x) => x !== value)].slice(0, 6)),
          )
          navigate(`/search?q=${encodeURIComponent(value)}`)
        }}
        upcoming={
          upcoming
            ? {
                testName: upcoming.test.name,
                date: formatDate(upcoming.date),
                time: upcoming.timeSlot,
                href: `/appointments/${upcoming.id}`,
              }
            : null
        }
      />

      <HomeHealthIdCard
        hasMembership={hasMembership}
        editOpen={editCard}
        onEditOpen={(open) => {
          if (open) setParams({ edit: 'card' })
          else setParams({})
        }}
        hasAddress={hasAddress}
      />

      <PaymentDiscountBanner />

      <HomeBannerSlider />

      <HomePackages />

      <HomeExplore categories={categoriesQuery.data ?? []} popular={popularQuery.data ?? []} />
    </UserPage>
  )
}
