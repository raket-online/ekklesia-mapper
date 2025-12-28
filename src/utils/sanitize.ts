/**
 * Input Sanitization Utilities
 *
 * Provides protection against XSS (Cross-Site Scripting) attacks
 * by sanitizing user input before storage or display.
 */

/**
 * Sanitize user input to prevent XSS attacks
 *
 * This function removes:
 * - HTML tags
 * - Event handlers (onclick, onerror, etc.)
 * - JavaScript: protocol
 * - Dangerous characters
 *
 * @param input - The raw user input
 * @returns The sanitized input string
 */
export function sanitizeInput(input: unknown): string {
  if (input === null || input === undefined) {
    return ''
  }

  // Convert to string if not already
  const str = String(input)

  // Remove HTML tags
  let sanitized = str.replace(/<[^>]*>/g, '')

  // Remove event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:/gi, '')

  // Remove vbscript: protocol
  sanitized = sanitized.replace(/vbscript:/gi, '')

  // Remove dangerous characters that could be used for injection
  // - Remove quotes and angle brackets
  sanitized = sanitized.replace(/["'<>]/g, '')

  // Remove extra whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ')

  return sanitized
}

/**
 * Sanitize and truncate input to a maximum length
 *
 * @param input - The raw user input
 * @param maxLength - Maximum allowed length
 * @returns The sanitized and truncated input string
 */
export function sanitizeAndTruncate(input: unknown, maxLength: number): string {
  const sanitized = sanitizeInput(input)
  return sanitized.substring(0, maxLength)
}

/**
 * Validate that input contains only safe characters
 *
 * Allows:
 * - Letters (a-z, A-Z)
 * - Numbers (0-9)
 * - Basic punctuation (.,!?-')
 * - Spaces
 * - Unicode letters and numbers (for internationalization)
 *
 * @param input - The input to validate
 * @returns true if input contains only safe characters, false otherwise
 */
export function isSafeInput(input: string): boolean {
  // Allow letters, numbers, spaces, and common punctuation
  // Also allow Unicode characters for internationalization
  const safePattern = /^[\p{L}\p{N}\s.,!?'\-]+$/u
  return safePattern.test(input)
}
