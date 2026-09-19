import { Router } from 'express'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { param } from '../utils/params.js'
import * as notificationsService from '../services/notifications.service.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    ok(res, await notificationsService.list(req.user.id))
  }),
)

router.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    ok(res, await notificationsService.unreadCount(req.user.id))
  }),
)

router.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    ok(res, await notificationsService.markAll(req.user.id))
  }),
)

router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    ok(res, await notificationsService.markRead(req.user.id, param(req, 'id')))
  }),
)

export default router
