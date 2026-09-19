import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { queryOne } from '../config/database.js'
import { unauthorized, forbidden } from '../utils/errors.js'

export const signAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role, typ: 'access' },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiresIn },
  )

export const signRefreshToken = (userId) =>
  jwt.sign({ sub: userId, typ: 'refresh' }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  })

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, config.jwtAccessSecret)
  if (payload.typ !== 'access') throw unauthorized('Invalid token', 'UNAUTHORIZED')
  return payload
}

export const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, config.jwtRefreshSecret)
  if (payload.typ !== 'refresh') throw unauthorized('Invalid refresh token', 'REFRESH_FAILED')
  return payload
}

/** Attach user if Bearer token present; does not fail if missing. */
export const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return next()
    const payload = verifyAccessToken(header.slice(7))
    const user = await queryOne(
      `SELECT id, email, role, fullName FROM User WHERE id = :id AND deletedAt IS NULL AND isActive = 1 LIMIT 1`,
      { id: payload.sub },
    )
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      }
    }
    next()
  } catch {
    next()
  }
}

export const requireAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw unauthorized('Authentication required', 'UNAUTHORIZED')
    }
    const payload = verifyAccessToken(header.slice(7))
    const user = await queryOne(
      `SELECT id, email, role, fullName, isActive FROM User WHERE id = :id AND deletedAt IS NULL LIMIT 1`,
      { id: payload.sub },
    )
    if (!user || !user.isActive) {
      throw unauthorized('Authentication required', 'UNAUTHORIZED')
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    }
    next()
  } catch (err) {
    next(err)
  }
}

export const requireRoles =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(unauthorized('Authentication required'))
    if (!roles.includes(req.user.role)) {
      return next(forbidden('Insufficient permissions', 'FORBIDDEN'))
    }
    next()
  }
