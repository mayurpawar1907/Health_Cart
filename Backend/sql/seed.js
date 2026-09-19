/**
 * Optional demo-user seed. Does NOT wipe or re-insert the lab catalog —
 * your MySQL data (tests, packages, plans) is the source of truth.
 *
 * Usage: npm run db:seed
 */
import bcrypt from 'bcrypt'
import { closePool, execute, queryOne } from '../src/config/database.js'
import { id } from '../src/utils/id.js'

const ensureUser = async ({ fullName, email, mobile, password, role = 'USER', referralCode }) => {
  const existing = await queryOne(`SELECT id FROM User WHERE email = :email LIMIT 1`, { email })
  if (existing) {
    console.log(`skip user ${email} (already exists)`)
    return existing.id
  }
  const userId = id()
  await execute(
    `INSERT INTO User (id, fullName, email, mobile, passwordHash, role, referralCode)
     VALUES (:id, :fullName, :email, :mobile, :passwordHash, :role, :referralCode)`,
    {
      id: userId,
      fullName,
      email,
      mobile,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      referralCode: referralCode ?? null,
    },
  )
  await execute(`INSERT INTO UserProfile (id, userId) VALUES (:id, :userId)`, {
    id: id(),
    userId,
  })
  console.log(`created user ${email}`)
  return userId
}

const main = async () => {
  await ensureUser({
    fullName: 'Mayur Pawar',
    email: 'mayur@healthcart.com',
    mobile: '9876543210',
    password: 'Demo@1234',
    referralCode: 'MAYUR9K2',
  })
  await ensureUser({
    fullName: 'HealthCart Admin',
    email: 'admin@healthcart.com',
    mobile: '9999999999',
    password: 'Admin@1234',
    role: 'ADMIN',
  })
  await ensureUser({
    fullName: 'Super Admin',
    email: 'superadmin@healthidcard.com',
    mobile: '9888888888',
    password: 'Super@1234',
    role: 'SUPER_ADMIN',
  })

  const settings = await queryOne(`SELECT id FROM PlatformSettings WHERE id = 'default'`)
  if (!settings) {
    await execute(
      `INSERT INTO PlatformSettings
        (id, paymentPromoPercent, paymentPromoActive, paymentPromoApplyToAllUsers, promoLabel)
       VALUES ('default', 30, 1, 1, 'Extra 30% off special price at payment')`,
    )
    console.log('created default platform pricing settings')
  } else {
    console.log('skip platform settings (already exists)')
  }

  console.log('Seed complete (demo users only — catalog stays in SQL).')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await closePool()
  })
