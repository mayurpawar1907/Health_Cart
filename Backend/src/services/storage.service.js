import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { randomBytes } from 'node:crypto'
import { badRequest } from '../utils/errors.js'

const ALLOWED_EXT = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt'])
const MAX_BYTES = 10 * 1024 * 1024
const root = join(process.cwd(), 'uploads')

export const ensureDir = (subdir) => {
  const dir = join(root, subdir)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

export const saveReportFile = (file, appointmentId) => {
  if (!file?.buffer?.length) {
    throw badRequest('Report file is required', 'FILE_REQUIRED')
  }
  if (file.size > MAX_BYTES) {
    throw badRequest('File must be under 10 MB', 'FILE_TOO_LARGE')
  }
  const ext = extname(file.originalname).toLowerCase()
  if (!ALLOWED_EXT.has(ext)) {
    throw badRequest('Allowed formats: PDF, PNG, JPG, WEBP, TXT', 'INVALID_FILE_TYPE')
  }
  const safeBase = basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .slice(0, 60)
  const token = randomBytes(4).toString('hex')
  const storedName = `${appointmentId}-${Date.now()}-${token}-${safeBase}${ext}`
  const dir = ensureDir('reports')
  const absolutePath = join(dir, storedName)
  writeFileSync(absolutePath, file.buffer)
  return {
    storagePath: join('reports', storedName),
    fileName: file.originalname,
    fileMimeType: file.mimetype || 'application/octet-stream',
    fileSize: file.size,
  }
}

export const resolveAbsolute = (storagePath) => {
  const normalized = storagePath.replace(/\\/g, '/').replace(/^\/+/, '')
  if (normalized.includes('..')) {
    throw badRequest('Invalid file path', 'INVALID_PATH')
  }
  return join(root, normalized)
}
