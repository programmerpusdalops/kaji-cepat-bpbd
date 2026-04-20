/**
 * sanitize.ts — Frontend input sanitization utilities
 *
 * Used to sanitize user-generated content before rendering (XSS prevention)
 * and to sanitize form inputs before sending to the API.
 */

/**
 * Remove dangerous HTML — strips <script>, event handlers (on*=), and
 * javascript: protocol URLs from user-generated content.
 * For rendering HTML from feeds or comments safely.
 */
export function sanitizeHTML(input: string): string {
  if (!input) return "";

  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "")
    // Remove javascript: protocol
    .replace(/javascript\s*:/gi, "")
    // Remove data: protocol for potential attack vectors
    .replace(/data\s*:\s*text\/html/gi, "")
    // Remove vbscript: protocol
    .replace(/vbscript\s*:/gi, "")
    // Remove style expressions (IE)
    .replace(/expression\s*\(/gi, "")
    // Remove <iframe>, <object>, <embed>, <form> tags
    .replace(/<(iframe|object|embed|form)\b[^>]*>/gi, "")
    .replace(/<\/(iframe|object|embed|form)>/gi, "");
}

/**
 * Sanitize a plain-text form input — trims whitespace and escapes
 * HTML special characters so the value is safe for display.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitize a number input — returns 0 if invalid.
 */
export function sanitizeNumber(input: string | number, min = 0, max = Infinity): number {
  const num = typeof input === "string" ? parseFloat(input) : input;
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

/**
 * Validate and sanitize an email address.
 * Returns null if invalid.
 */
export function sanitizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return emailRegex.test(email) ? email : null;
}
