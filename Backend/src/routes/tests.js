import { Router } from 'express'
import { param } from '../utils/params.js'
import { asyncHandler, ok } from '../utils/asyncHandler.js'
import { optionalAuth } from '../middleware/auth.js'
import * as testsService from '../services/tests.service.js'

const router = Router()

router.use(optionalAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    ok(
      res,
      await testsService.list(
        {
          search: req.query.search,
          category: req.query.category,
          minPrice: req.query.minPrice,
          maxPrice: req.query.maxPrice,
          sort: req.query.sort,
          popular: req.query.popular,
          membership: req.query.membership,
          packages: req.query.packages,
        },
        req.user?.id,
      ),
    )
  }),
)

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    ok(res, await testsService.categories())
  }),
)

router.get(
  '/search/suggest',
  asyncHandler(async (req, res) => {
    ok(res, await testsService.searchSuggestions(String(req.query.q ?? '')))
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    ok(res, await testsService.get(param(req, 'id'), req.user?.id))
  }),
)

export default router
