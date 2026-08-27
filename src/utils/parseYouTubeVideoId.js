/**
 * Returns the 11-character YouTube video id for embed URLs.
 * Accepts a bare id or a watch / youtu.be / embed / shorts / live URL.
 */
export function parseYouTubeVideoId(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const s = raw.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
    /\/live\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = s.match(re)
    if (m) return m[1]
  }
  return ''
}
