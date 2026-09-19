/** Use API package fields only — no static brochure fallback. */
export function packageIncludedTests(test) {
  return test.parameters?.map((p) => p.name).filter(Boolean) ?? []
}

export function enrichPackage(test) {
  const includedTestNames = packageIncludedTests(test)
  return {
    ...test,
    includedTestNames,
    brochureMrp: Number(test.price),
    brochureSpecialPrice: Number(test.discountedPrice ?? test.memberPrice ?? test.price),
  }
}

export function enrichPackages(tests) {
  return tests.filter((t) => t.isPackage).map(enrichPackage)
}
