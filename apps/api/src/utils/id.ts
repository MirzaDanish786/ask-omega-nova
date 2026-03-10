import { randomBytes } from 'crypto';

/**
 * Generates a cuid-like unique ID compatible with the existing schema.
 */
export function createId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString('hex');
  return `c${timestamp}${random}`;
}
