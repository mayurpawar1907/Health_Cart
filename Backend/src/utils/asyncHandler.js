export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const ok = (res, data, status = 200) => {
  if (data && typeof data === 'object' && 'success' in data) {
    return res.status(status).json(data)
  }
  return res.status(status).json({ success: true, data })
}
