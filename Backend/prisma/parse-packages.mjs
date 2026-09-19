import fs from 'fs';

const raw = fs.readFileSync('C:/Users/Admin/Downloads/package.txt', 'utf8');
const lines = raw.split(/\r?\n/).map((l) => l.trim());

const priceRe = /Special Rate:\s*₹\s*([\d,]+)\s*\/?-?\s*\|\s*MRP:\s*₹\s*([\d,\s]+)/i;

function nameBeforePrice(priceIdx) {
  for (let j = priceIdx - 1; j >= 0; j--) {
    if (lines[j] && lines[j] !== 'Included Tests:') return { name: lines[j], nameIdx: j };
  }
  return { name: `Package ${priceIdx}`, nameIdx: priceIdx - 1 };
}

const priceIndices = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(priceRe)) priceIndices.push(i);
}

const pkgs = [];
for (let pi = 0; pi < priceIndices.length; pi++) {
  const priceIdx = priceIndices[pi];
  const m = lines[priceIdx].match(priceRe);
  const specialPrice = +m[1].replace(/,/g, '');
  const mrp = +m[2].replace(/[\s,]/g, '');
  const { name, nameIdx } = nameBeforePrice(priceIdx);

  const nextPriceIdx = pi + 1 < priceIndices.length ? priceIndices[pi + 1] : lines.length;
  const nextName = pi + 1 < priceIndices.length ? nameBeforePrice(priceIndices[pi + 1]) : null;

  const includedTests = [];
  for (let j = priceIdx + 1; j < nextPriceIdx; j++) {
    const t = lines[j];
    if (!t || t === 'Included Tests:') continue;
    if (nextName && j === nextName.nameIdx) break;
    includedTests.push(t);
  }

  pkgs.push({ name, specialPrice, mrp, includedTests });
}

fs.writeFileSync('parsed-packages.json', JSON.stringify(pkgs, null, 2));
console.error('Parsed', pkgs.length, 'packages');
pkgs.forEach((p) => console.log(`${p.name} | ₹${p.specialPrice} / ₹${p.mrp} | ${p.includedTests.length} tests`));
