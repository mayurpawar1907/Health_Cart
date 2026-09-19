import { ZodError } from 'zod'
import { AppError } from '../utils/errors.js'
import { error as logError } from '../utils/logger.js'

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    logError(`${req.method} ${req.originalUrl} → ${err.status} ${err.message} [${err.errorCode}]`)
    return res.status(err.status).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    })
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? 'Validation failed'
    logError(`${req.method} ${req.originalUrl} → 400 ${message}`)
    return res.status(400).json({
      success: false,
      message,
      errorCode: 'VALIDATION_ERROR',
    })
  }

  logError(`${req.method} ${req.originalUrl} → 500`, err)
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    errorCode: 'REQUEST_FAILED',
  })
}
