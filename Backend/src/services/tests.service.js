import { query, queryOne, bool, num, parseJson } from '../config/database.js'
import { notFound } from '../utils/errors.js'
import * as pricing from './pricing.service.js'

const mapCategory = (row) => ({
  id: row.catId ?? row.id,
  name: row.catName ?? row.name,
  slug: row.catSlug ?? row.slug,
  description: row.catDescription ?? row.description ?? null,
  isActive: bool(row.catIsActive ?? row.isActive),
  createdAt: row.catCreatedAt ?? row.createdAt,
  updatedAt: row.catUpdatedAt ?? row.updatedAt,
  deletedAt: row.catDeletedAt ?? row.deletedAt ?? null,
})

const mapTestBase = (row) => ({
  id: row.id,
  categoryId: row.categoryId,
  name: row.name,
  slug: row.slug,
  shortDescription: row.shortDescription,
  description: row.description,
  preparation: row.preparation,
  sampleType: row.sampleType,
  reportHours: Number(row.reportHours),
  price: num(row.price),
  discountPercent: num(row.discountPercent),
  membershipDiscountPct: num(row.membershipDiscountPct),
  membershipEligible: bool(row.membershipEligible),
  membershipFree: bool(row.membershipFree),
  isPopular: bool(row.isPopular),
  isPackage: bool(row.isPackage),
  isActive: bool(row.isActive),
  faqs: parseJson(row.faqs, null),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  deletedAt: row.deletedAt,
})

const loadParameters = async (testId) =>
  query(`SELECT id, testId, name, unit FROM TestParameter WHERE testId = :testId`, { testId })

const loadPackageTests = async (testId, fullIncluded = false) => {
  const rows = await query(
    fullIncluded
      ? `SELECT h.id, h.packageTestId, h.includedTestId, t.*
         FROM HealthPackageTest h
         JOIN Test t ON t.id = h.includedTestId
         WHERE h.packageTestId = :testId`
      : `SELECT h.id, h.packageTestId, h.includedTestId,
                t.id AS incId, t.name AS incName, t.slug AS incSlug
         FROM HealthPackageTest h
         JOIN Test t ON t.id = h.includedTestId
         WHERE h.packageTestId = :testId`,
    { testId },
  )
  return rows.map((r) => ({
    id: r.id,
    packageTestId: r.packageTestId,
    includedTestId: r.includedTestId,
    includedTest: fullIncluded
      ? mapTestBase(r)
      : { id: r.incId, name: r.incName, slug: r.incSlug },
  }))
}

const withPricing = async (test, userId) => {
  const breakdown = await pricing.calculateForTest(test, userId)
  return {
    ...test,
    price: test.price,
    discountPercent: test.discountPercent,
    discountedPrice: breakdown.cardPrice,
    memberPrice: breakdown.cardPrice,
    priceAfterPaymentDiscount: breakdown.membershipApplied
      ? breakdown.finalPrice
      : breakdown.originalPrice,
    membershipDiscountApplied: breakdown.membershipDiscount,
    paymentDiscountAmount: breakdown.paymentDiscountAmount,
    membershipApplied: breakdown.membershipApplied,
    flatDiscountPercent: breakdown.flatDiscountPercent,
    isFreeForMember: breakdown.isFreeForMember,
  }
}

export const categories = async () => {
  const rows = await query(
    `SELECT * FROM TestCategory
     WHERE isActive = 1 AND deletedAt IS NULL
     ORDER BY name ASC`,
  )
  return rows.map((r) => ({
    ...r,
    isActive: bool(r.isActive),
  }))
}

export const list = async (filters, userId) => {
  const clauses = ['t.isActive = 1', 't.deletedAt IS NULL']
  const params = {}
  if (filters.search) {
    clauses.push('(t.name LIKE :search OR t.shortDescription LIKE :search)')
    params.search = `%${filters.search}%`
  }
  if (filters.category) {
    clauses.push('c.slug = :category')
    params.category = filters.category
  }
  if (filters.popular === 'true') {
    clauses.push('t.isPopular = 1 AND t.isPackage = 0')
  }
  if (filters.membership === 'true') {
    clauses.push('(t.membershipEligible = 1 OR t.membershipFree = 1)')
  }
  if (filters.packages === 'true') {
    clauses.push('t.isPackage = 1')
  }
  if (filters.minPrice) {
    clauses.push('t.price >= :minPrice')
    params.minPrice = filters.minPrice
  }
  if (filters.maxPrice) {
    clauses.push('t.price <= :maxPrice')
    params.maxPrice = filters.maxPrice
  }
  const orderBy =
    filters.sort === 'price_asc'
      ? 't.price ASC'
      : filters.sort === 'price_desc'
        ? 't.price DESC'
        : 't.isPopular DESC'
  const rows = await query(
    `SELECT t.*,
            c.id AS catId, c.name AS catName, c.slug AS catSlug,
            c.description AS catDescription, c.isActive AS catIsActive,
            c.createdAt AS catCreatedAt, c.updatedAt AS catUpdatedAt, c.deletedAt AS catDeletedAt
     FROM Test t
     JOIN TestCategory c ON c.id = t.categoryId
     WHERE ${clauses.join(' AND ')}
     ORDER BY ${orderBy}`,
    params,
  )
  return Promise.all(
    rows.map(async (row) => {
      const base = mapTestBase(row)
      const parameters = await loadParameters(base.id)
      const packageTests = await loadPackageTests(base.id, false)
      return withPricing(
        {
          ...base,
          category: mapCategory(row),
          parameters,
          packageTests,
        },
        userId,
      )
    }),
  )
}

export const get = async (idOrSlug, userId) => {
  const row = await queryOne(
    `SELECT t.*,
            c.id AS catId, c.name AS catName, c.slug AS catSlug,
            c.description AS catDescription, c.isActive AS catIsActive,
            c.createdAt AS catCreatedAt, c.updatedAt AS catUpdatedAt, c.deletedAt AS catDeletedAt
     FROM Test t
     JOIN TestCategory c ON c.id = t.categoryId
     WHERE t.isActive = 1 AND t.deletedAt IS NULL
       AND (t.id = :idOrSlug OR t.slug = :idOrSlug)
     LIMIT 1`,
    { idOrSlug },
  )
  if (!row) throw notFound('Test not found', 'TEST_NOT_FOUND')
  const base = mapTestBase(row)
  const parameters = await loadParameters(base.id)
  const packageTests = await loadPackageTests(base.id, true)
  return withPricing(
    {
      ...base,
      category: mapCategory(row),
      parameters,
      packageTests,
    },
    userId,
  )
}

export const searchSuggestions = async (q) => {
  if (!q || q.length < 2) return []
  const rows = await query(
    `SELECT id, name, slug, price FROM Test
     WHERE isActive = 1 AND deletedAt IS NULL AND name LIKE :q
     LIMIT 8`,
    { q: `%${q}%` },
  )
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: num(r.price),
  }))
}
