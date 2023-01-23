import { customAlphabet } from 'nanoid/non-secure'

/**
 * replace uuid for simplify and with only alphanumeric
 *
 * https://github.com/ai/nanoid
 */
export const nanoid = customAlphabet(
  '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  10,
)
