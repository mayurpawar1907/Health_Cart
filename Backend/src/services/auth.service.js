import bcrypt from 'bcrypt'
import { randomBytes } from 'node:crypto'
import { query, queryOne, execute, withTransaction, connExecute } from '../config/database.js'
import { sha256 } from '../utils/crypto.js'
import { id } from '../utils/id.js'
import { badRequest, conflict, unauthorized } from '../utils/errors.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../middleware/auth.js'
import * as walletService from './wallet.service.js'

export const signup = async (dto) => {
  if (dto.password !== dto.confirmPassword) {
    throw badRequest('Passwords do not match', 'PASSWORD_MISMATCH')
  }
  const existing = await queryOne(
    `SELECT id FROM User WHERE email = :email OR mobile = :mobile LIMIT 1`,
    { email: dto.email.toLowerCase(), mobile: dto.mobile },
  )
  if (existing) {
    throw conflict('Email or mobile is already registered', 'DUPLICATE_ACCOUNT')
  }
  const referrer = dto.referralCode ? await walletService.resolveReferrer(dto.referralCode) : null
  if (dto.referralCode?.trim() && !referrer) {
    throw badRequest('Invalid referral code', 'INVALID_REFERRAL_CODE')
  }
  const passwordHash = await bcrypt.hash(dto.password, 12)
  const userId = id()
  const profileId = id()
  const walletId = id()
  const notifId = id()
  await withTransaction(async (conn) => {
    await connExecute(
      conn,
      `INSERT INTO User (id, fullName, email, mobile, passwordHash, dateOfBirth, gender, referredByUserId)
       VALUES (:id, :fullName, :email, :mobile, :passwordHash, :dateOfBirth, :gender, :referredByUserId)`,
      {
        id: userId,
        fullName: dto.fullName.trim(),
        email: dto.email.toLowerCase(),
        mobile: dto.mobile,
        passwordHash,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender ?? null,
        referredByUserId: referrer?.id ?? null,
      },
    )
    await connExecute(conn, `INSERT INTO UserProfile (id, userId) VALUES (:id, :userId)`, {
      id: profileId,
      userId,
    })
    await connExecute(conn, `INSERT INTO Wallet (id, userId) VALUES (:id, :userId)`, {
      id: walletId,
      userId,
    })
    await connExecute(
      conn,
      `INSERT INTO Notification (id, userId, type, title, body)
       VALUES (:id, :userId, 'PROMOTIONAL', :title, :body)`,
      {
        id: notifId,
        userId,
        title: 'Welcome to HealthID Card',
        body: referrer
          ? 'Account created. Activate your free HealthID Card to unlock member rates and ₹250 joining bonus.'
          : 'Your account is ready. Activate your free HealthID Card and get ₹250 wallet bonus.',
      },
    )
  })
  await walletService.assignReferralCode(userId, dto.fullName.trim())
  return {
    message: 'Account created. Please log in to continue.',
    email: dto.email.toLowerCase(),
  }
}

const issueTokens = async (userId, email, role, fullName, userAgent) => {
  const accessToken = signAccessToken({ id: userId, email, role })
  const refreshToken = signRefreshToken(userId)
  await execute(
    `INSERT INTO RefreshToken (id, userId, tokenHash, userAgent, expiresAt)
     VALUES (:id, :userId, :tokenHash, :userAgent, :expiresAt)`,
    {
      id: id(),
      userId,
      tokenHash: sha256(refreshToken),
      userAgent: userAgent ?? null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  )
  return {
    accessToken,
    refreshToken,
    user: { id: userId, email, role, fullName },
  }
}

export const login = async (dto, userAgent) => {
  const identifier = dto.identifier.trim().toLowerCase()
  const user = await queryOne(
    `SELECT * FROM User WHERE deletedAt IS NULL AND (email = :email OR mobile = :mobile) LIMIT 1`,
    { email: identifier, mobile: dto.identifier.trim() },
  )
  if (!user || !(await bcrypt.compare(dto.password, String(user.passwordHash)))) {
    throw unauthorized('Invalid credentials', 'INVALID_CREDENTIALS')
  }
  if (!user.isActive) {
    throw unauthorized('Account is deactivated', 'ACCOUNT_INACTIVE')
  }
  return issueTokens(
    String(user.id),
    String(user.email),
    String(user.role),
    String(user.fullName),
    userAgent,
  )
}

export const refresh = async (refreshToken, userAgent) => {
  try {
    const payload = verifyRefreshToken(refreshToken)
    const tokenHash = sha256(refreshToken)
    const stored = await queryOne(
      `SELECT * FROM RefreshToken
       WHERE tokenHash = :tokenHash AND userId = :userId AND revokedAt IS NULL AND expiresAt > NOW(3)
       LIMIT 1`,
      { tokenHash, userId: payload.sub },
    )
    if (!stored) throw new Error('missing')
    await execute(`UPDATE RefreshToken SET revokedAt = NOW(3) WHERE id = :id`, { id: stored.id })
    const user = await queryOne(`SELECT * FROM User WHERE id = :id`, { id: payload.sub })
    if (!user) throw new Error('missing user')
    return issueTokens(
      String(user.id),
      String(user.email),
      String(user.role),
      String(user.fullName),
      userAgent,
    )
  } catch {
    throw unauthorized('Session expired. Please sign in again.', 'REFRESH_FAILED')
  }
}

export const logout = async (userId, refreshToken) => {
  if (refreshToken) {
    await execute(
      `UPDATE RefreshToken SET revokedAt = NOW(3)
       WHERE userId = :userId AND tokenHash = :tokenHash AND revokedAt IS NULL`,
      { userId, tokenHash: sha256(refreshToken) },
    )
  }
  return { message: 'Logged out' }
}

export const logoutAll = async (userId) => {
  await execute(
    `UPDATE RefreshToken SET revokedAt = NOW(3) WHERE userId = :userId AND revokedAt IS NULL`,
    { userId },
  )
  return { message: 'Logged out from all devices' }
}

export const forgotPassword = async (dto) => {
  const identifier = dto.identifier.trim().toLowerCase()
  const user = await queryOne(`SELECT id FROM User WHERE email = :email OR mobile = :mobile LIMIT 1`, {
    email: identifier,
    mobile: dto.identifier.trim(),
  })
  if (!user) {
    return { message: 'If an account exists, a reset token has been issued.' }
  }
  const raw = randomBytes(24).toString('hex')
  await execute(
    `INSERT INTO PasswordResetToken (id, userId, tokenHash, expiresAt)
     VALUES (:id, :userId, :tokenHash, :expiresAt)`,
    {
      id: id(),
      userId: user.id,
      tokenHash: sha256(raw),
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  )
  return {
    message: 'If an account exists, a reset token has been issued.',
    resetToken: process.env.NODE_ENV === 'production' ? undefined : raw,
  }
}

export const resetPassword = async (dto) => {
  const token = await queryOne(
    `SELECT * FROM PasswordResetToken
     WHERE tokenHash = :tokenHash AND usedAt IS NULL AND expiresAt > NOW(3) LIMIT 1`,
    { tokenHash: sha256(dto.token) },
  )
  if (!token) {
    throw badRequest('Invalid or expired reset token', 'RESET_INVALID')
  }
  const passwordHash = await bcrypt.hash(dto.password, 12)
  await withTransaction(async (conn) => {
    await connExecute(conn, `UPDATE User SET passwordHash = :passwordHash WHERE id = :id`, {
      passwordHash,
      id: token.userId,
    })
    await connExecute(conn, `UPDATE PasswordResetToken SET usedAt = NOW(3) WHERE id = :id`, {
      id: token.id,
    })
    await connExecute(
      conn,
      `UPDATE RefreshToken SET revokedAt = NOW(3) WHERE userId = :userId AND revokedAt IS NULL`,
      { userId: token.userId },
    )
  })
  return { message: 'Password updated. Please sign in.' }
}

export const sessions = async (userId) =>
  query(
    `SELECT id, userAgent, createdAt, expiresAt FROM RefreshToken
     WHERE userId = :userId AND revokedAt IS NULL AND expiresAt > NOW(3)
     ORDER BY createdAt DESC`,
    { userId },
  )
