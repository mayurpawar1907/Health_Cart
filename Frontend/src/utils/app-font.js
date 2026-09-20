export const FONT_STORAGE_KEY = 'hc_app_font'

export const APP_FONTS = [{ id: 'roboto', label: 'Roboto' }]

export function readAppFont() {
  return 'roboto'
}

export function applyAppFont() {
  document.documentElement.dataset.font = 'roboto'
}

export function saveAppFont() {
  const next = 'roboto'
  applyAppFont()
  try {
    localStorage.setItem(FONT_STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
  return next
}
