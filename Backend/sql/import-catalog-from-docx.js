/**
 * Import HealthID diagnostic packages from the Word brief into MySQL.
 * Reads the .docx directly — no static JSON/catalog file in the repo.
 *
 * Usage:
 *   node sql/import-catalog-from-docx.js
 *   node sql/import-catalog-from-docx.js "C:\path\to\HealthIDCard Brief & Packages.docx"
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { closePool, execute, query, queryOne } from '../src/config/database.js'
import { id } from '../src/utils/id.js'

const DEFAULT_DOCX =
  process.env.HEALTHID_CATALOG_DOCX ??
  'C:\\Users\\Admin\\Downloads\\HealthIDCard Brief & Packages (1).docx'

const CATEGORIES = [
  { slug: 'full-body-checkup', name: 'Full Body Checkup', description: 'Comprehensive health screening packages' },
  { slug: 'diabetes', name: 'Diabetes', description: 'Diabetes and metabolic panels' },
  { slug: 'heart', name: 'Heart', description: 'Cardiac care and lipid profiles' },
  { slug: 'cancer-markers', name: 'Cancer Markers', description: 'Tumour marker screening panels' },
  { slug: 'thyroid', name: 'Thyroid', description: 'Thyroid function tests' },
  { slug: 'pregnancy', name: 'Pregnancy & Fertility', description: 'Antenatal, fertility and women care panels' },
  { slug: 'hormones', name: 'Hormone', description: 'Hormonal and endocrine panels' },
  { slug: 'joints', name: 'Joints & Bone', description: 'Arthritis, bone and joint health' },
  { slug: 'liver', name: 'Liver', description: 'Liver and hepatitis panels' },
  { slug: 'vitamins', name: 'Vitamins', description: 'Vitamin deficiency panels' },
  { slug: 'general-health', name: 'General Health', description: 'Specialty screening panels' },
  { slug: 'blood-tests', name: 'Blood Tests', description: 'Individual lab tests' },
]

const POPULAR_PACKAGES = new Set([
  'FULL BODY BASIC',
  'FULL BODY CHECK-UP ADVANCE',
  'DIABETIC PANEL',
  'CARDIAC CARE PROFILE',
  'WOMEN CARE',
  'FITNESS CARE',
  'WELLNESS PLUS',
])

const POPULAR_STANDALONE = [
  { name: 'Complete Blood Count (CBC)', mrp: 350, special: 280, category: 'blood-tests' },
  { name: 'Lipid Profile', mrp: 800, special: 640, category: 'heart' },
  { name: 'Thyroid Profile -3 (T3 T4 TSH)', mrp: 550, special: 440, category: 'thyroid' },
  { name: 'Glycated Haemoglobin (HbA1c)', mrp: 450, special: 360, category: 'diabetes' },
  { name: 'Liver Function Tests', mrp: 700, special: 560, category: 'liver' },
  { name: 'Kidney Profile', mrp: 650, special: 520, category: 'general-health' },
  { name: 'Vitamin B12', mrp: 900, special: 720, category: 'vitamins' },
  { name: '25 OH VITAMIN D 3 TOTAL', mrp: 1200, special: 960, category: 'vitamins' },
  { name: 'Glucose F (Blood Sugar Fasting)', mrp: 120, special: 96, category: 'diabetes' },
  { name: 'Iron Profile', mrp: 1100, special: 880, category: 'blood-tests' },
  { name: 'C Reactive Protein (CRP) Quantitative', mrp: 500, special: 400, category: 'blood-tests' },
  { name: 'Urine Routine Manual', mrp: 150, special: 120, category: 'blood-tests' },
]

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 200)
}

function uniqueSlug(base, used) {
  let slug = slugify(base)
  if (!used.has(slug)) {
    used.add(slug)
    return slug
  }
  let i = 2
  while (used.has(`${slug}-${i}`)) i += 1
  const next = `${slug}-${i}`
  used.add(next)
  return next
}

function parsePrice(text) {
  const nums = [...text.replace(/,/g, '').matchAll(/₹\s*([\d.]+)/g)].map((m) => Number(m[1]))
  return nums
}

function extractDocxText(docxPath) {
  const py = `
import sys, zipfile, xml.etree.ElementTree as ET
sys.stdout.reconfigure(encoding='utf-8')
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
root=ET.fromstring(zipfile.ZipFile(sys.argv[1]).read('word/document.xml'))
for p in root.iter(W+'p'):
    parts=[]
    for t in p.iter(W+'t'):
        if t.text: parts.append(t.text)
        if t.tail: parts.append(t.tail)
    if parts:
        print(''.join(parts))
`
  return execFileSync('python', ['-c', py, docxPath], {
    encoding: 'utf-8',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  })
}

function parsePackages(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const start = lines.findIndex((l) => l.toUpperCase() === 'OUR DIAGNOSTIC PACKAGES')
  const end = lines.findIndex((l) => l.toUpperCase().startsWith('ADVANTAGES OF SERVICE'))
  const slice = start >= 0 ? lines.slice(start + 1, end > start ? end : undefined) : lines

  const packages = []

  for (let i = 0; i < slice.length; i++) {
    if (!/Special Rate:/i.test(slice[i])) continue

    const prices = parsePrice(slice[i])
    if (prices.length < 2) continue

    let nameIdx = i - 1
    while (nameIdx >= 0 && (/^Included Tests/i.test(slice[nameIdx]) || slice[nameIdx].includes('₹'))) {
      nameIdx -= 1
    }
    const name = slice[nameIdx]
    if (!name || name.toUpperCase() === 'OUR DIAGNOSTIC PACKAGES') continue

    const tests = []
    let k = i + 1
    if (k < slice.length && /^Included Tests/i.test(slice[k])) k += 1

    while (k < slice.length && !/Special Rate:/i.test(slice[k])) {
      if (k + 1 < slice.length && /Special Rate:/i.test(slice[k + 1])) break
      tests.push(slice[k])
      k += 1
    }

    packages.push({
      name: name.replace(/\s+/g, ' ').trim(),
      special: prices[0],
      mrp: prices[1],
      tests,
    })
  }

  return packages.filter((p) => p.name && p.special && p.mrp && p.tests.length)
}

function assignCategorySlug(packageName) {
  const n = packageName.toLowerCase()
  if (/diabetic|diabetes|homa|insulin fasting|pcod|glucose/.test(n)) return 'diabetes'
  if (/infertility|pregnancy|anc profile|obstetric|women care|female|male infertility/.test(n)) return 'pregnancy'
  if (/cardiac|heart/.test(n)) return 'heart'
  if (/cancer/.test(n)) return 'cancer-markers'
  if (/thyroid|thalassemia/.test(n)) return 'thyroid'
  if (/arthritis|bone profile|hla-b27|joint/.test(n)) return 'joints'
  if (/hepatitis|liver/.test(n)) return 'liver'
  if (/vitamin|b complex/.test(n)) return 'vitamins'
  if (/coagulation|pre surgery|hairfall|apl profile|hepatitis|bad obstetric/.test(n)) return 'general-health'
  if (/full body|wellness|fitness|women care/.test(n)) return 'full-body-checkup'
  return 'general-health'
}

function discountPercent(mrp, special) {
  if (!mrp || mrp <= 0) return 0
  return Math.round((1 - special / mrp) * 10000) / 100
}

async function clearCatalog() {
  await execute('DELETE FROM HealthPackageTest')
  await execute('DELETE FROM TestParameter')
  await execute('DELETE FROM Test')
  await execute('DELETE FROM TestCategory')
}

async function upsertCategories() {
  const map = new Map()
  for (const cat of CATEGORIES) {
    const catId = id()
    await execute(
      `INSERT INTO TestCategory (id, name, slug, description, isActive)
       VALUES (:id, :name, :slug, :description, 1)`,
      { id: catId, name: cat.name, slug: cat.slug, description: cat.description },
    )
    map.set(cat.slug, catId)
  }
  return map
}

async function insertPackage(pkg, categoryMap, usedSlugs) {
  const catSlug = assignCategorySlug(pkg.name)
  const categoryId = categoryMap.get(catSlug) ?? categoryMap.get('general-health')
  const slug = uniqueSlug(pkg.name, usedSlugs)
  const testId = id()
  const disc = discountPercent(pkg.mrp, pkg.special)
  const paramCount = pkg.tests.length
  const shortDescription = `${paramCount} tests included · Home sample collection`
  const description = `${pkg.name} includes ${paramCount} diagnostic tests. Special member rate ₹${pkg.special} (MRP ₹${pkg.mrp}).`
  const isPopular = POPULAR_PACKAGES.has(pkg.name.toUpperCase()) ? 1 : 0

  await execute(
    `INSERT INTO Test
      (id, categoryId, name, slug, shortDescription, description, preparation, sampleType,
       reportHours, price, discountPercent, membershipEligible, membershipFree, isPopular, isPackage, isActive)
     VALUES
      (:id, :categoryId, :name, :slug, :shortDescription, :description, :preparation, :sampleType,
       24, :price, :discountPercent, 1, 0, :isPopular, 1, 1)`,
    {
      id: testId,
      categoryId,
      name: pkg.name,
      slug,
      shortDescription,
      description,
      preparation: 'Follow package instructions; fasting may be required for select markers.',
      sampleType: 'Blood / Urine',
      price: pkg.mrp,
      discountPercent: disc,
      isPopular,
    },
  )

  for (const paramName of pkg.tests) {
    await execute(
      `INSERT INTO TestParameter (id, testId, name, unit) VALUES (:id, :testId, :name, NULL)`,
      { id: id(), testId, name: paramName },
    )
  }

  return testId
}

async function insertStandaloneTests(categoryMap, usedSlugs) {
  for (const t of POPULAR_STANDALONE) {
    const categoryId = categoryMap.get(t.category) ?? categoryMap.get('blood-tests')
    const slug = uniqueSlug(t.name, usedSlugs)
    const disc = discountPercent(t.mrp, t.special)
    await execute(
      `INSERT INTO Test
        (id, categoryId, name, slug, shortDescription, description, preparation, sampleType,
         reportHours, price, discountPercent, membershipEligible, isPopular, isPackage, isActive)
       VALUES
        (:id, :categoryId, :name, :slug, :shortDescription, :description, :preparation, :sampleType,
         24, :price, :discountPercent, 1, 1, 0, 1)`,
      {
        id: id(),
        categoryId,
        name: t.name,
        slug,
        shortDescription: 'Popular individual lab test',
        description: `${t.name} — book with free home collection for HealthID Card members.`,
        preparation: 'Non-fasting unless advised',
        sampleType: 'Blood',
        price: t.mrp,
        discountPercent: disc,
      },
    )
  }
}

async function main() {
  const docxPath = process.argv[2] ?? DEFAULT_DOCX
  if (!existsSync(docxPath)) {
    throw new Error(`Docx not found: ${docxPath}`)
  }

  console.log(`Reading ${docxPath}…`)
  const text = extractDocxText(docxPath)
  const packages = parsePackages(text)
  if (!packages.length) {
    throw new Error('No packages parsed from document')
  }

  console.log(`Parsed ${packages.length} packages — importing to MySQL…`)
  await clearCatalog()
  const categoryMap = await upsertCategories()
  const usedSlugs = new Set()

  for (const pkg of packages) {
    await insertPackage(pkg, categoryMap, usedSlugs)
    console.log(`  + ${pkg.name} (${pkg.tests.length} tests, MRP ₹${pkg.mrp}, special ₹${pkg.special})`)
  }

  await insertStandaloneTests(categoryMap, usedSlugs)
  console.log(`  + ${POPULAR_STANDALONE.length} popular individual tests`)

  const counts = await queryOne(
    `SELECT
       SUM(isPackage = 1) AS packages,
       SUM(isPackage = 0) AS tests
     FROM Test WHERE deletedAt IS NULL`,
  )
  console.log(`Import complete: ${counts.packages} packages, ${counts.tests} individual tests in database.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await closePool()
  })
