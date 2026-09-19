import { createReadStream, existsSync } from 'node:fs';
import { bool, execute, num, parseJson, query, queryOne } from '../config/database.js';
import { id } from "../utils/id.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";
import * as platformSettings from "./platform-settings.service.js";
import * as paymentLedger from "./payment-ledger.service.js";
import * as invoiceService from "./invoice.service.js";
import * as storage from "./storage.service.js";
import * as whatsapp from "./whatsapp.service.js";
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
async function audit(userId, action, entity, entityId, meta) {
  await execute(
    `INSERT INTO AuditLog (id, userId, action, entity, entityId, meta)
     VALUES (:id, :userId, :action, :entity, :entityId, :meta)`,
    {
      id: id(),
      userId,
      action,
      entity,
      entityId: entityId ?? null,
      meta: meta ? JSON.stringify(meta) : null
    }
  );
}
function ensureAdminRole(actor, targetRole) {
  if (actor.role !== "SUPER_ADMIN" && actor.role !== "ADMIN") {
    throw forbidden("Admin access required", "FORBIDDEN");
  }
  if (targetRole === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") {
    throw forbidden("Super admin access required", "FORBIDDEN");
  }
}
function ensureSuperAdmin(actor) {
  if (actor.role !== "SUPER_ADMIN") {
    throw forbidden("Super admin access required", "FORBIDDEN");
  }
}
async function dashboard() {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const now = /* @__PURE__ */ new Date();
  const [
    totalUsersRow,
    activeUsersRow,
    totalTestsRow,
    activeTestsRow,
    totalAppointmentsRow,
    todayAppointmentsRow,
    pendingReportsRow,
    activeMembershipsRow,
    revenueRow
  ] = await Promise.all([
    queryOne(
      `SELECT COUNT(*) AS cnt FROM User WHERE deletedAt IS NULL AND role = 'USER'`
    ),
    queryOne(
      `SELECT COUNT(*) AS cnt FROM User WHERE deletedAt IS NULL AND role = 'USER' AND isActive = 1`
    ),
    queryOne(`SELECT COUNT(*) AS cnt FROM Test WHERE deletedAt IS NULL`),
    queryOne(
      `SELECT COUNT(*) AS cnt FROM Test WHERE deletedAt IS NULL AND isActive = 1`
    ),
    queryOne(`SELECT COUNT(*) AS cnt FROM Appointment WHERE deletedAt IS NULL`),
    queryOne(
      `SELECT COUNT(*) AS cnt FROM Appointment WHERE deletedAt IS NULL AND date >= :today`,
      { today: todayStr }
    ),
    queryOne(
      `SELECT COUNT(*) AS cnt FROM TestReport WHERE status IN ('PENDING', 'PROCESSING')`
    ),
    queryOne(
      `SELECT COUNT(*) AS cnt FROM Membership WHERE isActive = 1 AND expiresAt > :now`,
      { now }
    ),
    queryOne(
      `SELECT COALESCE(SUM(finalPrice), 0) AS total
       FROM Appointment WHERE deletedAt IS NULL AND paymentStatus = 'PAID'`
    )
  ]);
  const recentRows = await query(
    `SELECT a.*,
            u.fullName AS userFullName, u.email AS userEmail,
            t.name AS testName
     FROM Appointment a
     JOIN User u ON u.id = a.userId
     JOIN Test t ON t.id = a.testId
     WHERE a.deletedAt IS NULL
     ORDER BY a.createdAt DESC
     LIMIT 8`
  );
  const recentAppointments = recentRows.map((r) => ({
    ...mapAppointment(r),
    user: { fullName: r.userFullName, email: r.userEmail },
    test: { name: r.testName }
  }));
  return {
    stats: {
      totalUsers: Number(totalUsersRow?.cnt ?? 0),
      activeUsers: Number(activeUsersRow?.cnt ?? 0),
      totalTests: Number(totalTestsRow?.cnt ?? 0),
      activeTests: Number(activeTestsRow?.cnt ?? 0),
      totalAppointments: Number(totalAppointmentsRow?.cnt ?? 0),
      todayAppointments: Number(todayAppointmentsRow?.cnt ?? 0),
      pendingReports: Number(pendingReportsRow?.cnt ?? 0),
      activeMemberships: Number(activeMembershipsRow?.cnt ?? 0),
      totalRevenue: num(revenueRow?.total)
    },
    recentAppointments
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
function mapTest(r, category) {
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
    deletedAt: r.deletedAt,
    ...category ? {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: bool(category.isActive),
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        deletedAt: category.deletedAt
      }
    } : {}
  };
}
async function listUsers(queryParams) {
  const page = Math.max(1, Number(queryParams.page) || 1);
  const limit = Math.min(100, Math.max(10, Number(queryParams.limit) || 25));
  const skip = (page - 1) * limit;
  const clauses = ["deletedAt IS NULL"];
  const params = { limit, skip };
  if (queryParams.q) {
    clauses.push("(fullName LIKE :q OR email LIKE :q OR mobile LIKE :q)");
    params.q = `%${queryParams.q}%`;
  }
  if (queryParams.role) {
    clauses.push("role = :role");
    params.role = queryParams.role;
  }
  if (queryParams.active === "true") clauses.push("isActive = 1");
  if (queryParams.active === "false") clauses.push("isActive = 0");
  const where = `WHERE ${clauses.join(" AND ")}`;
  const items = await query(
    `SELECT id, fullName, email, mobile, role, isActive, gender, createdAt,
            (SELECT COUNT(*) FROM Appointment a WHERE a.userId = User.id) AS appointmentsCount,
            (SELECT COUNT(*) FROM Membership m WHERE m.userId = User.id) AS membershipsCount
     FROM User
     ${where}
     ORDER BY createdAt DESC
     LIMIT :limit OFFSET :skip`,
    params
  );
  const countRow = await queryOne(
    `SELECT COUNT(*) AS cnt FROM User ${where}`,
    params
  );
  const total = Number(countRow?.cnt ?? 0);
  return {
    items: items.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      mobile: u.mobile,
      role: u.role,
      isActive: bool(u.isActive),
      gender: u.gender,
      createdAt: u.createdAt,
      _count: {
        appointments: Number(u.appointmentsCount),
        memberships: Number(u.membershipsCount)
      }
    })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
}
async function getUser(userId) {
  const user = await queryOne(
    `SELECT * FROM User WHERE id = :id AND deletedAt IS NULL`,
    { id: userId }
  );
  if (!user) throw notFound("User not found", "USER_NOT_FOUND");
  const [addresses, familyMembers, memberships, appointments, notifications] = await Promise.all([
    query(`SELECT * FROM Address WHERE userId = :userId`, { userId }),
    query(`SELECT * FROM FamilyMember WHERE userId = :userId`, { userId }),
    query(
      `SELECT m.*, p.id AS planId_p, p.name AS planName, p.slug AS planSlug, p.price AS planPrice,
              p.durationDays, p.description AS planDescription, p.isFree, p.flatDiscountPercent,
              p.maxFamilyMembers, p.isActive AS planIsActive, p.createdAt AS planCreatedAt,
              p.updatedAt AS planUpdatedAt
       FROM Membership m
       JOIN MembershipPlan p ON p.id = m.planId
       WHERE m.userId = :userId
       ORDER BY m.createdAt DESC`,
      { userId }
    ),
    query(
      `SELECT a.*, t.name AS testName
       FROM Appointment a
       JOIN Test t ON t.id = a.testId
       WHERE a.userId = :userId AND a.deletedAt IS NULL
       ORDER BY a.createdAt DESC
       LIMIT 20`,
      { userId }
    ),
    query(
      `SELECT * FROM Notification WHERE userId = :userId ORDER BY createdAt DESC LIMIT 10`,
      { userId }
    )
  ]);
  const membershipIds = memberships.map((m) => m.id);
  const members = membershipIds.length > 0 ? await query(
    `SELECT * FROM MembershipMember WHERE membershipId IN (${membershipIds.map(() => "?").join(",")})`,
    membershipIds
  ) : [];
  const appointmentIds = appointments.map((a) => a.id);
  const reports = appointmentIds.length > 0 ? await query(
    `SELECT * FROM TestReport WHERE appointmentId IN (${appointmentIds.map(() => "?").join(",")})`,
    appointmentIds
  ) : [];
  const { passwordHash: _pw, ...safe } = user;
  void _pw;
  return {
    ...safe,
    isActive: bool(user.isActive),
    addresses: addresses.map((a) => ({
      ...a,
      isPrimary: bool(a.isPrimary),
      latitude: a.latitude != null ? num(a.latitude) : null,
      longitude: a.longitude != null ? num(a.longitude) : null
    })),
    familyMembers,
    memberships: memberships.map((m) => ({
      id: m.id,
      userId: m.userId,
      planId: m.planId,
      number: m.number,
      startsAt: m.startsAt,
      expiresAt: m.expiresAt,
      isActive: bool(m.isActive),
      createdAt: m.createdAt,
      plan: {
        id: m.planId_p,
        name: m.planName,
        slug: m.planSlug,
        price: num(m.planPrice),
        durationDays: m.durationDays,
        description: m.planDescription,
        isFree: bool(m.isFree),
        flatDiscountPercent: num(m.flatDiscountPercent),
        maxFamilyMembers: m.maxFamilyMembers,
        isActive: bool(m.planIsActive),
        createdAt: m.planCreatedAt,
        updatedAt: m.planUpdatedAt
      },
      members: members.filter((mm) => mm.membershipId === m.id).map((mm) => ({
        ...mm,
        isPrimary: bool(mm.isPrimary)
      }))
    })),
    appointments: appointments.map((a) => ({
      ...mapAppointment(a),
      test: { name: a.testName },
      reports: reports.filter((r) => r.appointmentId === a.id).map(mapReport)
    })),
    notifications: notifications.map((n) => ({
      ...n,
      isRead: bool(n.isRead)
    }))
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
async function updateUser(actor, userId, data) {
  ensureAdminRole(actor, data.role);
  const target = await queryOne(`SELECT * FROM User WHERE id = :id`, { id: userId });
  if (!target) throw notFound("User not found", "USER_NOT_FOUND");
  if (data.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") {
    throw forbidden("Only super admin can assign super admin role", "FORBIDDEN");
  }
  if (target.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") {
    throw forbidden("Cannot modify super admin", "FORBIDDEN");
  }
  if (userId === actor.id && data.isActive === false) {
    throw badRequest("You cannot deactivate your own account", "SELF_DEACTIVATE");
  }
  if (data.isActive === false && (target.role === "ADMIN" || target.role === "SUPER_ADMIN")) {
    const adminCount = await queryOne(
      `SELECT COUNT(*) AS cnt FROM User
       WHERE role IN ('ADMIN', 'SUPER_ADMIN') AND isActive = 1 AND deletedAt IS NULL AND id <> :id`,
      { id: userId }
    );
    if (Number(adminCount?.cnt ?? 0) < 1) {
      throw badRequest("At least one active admin must remain", "LAST_ADMIN");
    }
  }
  await execute(
    `UPDATE User SET
      fullName = COALESCE(:fullName, fullName),
      email = COALESCE(:email, email),
      mobile = COALESCE(:mobile, mobile),
      isActive = COALESCE(:isActive, isActive),
      role = COALESCE(:role, role),
      gender = COALESCE(:gender, gender)
     WHERE id = :id`,
    {
      id: userId,
      fullName: data.fullName ?? null,
      email: data.email ?? null,
      mobile: data.mobile ?? null,
      isActive: data.isActive == null ? null : data.isActive ? 1 : 0,
      role: data.role ?? null,
      gender: data.gender ?? null
    }
  );
  const updated = await queryOne(
    `SELECT id, fullName, email, mobile, role, isActive, createdAt FROM User WHERE id = :id`,
    { id: userId }
  );
  await audit(actor.id, "UPDATE_USER", "User", userId, data);
  return {
    ...updated,
    isActive: bool(updated.isActive)
  };
}
async function listTests(queryParams) {
  const clauses = ["t.deletedAt IS NULL"];
  const params = {};
  if (queryParams.q) {
    clauses.push("t.name LIKE :q");
    params.q = `%${queryParams.q}%`;
  }
  if (queryParams.categoryId) {
    clauses.push("t.categoryId = :categoryId");
    params.categoryId = queryParams.categoryId;
  }
  if (queryParams.active === "true") clauses.push("t.isActive = 1");
  if (queryParams.active === "false") clauses.push("t.isActive = 0");
  const rows = await query(
    `SELECT t.*,
            c.id AS catId, c.name AS catName, c.slug AS catSlug, c.description AS catDescription,
            c.isActive AS catIsActive, c.createdAt AS catCreatedAt, c.updatedAt AS catUpdatedAt,
            c.deletedAt AS catDeletedAt
     FROM Test t
     JOIN TestCategory c ON c.id = t.categoryId
     WHERE ${clauses.join(" AND ")}
     ORDER BY t.name ASC`,
    params
  );
  return rows.map(
    (r) => mapTest(r, {
      id: r.catId,
      name: r.catName,
      slug: r.catSlug,
      description: r.catDescription,
      isActive: r.catIsActive,
      createdAt: r.catCreatedAt,
      updatedAt: r.catUpdatedAt,
      deletedAt: r.catDeletedAt
    })
  );
}
async function createTest(actorId, dto) {
  const discountPercent = dto.discountPercent ?? (dto.specialPrice != null && dto.price > 0 ? Math.round((1 - dto.specialPrice / dto.price) * 1e4) / 100 : 0);
  const testId = id();
  await execute(
    `INSERT INTO Test
      (id, name, slug, categoryId, shortDescription, description, preparation, sampleType,
       reportHours, price, discountPercent, membershipEligible, membershipFree, isPopular, isActive, faqs)
     VALUES
      (:id, :name, :slug, :categoryId, :shortDescription, :description, :preparation, :sampleType,
       :reportHours, :price, :discountPercent, :membershipEligible, :membershipFree, :isPopular, :isActive, :faqs)`,
    {
      id: testId,
      name: dto.name,
      slug: slugify(dto.name),
      categoryId: dto.categoryId,
      shortDescription: dto.shortDescription,
      description: dto.description,
      preparation: dto.preparation,
      sampleType: dto.sampleType,
      reportHours: dto.reportHours ?? 24,
      price: dto.price,
      discountPercent,
      membershipEligible: dto.membershipEligible ?? true ? 1 : 0,
      membershipFree: dto.membershipFree ?? false ? 1 : 0,
      isPopular: dto.isPopular ?? false ? 1 : 0,
      isActive: dto.isActive ?? true ? 1 : 0,
      faqs: JSON.stringify([])
    }
  );
  await audit(actorId, "CREATE_TEST", "Test", testId, { name: dto.name });
  const [created] = await listTests({ q: void 0 });
  const row = await queryOne(
    `SELECT t.*,
            c.id AS catId, c.name AS catName, c.slug AS catSlug, c.description AS catDescription,
            c.isActive AS catIsActive, c.createdAt AS catCreatedAt, c.updatedAt AS catUpdatedAt,
            c.deletedAt AS catDeletedAt
     FROM Test t
     JOIN TestCategory c ON c.id = t.categoryId
     WHERE t.id = :id`,
    { id: testId }
  );
  void created;
  return mapTest(row, {
    id: row.catId,
    name: row.catName,
    slug: row.catSlug,
    description: row.catDescription,
    isActive: row.catIsActive,
    createdAt: row.catCreatedAt,
    updatedAt: row.catUpdatedAt,
    deletedAt: row.catDeletedAt
  });
}
async function updateTest(actorId, testId, dto) {
  const existing = await queryOne(`SELECT * FROM Test WHERE id = :id`, { id: testId });
  if (!existing) throw notFound("Test not found", "TEST_NOT_FOUND");
  const price = dto.price != null ? Number(dto.price) : num(existing.price);
  let discountPercent = dto.discountPercent != null ? Number(dto.discountPercent) : num(existing.discountPercent);
  if (dto.specialPrice != null && price > 0) {
    discountPercent = Math.round((1 - Number(dto.specialPrice) / price) * 1e4) / 100;
  }
  await execute(
    `UPDATE Test SET
      name = COALESCE(:name, name),
      categoryId = COALESCE(:categoryId, categoryId),
      shortDescription = COALESCE(:shortDescription, shortDescription),
      description = COALESCE(:description, description),
      preparation = COALESCE(:preparation, preparation),
      sampleType = COALESCE(:sampleType, sampleType),
      reportHours = COALESCE(:reportHours, reportHours),
      price = :price,
      discountPercent = :discountPercent,
      membershipEligible = COALESCE(:membershipEligible, membershipEligible),
      membershipFree = COALESCE(:membershipFree, membershipFree),
      isPopular = COALESCE(:isPopular, isPopular),
      isActive = COALESCE(:isActive, isActive),
      slug = COALESCE(:slug, slug)
     WHERE id = :id`,
    {
      id: testId,
      name: dto.name ?? null,
      slug: dto.name ? slugify(String(dto.name)) : null,
      categoryId: dto.categoryId ?? null,
      shortDescription: dto.shortDescription ?? null,
      description: dto.description ?? null,
      preparation: dto.preparation ?? null,
      sampleType: dto.sampleType ?? null,
      reportHours: dto.reportHours != null ? Number(dto.reportHours) : null,
      price,
      discountPercent,
      membershipEligible: dto.membershipEligible == null ? null : dto.membershipEligible ? 1 : 0,
      membershipFree: dto.membershipFree == null ? null : dto.membershipFree ? 1 : 0,
      isPopular: dto.isPopular == null ? null : dto.isPopular ? 1 : 0,
      isActive: dto.isActive == null ? null : dto.isActive ? 1 : 0
    }
  );
  await audit(actorId, "UPDATE_TEST", "Test", testId, dto);
  const row = await queryOne(
    `SELECT t.*,
            c.id AS catId, c.name AS catName, c.slug AS catSlug, c.description AS catDescription,
            c.isActive AS catIsActive, c.createdAt AS catCreatedAt, c.updatedAt AS catUpdatedAt,
            c.deletedAt AS catDeletedAt
     FROM Test t
     JOIN TestCategory c ON c.id = t.categoryId
     WHERE t.id = :id`,
    { id: testId }
  );
  return mapTest(row, {
    id: row.catId,
    name: row.catName,
    slug: row.catSlug,
    description: row.catDescription,
    isActive: row.catIsActive,
    createdAt: row.catCreatedAt,
    updatedAt: row.catUpdatedAt,
    deletedAt: row.catDeletedAt
  });
}
async function listCategories() {
  const rows = await query(
    `SELECT c.*,
            (SELECT COUNT(*) FROM Test t WHERE t.categoryId = c.id AND t.deletedAt IS NULL) AS testsCount
     FROM TestCategory c
     WHERE c.deletedAt IS NULL
     ORDER BY c.name ASC`
  );
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    isActive: bool(c.isActive),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    deletedAt: c.deletedAt,
    _count: { tests: Number(c.testsCount) }
  }));
}
async function createCategory(actorId, body) {
  const catId = id();
  await execute(
    `INSERT INTO TestCategory (id, name, slug, description)
     VALUES (:id, :name, :slug, :description)`,
    {
      id: catId,
      name: body.name,
      slug: slugify(body.name),
      description: body.description ?? null
    }
  );
  await audit(actorId, "CREATE_CATEGORY", "TestCategory", catId, body);
  const cat = await queryOne(`SELECT * FROM TestCategory WHERE id = :id`, {
    id: catId
  });
  return {
    ...cat,
    isActive: bool(cat.isActive)
  };
}
async function updateCategory(actorId, catId, body) {
  await execute(
    `UPDATE TestCategory SET
      name = COALESCE(:name, name),
      description = COALESCE(:description, description),
      isActive = COALESCE(:isActive, isActive),
      slug = COALESCE(:slug, slug)
     WHERE id = :id`,
    {
      id: catId,
      name: body.name ?? null,
      slug: body.name ? slugify(body.name) : null,
      description: body.description ?? null,
      isActive: body.isActive == null ? null : body.isActive ? 1 : 0
    }
  );
  await audit(actorId, "UPDATE_CATEGORY", "TestCategory", catId, body);
  const cat = await queryOne(`SELECT * FROM TestCategory WHERE id = :id`, {
    id: catId
  });
  if (!cat) throw notFound("Category not found", "NOT_FOUND");
  return { ...cat, isActive: bool(cat.isActive) };
}
async function listAppointments(queryParams) {
  const clauses = ["a.deletedAt IS NULL"];
  const params = {};
  if (queryParams.status) {
    clauses.push("a.status = :status");
    params.status = queryParams.status;
  }
  if (queryParams.payment) {
    clauses.push("a.paymentStatus = :payment");
    params.payment = queryParams.payment;
  }
  if (queryParams.q) {
    clauses.push(
      `(a.code LIKE :q OR a.patientName LIKE :q OR u.fullName LIKE :q OR u.email LIKE :q)`
    );
    params.q = `%${queryParams.q}%`;
  }
  const rows = await query(
    `SELECT a.*,
            u.id AS userId_u, u.fullName AS userFullName, u.email AS userEmail, u.mobile AS userMobile,
            t.id AS testId_t, t.name AS testName, t.price AS testPrice
     FROM Appointment a
     JOIN User u ON u.id = a.userId
     JOIN Test t ON t.id = a.testId
     WHERE ${clauses.join(" AND ")}
     ORDER BY a.createdAt DESC
     LIMIT 200`,
    params
  );
  const appointmentIds = rows.map((r) => r.id);
  const reports = appointmentIds.length > 0 ? await query(
    `SELECT * FROM TestReport WHERE appointmentId IN (${appointmentIds.map(() => "?").join(",")})`,
    appointmentIds
  ) : [];
  return rows.map((r) => ({
    ...mapAppointment(r),
    user: {
      id: r.userId_u,
      fullName: r.userFullName,
      email: r.userEmail,
      mobile: r.userMobile
    },
    test: {
      id: r.testId_t,
      name: r.testName,
      price: num(r.testPrice)
    },
    reports: reports.filter((rep) => rep.appointmentId === r.id).map(mapReport)
  }));
}
async function updateAppointmentStatus(actorId, appointmentId, status) {
  await execute(`UPDATE Appointment SET status = :status WHERE id = :id`, {
    status,
    id: appointmentId
  });
  await audit(actorId, "UPDATE_STATUS", "Appointment", appointmentId, { status });
  const row = await queryOne(`SELECT * FROM Appointment WHERE id = :id`, {
    id: appointmentId
  });
  if (!row) throw notFound("Appointment not found", "NOT_FOUND");
  return mapAppointment(row);
}
async function updateAppointmentPayment(actorId, appointmentId, data) {
  await execute(
    `UPDATE Appointment SET
      paymentStatus = :paymentStatus,
      paymentMethod = COALESCE(:paymentMethod, paymentMethod)
     WHERE id = :id`,
    {
      id: appointmentId,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod ?? null
    }
  );
  await audit(actorId, "UPDATE_PAYMENT", "Appointment", appointmentId, data);
  const row = await queryOne(`SELECT * FROM Appointment WHERE id = :id`, {
    id: appointmentId
  });
  if (!row) throw notFound("Appointment not found", "NOT_FOUND");
  return mapAppointment(row);
}
async function listMemberships(queryParams) {
  const clauses = ["1=1"];
  const params = {};
  const now = /* @__PURE__ */ new Date();
  if (queryParams.active === "true") {
    clauses.push("m.isActive = 1 AND m.expiresAt > :now");
    params.now = now;
  } else if (queryParams.active === "false") {
    clauses.push("(m.isActive = 0 OR m.expiresAt <= :now)");
    params.now = now;
  }
  const rows = await query(
    `SELECT m.*,
            u.id AS userId_u, u.fullName AS userFullName, u.email AS userEmail, u.mobile AS userMobile,
            p.id AS planId_p, p.name AS planName, p.slug AS planSlug, p.price AS planPrice,
            p.durationDays, p.description AS planDescription, p.isFree, p.flatDiscountPercent,
            p.maxFamilyMembers, p.isActive AS planIsActive, p.createdAt AS planCreatedAt,
            p.updatedAt AS planUpdatedAt
     FROM Membership m
     JOIN User u ON u.id = m.userId
     JOIN MembershipPlan p ON p.id = m.planId
     WHERE ${clauses.join(" AND ")}
     ORDER BY m.createdAt DESC`,
    params
  );
  const membershipIds = rows.map((r) => r.id);
  const members = membershipIds.length > 0 ? await query(
    `SELECT * FROM MembershipMember WHERE membershipId IN (${membershipIds.map(() => "?").join(",")})`,
    membershipIds
  ) : [];
  return rows.map((m) => ({
    id: m.id,
    userId: m.userId,
    planId: m.planId,
    number: m.number,
    startsAt: m.startsAt,
    expiresAt: m.expiresAt,
    isActive: bool(m.isActive),
    createdAt: m.createdAt,
    user: {
      id: m.userId_u,
      fullName: m.userFullName,
      email: m.userEmail,
      mobile: m.userMobile
    },
    plan: {
      id: m.planId_p,
      name: m.planName,
      slug: m.planSlug,
      price: num(m.planPrice),
      durationDays: m.durationDays,
      description: m.planDescription,
      isFree: bool(m.isFree),
      flatDiscountPercent: num(m.flatDiscountPercent),
      maxFamilyMembers: m.maxFamilyMembers,
      isActive: bool(m.planIsActive),
      createdAt: m.planCreatedAt,
      updatedAt: m.planUpdatedAt
    },
    members: members.filter((mm) => mm.membershipId === m.id).map((mm) => ({ ...mm, isPrimary: bool(mm.isPrimary) }))
  }));
}
async function listPlans() {
  const plans = await query(`SELECT * FROM MembershipPlan ORDER BY price ASC`);
  const benefits = await query(`SELECT * FROM MembershipBenefit`);
  const counts = await query(
    `SELECT planId, COUNT(*) AS cnt FROM Membership GROUP BY planId`
  );
  const countMap = new Map(counts.map((c) => [c.planId, Number(c.cnt)]));
  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: num(p.price),
    durationDays: p.durationDays,
    description: p.description,
    isFree: bool(p.isFree),
    flatDiscountPercent: num(p.flatDiscountPercent),
    maxFamilyMembers: p.maxFamilyMembers,
    isActive: bool(p.isActive),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    benefits: benefits.filter((b) => b.planId === p.id).map((b) => ({
      ...b,
      freeTest: bool(b.freeTest)
    })),
    _count: { memberships: countMap.get(p.id) ?? 0 }
  }));
}
async function grantMembership(actorId, body) {
  const plan = await queryOne(`SELECT * FROM MembershipPlan WHERE id = :id`, {
    id: body.planId
  });
  if (!plan) throw notFound("Plan not found", "NOT_FOUND");
  const user = await queryOne(`SELECT * FROM User WHERE id = :id`, {
    id: body.userId
  });
  if (!user) throw notFound("User not found", "USER_NOT_FOUND");
  const startsAt = /* @__PURE__ */ new Date();
  const expiresAt = /* @__PURE__ */ new Date();
  expiresAt.setMonth(expiresAt.getMonth() + (body.months ?? Math.round(Number(plan.durationDays) / 30)));
  const number = `HIC-${String(user.fullName).split(" ")[0].toUpperCase().slice(0, 4)}${String(Date.now()).slice(-4)}`;
  const membershipId = id();
  const memberId = id();
  await execute(
    `INSERT INTO Membership (id, userId, planId, number, startsAt, expiresAt, isActive)
     VALUES (:id, :userId, :planId, :number, :startsAt, :expiresAt, 1)`,
    {
      id: membershipId,
      userId: body.userId,
      planId: body.planId,
      number,
      startsAt,
      expiresAt
    }
  );
  await execute(
    `INSERT INTO MembershipMember (id, membershipId, name, relation, isPrimary)
     VALUES (:id, :membershipId, :name, 'Self', 1)`,
    { id: memberId, membershipId, name: user.fullName }
  );
  await audit(actorId, "GRANT_MEMBERSHIP", "Membership", membershipId, body);
  return {
    id: membershipId,
    userId: body.userId,
    planId: body.planId,
    number,
    startsAt,
    expiresAt,
    isActive: true,
    plan: {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      price: num(plan.price),
      durationDays: plan.durationDays,
      description: plan.description,
      isFree: bool(plan.isFree),
      flatDiscountPercent: num(plan.flatDiscountPercent),
      maxFamilyMembers: plan.maxFamilyMembers,
      isActive: bool(plan.isActive),
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    },
    user: { fullName: user.fullName, email: user.email }
  };
}
async function listReports(queryParams) {
  const clauses = ["1=1"];
  const params = {};
  if (queryParams.status) {
    clauses.push("r.status = :status");
    params.status = queryParams.status;
  }
  const rows = await query(
    `SELECT r.*,
            u.fullName AS userFullName, u.email AS userEmail,
            a.id AS apptId, a.code AS apptCode, a.date AS apptDate, a.timeSlot AS apptTimeSlot,
            a.userId AS apptUserId, a.testId AS apptTestId, a.status AS apptStatus,
            a.patientName AS apptPatientName, a.paymentStatus AS apptPaymentStatus,
            t.name AS testName
     FROM TestReport r
     JOIN User u ON u.id = r.userId
     JOIN Appointment a ON a.id = r.appointmentId
     JOIN Test t ON t.id = a.testId
     WHERE ${clauses.join(" AND ")}
     ORDER BY r.createdAt DESC
     LIMIT 200`,
    params
  );
  return rows.map((r) => ({
    ...mapReport(r),
    user: { fullName: r.userFullName, email: r.userEmail },
    appointment: {
      id: r.apptId,
      code: r.apptCode,
      date: r.apptDate,
      timeSlot: r.apptTimeSlot,
      userId: r.apptUserId,
      testId: r.apptTestId,
      status: r.apptStatus,
      patientName: r.apptPatientName,
      paymentStatus: r.apptPaymentStatus,
      test: { name: r.testName }
    }
  }));
}
async function uploadReport(dto) {
  if (!dto.storagePath) {
    throw badRequest("Report file is required", "FILE_REQUIRED");
  }
  const appointment = await queryOne(
    `SELECT a.*, t.name AS testName
     FROM Appointment a
     JOIN Test t ON t.id = a.testId
     WHERE a.id = :id`,
    { id: dto.appointmentId }
  );
  if (!appointment) throw notFound("Appointment not found", "NOT_FOUND");
  const existing = await queryOne(
    `SELECT * FROM TestReport WHERE appointmentId = :appointmentId LIMIT 1`,
    { appointmentId: dto.appointmentId }
  );
  const releasedAt = /* @__PURE__ */ new Date();
  let reportId;
  if (existing) {
    reportId = existing.id;
    await execute(
      `UPDATE TestReport SET
        status = 'AVAILABLE',
        fileUrl = :fileUrl,
        fileName = :fileName,
        fileMimeType = :fileMimeType,
        fileSize = :fileSize,
        summary = :summary,
        releasedAt = :releasedAt
       WHERE id = :id`,
      {
        id: reportId,
        fileUrl: dto.storagePath,
        fileName: dto.fileName ?? null,
        fileMimeType: dto.fileMimeType ?? null,
        fileSize: dto.fileSize ?? null,
        summary: dto.summary ?? null,
        releasedAt
      }
    );
  } else {
    reportId = id();
    await execute(
      `INSERT INTO TestReport
        (id, userId, appointmentId, status, fileUrl, fileName, fileMimeType, fileSize, summary, releasedAt)
       VALUES
        (:id, :userId, :appointmentId, 'AVAILABLE', :fileUrl, :fileName, :fileMimeType, :fileSize, :summary, :releasedAt)`,
      {
        id: reportId,
        userId: appointment.userId,
        appointmentId: appointment.id,
        fileUrl: dto.storagePath,
        fileName: dto.fileName ?? null,
        fileMimeType: dto.fileMimeType ?? null,
        fileSize: dto.fileSize ?? null,
        summary: dto.summary ?? null,
        releasedAt
      }
    );
  }
  const body = `Your ${appointment.testName} report is ready. ${dto.summary ?? "Open HealthID Card to view and download."}`;
  await execute(
    `INSERT INTO Notification (id, userId, type, title, body)
     VALUES (:id, :userId, 'REPORT_AVAILABLE', 'Report available', :body)`,
    { id: id(), userId: appointment.userId, body }
  );
  await whatsapp.send(appointment.userId, "report_available", body);
  const report = await queryOne(`SELECT * FROM TestReport WHERE id = :id`, {
    id: reportId
  });
  return mapReport(report);
}
async function getReportFile(reportId) {
  const report = await queryOne(
    `SELECT r.*, a.code AS appointmentCode
     FROM TestReport r
     JOIN Appointment a ON a.id = r.appointmentId
     WHERE r.id = :id`,
    { id: reportId }
  );
  if (!report?.fileUrl) {
    throw notFound("Report file not found", "NOT_FOUND");
  }
  const absolute = storage.resolveAbsolute(String(report.fileUrl));
  if (!existsSync(absolute)) {
    throw notFound("Report file missing on server", "FILE_MISSING");
  }
  return {
    stream: createReadStream(absolute),
    fileName: report.fileName ?? `${report.appointmentCode}-report.pdf`,
    mimeType: report.fileMimeType ?? "application/octet-stream"
  };
}
function getPaymentInvoice(paymentId) {
  return invoiceService.getForAdmin(paymentId);
}
async function listAuditLogs(queryParams) {
  const page = Math.max(1, Number(queryParams.page) || 1);
  const limit = 50;
  const skip = (page - 1) * limit;
  const clauses = ["1=1"];
  const params = { limit, skip };
  if (queryParams.entity) {
    clauses.push("a.entity = :entity");
    params.entity = queryParams.entity;
  }
  const where = `WHERE ${clauses.join(" AND ")}`;
  const items = await query(
    `SELECT a.*,
            u.fullName AS userFullName, u.email AS userEmail, u.role AS userRole
     FROM AuditLog a
     LEFT JOIN User u ON u.id = a.userId
     ${where}
     ORDER BY a.createdAt DESC
     LIMIT :limit OFFSET :skip`,
    params
  );
  const countRow = await queryOne(
    `SELECT COUNT(*) AS cnt FROM AuditLog a ${where}`,
    params
  );
  const total = Number(countRow?.cnt ?? 0);
  return {
    items: items.map((a) => ({
      id: a.id,
      userId: a.userId,
      action: a.action,
      entity: a.entity,
      entityId: a.entityId,
      meta: parseJson(a.meta, null),
      createdAt: a.createdAt,
      user: a.userFullName ? { fullName: a.userFullName, email: a.userEmail, role: a.userRole } : null
    })),
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}
async function listWhatsAppMessages() {
  const rows = await query(
    `SELECT w.*, u.fullName AS userFullName, u.mobile AS userMobile
     FROM WhatsAppMessage w
     JOIN User u ON u.id = w.userId
     ORDER BY w.createdAt DESC
     LIMIT 100`
  );
  return rows.map((w) => ({
    id: w.id,
    userId: w.userId,
    mobile: w.mobile,
    template: w.template,
    body: w.body,
    status: w.status,
    createdAt: w.createdAt,
    user: { fullName: w.userFullName, mobile: w.userMobile }
  }));
}
function getPricingSettings() {
  return platformSettings.getPricingSettings();
}
async function updatePricingSettings(actor, dto) {
  ensureSuperAdmin(actor);
  const updated = await platformSettings.updatePricingSettings(actor.id, dto);
  await audit(actor.id, "UPDATE_PRICING_SETTINGS", "PlatformSettings", "default", dto);
  return updated;
}
function listPayments(queryParams) {
  return paymentLedger.listForAdmin({
    q: queryParams.q,
    status: queryParams.status,
    method: queryParams.method,
    page: queryParams.page ? Number(queryParams.page) : 1,
    limit: queryParams.limit ? Number(queryParams.limit) : 25
  });
}
function getPayment(paymentId) {
  return paymentLedger.getForAdmin(paymentId);
}
async function updatePaymentStatus(actorId, paymentId, status) {
  const updated = await paymentLedger.updateStatus(paymentId, status);
  await audit(actorId, "UPDATE_PAYMENT_STATUS", "PaymentTransaction", paymentId, { status });
  return updated;
}
export {
  createCategory,
  createTest,
  dashboard,
  getPayment,
  getPaymentInvoice,
  getPricingSettings,
  getReportFile,
  getUser,
  grantMembership,
  listAppointments,
  listAuditLogs,
  listCategories,
  listMemberships,
  listPayments,
  listPlans,
  listReports,
  listTests,
  listUsers,
  listWhatsAppMessages,
  updateAppointmentPayment,
  updateAppointmentStatus,
  updateCategory,
  updatePaymentStatus,
  updatePricingSettings,
  updateTest,
  updateUser,
  uploadReport
};
