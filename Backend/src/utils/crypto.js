import { createHash } from 'node:crypto'

export const sha256 = (value) => createHash('sha256').update(value).digest('hex')

export const money = (n) => Math.round(n * 100) / 100
