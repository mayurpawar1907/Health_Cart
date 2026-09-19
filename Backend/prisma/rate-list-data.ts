export type RateListEntry = {
  sr: number;
  name: string;
  mrp: number;
  specialPrice: number;
  category: string;
  sampleType?: string;
  reportHours?: number;
  isPopular?: boolean;
};

export const RATE_LIST_CATEGORIES = [
  { name: 'Blood Tests', description: 'Hematology, proteins and general blood panels' },
  { name: 'Diabetes', description: 'Glucose, HbA1c and insulin assays' },
  { name: 'Thyroid', description: 'Thyroid hormones and profiles' },
  { name: 'Liver', description: 'Liver enzymes and hepatic panels' },
  { name: 'Kidney', description: 'Renal function, urine and electrolytes' },
  { name: 'Heart', description: 'Lipids, cardiac enzymes and risk markers' },
  { name: 'Vitamins', description: 'Vitamin and iron studies' },
  { name: 'Hormones', description: 'Reproductive and endocrine hormones' },
  { name: 'Infection', description: 'Infectious disease screening' },
  { name: 'Pregnancy', description: 'Prenatal screening markers' },
  { name: 'Cancer Markers', description: 'Tumour marker assays' },
  { name: 'Microbiology', description: 'Culture and sensitivity panels' },
  { name: 'Full Body Packages', description: 'Curated health checkup packages at bundled member rates' },
] as const;

/** Official HealthID Card blood test rate list — MRP vs special partner price. */
export const RATE_LIST: RateListEntry[] = [
  { sr: 1, name: 'Complete Blood Count (CBC) - 3 Part', mrp: 350, specialPrice: 150, category: 'Blood Tests', isPopular: true },
  { sr: 2, name: 'ESR', mrp: 250, specialPrice: 120, category: 'Blood Tests' },
  { sr: 3, name: 'Calcium', mrp: 300, specialPrice: 100, category: 'Blood Tests' },
  { sr: 4, name: 'CPK-MB', mrp: 900, specialPrice: 400, category: 'Heart' },
  { sr: 5, name: 'CPK-Total', mrp: 1100, specialPrice: 500, category: 'Heart' },
  { sr: 6, name: 'Creatinine', mrp: 250, specialPrice: 150, category: 'Kidney' },
  { sr: 7, name: 'CRP (Quantitative)', mrp: 700, specialPrice: 400, category: 'Blood Tests' },
  { sr: 8, name: 'Cholesterol', mrp: 220, specialPrice: 150, category: 'Heart' },
  { sr: 9, name: 'SGOT', mrp: 300, specialPrice: 150, category: 'Liver' },
  { sr: 10, name: 'SGPT', mrp: 300, specialPrice: 150, category: 'Liver' },
  { sr: 11, name: 'Bilirubin', mrp: 300, specialPrice: 150, category: 'Liver' },
  { sr: 12, name: 'Blood Sugar (F & PP)', mrp: 200, specialPrice: 100, category: 'Diabetes', isPopular: true },
  { sr: 13, name: 'Blood Sugar (R / F / PP)', mrp: 200, specialPrice: 100, category: 'Diabetes' },
  { sr: 14, name: 'Blood Urea', mrp: 300, specialPrice: 150, category: 'Kidney' },
  { sr: 15, name: 'Rheumatoid Factor, RA (Quantitative)', mrp: 900, specialPrice: 550, category: 'Blood Tests' },
  { sr: 16, name: 'Uric Acid', mrp: 300, specialPrice: 150, category: 'Kidney' },
  { sr: 17, name: 'Amylase', mrp: 650, specialPrice: 400, category: 'Liver' },
  { sr: 18, name: 'Lipase', mrp: 650, specialPrice: 400, category: 'Liver' },
  { sr: 19, name: 'LDH', mrp: 700, specialPrice: 450, category: 'Blood Tests' },
  { sr: 20, name: 'Serum Proteins', mrp: 350, specialPrice: 200, category: 'Blood Tests' },
  { sr: 21, name: 'Malarial Parasite Identification (MP)', mrp: 400, specialPrice: 150, category: 'Infection' },
  { sr: 22, name: 'Urine Routine', mrp: 300, specialPrice: 80, category: 'Kidney', sampleType: 'Urine', isPopular: true },
  { sr: 23, name: 'VDRL', mrp: 600, specialPrice: 400, category: 'Infection' },
  { sr: 24, name: 'Thyroid Profile (T3, T4, TSH)', mrp: 700, specialPrice: 399, category: 'Thyroid', isPopular: true },
  { sr: 25, name: 'Free Thyroid Profile - FT3, FT4, TSH', mrp: 1000, specialPrice: 499, category: 'Thyroid' },
  { sr: 26, name: '25 Hydroxy Vitamin D3', mrp: 1400, specialPrice: 800, category: 'Vitamins', isPopular: true },
  { sr: 27, name: 'Vitamin B12', mrp: 1000, specialPrice: 550, category: 'Vitamins', isPopular: true },
  { sr: 28, name: '25 Hydroxy Vitamin D3 + Vitamin B12', mrp: 2000, specialPrice: 1400, category: 'Vitamins' },
  { sr: 29, name: 'TSH (Thyroid Stimulating Hormone)', mrp: 300, specialPrice: 150, category: 'Thyroid' },
  { sr: 30, name: 'FSH (Follicle Stimulating Hormone)', mrp: 600, specialPrice: 300, category: 'Hormones' },
  { sr: 31, name: 'LH (Leutinizing Hormone)', mrp: 600, specialPrice: 300, category: 'Hormones' },
  { sr: 32, name: 'Prolactin (PRL)', mrp: 600, specialPrice: 300, category: 'Hormones' },
  { sr: 33, name: 'FSH, LH, Prolactin', mrp: 1600, specialPrice: 999, category: 'Hormones' },
  { sr: 34, name: 'Anti Mullerian Hormone (AMH)', mrp: 2400, specialPrice: 1400, category: 'Hormones' },
  { sr: 35, name: 'Beta Human Chorionic Gonadotropin - Serum (BHCG)', mrp: 800, specialPrice: 499, category: 'Hormones' },
  { sr: 36, name: 'Glycated Hemoglobin (HbA1c) : HPLC', mrp: 800, specialPrice: 399, category: 'Diabetes', isPopular: true },
  { sr: 37, name: 'Insulin - Fasting', mrp: 800, specialPrice: 400, category: 'Diabetes' },
  { sr: 38, name: 'Insulin Post Prandial (PP)', mrp: 800, specialPrice: 400, category: 'Diabetes' },
  { sr: 39, name: 'Anti Cyclic Citrullinated Peptide : ANTICCP', mrp: 1400, specialPrice: 900, category: 'Blood Tests' },
  { sr: 40, name: 'Homocysteine - Serum', mrp: 1500, specialPrice: 950, category: 'Heart' },
  { sr: 41, name: 'Progesterone - Serum', mrp: 700, specialPrice: 550, category: 'Hormones' },
  { sr: 42, name: 'Prostate Specific Antigen (PSA) Total', mrp: 700, specialPrice: 400, category: 'Hormones' },
  { sr: 43, name: 'Electrolyte Profile - Na, K, Cl', mrp: 600, specialPrice: 350, category: 'Kidney' },
  { sr: 44, name: 'Lipid Profile', mrp: 700, specialPrice: 399, category: 'Heart', isPopular: true },
  { sr: 45, name: 'Iron Profile (Iron, TIBC, Transferrin, Iron Saturation)', mrp: 900, specialPrice: 499, category: 'Vitamins' },
  { sr: 46, name: 'Kidney Profile (Urea, Creatinine, Uric Acid, BUN)', mrp: 700, specialPrice: 399, category: 'Kidney', isPopular: true },
  { sr: 47, name: 'Kidney Profile Max (Urea, Creatinine, Uric Acid, BUN, Na, K, Cl)', mrp: 900, specialPrice: 499, category: 'Kidney' },
  { sr: 48, name: 'Liver Profile', mrp: 1400, specialPrice: 599, category: 'Liver', isPopular: true },
  { sr: 49, name: 'Total IgE', mrp: 1000, specialPrice: 550, category: 'Blood Tests' },
  { sr: 50, name: 'Hemoglobin Variant Estimation by Hemoglobin Electrophoresis', mrp: 1600, specialPrice: 900, category: 'Blood Tests' },
  { sr: 51, name: 'Ferritin', mrp: 900, specialPrice: 600, category: 'Vitamins' },
  { sr: 52, name: 'Double Marker - Free Beta HCG, PAPPA', mrp: 2600, specialPrice: 1100, category: 'Pregnancy' },
  { sr: 53, name: 'Triple Marker BetaHCG, AFP, E3', mrp: 3000, specialPrice: 1300, category: 'Pregnancy' },
  { sr: 54, name: 'Quadruple Marker (AFP, B-hCG, UE3 & Inhibin A)', mrp: 3200, specialPrice: 1500, category: 'Pregnancy' },
  { sr: 55, name: 'CA125 - Ovarian Cancer Marker', mrp: 1400, specialPrice: 899, category: 'Cancer Markers' },
  { sr: 56, name: 'CA15.3 - Breast Cancer Marker', mrp: 1200, specialPrice: 899, category: 'Cancer Markers' },
  { sr: 57, name: 'CA19.9 - Pancreatic Cancer Marker', mrp: 1400, specialPrice: 999, category: 'Cancer Markers' },
  { sr: 58, name: 'Culture & Sensitivity - Urine', mrp: 1200, specialPrice: 499, category: 'Microbiology', sampleType: 'Urine', reportHours: 72 },
  { sr: 59, name: 'Culture & Sensitivity - Blood', mrp: 1200, specialPrice: 499, category: 'Microbiology', sampleType: 'Blood', reportHours: 72 },
  { sr: 60, name: 'Culture & Sensitivity - Pus', mrp: 1200, specialPrice: 499, category: 'Microbiology', sampleType: 'Pus', reportHours: 72 },
  { sr: 61, name: 'Culture & Sensitivity - Stool', mrp: 1200, specialPrice: 499, category: 'Microbiology', sampleType: 'Stool', reportHours: 72 },
  { sr: 62, name: 'Culture & Sensitivity - Fungal', mrp: 1400, specialPrice: 599, category: 'Microbiology', reportHours: 72 },
  { sr: 63, name: 'Culture & Sensitivity - Sputum', mrp: 1200, specialPrice: 499, category: 'Microbiology', sampleType: 'Sputum', reportHours: 72 },
];

export function discountPercentFromRate(mrp: number, specialPrice: number) {
  if (mrp <= 0) return 0;
  return Math.round((1 - specialPrice / mrp) * 10000) / 100;
}

export function savingsPercent(mrp: number, specialPrice: number) {
  if (mrp <= 0) return 0;
  return Math.round((1 - specialPrice / mrp) * 100);
}
