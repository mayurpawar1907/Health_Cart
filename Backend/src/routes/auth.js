import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import * as authService from '../services/auth.service.js'

const router = Router()

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(8),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  referralCode: z.string().optional(),
})

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
})

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    ok(res, await authService.signup(signupSchema.parse(req.body)))
  }),
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    ok(res, await authService.login(loginSchema.parse(req.body), req.headers['user-agent']))
  }),
)

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const body = z.object({ refreshToken: z.string().min(10) }).parse(req.body)
    ok(res, await authService.refresh(body.refreshToken, req.headers['user-agent']))
  }),
)

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const body = z.object({ identifier: z.string().min(3) }).parse(req.body)
    ok(res, await authService.forgotPassword(body))
  }),
)

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const body = z
      .object({ token: z.string().min(10), password: z.string().min(6) })
      .parse(req.body)
    ok(res, await authService.resetPassword(body))
  }),
)

router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z.object({ refreshToken: z.string().optional() }).parse(req.body)
    ok(res, await authService.logout(req.user.id, body.refreshToken))
  }),
)

router.post(
  '/logout-all',
  requireAuth,
  asyncHandler(async (req, res) => {
    ok(res, await authService.logoutAll(req.user.id))
  }),
)

router.get(
  '/sessions',
  requireAuth,
  asyncHandler(async (req, res) => {
    ok(res, await authService.sessions(req.user.id))
  }),
)

export default router
