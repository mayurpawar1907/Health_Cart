import { Router } from 'express'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { requireAuth } from '../middleware/auth.js'
import { param } from '../utils/params.js'
import * as historyService from '../services/history.service.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/history',
  asyncHandler(async (req, res) => {
    ok(res, await historyService.history(req.user.id))
  }),
)

router.get(
  '/reports',
  asyncHandler(async (req, res) => {
    ok(res, await historyService.reports(req.user.id))
  }),
)

router.get(
  '/reports/:id',
  asyncHandler(async (req, res) => {
    ok(res, await historyService.report(req.user.id, param(req, 'id')))
  }),
)

router.get(
  '/reports/:id/file',
  asyncHandler(async (req, res) => {
    const file = await historyService.getReportFile(req.user.id, param(req, 'id'))
    res.setHeader('Content-Type', file.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`)
    file.stream.pipe(res)
  }),
)

export default router
