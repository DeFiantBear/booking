// Simple in-memory rate limiting for API routes
// In production, consider using Redis or a more robust solution

interface RateLimitStore {
  [ip: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}
const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10 // Max 10 requests per minute per IP

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowStart = now - WINDOW_MS

  // Clean up old entries
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < windowStart) {
      delete store[key]
    }
  })

  // Get or create entry for this IP
  if (!store[ip]) {
    store[ip] = {
      count: 0,
      resetTime: now + WINDOW_MS
    }
  }

  // Check if within window
  if (store[ip].resetTime < now) {
    store[ip] = {
      count: 0,
      resetTime: now + WINDOW_MS
    }
  }

  // Increment count
  store[ip].count++

  const remaining = Math.max(0, MAX_REQUESTS - store[ip].count)
  const allowed = store[ip].count <= MAX_REQUESTS

  return { allowed, remaining }
}

export function getClientIP(request: Request): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to localhost for development
  return '127.0.0.1'
} 