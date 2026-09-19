import { query, queryOne, num, bool } from '../config/database.js'

export const overview = async (userId) => {
  const [upcoming, completed, cancelled] = await Promise.all([
    queryOne(
      `SELECT COUNT(*) AS cnt FROM Appointment
       WHERE userId = :userId AND status IN ('CONFIRMED','RESCHEDULED','PENDING') AND deletedAt IS NULL`,
      { userId },
    ),
    queryOne(
      `SELECT COUNT(*) AS cnt FROM Appointment WHERE userId = :userId AND status = 'COMPLETED' AND deletedAt IS NULL`,
      { userId },
    ),
    queryOne(
      `SELECT COUNT(*) AS cnt FROM Appointment WHERE userId = :userId AND status = 'CANCELLED' AND deletedAt IS NULL`,
      { userId },
    ),
  ])
  const membership = await queryOne(
    `SELECT m.*, p.name AS planName, p.flatDiscountPercent, p.maxFamilyMembers, p.slug AS planSlug
     FROM Membership m
     JOIN MembershipPlan p ON p.id = m.planId
     WHERE m.userId = :userId AND m.isActive = 1 AND m.expiresAt > NOW(3)
     LIMIT 1`,
    { userId },
  )
  const recent = await query(
    `SELECT a.*, t.id AS t_id, t.name AS t_name, t.slug AS t_slug
     FROM Appointment a JOIN Test t ON t.id = a.testId
     WHERE a.userId = :userId AND a.deletedAt IS NULL
     ORDER BY a.createdAt DESC LIMIT 5`,
    { userId },
  )
  const popular = await query(
    `SELECT t.*, c.id AS c_id, c.name AS c_name, c.slug AS c_slug
     FROM Test t JOIN TestCategory c ON c.id = t.categoryId
     WHERE t.isActive = 1 AND t.isPopular = 1 AND t.isPackage = 0 AND t.deletedAt IS NULL
     LIMIT 6`,
  )
  const packages = await query(
    `SELECT t.*, c.id AS c_id, c.name AS c_name, c.slug AS c_slug
     FROM Test t JOIN TestCategory c ON c.id = t.categoryId
     WHERE t.isActive = 1 AND t.isPackage = 1 AND t.deletedAt IS NULL
     ORDER BY t.isPopular DESC LIMIT 6`,
  )
  const next = await queryOne(
    `SELECT a.*, t.id AS t_id, t.name AS t_name, t.slug AS t_slug
     FROM Appointment a JOIN Test t ON t.id = a.testId
     WHERE a.userId = :userId
       AND a.status IN ('CONFIRMED','RESCHEDULED')
       AND a.date >= CURDATE()
       AND a.deletedAt IS NULL
     ORDER BY a.date ASC LIMIT 1`,
    { userId },
  )

  const mapAppt = (a) =>
    a
      ? {
          ...a,
          originalPrice: a.originalPrice != null ? num(a.originalPrice) : null,
          finalPrice: a.finalPrice != null ? num(a.finalPrice) : null,
          payableAmount: a.payableAmount != null ? num(a.payableAmount) : null,
          test: { id: a.t_id, name: a.t_name, slug: a.t_slug },
        }
      : null

  const mapTest = (t) => ({
    ...t,
    price: num(t.price),
    discountPercent: num(t.discountPercent),
    isPopular: bool(t.isPopular),
    isPackage: bool(t.isPackage),
    category: { id: t.c_id, name: t.c_name, slug: t.c_slug },
  })

  return {
    stats: {
      upcoming: Number(upcoming?.cnt ?? 0),
      completed: Number(completed?.cnt ?? 0),
      cancelled: Number(cancelled?.cnt ?? 0),
      membership: membership ? membership.planName : 'None',
    },
    membership: membership
      ? {
          ...membership,
          isActive: bool(membership.isActive),
          plan: {
            name: membership.planName,
            slug: membership.planSlug,
            flatDiscountPercent: num(membership.flatDiscountPercent),
            maxFamilyMembers: membership.maxFamilyMembers,
          },
        }
      : null,
    upcomingAppointment: mapAppt(next),
    recent: recent.map(mapAppt),
    popularTests: popular.map(mapTest),
    healthPackages: packages.map(mapTest),
  }
}
