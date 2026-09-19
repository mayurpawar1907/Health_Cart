export class AppError extends Error {
  constructor(message, status = 400, errorCode = 'REQUEST_FAILED') {
    super(message)
    this.status = status
    this.errorCode = errorCode
  }
}

export const badRequest = (message, errorCode = 'REQUEST_FAILED') =>
  new AppError(message, 400, errorCode)

export const unauthorized = (message, errorCode = 'UNAUTHORIZED') =>
  new AppError(message, 401, errorCode)

export const forbidden = (message, errorCode = 'FORBIDDEN') =>
  new AppError(message, 403, errorCode)

export const notFound = (message, errorCode = 'NOT_FOUND') =>
  new AppError(message, 404, errorCode)

export const conflict = (message, errorCode = 'CONFLICT') =>
  new AppError(message, 409, errorCode)
