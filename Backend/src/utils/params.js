/** Express 5 params can be string | string[] */
export const param = (req, name) => {
  const value = req.params[name]
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}
