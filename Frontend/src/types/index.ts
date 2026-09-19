export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type CollectionType = 'LAB' | 'HOME'
export type PaymentMethod = 'UPI' | 'CARD' | 'COD' | 'WALLET'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type FamilyRelation = 'SPOUSE' | 'PARENT' | 'CHILD' | 'SIBLING' | 'OTHER'

export type AuthUser = {
  id: string
  email: string
  role: Role
  fullName: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
}

export type LabTest = {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  preparation: string
  sampleType: string
  reportHours: number
  price: number
  discountPercent: number
  discountedPrice: number
  memberPrice?: number
  membershipDiscountApplied?: number
  membershipApplied?: boolean
  flatDiscountPercent?: number
  isFreeForMember?: boolean
  membershipDiscountPct: number
  membershipEligible: boolean
  membershipFree: boolean
  isPopular: boolean
  isPackage: boolean
  faqs?: { q: string; a: string }[] | null
  category: Category
  parameters: { id: string; name: string; unit?: string | null }[]
  packageTests?: { id: string; includedTest: { id: string; name: string; slug: string } }[]
}

export type PriceQuote = {
  testId: string
  testName: string
  originalPrice: number
  baseDiscount: number
  listPrice: number
  specialPrice?: number
  listDiscountFromMrp: number
  priceBeforePaymentDiscount: number
  paymentDiscountPercent: number
  paymentDiscountAmount: number
  subtotalAfterPaymentDiscount: number
  /** @deprecated use listDiscountFromMrp */
  membershipDiscount: number
  /** @deprecated use listDiscountFromMrp */
  cardDiscount: number
  /** @deprecated use listPrice */
  cardPrice: number
  /** @deprecated use subtotalAfterPaymentDiscount */
  subtotalAfterCard: number
  walletBalance: number
  referralBalance: number
  referralPerTest: number
  referralCreditAvailable: number
  useWallet: boolean
  useReferral: boolean
  referralCreditApplied: number
  walletCreditApplied: number
  amountDue: number
  finalPrice: number
  membershipApplied: boolean
  flatDiscountPercent: number
  isFreeForMember: boolean
}

export type WalletSummary = {
  balance: number
  referralBalance: number
  totalSpendable: number
  referralPerTest: number
  referralTestsRemaining: number
  joiningBonusCredited: boolean
  referralCode: string
  rules: { JOINING_BONUS: number; REFERRAL_BONUS: number; REFERRAL_PER_TEST: number }
  transactions: { id: string; type: string; amount: number; description: string; createdAt: string }[]
}

export type Appointment = {
  id: string
  code: string
  date: string
  timeSlot: string
  status: AppointmentStatus
  patientName: string
  patientAge?: number | null
  location: string
  collectionType?: CollectionType
  deliveryAddress?: string | null
  originalPrice?: number | null
  membershipDiscount?: number | null
  finalPrice?: number | null
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod | null
  reminderEnabled?: boolean
  test: LabTest
  reports?: Report[]
  familyMember?: FamilyMember | null
}

export type Report = {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'AVAILABLE'
  fileUrl?: string | null
  fileName?: string | null
  fileMimeType?: string | null
  fileSize?: number | null
  summary?: string | null
  releasedAt?: string | null
  appointment?: Appointment
}

export type MembershipPlan = {
  id: string
  name: string
  slug: string
  price: number | string
  durationDays: number
  description: string
  isFree?: boolean
  flatDiscountPercent?: number | string
  maxFamilyMembers?: number
  benefits: { id: string; title: string; description: string; freeTest: boolean; test?: LabTest | null }[]
}

export type MembershipMember = {
  id: string
  name: string
  relation: string
  isPrimary: boolean
  familyMember?: FamilyMember | null
}

export type Membership = {
  id: string
  number: string
  startsAt: string
  expiresAt: string
  isActive: boolean
  plan: MembershipPlan
  usage: { id: string; usedAt: string; note?: string | null; test: LabTest }[]
  members?: MembershipMember[]
}

export type FamilyMember = {
  id: string
  name: string
  relation: FamilyRelation
  age?: number | null
  gender?: Gender | null
  mobile?: string | null
}

export type TestReminder = {
  id: string
  label: string
  remindAt: string
  isActive: boolean
  test?: LabTest | null
  appointment?: Appointment | null
}

export type NotificationItem = {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

export type PlatformPricingSettings = {
  paymentPromoPercent: number
  paymentPromoActive: boolean
  paymentPromoApplyToAllUsers: boolean
  promoLabel: string
  updatedAt?: string
}

export type PaymentTransactionBreakdown = {
  mrp: number
  specialPrice: number
  listDiscountFromMrp: number
  priceBeforePaymentDiscount: number
  paymentDiscountPercent: number
  paymentDiscountAmount: number
  subtotalAfterPaymentDiscount: number
  referralCreditApplied: number
  walletCreditApplied: number
  amountDue: number
  isFreeForMember: boolean
  totalDiscount?: number
}

export type PaymentInvoice = {
  invoiceNumber: string
  issuedAt: string
  bookingCode: string
  testName: string
  patientName?: string
  customer: { name: string; email: string; mobile?: string }
  payment: {
    id: string
    method: PaymentMethod
    status: PaymentStatus
    amount: number
    currency: string
  }
  pricing: PaymentTransactionBreakdown
  appointment?: {
    id: string
    code: string
    date: string
    timeSlot?: string
  }
}

export type PaymentTransaction = {
  id: string
  appointmentId: string
  userId: string
  bookingCode: string
  testName: string
  invoiceNumber?: string | null
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  breakdown: PaymentTransactionBreakdown
  createdAt: string
  updatedAt: string
  user?: { id: string; fullName: string; email: string; mobile?: string }
  appointment?: {
    id: string
    code: string
    date: string
    timeSlot?: string
    patientName?: string
    paymentStatus?: PaymentStatus
    payableAmount?: number
    finalPrice?: number
    test?: { name: string; slug: string }
  }
}

export type PaymentTransactionList = {
  items: PaymentTransaction[]
  total: number
  page: number
  pages: number
  stats?: { status: PaymentStatus; count: number; amount: number }[]
}

export type UserProfile = {
  fullName: string
  email: string
  mobile: string
  dateOfBirth?: string | null
  gender?: string | null
  avatarUrl?: string | null
  profile?: { language: string; theme: string; notificationsOn: boolean; whatsappOn?: boolean; locationLat?: number | null; locationLng?: number | null }
  addresses: { id?: string; line1: string; city: string; state: string; pincode: string; label?: string | null }[]
}
