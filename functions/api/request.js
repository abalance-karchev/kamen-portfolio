// POST /api/request — receives a project request and writes it to D1.
//
// This is a public, unauthenticated write endpoint, so it is a spam target by
// construction. Protections here: a honeypot field, strict length caps, and a
// per-IP rate limit. Turnstile is the proper fix and is NOT wired up — the
// current Cloudflare API token is missing `challenge-widgets.write`, so the
// widget cannot be provisioned. See docs/request-form-deploy.md.
//
// Bindings required (see the same doc — creating them is a deploy-time action):
//   DB              D1 database, migrated with migrations/0001_*.sql
//   IP_HASH_SALT    secret; without it the endpoint still works but IP hashes
//                   are unsalted and therefore guessable, so set it.

import { validateRequest, isValid, toSubmission } from '../../src/utils/requestValidation.js'

const RATE_LIMIT_MAX     = 3
const RATE_LIMIT_WINDOW  = '-1 hours'
const MAX_BODY_BYTES     = 16 * 1024

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'unconfigured' }, 503)

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return json({ error: 'tooLarge' }, 413)

  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ error: 'malformed' }, 400)
  }

  // Honeypot: a field hidden from humans. Anything that fills it is a bot.
  // Answer 200 so the bot has no signal that it was rejected.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json({ ok: true })
  }

  const errors = validateRequest(body)
  if (!isValid(errors)) return json({ error: 'invalid', fields: errors }, 422)

  const ipHash = await hashIp(request.headers.get('CF-Connecting-IP'), env.IP_HASH_SALT)

  if (ipHash) {
    const { results } = await env.DB
      .prepare(
        `SELECT COUNT(*) AS n FROM project_requests
          WHERE ip_hash = ? AND created_at > datetime('now', ?)`,
      )
      .bind(ipHash, RATE_LIMIT_WINDOW)
      .all()

    if ((results?.[0]?.n ?? 0) >= RATE_LIMIT_MAX) {
      return json({ error: 'rateLimited' }, 429)
    }
  }

  const s = toSubmission(body)

  await env.DB
    .prepare(
      `INSERT INTO project_requests
         (name, email, project_name, description, engagement, timeline, budget, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(s.name, s.email, s.projectName, s.description, s.engagement, s.timeline, s.budget, ipHash)
    .run()

  return json({ ok: true })
}

// Only POST is exported on purpose: Pages routes methods to their own handler,
// so anything else on this path never reaches the database.

// Salted SHA-256. Stored instead of the address so rate limiting does not
// require retaining an identifier.
async function hashIp(ip, salt) {
  if (!ip) return null
  const data   = new TextEncoder().encode(`${salt ?? ''}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
