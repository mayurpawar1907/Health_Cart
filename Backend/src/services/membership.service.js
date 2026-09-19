import { bool, execute, num, query, queryOne } from '../config/database.js';
import { id } from "../utils/id.js";
import { badRequest, notFound } from "../utils/errors.js";
import * as wallet from "./wallet.service.js";
import * as whatsapp from "./whatsapp.service.js";
function mapPlan(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: num(row.price),
    durationDays: Number(row.durationDays),
    description: row.description,
    isFree: bool(row.isFree),
    flatDiscountPercent: num(row.flatDiscountPercent),
    maxFamilyMembers: Number(row.maxFamilyMembers),
    isActive: bool(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}
function mapBenefit(row, test = null) {
  return {
    id: row.id,
    planId: row.planId,
    title: row.title,
    description: row.description,
    testId: row.testId,
    freeTest: bool(row.freeTest),
    test: test ? {
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
      faqs: test.faqs,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
      deletedAt: test.deletedAt
    } : null
  };
}
async function loadBenefitsForPlan(planId, withTest = true) {
  const rows = await query(
    withTest ? `SELECT b.*,
                t.id AS t_id, t.categoryId AS t_categoryId, t.name AS t_name, t.slug AS t_slug,
                t.shortDescription AS t_shortDescription, t.description AS t_description,
                t.preparation AS t_preparation, t.sampleType AS t_sampleType,
                t.reportHours AS t_reportHours, t.price AS t_price,
                t.discountPercent AS t_discountPercent, t.membershipDiscountPct AS t_membershipDiscountPct,
                t.membershipEligible AS t_membershipEligible, t.membershipFree AS t_membershipFree,
                t.isPopular AS t_isPopular, t.isPackage AS t_isPackage, t.isActive AS t_isActive,
                t.faqs AS t_faqs, t.createdAt AS t_createdAt, t.updatedAt AS t_updatedAt, t.deletedAt AS t_deletedAt
         FROM MembershipBenefit b
         LEFT JOIN Test t ON t.id = b.testId
         WHERE b.planId = :planId` : `SELECT b.* FROM MembershipBenefit b WHERE b.planId = :planId`,
    { planId }
  );
  return rows.map((r) => {
    if (!withTest || !r.t_id) {
      return mapBenefit(
        {
          id: r.id,
          planId: r.planId,
          title: r.title,
          description: r.description,
          testId: r.testId,
          freeTest: r.freeTest
        },
        null
      );
    }
    const test = {
      id: r.t_id,
      categoryId: r.t_categoryId,
      name: r.t_name,
      slug: r.t_slug,
      shortDescription: r.t_shortDescription,
      description: r.t_description,
      preparation: r.t_preparation,
      sampleType: r.t_sampleType,
      reportHours: r.t_reportHours,
      price: r.t_price,
      discountPercent: r.t_discountPercent,
      membershipDiscountPct: r.t_membershipDiscountPct,
      membershipEligible: r.t_membershipEligible,
      membershipFree: r.t_membershipFree,
      isPopular: r.t_isPopular,
      isPackage: r.t_isPackage,
      isActive: r.t_isActive,
      faqs: r.t_faqs,
      createdAt: r.t_createdAt,
      updatedAt: r.t_updatedAt,
      deletedAt: r.t_deletedAt
    };
    return mapBenefit(r, test);
  });
}
async function loadMembers(membershipId) {
  const rows = await query(
    `SELECT mm.*,
            f.id AS f_id, f.userId AS f_userId, f.name AS f_name, f.relation AS f_relation,
            f.dateOfBirth AS f_dateOfBirth, f.gender AS f_gender, f.age AS f_age,
            f.mobile AS f_mobile, f.createdAt AS f_createdAt
     FROM MembershipMember mm
     LEFT JOIN FamilyMember f ON f.id = mm.familyMemberId
     WHERE mm.membershipId = :membershipId`,
    { membershipId }
  );
  return rows.map((r) => ({
    id: r.id,
    membershipId: r.membershipId,
    familyMemberId: r.familyMemberId,
    name: r.name,
    relation: r.relation,
    isPrimary: bool(r.isPrimary),
    familyMember: r.f_id ? {
      id: r.f_id,
      userId: r.f_userId,
      name: r.f_name,
      relation: r.f_relation,
      dateOfBirth: r.f_dateOfBirth,
      gender: r.f_gender,
      age: r.f_age != null ? Number(r.f_age) : null,
      mobile: r.f_mobile,
      createdAt: r.f_createdAt
    } : null
  }));
}
async function loadUsage(membershipId) {
  const rows = await query(
    `SELECT u.*,
            t.id AS t_id, t.categoryId AS t_categoryId, t.name AS t_name, t.slug AS t_slug,
            t.shortDescription AS t_shortDescription, t.description AS t_description,
            t.preparation AS t_preparation, t.sampleType AS t_sampleType,
            t.reportHours AS t_reportHours, t.price AS t_price,
            t.discountPercent AS t_discountPercent, t.membershipDiscountPct AS t_membershipDiscountPct,
            t.membershipEligible AS t_membershipEligible, t.membershipFree AS t_membershipFree,
            t.isPopular AS t_isPopular, t.isPackage AS t_isPackage, t.isActive AS t_isActive,
            t.faqs AS t_faqs, t.createdAt AS t_createdAt, t.updatedAt AS t_updatedAt, t.deletedAt AS t_deletedAt
     FROM MembershipUsage u
     JOIN Test t ON t.id = u.testId
     WHERE u.membershipId = :membershipId
     ORDER BY u.usedAt DESC`,
    { membershipId }
  );
  return rows.map((r) => ({
    id: r.id,
    membershipId: r.membershipId,
    testId: r.testId,
    appointmentId: r.appointmentId,
    usedAt: r.usedAt,
    note: r.note,
    test: {
      id: r.t_id,
      categoryId: r.t_categoryId,
      name: r.t_name,
      slug: r.t_slug,
      shortDescription: r.t_shortDescription,
      description: r.t_description,
      preparation: r.t_preparation,
      sampleType: r.t_sampleType,
      reportHours: Number(r.t_reportHours),
      price: num(r.t_price),
      discountPercent: num(r.t_discountPercent),
      membershipDiscountPct: num(r.t_membershipDiscountPct),
      membershipEligible: bool(r.t_membershipEligible),
      membershipFree: bool(r.t_membershipFree),
      isPopular: bool(r.t_isPopular),
      isPackage: bool(r.t_isPackage),
      isActive: bool(r.t_isActive),
      faqs: r.t_faqs,
      createdAt: r.t_createdAt,
      updatedAt: r.t_updatedAt,
      deletedAt: r.t_deletedAt
    }
  }));
}
async function plans() {
  const rows = await query(
    `SELECT * FROM MembershipPlan WHERE isActive = 1 ORDER BY isFree DESC, price ASC`
  );
  return Promise.all(
    rows.map(async (row) => {
      const plan = mapPlan(row);
      const benefits2 = await loadBenefitsForPlan(plan.id, true);
      return { ...plan, benefits: benefits2 };
    })
  );
}
async function current(userId) {
  const row = await queryOne(
    `SELECT m.*,
            p.id AS p_id, p.name AS p_name, p.slug AS p_slug, p.price AS p_price,
            p.durationDays AS p_durationDays, p.description AS p_description,
            p.isFree AS p_isFree, p.flatDiscountPercent AS p_flatDiscountPercent,
            p.maxFamilyMembers AS p_maxFamilyMembers, p.isActive AS p_isActive,
            p.createdAt AS p_createdAt, p.updatedAt AS p_updatedAt
     FROM Membership m
     JOIN MembershipPlan p ON p.id = m.planId
     WHERE m.userId = :userId AND m.isActive = 1 AND m.expiresAt > NOW(3)
     LIMIT 1`,
    { userId }
  );
  if (!row) return null;
  const plan = mapPlan({
    id: row.p_id,
    name: row.p_name,
    slug: row.p_slug,
    price: row.p_price,
    durationDays: row.p_durationDays,
    description: row.p_description,
    isFree: row.p_isFree,
    flatDiscountPercent: row.p_flatDiscountPercent,
    maxFamilyMembers: row.p_maxFamilyMembers,
    isActive: row.p_isActive,
    createdAt: row.p_createdAt,
    updatedAt: row.p_updatedAt
  });
  const benefits2 = await loadBenefitsForPlan(plan.id, true);
  const usage = await loadUsage(row.id);
  const members = await loadMembers(row.id);
  return {
    id: row.id,
    userId: row.userId,
    planId: row.planId,
    number: row.number,
    startsAt: row.startsAt,
    expiresAt: row.expiresAt,
    isActive: bool(row.isActive),
    createdAt: row.createdAt,
    plan: { ...plan, benefits: benefits2 },
    usage,
    members
  };
}
async function card(userId) {
  const membership = await current(userId);
  if (!membership) throw notFound("No active membership", "NO_MEMBERSHIP");
  const user = await queryOne(`SELECT * FROM User WHERE id = :id`, { id: userId });
  if (!user) throw notFound("User not found");
  const expiresAt = membership.expiresAt instanceof Date ? membership.expiresAt : new Date(membership.expiresAt);
  return {
    brand: "HEALTH ID CARD",
    title: "Family Health Card",
    memberName: user.fullName,
    dateOfBirth: user.dateOfBirth,
    membershipId: membership.number,
    validFrom: membership.startsAt,
    validUntil: membership.expiresAt,
    plan: membership.plan.name,
    flatDiscountPercent: Number(membership.plan.flatDiscountPercent),
    maxFamilyMembers: membership.plan.maxFamilyMembers,
    familyMembers: membership.members.map((m) => ({
      id: m.id,
      name: m.name,
      relation: m.relation,
      isPrimary: m.isPrimary
    })),
    qrPayload: JSON.stringify({
      v: 2,
      id: membership.number,
      name: user.fullName,
      valid: expiresAt.toISOString().slice(0, 10)
    })
  };
}
async function benefits(userId) {
  const m = await current(userId);
  return m?.plan.benefits ?? [];
}
async function subscribe(userId, planId) {
  const planRow = await queryOne(
    `SELECT * FROM MembershipPlan WHERE id = :id AND isActive = 1 LIMIT 1`,
    { id: planId }
  );
  if (!planRow) throw badRequest("Invalid plan", "INVALID_PLAN");
  const existing = await current(userId);
  if (existing) {
    throw badRequest("You already have an active membership", "ALREADY_MEMBER");
  }
  const user = await queryOne(
    `SELECT id, fullName, referredByUserId FROM User WHERE id = :id`,
    { id: userId }
  );
  if (!user) throw notFound("User not found");
  const plan = mapPlan(planRow);
  const startsAt = /* @__PURE__ */ new Date();
  const expiresAt = new Date(startsAt.getTime() + plan.durationDays * 864e5);
  const number = `HIC-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-6)}`;
  const membershipId = id();
  const primaryMemberId = id();
  await execute(
    `INSERT INTO Membership (id, userId, planId, number, startsAt, expiresAt, isActive)
     VALUES (:id, :userId, :planId, :number, :startsAt, :expiresAt, 1)`,
    {
      id: membershipId,
      userId,
      planId: plan.id,
      number,
      startsAt,
      expiresAt
    }
  );
  await execute(
    `INSERT INTO MembershipMember (id, membershipId, name, relation, isPrimary)
     VALUES (:id, :membershipId, :name, 'Self', 1)`,
    { id: primaryMemberId, membershipId, name: user.fullName }
  );
  const family = await query(
    `SELECT * FROM FamilyMember WHERE userId = :userId`,
    { userId }
  );
  for (const f of family.slice(0, plan.maxFamilyMembers - 1)) {
    await addFamilyToCard(userId, f.id, membershipId);
  }
  const priceText = plan.isFree ? "FREE for 1 year" : `\u20B9${Number(plan.price)}/year`;
  const body = `Your HealthID Card (${number}) is active until ${expiresAt.toDateString()}. ${priceText}. Enjoy ${Number(plan.flatDiscountPercent)}% off on all tests + free home collection.`;
  await execute(
    `INSERT INTO Notification (id, userId, type, title, body)
     VALUES (:id, :userId, 'PROMOTIONAL', :title, :body)`,
    { id: id(), userId, title: "HealthID Card activated", body }
  );
  await whatsapp.send(userId, "membership_activated", body);
  await wallet.assignReferralCode(userId, user.fullName);
  await wallet.creditJoiningBonus(userId);
  if (user.referredByUserId) {
    await wallet.creditReferralBonus(String(user.referredByUserId), userId);
  }
  const benefitsOnly = await loadBenefitsForPlan(plan.id, false);
  const members = await loadMembers(membershipId);
  return {
    id: membershipId,
    userId,
    planId: plan.id,
    number,
    startsAt,
    expiresAt,
    isActive: true,
    plan: { ...plan, benefits: benefitsOnly },
    members
  };
}
async function addFamilyToCard(userId, familyMemberId, membershipId) {
  let membership;
  if (membershipId) {
    const row = await queryOne(
      `SELECT m.id, p.maxFamilyMembers
       FROM Membership m
       JOIN MembershipPlan p ON p.id = m.planId
       WHERE m.id = :membershipId AND m.userId = :userId
       LIMIT 1`,
      { membershipId, userId }
    );
    membership = row ? { id: row.id, plan: { maxFamilyMembers: Number(row.maxFamilyMembers) } } : null;
  } else {
    const cur = await current(userId);
    membership = cur ? { id: cur.id, plan: { maxFamilyMembers: cur.plan.maxFamilyMembers } } : null;
  }
  if (!membership) throw badRequest("No active membership", "NO_MEMBERSHIP");
  const family = await queryOne(
    `SELECT * FROM FamilyMember WHERE id = :id AND userId = :userId LIMIT 1`,
    { id: familyMemberId, userId }
  );
  if (!family) throw notFound("Family member not found", "NOT_FOUND");
  const countRow = await queryOne(
    `SELECT COUNT(*) AS cnt FROM MembershipMember WHERE membershipId = :membershipId`,
    { membershipId: membership.id }
  );
  const count = Number(countRow?.cnt ?? 0);
  if (count >= membership.plan.maxFamilyMembers) {
    throw badRequest(
      `Card supports up to ${membership.plan.maxFamilyMembers} members`,
      "FAMILY_LIMIT"
    );
  }
  const existing = await queryOne(
    `SELECT * FROM MembershipMember
     WHERE membershipId = :membershipId AND familyMemberId = :familyMemberId
     LIMIT 1`,
    { membershipId: membership.id, familyMemberId }
  );
  if (existing) {
    return {
      ...existing,
      isPrimary: bool(existing.isPrimary)
    };
  }
  const memberId = id();
  await execute(
    `INSERT INTO MembershipMember (id, membershipId, familyMemberId, name, relation, isPrimary)
     VALUES (:id, :membershipId, :familyMemberId, :name, :relation, 0)`,
    {
      id: memberId,
      membershipId: membership.id,
      familyMemberId,
      name: family.name,
      relation: family.relation
    }
  );
  return queryOne(`SELECT * FROM MembershipMember WHERE id = :id`, {
    id: memberId
  }).then((r) => ({ ...r, isPrimary: bool(r.isPrimary) }));
}
async function removeFromCard(userId, memberId) {
  const membership = await current(userId);
  if (!membership) throw badRequest("No active membership", "NO_MEMBERSHIP");
  const member = await queryOne(
    `SELECT * FROM MembershipMember
     WHERE id = :id AND membershipId = :membershipId AND isPrimary = 0
     LIMIT 1`,
    { id: memberId, membershipId: membership.id }
  );
  if (!member) throw notFound("Cannot remove primary member", "NOT_FOUND");
  await execute(`DELETE FROM MembershipMember WHERE id = :id`, { id: member.id });
  return { message: "Removed from card" };
}
export {
  addFamilyToCard,
  benefits,
  card,
  current,
  plans,
  removeFromCard,
  subscribe
};
