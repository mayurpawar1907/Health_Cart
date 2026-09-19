const stamp = () => new Date().toISOString()

export const info = (...args) => console.log(`[${stamp()}]`, ...args)

export const warn = (...args) => console.warn(`[${stamp()}] WARN`, ...args)

export const error = (...args) => console.error(`[${stamp()}] ERROR`, ...args)

/** Express middleware — logs method, path, status, duration */
export const requestLogger = (req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    const user = req.user?.id ? ` user=${req.user.id}` : ''
    info(`${req.method} ${req.originalUrl} → ${res.statusCode} ${ms}ms${user}`)
  })
  next()
}
