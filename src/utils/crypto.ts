import crypto from 'node:crypto'

export function md5(value: string): string {
  const hash = crypto.createHash('md5')
  hash.update(value)
  return hash.digest('hex')
}

export function sha256(value: string): string {
  const hash = crypto.createHash('sha256')
  hash.update(value)
  return hash.digest('hex')
}
