import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('parsed-packages.json', 'utf8'));

const POPULAR = new Set([
  'FULL BODY BASIC',
  'FULL BODY CHECK-UP ADVANCE',
  'WOMEN CARE',
  'DIABETIC PANEL',
  'CARDIAC CARE PROFILE',
  'PCOD MINI',
]);

const FOOTER = [
  'ADVANTAGES OF SERVICE WITH US',
  'Free Home Sample Collection',
  'NABL Accredited Reports',
  'CONTACT & LOCATION',
];

function cleanTests(tests) {
  const idx = tests.findIndex((t) => FOOTER.some((f) => t.startsWith(f) || t.includes('ADVANTAGES OF SERVICE')));
  return idx >= 0 ? tests.slice(0, idx) : tests;
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function describe(name, count) {
  const n = name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return `${n} — ${count} parameters bundled at HealthID Card special rate with free home collection.`;
}

const packages = raw.map((p) => {
  const includedTests = cleanTests(p.includedTests);
  return {
    name: p.name,
    shortDescription: describe(p.name, includedTests.length),
    description: `${describe(p.name, includedTests.length)} Processed at NABL partner labs with digital reports on WhatsApp.`,
    preparation: 'Follow fasting instructions as advised for included parameters. Phlebotomist will confirm at collection.',
    includedTests,
    mrp: p.mrp,
    specialPrice: p.specialPrice,
    isPopular: POPULAR.has(p.name),
  };
});

const lines = [
  '/** Official HealthID Card diagnostic packages from the partner brochure (29 packages). */',
  'export type HealthPackageDef = {',
  '  name: string;',
  '  shortDescription: string;',
  '  description: string;',
  '  preparation: string;',
  '  includedTests: string[];',
  '  mrp: number;',
  '  specialPrice: number;',
  '  isPopular?: boolean;',
  '  reportHours?: number;',
  '  sampleType?: string;',
  '};',
  '',
  'export const HEALTH_PACKAGES: HealthPackageDef[] = [',
];

for (const pkg of packages) {
  lines.push('  {');
  lines.push(`    name: '${esc(pkg.name)}',`);
  lines.push(`    shortDescription: '${esc(pkg.shortDescription)}',`);
  lines.push(`    description: '${esc(pkg.description)}',`);
  lines.push(`    preparation: '${esc(pkg.preparation)}',`);
  lines.push('    includedTests: [');
  for (const t of pkg.includedTests) lines.push(`      '${esc(t)}',`);
  lines.push('    ],');
  lines.push(`    mrp: ${pkg.mrp},`);
  lines.push(`    specialPrice: ${pkg.specialPrice},`);
  if (pkg.isPopular) lines.push('    isPopular: true,');
  lines.push('  },');
}

lines.push('];');
lines.push('');

const out = lines.join('\n');
fs.writeFileSync('packages-data.ts', out);
fs.writeFileSync('../../Frontend/src/data/packages-data.ts', out.replace(
  '/** Official HealthID Card diagnostic packages from the partner brochure (29 packages). */',
  '/** Mirror of Backend/prisma/packages-data.ts — official 29 diagnostic packages. */',
).replace(/;\n/g, '\n').replace(/export type/g, 'export type').replace(/: HealthPackageDef\[\]/, ': HealthPackageDef[]'));

// Frontend uses no semicolons in some places - check existing style
const frontend = out
  .replace(
    '/** Official HealthID Card diagnostic packages from the partner brochure (29 packages). */',
    '/** Mirror of Backend/prisma/packages-data.ts — official 29 diagnostic packages. */',
  )
  .replace(/;\n/g, '\n')
  .replace(/export const HEALTH_PACKAGES: HealthPackageDef\[\] = \[/, 'export const HEALTH_PACKAGES: HealthPackageDef[] = [')
  .replace(/export type HealthPackageDef = \{[\s\S]*?\};/, `export type HealthPackageDef = {
  name: string
  shortDescription: string
  description: string
  preparation: string
  includedTests: string[]
  mrp: number
  specialPrice: number
  isPopular?: boolean
  reportHours?: number
  sampleType?: string
}`);

fs.writeFileSync('../../Frontend/src/data/packages-data.ts', frontend);
console.log('Generated', packages.length, 'packages');
