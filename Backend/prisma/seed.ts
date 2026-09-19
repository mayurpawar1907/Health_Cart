import { PrismaClient, Gender, Role, AppointmentStatus, ReportStatus, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RATE_LIST, RATE_LIST_CATEGORIES, discountPercentFromRate } from './rate-list-data';
import { HEALTH_PACKAGES } from './packages-data';

const prisma = new PrismaClient();

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  await prisma.paymentTransaction.deleteMany();
  await prisma.platformSettings.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.whatsAppMessage.deleteMany();
  await prisma.testReminder.deleteMany();
  await prisma.membershipMember.deleteMany();
  await prisma.membershipUsage.deleteMany();
  await prisma.membershipBenefit.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.testReport.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.healthPackageTest.deleteMany();
  await prisma.testParameter.deleteMany();
  await prisma.test.deleteMany();
  await prisma.testCategory.deleteMany();
  await prisma.address.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  const catMap: Record<string, string> = {};
  for (const c of RATE_LIST_CATEGORIES) {
    const created = await prisma.testCategory.create({
      data: { name: c.name, slug: slugify(c.name), description: c.description },
    });
    catMap[c.name] = created.id;
  }

  const testIds: Record<string, string> = {};
  for (const item of RATE_LIST) {
    const discountPercent = discountPercentFromRate(item.mrp, item.specialPrice);
    const created = await prisma.test.create({
      data: {
        categoryId: catMap[item.category],
        name: item.name,
        slug: slugify(item.name),
        shortDescription: `${item.name} — NABL partner lab with home collection available.`,
        description: `${item.name} is processed at accredited partner laboratories. Book home sample collection and receive digital reports in-app and on WhatsApp.`,
        preparation: item.category === 'Diabetes'
          ? 'Fasting may be required for select parameters. Follow phlebotomist guidance.'
          : 'Standard preparation unless otherwise advised by your doctor.',
        sampleType: item.sampleType ?? (item.category === 'Microbiology' ? 'Specimen' : 'Blood'),
        reportHours: item.reportHours ?? 24,
        price: item.mrp,
        discountPercent,
        membershipDiscountPct: 0,
        membershipEligible: true,
        membershipFree: item.name === 'Complete Blood Count (CBC) - 3 Part' || item.name === 'TSH (Thyroid Stimulating Hormone)',
        isPopular: Boolean(item.isPopular),
        isPackage: false,
        faqs: [
          { q: 'What is the MRP?', a: `MRP is ₹${item.mrp}. HealthID Card members pay ₹${item.specialPrice}.` },
          { q: 'When will I get the report?', a: `Reports are typically available within ${item.reportHours ?? 24} hours.` },
          { q: 'Is home collection available?', a: 'Yes. Free home sample collection is available for HealthID Card members in supported cities.' },
        ],
        parameters: { create: [{ name: item.name.split('(')[0].trim() }] },
      },
    });
    testIds[item.name] = created.id;
  }

  const packageCategoryId = catMap['Full Body Packages'];
  for (const pkg of HEALTH_PACKAGES) {
    const discountPercent = discountPercentFromRate(pkg.mrp, pkg.specialPrice);

    const created = await prisma.test.create({
      data: {
        categoryId: packageCategoryId,
        name: pkg.name,
        slug: slugify(pkg.name),
        shortDescription: pkg.shortDescription,
        description: pkg.description,
        preparation: pkg.preparation,
        sampleType: pkg.sampleType ?? 'Blood / Urine',
        reportHours: pkg.reportHours ?? 48,
        price: pkg.mrp,
        discountPercent,
        membershipDiscountPct: 0,
        membershipEligible: true,
        membershipFree: false,
        isPopular: Boolean(pkg.isPopular),
        isPackage: true,
        faqs: [
          { q: 'What is included?', a: `${pkg.includedTests.length} parameters: ${pkg.includedTests.join(', ')}.` },
          { q: 'What is the package MRP?', a: `MRP is ₹${pkg.mrp}. HealthID Card members pay ₹${pkg.specialPrice}.` },
          { q: 'Is home collection included?', a: 'Yes — one phlebotomist visit collects all samples for this package.' },
        ],
        parameters: { create: pkg.includedTests.map((name) => ({ name })) },
      },
    });
    testIds[pkg.name] = created.id;
  }

  const healthIdPlan = await prisma.membershipPlan.create({
    data: {
      name: 'HealthID Card',
      slug: 'health-id-card',
      price: 0,
      durationDays: 365,
      isFree: true,
      flatDiscountPercent: 30,
      maxFamilyMembers: 5,
      description: 'One-time free family health card for 1 year. Exclusive lab rates on 63+ tests, 29 health packages, free home collection, WhatsApp updates & digital reports.',
      benefits: {
        create: [
          { title: 'Exclusive lab rates', description: 'Special partner pricing on 63+ blood tests — save up to 77% vs MRP.' },
          { title: 'Free home collection', description: 'Certified phlebotomist visits your doorstep at your chosen time.' },
          { title: 'Family coverage', description: 'Add up to 4 family members on one digital card.' },
          { title: 'WhatsApp updates', description: 'Booking confirmations, reminders, and reports on WhatsApp.' },
          { title: 'Digital reports vault', description: 'Lifetime access to reports in-app with secure download.' },
          { title: 'Member health packages', description: '29 official diagnostic packages — Full Body, Diabetic, Cardiac, PCOD, Cancer & more at special rates.' },
          { title: 'Free annual CBC', description: 'Complete Blood Count included once per year.', testId: testIds['Complete Blood Count (CBC) - 3 Part'], freeTest: true },
        ],
      },
    },
  });

  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const adminHash = await bcrypt.hash('Admin@1234', 12);

  const mayur = await prisma.user.create({
    data: {
      fullName: 'Mayur Pawar',
      email: 'mayur@healthcart.com',
      mobile: '9876543210',
      passwordHash,
      dateOfBirth: new Date('1999-04-12'),
      gender: Gender.MALE,
      referralCode: 'MAYUR9K2',
      profile: { create: { language: 'en', theme: 'system', whatsappOn: true } },
      wallet: {
        create: {
          balance: 250,
          referralBalance: 0,
          joiningBonusCredited: true,
          transactions: {
            create: {
              type: 'JOINING_BONUS',
              amount: 250,
              balanceAfter: 250,
              referralBalanceAfter: 0,
              description: '₹250 joining bonus — welcome to HealthID Card',
            },
          },
        },
      },
      addresses: {
        create: { line1: '12, Green Residency, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', label: 'Home' },
      },
    },
  });

  const spouse = await prisma.familyMember.create({
    data: { userId: mayur.id, name: 'Priya Pawar', relation: 'SPOUSE', age: 25, gender: Gender.FEMALE },
  });

  const superAdminHash = await bcrypt.hash('Super@1234', 12);

  await prisma.user.create({
    data: {
      fullName: 'HealthCart Admin',
      email: 'admin@healthcart.com',
      mobile: '9999999999',
      passwordHash: adminHash,
      role: Role.ADMIN,
      profile: { create: {} },
    },
  });

  await prisma.user.create({
    data: {
      fullName: 'Super Admin',
      email: 'superadmin@healthidcard.com',
      mobile: '9888888888',
      passwordHash: superAdminHash,
      role: Role.SUPER_ADMIN,
      profile: { create: {} },
    },
  });

  const startsAt = new Date();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await prisma.membership.create({
    data: {
      userId: mayur.id,
      planId: healthIdPlan.id,
      number: 'HIC-MAYUR009',
      startsAt,
      expiresAt,
      members: {
        create: [
          { name: 'Mayur Pawar', relation: 'Self', isPrimary: true },
          { name: 'Priya Pawar', relation: 'SPOUSE', familyMemberId: spouse.id },
        ],
      },
    },
  });

  const addr = await prisma.address.findFirst({ where: { userId: mayur.id } });
  const cbcId = testIds['Complete Blood Count (CBC) - 3 Part'];
  const vitDId = testIds['25 Hydroxy Vitamin D3'];

  const upcoming = await prisma.appointment.create({
    data: {
      code: 'HIC-24001821',
      userId: mayur.id,
      testId: cbcId,
      date: new Date(Date.now() + 86400000 * 3),
      timeSlot: '08:00 AM',
      status: AppointmentStatus.CONFIRMED,
      patientName: 'Mayur Pawar',
      patientAge: 26,
      collectionType: 'HOME',
      addressId: addr?.id,
      deliveryAddress: '12, Green Residency, Andheri West, Mumbai, Maharashtra - 400053',
      originalPrice: 350,
      membershipDiscount: 200,
      finalPrice: 150,
      cardDiscount: 200,
      payableAmount: 150,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      reminderEnabled: true,
    },
  });

  const completed = await prisma.appointment.create({
    data: {
      code: 'HIC-24001002',
      userId: mayur.id,
      testId: vitDId,
      date: new Date(Date.now() - 86400000 * 12),
      timeSlot: '09:30 AM',
      status: AppointmentStatus.COMPLETED,
      patientName: 'Mayur Pawar',
      patientAge: 26,
      collectionType: 'HOME',
      addressId: addr?.id,
      deliveryAddress: '12, Green Residency, Andheri West, Mumbai, Maharashtra - 400053',
      originalPrice: 1400,
      membershipDiscount: 600,
      finalPrice: 800,
      cardDiscount: 600,
      payableAmount: 800,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
    },
  });

  await prisma.testReport.createMany({
    data: [
      { userId: mayur.id, appointmentId: upcoming.id, status: ReportStatus.PENDING },
      {
        userId: mayur.id,
        appointmentId: completed.id,
        status: ReportStatus.AVAILABLE,
        summary: 'Vitamin D is in the insufficient range. Discuss supplementation with your clinician.',
        fileUrl: '/reports/demo-vitamin-d.txt',
        releasedAt: new Date(),
      },
    ],
  });

  await prisma.platformSettings.create({
    data: {
      id: 'default',
      paymentPromoPercent: 30,
      paymentPromoActive: true,
      paymentPromoApplyToAllUsers: true,
      promoLabel: 'Extra 30% off special price at payment',
    },
  });

  await prisma.notification.createMany({
    data: [
      { userId: mayur.id, type: NotificationType.APPOINTMENT_CONFIRMATION, title: 'Booking confirmed', body: 'CBC home collection booked for 08:00 AM. ID HIC-24001821.', isRead: false },
      { userId: mayur.id, type: NotificationType.REPORT_AVAILABLE, title: 'Report available', body: 'Your Vitamin D report is ready. Also sent on WhatsApp.', isRead: false },
      { userId: mayur.id, type: NotificationType.PROMOTIONAL, title: 'HealthID Card active', body: 'Your free 1-year card is active. Exclusive rates on 63+ tests + free home collection.', isRead: true },
    ],
  });

  await prisma.whatsAppMessage.createMany({
    data: [
      { userId: mayur.id, mobile: '9876543210', template: 'membership_activated', body: 'HealthID Card HIC-MAYUR009 activated. Special rates on all tests for 1 year.', status: 'SENT' },
      { userId: mayur.id, mobile: '9876543210', template: 'booking_confirmed', body: 'CBC booked with home collection at 08:00 AM.', status: 'SENT' },
    ],
  });

  console.log(`HealthID Card seed complete — ${RATE_LIST.length} tests + ${HEALTH_PACKAGES.length} packages from official rate list`);
  console.log('Demo user:   mayur@healthcart.com / Demo@1234');
  console.log('Admin user:  admin@healthcart.com / Admin@1234');
  console.log('Super admin: superadmin@healthidcard.com / Super@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
