/**
 * UUID v4 validation regex
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * where x is any hexadecimal digit and y is one of 8, 9, A, or B
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Email validation regex
 * Simple but effective pattern that catches most common email formats
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates if a string is a valid UUID v4 format
 *
 * @param value - The string to validate
 * @returns true if the string is a valid UUID v4, false otherwise
 *
 * @example
 * ```typescript
 * isValidUUID('123e4567-e89b-12d3-a456-426614174000') // true
 * isValidUUID('invalid-uuid') // false
 * ```
 */
export function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

/**
 * Validates if a string is a valid email format
 *
 * @param value - The string to validate
 * @returns true if the string is a valid email format, false otherwise
 *
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

/**
 * Validates if a number is a valid price (positive and finite)
 *
 * @param value - The number to validate
 * @returns true if the number is positive and finite, false otherwise
 *
 * @example
 * ```typescript
 * isValidPrice(99.99) // true
 * isValidPrice(0) // false
 * isValidPrice(-10) // false
 * ```
 */
export function isValidPrice(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}
