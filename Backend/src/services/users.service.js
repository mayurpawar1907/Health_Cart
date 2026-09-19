import bcrypt from 'bcrypt'
import { query, queryOne, execute, bool, num } from '../config/database.js'
import { id } from '../utils/id.js'
import { notFound, badRequest } from '../utils/errors.js'

const mapUser = (user, profile, addresses) => {
  const { passwordHash: _p, ...safe } = user
  return {
    ...safe,
    isActive: bool(user.isActive),
    profile: profile
      ? {
          ...profile,
          notificationsOn: bool(profile.notificationsOn),
          whatsappOn: bool(profile.whatsappOn),
          locationLat: profile.locationLat != null ? num(profile.locationLat) : null,
          locationLng: profile.locationLng != null ? num(profile.locationLng) : null,
        }
      : null,
    addresses: addresses.map((a) => ({
      ...a,
      isPrimary: bool(a.isPrimary),
      latitude: a.latitude != null ? num(a.latitude) : null,
      longitude: a.longitude != null ? num(a.longitude) : null,
    })),
  }
}

export const getProfile = async (userId) => {
  const user = await queryOne(`SELECT * FROM User WHERE id = :id`, { id: userId })
  if (!user) throw notFound('User not found')
  const profile = await queryOne(`SELECT * FROM UserProfile WHERE userId = :userId`, {
    userId,
  })
  const addresses = await query(
    `SELECT * FROM Address WHERE userId = :userId ORDER BY createdAt DESC`,
    { userId },
  )
  return mapUser(user, profile, addresses)
}

export const updateProfile = async (userId, dto) => {
  await execute(
    `UPDATE User SET
      fullName = COALESCE(:fullName, fullName),
      dateOfBirth = COALESCE(:dateOfBirth, dateOfBirth),
      gender = COALESCE(:gender, gender),
      avatarUrl = COALESCE(:avatarUrl, avatarUrl)
     WHERE id = :id`,
    {
      id: userId,
      fullName: dto.fullName ?? null,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      gender: dto.gender ?? null,
      avatarUrl: dto.avatarUrl ?? null,
    },
  )
  const existingProfile = await queryOne(`SELECT id FROM UserProfile WHERE userId = :userId`, {
    userId,
  })
  if (!existingProfile) {
    await execute(
      `INSERT INTO UserProfile (id, userId, language, theme, notificationsOn, whatsappOn, locationLat, locationLng)
       VALUES (:id, :userId, :language, :theme, :notificationsOn, :whatsappOn, :locationLat, :locationLng)`,
      {
        id: id(),
        userId,
        language: dto.language ?? 'en',
        theme: dto.theme ?? 'system',
        notificationsOn: (dto.notificationsOn ?? true) ? 1 : 0,
        whatsappOn: (dto.whatsappOn ?? true) ? 1 : 0,
        locationLat: dto.locationLat ?? null,
        locationLng: dto.locationLng ?? null,
      },
    )
  } else {
    await execute(
      `UPDATE UserProfile SET
        language = COALESCE(:language, language),
        theme = COALESCE(:theme, theme),
        notificationsOn = COALESCE(:notificationsOn, notificationsOn),
        whatsappOn = COALESCE(:whatsappOn, whatsappOn),
        locationLat = COALESCE(:locationLat, locationLat),
        locationLng = COALESCE(:locationLng, locationLng)
       WHERE userId = :userId`,
      {
        userId,
        language: dto.language ?? null,
        theme: dto.theme ?? null,
        notificationsOn: dto.notificationsOn == null ? null : dto.notificationsOn ? 1 : 0,
        whatsappOn: dto.whatsappOn == null ? null : dto.whatsappOn ? 1 : 0,
        locationLat: dto.locationLat ?? null,
        locationLng: dto.locationLng ?? null,
      },
    )
  }
  if (dto.line1 && dto.city && dto.state && dto.pincode) {
    const existing = await queryOne(
      `SELECT id FROM Address WHERE userId = :userId AND isPrimary = 1 LIMIT 1`,
      { userId },
    )
    if (existing) {
      await execute(
        `UPDATE Address SET line1 = :line1, city = :city, state = :state, pincode = :pincode,
          latitude = :latitude, longitude = :longitude WHERE id = :id`,
        {
          id: existing.id,
          line1: dto.line1,
          city: dto.city,
          state: dto.state,
          pincode: dto.pincode,
          latitude: dto.locationLat ?? null,
          longitude: dto.locationLng ?? null,
        },
      )
    } else {
      await execute(
        `INSERT INTO Address (id, userId, line1, city, state, pincode, latitude, longitude, isPrimary)
         VALUES (:id, :userId, :line1, :city, :state, :pincode, :latitude, :longitude, 1)`,
        {
          id: id(),
          userId,
          line1: dto.line1,
          city: dto.city,
          state: dto.state,
          pincode: dto.pincode,
          latitude: dto.locationLat ?? null,
          longitude: dto.locationLng ?? null,
        },
      )
    }
  }
  return getProfile(userId)
}

export const changePassword = async (userId, dto) => {
  const user = await queryOne(`SELECT passwordHash FROM User WHERE id = :id`, {
    id: userId,
  })
  if (!user) throw notFound('User not found')
  if (!(await bcrypt.compare(dto.currentPassword, String(user.passwordHash)))) {
    throw badRequest('Current password is incorrect', 'BAD_PASSWORD')
  }
  await execute(`UPDATE User SET passwordHash = :passwordHash WHERE id = :id`, {
    id: userId,
    passwordHash: await bcrypt.hash(dto.newPassword, 12),
  })
  return { message: 'Password changed' }
}
