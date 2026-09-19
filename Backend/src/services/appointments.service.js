import { bool, execute, num, parseJson, query, queryOne } from '../config/database.js';
import { id } from "../utils/id.js";
import { badRequest, notFound } from "../utils/errors.js";
import * as pricing from "./pricing.service.js";
import * as checkout from "./checkout.service.js";
import * as wallet from "./wallet.service.js";
import * as paymentLedger from "./payment-ledger.service.js";
import * as whatsapp from "./whatsapp.service.js";
const SLOTS = [
  "06:00 AM",
  "06:30 AM",
  "07:00 AM",
  "07:30 AM",
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "07:00 PM"
];
const METRO_PIN_PREFIXES = ["11", "12", "20", "30", "38", "40", "41", "50", "56", "60", "70"];
function isServiceablePincode(pincode) {
  return /^\d{6}$/.test(pincode) && METRO_PIN_PREFIXES.some((p) => pincode.startsWith(p));
}
function mapTest(row, prefix = "t") {
  const g = (k) => row[`${prefix}_${k}`] ?? (prefix === "" ? row[k] : void 0);
  if (g("id") == null && row.testId == null && !row.name) return null;
  const idVal = g("id") ?? row.testId;
  if (idVal == null) return null;
  return {
    id: idVal,
    categoryId: g("categoryId") ?? row.categoryId,
    name: g("name") ?? row.testName ?? row.name,
    slug: g("slug") ?? row.slug,
    shortDescription: g("shortDescription") ?? row.shortDescription,
    description: g("description") ?? row.description,
    preparation: g("preparation") ?? row.preparation,
    sampleType: g("sampleType") ?? row.sampleType,
    reportHours: Number(g("reportHours") ?? row.reportHours ?? 24),
    price: num(g("price") ?? row.price),
    discountPercent: num(g("discountPercent") ?? row.discountPercent),
    membershipDiscountPct: num(g("membershipDiscountPct") ?? row.membershipDiscountPct),
    membershipEligible: bool(g("membershipEligible") ?? row.membershipEligible),
    membershipFree: bool(g("membershipFree") ?? row.membershipFree),
    isPopular: bool(g("isPopular") ?? row.isPopular),
    isPackage: bool(g("isPackage") ?? row.isPackage),
    isActive: bool(g("isActive") ?? row.isActive),
    faqs: parseJson(g("faqs") ?? row.faqs, null),
    createdAt: g("createdAt") ?? row.createdAt,
    updatedAt: g("updatedAt") ?? row.updatedAt,
    deletedAt: g("deletedAt") ?? row.deletedAt
  };
}
function mapAppointment(row) {
  return {
    id: row.id,
    code: row.code,
    userId: row.userId,
    testId: row.testId,
    date: row.date,
    timeSlot: row.timeSlot,
    status: row.status,
    patientName: row.patientName,
    patientAge: row.patientAge != null ? Number(row.patientAge) : null,
    notes: row.notes,
    collectionType: row.collectionType,
    addressId: row.addressId,
    familyMemberId: row.familyMemberId,
    location: row.location,
    deliveryAddress: row.deliveryAddress,
    latitude: row.latitude != null ? num(row.latitude) : null,
    longitude: row.longitude != null ? num(row.longitude) : null,
    originalPrice: row.originalPrice != null ? num(row.originalPrice) : null,
    membershipDiscount: row.membershipDiscount != null ? num(row.membershipDiscount) : null,
    cardDiscount: row.cardDiscount != null ? num(row.cardDiscount) : null,
    referralDiscount: row.referralDiscount != null ? num(row.referralDiscount) : null,
    walletDiscount: row.walletDiscount != null ? num(row.walletDiscount) : null,
    finalPrice: row.finalPrice != null ? num(row.finalPrice) : null,
    payableAmount: row.payableAmount != null ? num(row.payableAmount) : null,
    paymentStatus: row.paymentStatus,
    paymentMethod: row.paymentMethod,
    reminderEnabled: bool(row.reminderEnabled),
    reminderSentAt: row.reminderSentAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt
  };
}
async function loadAddress(addressId) {
  if (!addressId) return null;
  const addr = await queryOne(`SELECT * FROM Address WHERE id = :id`, { id: addressId });
  if (!addr) return null;
  return {
    ...addr,
    isPrimary: bool(addr.isPrimary),
    latitude: addr.latitude != null ? num(addr.latitude) : null,
    longitude: addr.longitude != null ? num(addr.longitude) : null
  };
}
async function loadFamilyMember(familyMemberId) {
  if (!familyMemberId) return null;
  return queryOne(`SELECT * FROM FamilyMember WHERE id = :id`, { id: familyMemberId });
}
async function loadCategory(categoryId) {
  const c = await queryOne(`SELECT * FROM TestCategory WHERE id = :id`, { id: categoryId });
  if (!c) return null;
  return { ...c, isActive: bool(c.isActive) };
}
function slots(date) {
  return { date, slots: SLOTS, homeCollectionAvailable: true };
}
function checkServiceability(pincode) {
  const ok = isServiceablePincode(pincode);
  return {
    pincode,
    serviceable: ok,
    message: ok ? "Free home collection available in your area" : "Home collection coming soon to your pincode. Lab visit available."
  };
}
async function list(userId, status) {
  const clauses = ["a.userId = :userId", "a.deletedAt IS NULL"];
  const params = { userId };
  if (status && status !== "ALL") {
    clauses.push("a.status = :status");
    params.status = status;
  }
  const rows = await query(
    `SELECT a.*,
            t.id AS t_id, t.categoryId AS t_categoryId, t.name AS t_name, t.slug AS t_slug,
            t.shortDescription AS t_shortDescription, t.description AS t_description,
            t.preparation AS t_preparation, t.sampleType AS t_sampleType, t.reportHours AS t_reportHours,
            t.price AS t_price, t.discountPercent AS t_discountPercent,
            t.membershipDiscountPct AS t_membershipDiscountPct,
            t.membershipEligible AS t_membershipEligible, t.membershipFree AS t_membershipFree,
            t.isPopular AS t_isPopular, t.isPackage AS t_isPackage, t.isActive AS t_isActive,
            t.faqs AS t_faqs, t.createdAt AS t_createdAt, t.updatedAt AS t_updatedAt, t.deletedAt AS t_deletedAt
     FROM Appointment a
     JOIN Test t ON t.id = a.testId
     WHERE ${clauses.join(" AND ")}
     ORDER BY a.date DESC`,
    params
  );
  return Promise.all(
    rows.map(async (row) => {
      const appt = mapAppointment(row);
      const test = mapTest(row, "t");
      const category = await loadCategory(test.categoryId);
      const address = await loadAddress(appt.addressId);
      const familyMember = await loadFamilyMember(appt.familyMemberId);
      return { ...appt, test: { ...test, category }, address, familyMember };
    })
  );
}
async function get(userId, appointmentId) {
  const row = await queryOne(
    `SELECT a.*,
            t.id AS t_id, t.categoryId AS t_categoryId, t.name AS t_name, t.slug AS t_slug,
            t.shortDescription AS t_shortDescription, t.description AS t_description,
            t.preparation AS t_preparation, t.sampleType AS t_sampleType, t.reportHours AS t_reportHours,
            t.price AS t_price, t.discountPercent AS t_discountPercent,
            t.membershipDiscountPct AS t_membershipDiscountPct,
            t.membershipEligible AS t_membershipEligible, t.membershipFree AS t_membershipFree,
            t.isPopular AS t_isPopular, t.isPackage AS t_isPackage, t.isActive AS t_isActive,
            t.faqs AS t_faqs, t.createdAt AS t_createdAt, t.updatedAt AS t_updatedAt, t.deletedAt AS t_deletedAt
     FROM Appointment a
     JOIN Test t ON t.id = a.testId
     WHERE a.id = :id AND a.userId = :userId AND a.deletedAt IS NULL
     LIMIT 1`,
    { id: appointmentId, userId }
  );
  if (!row) throw notFound("Appointment not found", "APPOINTMENT_NOT_FOUND");
  const appt = mapAppointment(row);
  const test = mapTest(row, "t");
  const address = await loadAddress(appt.addressId);
  const familyMember = await loadFamilyMember(appt.familyMemberId);
  const reports = await query(
    `SELECT * FROM TestReport WHERE appointmentId = :appointmentId ORDER BY createdAt ASC`,
    { appointmentId }
  );
  return {
    ...appt,
    test,
    address,
    familyMember,
    reports: reports.map((r) => ({
      ...r,
      fileSize: r.fileSize != null ? Number(r.fileSize) : null
    }))
  };
}
async function quote(userId, testId, opts = {}) {
  const test = await queryOne(
    `SELECT * FROM Test WHERE id = :id AND isActive = 1 LIMIT 1`,
    { id: testId }
  );
  if (!test) throw badRequest("Invalid test", "INVALID_TEST");
  return checkout.quote(
    userId,
    {
      id: test.id,
      name: test.name,
      price: test.price,
      discountPercent: test.discountPercent,
      membershipFree: bool(test.membershipFree)
    },
    opts
  );
}
async function create(userId, dto) {
  const test = await queryOne(
    `SELECT * FROM Test WHERE id = :id AND isActive = 1 LIMIT 1`,
    { id: dto.testId }
  );
  if (!test) throw badRequest("Invalid test", "INVALID_TEST");
  if (!SLOTS.includes(dto.timeSlot)) {
    throw badRequest("Invalid time slot", "INVALID_SLOT");
  }
  const collectionType = dto.collectionType ?? "HOME";
  let deliveryAddress = dto.deliveryAddress;
  let addressId = dto.addressId;
  let latitude = dto.latitude;
  let longitude = dto.longitude;
  if (collectionType === "HOME") {
    if (addressId) {
      const addr = await queryOne(
        `SELECT * FROM Address WHERE id = :id AND userId = :userId LIMIT 1`,
        { id: addressId, userId }
      );
      if (!addr) throw badRequest("Invalid address", "INVALID_ADDRESS");
      deliveryAddress = `${addr.line1}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
      latitude = latitude ?? (addr.latitude != null ? num(addr.latitude) : void 0);
      longitude = longitude ?? (addr.longitude != null ? num(addr.longitude) : void 0);
      const service = checkServiceability(addr.pincode);
      if (!service.serviceable) {
        throw badRequest(service.message, "NOT_SERVICEABLE");
      }
    } else if (!deliveryAddress) {
      throw badRequest("Share your location for home collection", "ADDRESS_REQUIRED");
    }
  }
  if (dto.familyMemberId) {
    const fm = await queryOne(
      `SELECT id FROM FamilyMember WHERE id = :id AND userId = :userId LIMIT 1`,
      { id: dto.familyMemberId, userId }
    );
    if (!fm) throw badRequest("Invalid family member", "INVALID_FAMILY");
  }
  const quoteResult = await checkout.quote(
    userId,
    {
      id: test.id,
      name: test.name,
      price: test.price,
      discountPercent: test.discountPercent,
      membershipFree: bool(test.membershipFree)
    },
    {
      useWallet: dto.useWallet !== false,
      useReferral: dto.useReferral !== false
    }
  );
  const membership = await pricing.activeMembership(userId);
  if (bool(test.membershipFree) && membership) {
    await execute(
      `INSERT INTO MembershipUsage (id, membershipId, testId, note)
       VALUES (:id, :membershipId, :testId, :note)`,
      {
        id: id(),
        membershipId: membership.id,
        testId: test.id,
        note: "Free eligible test"
      }
    );
  }
  let paymentMethod = dto.paymentMethod ?? "UPI";
  if (quoteResult.amountDue === 0 && (quoteResult.walletCreditApplied > 0 || quoteResult.referralCreditApplied > 0)) {
    paymentMethod = "WALLET";
  }
  const paymentStatus = quoteResult.amountDue === 0 ? "PAID" : paymentMethod === "COD" ? "PENDING" : "PAID";
  const code = `HIC-${Date.now().toString().slice(-8)}`;
  const appointmentId = id();
  const location = collectionType === "HOME" ? "Home collection" : "HealthID Diagnostics Centre";
  await execute(
    `INSERT INTO Appointment
      (id, code, userId, testId, date, timeSlot, status, patientName, patientAge, notes,
       collectionType, addressId, familyMemberId, location, deliveryAddress, latitude, longitude,
       originalPrice, membershipDiscount, cardDiscount, referralDiscount, walletDiscount,
       finalPrice, payableAmount, paymentStatus, paymentMethod, reminderEnabled)
     VALUES
      (:id, :code, :userId, :testId, :date, :timeSlot, 'CONFIRMED', :patientName, :patientAge, :notes,
       :collectionType, :addressId, :familyMemberId, :location, :deliveryAddress, :latitude, :longitude,
       :originalPrice, :membershipDiscount, :cardDiscount, :referralDiscount, :walletDiscount,
       :finalPrice, :payableAmount, :paymentStatus, :paymentMethod, :reminderEnabled)`,
    {
      id: appointmentId,
      code,
      userId,
      testId: test.id,
      date: dto.date,
      timeSlot: dto.timeSlot,
      patientName: dto.patientName,
      patientAge: dto.patientAge ?? null,
      notes: dto.notes ?? null,
      collectionType,
      addressId: addressId ?? null,
      familyMemberId: dto.familyMemberId ?? null,
      location,
      deliveryAddress: deliveryAddress ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      originalPrice: quoteResult.originalPrice,
      membershipDiscount: quoteResult.listDiscountFromMrp,
      cardDiscount: quoteResult.paymentDiscountAmount,
      referralDiscount: quoteResult.referralCreditApplied,
      walletDiscount: quoteResult.walletCreditApplied,
      finalPrice: quoteResult.subtotalAfterPaymentDiscount,
      payableAmount: quoteResult.amountDue,
      paymentStatus,
      paymentMethod,
      reminderEnabled: dto.reminderEnabled !== false ? 1 : 0
    }
  );
  if (quoteResult.referralCreditApplied > 0 || quoteResult.walletCreditApplied > 0) {
    await wallet.debitForBooking(
      userId,
      appointmentId,
      quoteResult.referralCreditApplied,
      quoteResult.walletCreditApplied
    );
  }
  await paymentLedger.recordBookingPayment({
    appointmentId,
    userId,
    bookingCode: code,
    testName: test.name,
    quote: quoteResult,
    method: paymentMethod,
    status: paymentStatus
  });
  const collectionText = collectionType === "HOME" ? `Home visit at ${deliveryAddress}` : "Lab visit";
  const savings = [];
  if (quoteResult.listDiscountFromMrp > 0) {
    savings.push(`list rate \u2212\u20B9${quoteResult.listDiscountFromMrp}`);
  }
  if (quoteResult.paymentDiscountAmount > 0) {
    savings.push(
      `${quoteResult.paymentDiscountPercent}% off \u2212\u20B9${quoteResult.paymentDiscountAmount}`
    );
  }
  if (quoteResult.referralCreditApplied > 0) {
    savings.push(`referral \u2212\u20B9${quoteResult.referralCreditApplied}`);
  }
  if (quoteResult.walletCreditApplied > 0) {
    savings.push(`wallet \u2212\u20B9${quoteResult.walletCreditApplied}`);
  }
  const payText = quoteResult.amountDue === 0 ? quoteResult.isFreeForMember ? "FREE (member benefit)" : `Fully covered by wallet${savings.length ? ` (${savings.join(", ")})` : ""}` : `\u20B9${quoteResult.amountDue} via ${paymentMethod}${savings.length ? ` after ${savings.join(", ")}` : ""}`;
  const body = `${test.name} booked for ${dto.date} at ${dto.timeSlot}. ${collectionText}. ${payText}. Booking ID: ${code}.`;
  await execute(
    `INSERT INTO Notification (id, userId, type, title, body)
     VALUES (:id, :userId, 'APPOINTMENT_CONFIRMATION', :title, :body)`,
    { id: id(), userId, title: "Booking confirmed", body }
  );
  await whatsapp.send(userId, "booking_confirmed", body);
  await execute(
    `INSERT INTO TestReport (id, userId, appointmentId, status)
     VALUES (:id, :userId, :appointmentId, 'PENDING')`,
    { id: id(), userId, appointmentId }
  );
  const remindAt = new Date(dto.date);
  remindAt.setDate(remindAt.getDate() - 1);
  remindAt.setHours(9, 0, 0, 0);
  if (remindAt > /* @__PURE__ */ new Date()) {
    await execute(
      `INSERT INTO TestReminder (id, userId, appointmentId, label, remindAt)
       VALUES (:id, :userId, :appointmentId, :label, :remindAt)`,
      {
        id: id(),
        userId,
        appointmentId,
        label: `${test.name} tomorrow`,
        remindAt
      }
    );
  }
  const created = await queryOne(`SELECT * FROM Appointment WHERE id = :id`, {
    id: appointmentId
  });
  const address = await loadAddress(addressId ?? null);
  return {
    ...mapAppointment(created),
    test: {
      id: test.id,
      categoryId: test.categoryId,
      name: test.name,
      slug: test.slug,
      shortDescription: test.shortDescription,
      description: test.description,
      preparation: test.preparation,
      sampleType: test.sampleType,
      reportHours: Number(test.reportHours),
      price: num(test.price),
      discountPercent: num(test.discountPercent),
      membershipDiscountPct: num(test.membershipDiscountPct),
      membershipEligible: bool(test.membershipEligible),
      membershipFree: bool(test.membershipFree),
      isPopular: bool(test.isPopular),
      isPackage: bool(test.isPackage),
      isActive: bool(test.isActive),
      faqs: parseJson(test.faqs, null),
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
      deletedAt: test.deletedAt
    },
    address
  };
}
async function cancel(userId, appointmentId) {
  const appointment = await get(userId, appointmentId);
  if (["COMPLETED", "CANCELLED"].includes(appointment.status)) {
    throw badRequest("This appointment cannot be cancelled", "CANCEL_FAILED");
  }
  await execute(`UPDATE Appointment SET status = 'CANCELLED' WHERE id = :id`, {
    id: appointmentId
  });
  const updated = await queryOne(
    `SELECT a.*,
            t.id AS t_id, t.categoryId AS t_categoryId, t.name AS t_name, t.slug AS t_slug,
            t.shortDescription AS t_shortDescription, t.description AS t_description,
            t.preparation AS t_preparation, t.sampleType AS t_sampleType, t.reportHours AS t_reportHours,
            t.price AS t_price, t.discountPercent AS t_discountPercent,
            t.membershipDiscountPct AS t_membershipDiscountPct,
            t.membershipEligible AS t_membershipEligible, t.membershipFree AS t_membershipFree,
            t.isPopular AS t_isPopular, t.isPackage AS t_isPackage, t.isActive AS t_isActive,
            t.faqs AS t_faqs, t.createdAt AS t_createdAt, t.updatedAt AS t_updatedAt, t.deletedAt AS t_deletedAt
     FROM Appointment a
     JOIN Test t ON t.id = a.testId
     WHERE a.id = :id`,
    { id: appointmentId }
  );
  const test = mapTest(updated, "t");
  const body = `${test.name} (${updated.code}) has been cancelled. Refund will be processed in 3-5 business days if applicable.`;
  await execute(
    `INSERT INTO Notification (id, userId, type, title, body)
     VALUES (:id, :userId, 'APPOINTMENT_CANCELLATION', :title, :body)`,
    { id: id(), userId, title: "Booking cancelled", body }
  );
  await whatsapp.send(userId, "booking_cancelled", body);
  return { ...mapAppointment(updated), test };
}
async function reschedule(userId, appointmentId, dto) {
  const appointment = await get(userId, appointmentId);
  if (["COMPLETED", "CANCELLED"].includes(appointment.status)) {
    throw badRequest("This appointment cannot be rescheduled", "RESCHEDULE_FAILED");
  }
  await execute(
    `UPDATE Appointment
     SET date = :date, timeSlot = :timeSlot, status = 'RESCHEDULED', reminderSentAt = NULL
     WHERE id = :id`,
    { date: dto.date, timeSlot: dto.timeSlot, id: appointmentId }
  );
  const updated = await queryOne(
    `SELECT a.*,
            t.id AS t_id, t.categoryId AS t_categoryId, t.name AS t_name, t.slug AS t_slug,
            t.shortDescription AS t_shortDescription, t.description AS t_description,
            t.preparation AS t_preparation, t.sampleType AS t_sampleType, t.reportHours AS t_reportHours,
            t.price AS t_price, t.discountPercent AS t_discountPercent,
            t.membershipDiscountPct AS t_membershipDiscountPct,
            t.membershipEligible AS t_membershipEligible, t.membershipFree AS t_membershipFree,
            t.isPopular AS t_isPopular, t.isPackage AS t_isPackage, t.isActive AS t_isActive,
            t.faqs AS t_faqs, t.createdAt AS t_createdAt, t.updatedAt AS t_updatedAt, t.deletedAt AS t_deletedAt
     FROM Appointment a
     JOIN Test t ON t.id = a.testId
     WHERE a.id = :id`,
    { id: appointmentId }
  );
  const test = mapTest(updated, "t");
  const body = `${test.name} moved to ${dto.date} at ${dto.timeSlot}.`;
  await execute(
    `INSERT INTO Notification (id, userId, type, title, body)
     VALUES (:id, :userId, 'APPOINTMENT_RESCHEDULED', :title, :body)`,
    { id: id(), userId, title: "Booking rescheduled", body }
  );
  await whatsapp.send(userId, "booking_rescheduled", body);
  return { ...mapAppointment(updated), test };
}
export {
  cancel,
  checkServiceability,
  create,
  get,
  list,
  quote,
  reschedule,
  slots
};
