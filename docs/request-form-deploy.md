# Project request form — deploy steps

The form, the Pages Function, the schema, and the validation are built and
tested. Everything left is account-level infrastructure with a real footprint,
so it is deliberately not done: **these commands are for Kamen to run.**

Until they are run, `POST /api/request` responds `503 {"error":"unconfigured"}`
and the form shows "the form is not connected to its database yet". The rest of
the site is unaffected.

## 1. Create the D1 database

```
npx wrangler d1 create kamen-portfolio
```

Note the returned `database_id`.

## 2. Apply the migration

```
npx wrangler d1 migrations apply kamen-portfolio --remote
```

(Drop `--remote` to apply to the local dev copy first.)

## 3. Bind it to the Pages project

Dashboard → Pages → the project → Settings → Functions → D1 bindings:

| Variable name | Value |
|---|---|
| `DB` | the `kamen-portfolio` database |

Bind it for **both** Production and Preview, otherwise preview deploys 503.

## 4. Set the IP hash salt

```
npx wrangler pages secret put IP_HASH_SALT
```

Any long random string. The function stores a salted SHA-256 of the submitter's
IP so it can rate-limit without retaining the address; without the salt the
hashes are guessable, which defeats the point.

## 5. Deploy

Normal Pages deploy. Verify by submitting once and reading it back:

```
npx wrangler d1 execute kamen-portfolio --remote \
  --command "SELECT id, project_name, engagement, created_at FROM project_requests ORDER BY id DESC LIMIT 5"
```

## Anti-abuse status

This is a public, unauthenticated endpoint that writes to a database, so it is
a spam target by construction. Currently in place:

- Honeypot field (`website`) — filled only by bots. Returns `200` so the bot
  gets no signal.
- Strict per-field length caps, enforced server-side as well as in the form.
- Per-IP rate limit: 3 submissions per hour, counted against `ip_hash`.
- 16 KB request body cap.

**Turnstile is the proper fix and is not wired up.** The current Cloudflare API
token is missing the `challenge-widgets.write` scope, so the widget cannot be
provisioned. Adding that scope and then adding Turnstile is the right next step
if spam actually appears — the protections above are a floor, not a substitute.

## Email forwarding

Not implemented. It was the stated preference but needs an external provider and
an API key, and no key should be committed. If it is added later: read the key
from an env var, leave it unset by default, and document the variable name here.
D1 is the durable record either way — email would be a notification on top, not
the storage.

## Privacy

The page has no analytics or tracking, on purpose: people describe unshipped
work on it. Nothing is stored beyond the seven form fields plus the IP hash.
