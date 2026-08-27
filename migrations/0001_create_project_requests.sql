-- Project requests submitted from /request.
--
-- Apply with:
--   npx wrangler d1 migrations apply kamen-portfolio --remote
-- (locally: drop --remote)
--
-- ip_hash is a salted SHA-256 of the submitter's IP, kept only so the function
-- can rate-limit. The raw address is never stored, and nothing here is used for
-- analytics.

CREATE TABLE IF NOT EXISTS project_requests (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  email        TEXT    NOT NULL,
  project_name TEXT    NOT NULL,
  description  TEXT    NOT NULL,
  engagement   TEXT    NOT NULL CHECK (engagement IN ('paid', 'free', 'undecided')),
  timeline     TEXT,
  budget       TEXT,
  ip_hash      TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Supports the per-IP rate-limit lookup, which filters on both columns.
CREATE INDEX IF NOT EXISTS idx_project_requests_ip_created
  ON project_requests (ip_hash, created_at);
