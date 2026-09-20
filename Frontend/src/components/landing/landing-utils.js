import { formatMoney } from '@/utils/utils'

/** Shared centered page width for all landing sections */
export const LANDING_CONTAINER = 'landing-container'

export const LANDING_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Gurgaon']

export const CITY_STORAGE_KEY = 'hc_landing_city'

export function readLandingCity() {
  try {
    const saved = localStorage.getItem(CITY_STORAGE_KEY)
    if (saved && LANDING_CITIES.includes(saved)) return saved
  } catch {
    /* ignore */
  }
  return 'Mumbai'
}

export function saveLandingCity(city) {
  try {
    localStorage.setItem(CITY_STORAGE_KEY, city)
  } catch {
    /* ignore */
  }
}

/** Primary nav — top category menu */
export const PRIMARY_NAV = [
  { slug: 'full-body-packages', label: 'Full Body Checkup', hint: 'Comprehensive health panels' },
  { slug: 'heart', label: 'Heart', hint: 'Cardiac markers & lipid profile' },
  { slug: 'cancer-markers', label: 'Cancer', hint: 'Screening & tumour markers' },
  { slug: 'thyroid', label: 'Thyroid', hint: 'TSH, T3, T4 & antibodies' },
  { slug: 'diabetes', label: 'Diabetes', hint: 'Sugar control & HbA1c' },
  { slug: 'pregnancy', label: 'Pregnancy', hint: 'Antenatal & fertility tests' },
  { slug: 'hormones', label: 'Hormone', hint: 'Endocrine & reproductive panels' },
]

export const SERVICE_TAB_LABELS = {
  'full-body-packages': 'Full Body Checkup',
  vitamins: 'Vitamins',
  thyroid: 'Thyroid',
  kidney: 'Kidney',
  liver: 'Liver',
  heart: 'Heart',
  diabetes: 'Diabetes',
  hormones: 'Hormone',
  'blood-tests': 'Blood Tests',
  pregnancy: 'Pregnancy',
  'cancer-markers': 'Cancer',
  infection: 'Infection',
  microbiology: 'Microbiology',
}

/** Left sidebar inside Full Body mega menu */
export const MEGA_SIDEBAR = [
  { id: 'popular', label: 'Popular Packages', desc: 'Most booked by members' },
  { id: 'blood-tests', label: 'Blood Tests', desc: 'CBC & hematology panels' },
  { id: 'all-packages', label: 'Health Packages', desc: 'Browse all bundles' },
  { id: 'risk-panels', label: 'Health Risk Panels', desc: 'Heart, diabetes & more' },
  { id: 'rate-list', label: 'Full Rate List', desc: 'Every test & price', href: '#catalog' },
]

/** Trending quick-pick icons (right column top row) */
export const TRENDING_PICKS = [
  { slug: 'diabetes', label: 'Diabetes Package', tint: 'bg-amber-50' },
  { slug: 'thyroid', label: 'Thyroid Package', tint: 'bg-sky-50' },
  { slug: 'heart', label: 'Heart Package', tint: 'bg-rose-50' },
  { slug: 'pregnancy', label: 'Pregnancy Package', tint: 'bg-violet-50' },
]

const RISK_KEYWORDS = ['cardiac', 'diabetic', 'diabetes', 'heart', 'thyroid', 'pcod', 'cancer', 'arthritis', 'hepatitis']

export function specialPrice(test) {
  return Number(test.discountedPrice ?? test.memberPrice ?? test.price)
}

export function savingsPercent(mrp, special) {
  if (!mrp || mrp <= 0) return 0
  return Math.round(((mrp - special) / mrp) * 100)
}

export function testCountLabel(item) {
  const n = (item.parameters ?? []).length
  if (n > 0) return `${n}+ Tests Included`
  if (item.isPackage) return 'Multi-test package'
  return '1 Test Included'
}

export function filterPackages(packages, sidebarId) {
  const list = packages.filter((p) => p.isPackage)
  switch (sidebarId) {
    case 'popular':
      return [...list].sort((a, b) => Number(b.isPopular) - Number(a.isPopular))
    case 'blood-tests':
      return list.filter((p) => /blood|cbc|hematology/i.test(p.name))
    case 'risk-panels':
      return list.filter((p) => RISK_KEYWORDS.some((k) => p.name.toLowerCase().includes(k)))
    case 'all-packages':
    default:
      return list
  }
}

export function filterTests(tests, slug) {
  return tests.filter((t) => !t.isPackage && t.category?.slug === slug)
}

export function formatCardPrice(mrp, special) {
  return {
    mrp: formatMoney(mrp),
    special: formatMoney(special),
    save: savingsPercent(mrp, special),
  }
}

export function fastingLabel(preparation) {
  if (!preparation || /non.?fast/i.test(preparation)) return 'Non-fasting sample'
  if (/fast/i.test(preparation)) return 'Fasting required (8–12 hrs)'
  return preparation
}
