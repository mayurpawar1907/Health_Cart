import { createReadStream, existsSync } from 'node:fs';
import { bool, num, parseJson, query, queryOne } from '../config/database.js';
import { notFound } from "../utils/errors.js";
import { resolveAbsolute } from "./storage.service.js";
function mapTest(r) {
  return {
    id: r.id,
    categoryId: r.categoryId,
    name: r.name,
    slug: r.slug,
    shortDescription: r.shortDescription,
    description: r.description,
    preparation: r.preparation,
    sampleType: r.sampleType,
    reportHours: r.reportHours,
    price: num(r.price),
    discountPercent: num(r.discountPercent),
    membershipDiscountPct: num(r.membershipDiscountPct),
    membershipEligible: bool(r.membershipEligible),
    membershipFree: bool(r.membershipFree),
    isPopular: bool(r.isPopular),
    isPackage: bool(r.isPackage),
    isActive: bool(r.isActive),
    faqs: parseJson(r.faqs, []),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    deletedAt: r.deletedAt
  };
}
function mapReport(r) {
  return {
    id: r.id,
    userId: r.userId,
    appointmentId: r.appointmentId,
    status: r.status,
    fileUrl: r.fileUrl,
    fileName: r.fileName,
    fileMimeType: r.fileMimeType,
    fileSize: r.fileSize,
    summary: r.summary,
    releasedAt: r.releasedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  };
}
function mapAppointment(r) {
  return {
    id: r.id,
    code: r.code,
    userId: r.userId,
    testId: r.testId,
    date: r.date,
    timeSlot: r.timeSlot,
    status: r.status,
    patientName: r.patientName,
    patientAge: r.patientAge,
    notes: r.notes,
    collectionType: r.collectionType,
    addressId: r.addressId,
    familyMemberId: r.familyMemberId,
    location: r.location,
    deliveryAddress: r.deliveryAddress,
    latitude: r.latitude != null ? num(r.latitude) : null,
    longitude: r.longitude != null ? num(r.longitude) : null,
    originalPrice: r.originalPrice != null ? num(r.originalPrice) : null,
    membershipDiscount: r.membershipDiscount != null ? num(r.membershipDiscount) : null,
    cardDiscount: r.cardDiscount != null ? num(r.cardDiscount) : null,
    referralDiscount: r.referralDiscount != null ? num(r.referralDiscount) : null,
    walletDiscount: r.walletDiscount != null ? num(r.walletDiscount) : null,
    finalPrice: r.finalPrice != null ? num(r.finalPrice) : null,
    payableAmount: r.payableAmount != null ? num(r.payableAmount) : null,
    paymentStatus: r.paymentStatus,
    paymentMethod: r.paymentMethod,
    reminderEnabled: bool(r.reminderEnabled),
    reminderSentAt: r.reminderSentAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    deletedAt: r.deletedAt
  };
}
async function history(userId) {
  const appointments = await query(
    `SELECT a.*, t.*
     FROM Appointment a
     JOIN Test t ON t.id = a.testId
     WHERE a.userId = :userId AND a.deletedAt IS NULL
     ORDER BY a.date DESC`,
    { userId }
  );
  const appointmentIds = appointments.map((a) => a.id);
  const reports2 = appointmentIds.length > 0 ? await query(
    `SELECT * FROM TestReport WHERE appointmentId IN (${appointmentIds.map(() => "?").join(",")})`,
    appointmentIds
  ) : [];
  return appointments.map((row) => {
    const appt = mapAppointment(row);
    const test = mapTest({
      id: row.testId,
      categoryId: row.categoryId,
      name: row.name,
      slug: row.slug,
      shortDescription: row.shortDescription,
      description: row.description,
      preparation: row.preparation,
      sampleType: row.sampleType,
      reportHours: row.reportHours,
      price: row.price,
      discountPercent: row.discountPercent,
      membershipDiscountPct: row.membershipDiscountPct,
      membershipEligible: row.membershipEligible,
      membershipFree: row.membershipFree,
      isPopular: row.isPopular,
      isPackage: row.isPackage,
      isActive: row.isActive,
      faqs: row.faqs,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt
    });
    return {
      ...appt,
      test,
      reports: reports2.filter((r) => r.appointmentId === appt.id).map(mapReport)
    };
  });
}
async function reports(userId) {
  const rows = await query(
    `SELECT r.*,
            a.id AS apptId, a.code AS apptCode, a.date AS apptDate, a.timeSlot AS apptTimeSlot,
            a.userId AS apptUserId, a.testId AS apptTestId, a.status AS apptStatus,
            a.patientName AS apptPatientName, a.paymentStatus AS apptPaymentStatus,
            a.originalPrice, a.finalPrice, a.payableAmount, a.paymentMethod,
            a.createdAt AS apptCreatedAt, a.updatedAt AS apptUpdatedAt, a.deletedAt AS apptDeletedAt,
            a.collectionType, a.location, a.deliveryAddress, a.reminderEnabled, a.reminderSentAt,
            a.patientAge, a.notes, a.addressId, a.familyMemberId,
            a.latitude, a.longitude, a.membershipDiscount, a.cardDiscount,
            a.referralDiscount, a.walletDiscount,
            t.id AS testId_t, t.categoryId, t.name AS testName, t.slug AS testSlug,
            t.shortDescription, t.description, t.preparation, t.sampleType, t.reportHours,
            t.price AS testPrice, t.discountPercent, t.membershipDiscountPct,
            t.membershipEligible, t.membershipFree, t.isPopular, t.isPackage, t.isActive AS testIsActive,
            t.faqs, t.createdAt AS testCreatedAt, t.updatedAt AS testUpdatedAt, t.deletedAt AS testDeletedAt
     FROM TestReport r
     JOIN Appointment a ON a.id = r.appointmentId
     JOIN Test t ON t.id = a.testId
     WHERE r.userId = :userId
     ORDER BY r.createdAt DESC`,
    { userId }
  );
  return rows.map((r) => ({
    ...mapReport(r),
    appointment: {
      ...mapAppointment({
        id: r.apptId,
        code: r.apptCode,
        userId: r.apptUserId,
        testId: r.apptTestId,
        date: r.apptDate,
        timeSlot: r.apptTimeSlot,
        status: r.apptStatus,
        patientName: r.apptPatientName,
        patientAge: r.patientAge,
        notes: r.notes,
        collectionType: r.collectionType,
        addressId: r.addressId,
        familyMemberId: r.familyMemberId,
        location: r.location,
        deliveryAddress: r.deliveryAddress,
        latitude: r.latitude,
        longitude: r.longitude,
        originalPrice: r.originalPrice,
        membershipDiscount: r.membershipDiscount,
        cardDiscount: r.cardDiscount,
        referralDiscount: r.referralDiscount,
        walletDiscount: r.walletDiscount,
        finalPrice: r.finalPrice,
        payableAmount: r.payableAmount,
        paymentStatus: r.apptPaymentStatus,
        paymentMethod: r.paymentMethod,
        reminderEnabled: r.reminderEnabled,
        reminderSentAt: r.reminderSentAt,
        createdAt: r.apptCreatedAt,
        updatedAt: r.apptUpdatedAt,
        deletedAt: r.apptDeletedAt
      }),
      test: mapTest({
        id: r.testId_t,
        categoryId: r.categoryId,
        name: r.testName,
        slug: r.testSlug,
        shortDescription: r.shortDescription,
        description: r.description,
        preparation: r.preparation,
        sampleType: r.sampleType,
        reportHours: r.reportHours,
        price: r.testPrice,
        discountPercent: r.discountPercent,
        membershipDiscountPct: r.membershipDiscountPct,
        membershipEligible: r.membershipEligible,
        membershipFree: r.membershipFree,
        isPopular: r.isPopular,
        isPackage: r.isPackage,
        isActive: r.testIsActive,
        faqs: r.faqs,
        createdAt: r.testCreatedAt,
        updatedAt: r.testUpdatedAt,
        deletedAt: r.testDeletedAt
      })
    }
  }));
}
async function report(userId, reportId) {
  const rows = await reports(userId);
  const item = rows.find((r) => r.id === reportId);
  if (!item) throw notFound("Report not found", "REPORT_NOT_FOUND");
  return item;
}
async function getReportFile(userId, reportId) {
  const row = await queryOne(
    `SELECT r.*, a.code AS appointmentCode
     FROM TestReport r
     JOIN Appointment a ON a.id = r.appointmentId
     WHERE r.id = :id AND r.userId = :userId`,
    { id: reportId, userId }
  );
  if (!row?.fileUrl) {
    throw notFound("Report file not found", "REPORT_NOT_FOUND");
  }
  const absolute = resolveAbsolute(String(row.fileUrl));
  if (!existsSync(absolute)) {
    throw notFound("Report file missing on server", "FILE_MISSING");
  }
  return {
    stream: createReadStream(absolute),
    fileName: row.fileName ?? `${row.appointmentCode}-report.pdf`,
    mimeType: row.fileMimeType ?? "application/octet-stream"
  };
}
export {
  getReportFile,
  history,
  report,
  reports
};
