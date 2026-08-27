// Shared validation for the project request form.
//
// Imported by both the React form and the Pages Function. The client copy is
// for fast feedback only — the function re-runs the exact same checks, because
// anything can POST to the endpoint directly.

export const ENGAGEMENT_TYPES = ['paid', 'free', 'undecided']

export const LIMITS = {
  name:        { min: 2,  max: 80 },
  email:       { min: 5,  max: 160 },
  projectName: { min: 2,  max: 120 },
  description: { min: 30, max: 4000 },
  timeline:    { min: 0,  max: 200 },
  budget:      { min: 0,  max: 120 },
}

// Deliberately loose: the goal is to catch typos, not to adjudicate the RFC.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * @returns {Record<string, string>} field name → error key, empty when valid.
 * Error keys, not sentences — the form renders them through the locale copy.
 */
export function validateRequest(input) {
  const errors = {}
  const str = (v) => (typeof v === 'string' ? v.trim() : '')

  for (const field of ['name', 'projectName', 'description']) {
    const value = str(input[field])
    if (!value) errors[field] = 'required'
    else if (value.length < LIMITS[field].min) errors[field] = 'tooShort'
    else if (value.length > LIMITS[field].max) errors[field] = 'tooLong'
  }

  const email = str(input.email)
  if (!email) errors.email = 'required'
  else if (email.length > LIMITS.email.max) errors.email = 'tooLong'
  else if (!EMAIL_RE.test(email)) errors.email = 'invalid'

  // The paid/free distinction is a structured field on purpose — it is the
  // thing Kamen most needs to know up front, so it must not be buried in prose.
  if (!ENGAGEMENT_TYPES.includes(input.engagement)) errors.engagement = 'required'

  for (const field of ['timeline', 'budget']) {
    if (str(input[field]).length > LIMITS[field].max) errors[field] = 'tooLong'
  }

  return errors
}

export function isValid(errors) {
  return Object.keys(errors).length === 0
}

// Normalised row, ready to insert. Nothing beyond these fields is kept.
export function toSubmission(input) {
  const str = (v) => (typeof v === 'string' ? v.trim() : '')
  return {
    name:        str(input.name),
    email:       str(input.email),
    projectName: str(input.projectName),
    description: str(input.description),
    engagement:  input.engagement,
    timeline:    str(input.timeline) || null,
    budget:      str(input.budget) || null,
  }
}
