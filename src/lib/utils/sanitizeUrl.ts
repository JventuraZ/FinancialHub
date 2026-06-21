const BLOCKED_PROTOCOLS = new Set([
  'javascript:', 'data:', 'blob:', 'vbscript:', 'file:',
])

// Blocks localhost and RFC-1918 private ranges to prevent SSRF-style requests
const PRIVATE_HOST =
  /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|::1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/i

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (BLOCKED_PROTOCOLS.has(parsed.protocol)) return '#'
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '#'
    if (PRIVATE_HOST.test(parsed.hostname)) return '#'
    return url
  } catch {
    return '#'
  }
}

/** Returns null for invalid/unsafe URLs instead of '#', for use with <img src>. */
export function sanitizeImageUrl(url: string | undefined | null): string | null {
  if (!url) return null
  const safe = sanitizeUrl(url)
  return safe === '#' ? null : safe
}
