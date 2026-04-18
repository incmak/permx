import startHandler from '@tanstack/react-start/server-entry'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'X-Robots-Tag': 'all',
  'Permissions-Policy':
    'interest-cohort=(), camera=(), microphone=(), geolocation=()',
}

function withSecurityHeaders(res: Response): Response {
  const headers = new Headers(res.headers)
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(k)) headers.set(k, v)
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  })
}

type FetchArgs = Parameters<typeof startHandler.fetch>

export default {
  async fetch(...args: FetchArgs): Promise<Response> {
    const res = await startHandler.fetch(...args)
    return withSecurityHeaders(res)
  },
}
