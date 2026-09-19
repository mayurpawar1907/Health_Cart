import { HEALTH_PACKAGES, type HealthPackageDef } from '@/data/packages-data'
import type { LabTest } from '@/types'

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function findStaticPackage(test: Pick<LabTest, 'name' | 'slug'>): HealthPackageDef | undefined {
  return HEALTH_PACKAGES.find((p) => p.name === test.name || slugify(p.name) === test.slug)
}

export function packageIncludedTests(test: LabTest): string[] {
  const fromApi = test.parameters?.map((p) => p.name).filter(Boolean) ?? []
  if (fromApi.length) return fromApi
  return findStaticPackage(test)?.includedTests ?? []
}

export type EnrichedPackage = LabTest & {
  includedTestNames: string[]
  brochureMrp: number
  brochureSpecialPrice: number
}

/** Merge API package records with official brochure metadata (included tests, prices). */
export function enrichPackage(test: LabTest): EnrichedPackage {
  const staticPkg = findStaticPackage(test)
  const includedTestNames = packageIncludedTests(test)
  return {
    ...test,
    includedTestNames,
    brochureMrp: staticPkg?.mrp ?? Number(test.price),
    brochureSpecialPrice: staticPkg?.specialPrice ?? Number(test.discountedPrice ?? test.price),
  }
}

export function enrichPackages(tests: LabTest[]): EnrichedPackage[] {
  return tests.filter((t) => t.isPackage).map(enrichPackage)
}
