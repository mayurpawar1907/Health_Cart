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
  allergy: 'Allergy',
  thyroid: 'Thyroid',
  kidney: 'Kidney',
  liver: 'Liver',
  heart: 'Heart',
  diabetes: 'Diabetes',
  joints: 'Joints',
  hormones: 'Hormone',
  'blood-tests': 'Blood Tests',
  pregnancy: 'Pregnancy',
  'cancer-markers': 'Cancer',
  infection: 'Infection',
  microbiology: 'Microbiology',
}

/** Left sidebar inside Full Body mega menu — Healthians-style browse list */
export const MEGA_SIDEBAR = [
  { id: 'popular', label: 'Popular Packages' },
  { id: 'blood-tests', label: 'Blood Tests' },
  { id: 'unhealthy-habits', label: 'Tests by Unhealthy Habits' },
  { id: 'risk-panels', label: 'Tests by Health Risks' },
  { id: 'govt-panel', label: 'Govt. Panel Health Test' },
  { id: 'all-packages', label: 'Health Packages' },
  { id: 'rate-list', label: 'Full Rate List', href: '#catalog' },
  { id: 'health-tips', label: 'Health Tips', href: '#faq' },
]

/** Trending quick-pick icons (right column top row) — HealthID tints */
export const TRENDING_PICKS = [
  { slug: 'diabetes', label: 'Diabetes Package', tint: 'bg-teal-light/90', icon: 'diabetes' },
  { slug: 'thyroid', label: 'Thyroid Package', tint: 'bg-cream', icon: 'thyroid' },
  { slug: 'heart', label: 'Heart Package', tint: 'bg-brand-red-light/80', icon: 'heart', badge: 'Trending' },
  { slug: 'allergy', label: 'Allergy Package', tint: 'bg-teal-light/60', icon: 'allergy' },
]

/** 4-column browse grids — Full Body mega menu center panel (HealthID catalog) */
export const MEGA_UNHEALTHY_HABITS = [
  { label: 'Smoking & Tobacco', query: 'liver lipid' },
  { label: 'Alcohol Consumption', query: 'liver hepatitis' },
  { label: 'Junk Food & Fast Food', query: 'lipid cholesterol' },
  { label: 'Sedentary Lifestyle', query: 'diabetes hba1c' },
  { label: 'Chronic Stress', query: 'thyroid cortisol' },
  { label: 'Poor Sleep / Sleeplessness', query: 'thyroid vitamin' },
  { label: 'Low Iron Diet', query: 'iron ferritin' },
  { label: 'High Sugar Intake', query: 'diabetes glucose hba1c' },
  { label: 'Heartburn & Acidity', query: 'liver amylase' },
  { label: 'Medicine Overuse', query: 'kidney liver' },
  { label: 'Poor Nutrition', query: 'vitamin b12 d3' },
  { label: 'Zero Exercise', query: 'fitness lipid cardiac' },
]

export const MEGA_HEALTH_RISK_TESTS = [
  { label: 'Complete Blood Count (CBC)', query: 'cbc blood count' },
  { label: 'Lipid Profile Test', query: 'lipid cholesterol' },
  { label: 'LFT (Liver Function Test)', query: 'liver function' },
  { label: 'KFT / Kidney Profile', query: 'kidney renal creatinine' },
  { label: 'HbA1c / Diabetes Test', query: 'diabetes hba1c glucose' },
  { label: 'Thyroid Profile (T3 T4 TSH)', query: 'thyroid tsh' },
  { label: 'Vitamin D Test', query: 'vitamin d' },
  { label: 'Vitamin B12 Test', query: 'vitamin b12' },
  { label: 'Iron Profile / Ferritin', query: 'iron ferritin' },
  { label: 'Cardiac Care Profile', query: 'cardiac heart' },
  { label: 'Cancer Marker Panel', query: 'cancer marker' },
  { label: 'PCOD / Hormone Panel', query: 'pcod hormone' },
  { label: 'Arthritis Profile', query: 'arthritis rheumatoid' },
  { label: 'Hepatitis Profile', query: 'hepatitis' },
  { label: 'Pregnancy / ANC Profile', query: 'pregnancy anc' },
  { label: 'Full Body Checkup Basic', query: 'full body basic' },
  { label: 'Diabetic Panel', query: 'diabetic diabetes' },
  { label: 'Urine Routine Test', query: 'urine' },
  { label: 'CRP / Inflammation Test', query: 'crp' },
  { label: 'Infertility Profile', query: 'infertility' },
  { label: 'Bone Health Profile', query: 'bone vitamin d' },
  { label: 'Hairfall Profile', query: 'hairfall' },
  { label: 'Coagulation Profile', query: 'coagulation' },
  { label: 'Thalassemia Screening', query: 'thalassemia' },
  { label: 'Pre-Surgery Profile', query: 'pre surgery' },
  { label: 'Allergy Testing', query: 'allergy' },
  { label: 'Fitness Care Package', query: 'fitness' },
  { label: 'Women Care Panel', query: 'women care' },
]

export const MEGA_BLOOD_TESTS = [
  { label: 'Complete Blood Count (CBC)', query: 'cbc' },
  { label: 'HbA1c Test', query: 'hba1c' },
  { label: 'Blood Sugar Fasting', query: 'glucose fasting' },
  { label: 'Lipid Profile', query: 'lipid' },
  { label: 'Liver Function Test', query: 'liver function' },
  { label: 'Kidney Profile', query: 'kidney' },
  { label: 'Thyroid Profile', query: 'thyroid' },
  { label: 'Vitamin B12', query: 'b12' },
  { label: 'Vitamin D', query: 'vitamin d' },
  { label: 'Iron Profile', query: 'iron' },
  { label: 'CRP Test', query: 'crp' },
  { label: 'Urine Routine', query: 'urine' },
  { label: 'ESR Test', query: 'esr' },
  { label: 'PSA Test', query: 'psa' },
  { label: 'HIV Rapid Test', query: 'hiv' },
  { label: 'Hb Electrophoresis', query: 'hemoglobin electrophoresis' },
]

export const MEGA_GRID_PANELS = {
  'unhealthy-habits': { title: 'Tests by Unhealthy Habits', items: MEGA_UNHEALTHY_HABITS },
  'risk-panels': { title: 'Tests by Health Risks', items: MEGA_HEALTH_RISK_TESTS },
  'blood-tests': { title: 'Popular Blood Tests', items: MEGA_BLOOD_TESTS },
}

/** Split flat list into N columns for mega-menu browse grid */
export function chunkIntoColumns(items, columnCount = 4) {
  if (!items.length) return []
  const size = Math.ceil(items.length / columnCount)
  return Array.from({ length: columnCount }, (_, i) => items.slice(i * size, (i + 1) * size)).filter(
    (col) => col.length > 0,
  )
}

/** HealthID-tinted backgrounds for trending 2×2 package grid */
export const TRENDING_CARD_TINTS = [
  'bg-brand-red-light/70 border-brand-red/15',
  'bg-teal-light/80 border-teal/15',
  'bg-cream border-teal/10',
  'bg-teal-light/50 border-teal/12',
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
    case 'unhealthy-habits':
      return list.filter((p) => /smok|alcohol|tobacco|lifestyle|habit|liver|lipid/i.test(p.name))
    case 'risk-panels':
      return list.filter((p) => RISK_KEYWORDS.some((k) => p.name.toLowerCase().includes(k)))
    case 'govt-panel':
      return list.filter((p) => /govt|government|panel|pre-employment|employment/i.test(p.name))
    case 'all-packages':
    default:
      return list
  }
}

const TAB_KEYWORDS = {
  heart: ['heart', 'cardiac', 'lipid', 'cholesterol'],
  'cancer-markers': ['cancer', 'tumour', 'tumor', 'oncology'],
  thyroid: ['thyroid', 'tsh', 't3', 't4'],
  diabetes: ['diabetes', 'diabetic', 'sugar', 'hba1c', 'glucose'],
  pregnancy: ['pregnancy', 'prenatal', 'antenatal', 'fertility'],
  hormones: ['hormone', 'hormonal', 'endocrine', 'testosterone'],
  vitamins: ['vitamin', 'b12', 'd3', 'folate'],
  allergy: ['allergy', 'allergen', 'ige'],
  kidney: ['kidney', 'renal', 'kft', 'creatinine'],
  liver: ['liver', 'hepatic', 'lft', 'sgpt'],
  joints: ['joint', 'arthritis', 'rheumatoid', 'uric'],
  'full-body-packages': ['full body', 'checkup', 'health package', 'comprehensive'],
}

/** Left panel copy for Healthians-style category mega menu */
export const MEGA_CATEGORY_INFO = {
  heart: {
    whyHeading: 'Why Heart Checkups Matter:',
    bullets: ['Heart issues often start silently.', 'Early tests can save lives.', 'A healthy heart powers everything.'],
    gradient: 'from-brand-red-light/80 via-teal-light/70 to-cream',
    packageHeading: 'Preventive Packages for Heart',
  },
  'cancer-markers': {
    whyHeading: 'Why Cancer Checkups Matter:',
    bullets: ['Early signs are often silent.', 'Screening can catch risks sooner.', 'Timely detection saves lives.'],
    gradient: 'from-teal-light via-cream to-brand-red-light/50',
    packageHeading: 'Preventive Packages for Cancer',
  },
  thyroid: {
    whyHeading: 'Why Thyroid Checkups Matter:',
    bullets: ['Thyroid imbalance affects energy & weight.', 'Simple blood tests reveal the full picture.', 'Early care keeps hormones balanced.'],
    gradient: 'from-teal-light/90 via-cream to-teal-light/40',
    packageHeading: 'Preventive Packages for Thyroid',
  },
  diabetes: {
    whyHeading: 'Why Diabetes Checkups Matter:',
    bullets: ['Sugar spikes often go unnoticed.', 'HbA1c tracks long-term control.', 'Prevention is easier than complications.'],
    gradient: 'from-cream via-teal-light/60 to-teal-light/30',
    packageHeading: 'Preventive Packages for Diabetes',
  },
  pregnancy: {
    whyHeading: 'Why Pregnancy Tests Matter:',
    bullets: ['Monitor maternal health at every stage.', 'Early panels support safer pregnancies.', 'Home collection for your comfort.'],
    gradient: 'from-brand-red-light/60 via-teal-light/50 to-cream',
    packageHeading: 'Preventive Packages for Pregnancy',
  },
  hormones: {
    whyHeading: 'Why Hormone Checkups Matter:',
    bullets: ['Hormones drive mood, energy & metabolism.', 'Targeted panels find imbalances early.', 'Personalised care starts with data.'],
    gradient: 'from-teal-light/80 via-cream to-teal-light/40',
    packageHeading: 'Preventive Packages for Hormones',
  },
  'full-body-packages': {
    whyHeading: 'Why Full Body Checkups Matter:',
    bullets: ['One visit covers dozens of vital markers.', 'Catch risks before symptoms appear.', 'Best value for preventive family care.'],
    gradient: 'from-teal-light via-cream to-teal-light/50',
    packageHeading: 'Popular Full Body Packages',
  },
}

export function getMegaCategoryInfo(tab) {
  return (
    MEGA_CATEGORY_INFO[tab] ?? {
      whyHeading: 'Why preventive checkups matter:',
      bullets: ['Early detection saves time and cost.', 'Home collection fits your schedule.', 'NABL partner labs you can trust.'],
      gradient: 'from-teal-light via-cream to-white',
      packageHeading: `Preventive Packages for ${SERVICE_TAB_LABELS[tab] ?? 'Health'}`,
    }
  )
}

function matchesFilterKey(text, filterKey) {
  const keywords = TAB_KEYWORDS[filterKey]
  const hay = text.toLowerCase()
  if (!keywords) return hay.includes(filterKey.replace(/-/g, ' '))
  return keywords.some((k) => hay.includes(k))
}

export function filterTests(tests, slug) {
  const list = tests.filter((t) => !t.isPackage)
  const bySlug = list.filter((t) => t.category?.slug === slug)
  if (bySlug.length) return bySlug
  return list.filter((t) =>
    matchesFilterKey(`${t.name} ${t.shortDescription ?? ''} ${t.category?.name ?? ''}`, slug),
  )
}

export function filterBrowsePackages(packages, filterKey) {
  const list = packages.filter((p) => p.isPackage)
  if (filterKey === 'full-body-packages') {
    return [...list].sort((a, b) => Number(b.isPopular) - Number(a.isPopular))
  }
  const related = list.filter((p) => matchesFilterKey(p.name, filterKey))
  return related.length ? related : list.slice(0, 8)
}

/** Healthians-style quick category icons below hero search */
export const QUICK_CATEGORIES = [
  { filterKey: 'full-body-packages', label: 'Full Body', tint: 'bg-teal-light text-teal' },
  { filterKey: 'vitamins', label: 'Vitamins', tint: 'bg-amber-50 text-amber-700' },
  { filterKey: 'allergy', label: 'Allergy', tint: 'bg-rose-50 text-rose-600' },
  { filterKey: 'thyroid', label: 'Thyroid', tint: 'bg-sky-50 text-sky-700' },
  { filterKey: 'kidney', label: 'Kidney', tint: 'bg-violet-50 text-violet-700' },
  { filterKey: 'liver', label: 'Liver', tint: 'bg-orange-50 text-orange-700' },
  { filterKey: 'heart', label: 'Heart', tint: 'bg-red-50 text-red-600' },
  { filterKey: 'diabetes', label: 'Diabetes', tint: 'bg-emerald-50 text-emerald-700' },
  { filterKey: 'joints', label: 'Joints', tint: 'bg-indigo-50 text-indigo-700' },
]

/** Health risk browse grid */
export const HEALTH_RISK_GRID = [
  { filterKey: 'vitamins', blurb: 'Vitamin D, B12 and deficiency panels.' },
  { filterKey: 'allergy', blurb: 'Allergy screening and intolerance tests.' },
  { filterKey: 'thyroid', blurb: 'TSH, T3, T4 and thyroid antibodies.' },
  { filterKey: 'kidney', blurb: 'Kidney function and renal health panels.' },
  { filterKey: 'liver', blurb: 'Liver function and hepatic markers.' },
  { filterKey: 'heart', blurb: 'Cardiac markers, lipids and heart screens.' },
  { filterKey: 'diabetes', blurb: 'Blood sugar, HbA1c and diabetic care.' },
  { filterKey: 'joints', blurb: 'Arthritis, RA factor and joint health.' },
  { filterKey: 'cancer-markers', blurb: 'Tumour markers and screening panels.' },
  { filterKey: 'hormones', blurb: 'Reproductive and endocrine hormones.' },
  { filterKey: 'pregnancy', blurb: 'Antenatal, fertility and pregnancy tests.' },
]

export const WHY_CHOOSE_ITEMS = [
  { title: 'Safety first', desc: 'Verified phlebotomists & hygiene protocols' },
  { title: 'Best member prices', desc: 'Special partner rates on every test' },
  { title: 'Smart digital reports', desc: 'Secure vault + WhatsApp delivery' },
  { title: '100% accurate results', desc: 'NABL accredited partner laboratories' },
  { title: 'Free home collection', desc: 'No extra visit charges for members' },
  { title: 'Extra off at payment', desc: 'Flat discount on special price checkout' },
  { title: 'Family membership', desc: 'One card covers your whole household' },
  { title: 'Easy rescheduling', desc: 'Manage slots from app or WhatsApp' },
]

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

/** Pills under "Full Body Checkup in {city}" — Healthians-style category row */
export const PACKAGE_CATEGORY_TABS = [
  { filterKey: 'full-body-packages', label: 'Full Body Checkup' },
  { filterKey: 'vitamins', label: 'Vitamins' },
  { filterKey: 'allergy', label: 'Allergy' },
  { filterKey: 'thyroid', label: 'Thyroid' },
  { filterKey: 'kidney', label: 'Kidney' },
  { filterKey: 'liver', label: 'Liver' },
  { filterKey: 'heart', label: 'Heart' },
  { filterKey: 'diabetes', label: 'Diabetes' },
  { filterKey: 'joints', label: 'Joints' },
]

export function packageParameterPreview(item, max = 6) {
  const names = (item.parameters ?? []).map((p) => p.name).filter(Boolean)
  if (names.length) return names
  if (item.shortDescription) return [item.shortDescription]
  return ['Comprehensive lab panel from partner catalog']
}

export function recommendedAudience(name) {
  const n = name.toLowerCase()
  if (/female|women|woman/.test(n)) return 'Female'
  if (/male|men|man/.test(n)) return 'Male'
  return 'Everyone'
}

export function groupPerPersonPrice(special, members) {
  if (members <= 1) return special
  const discount = members >= 3 ? 0.08 : 0.05
  return Math.round(special * (1 - discount))
}
