import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  validateRequest, isValid, toSubmission, LIMITS, ENGAGEMENT_TYPES,
} from '../src/utils/requestValidation.js'

const good = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  projectName: 'Inventory tool',
  description: 'A small internal tool for tracking stock across two warehouses. Nothing exists yet.',
  engagement: 'paid',
  timeline: 'about six weeks',
  budget: '',
}

test('accepts a complete request', () => {
  assert.ok(isValid(validateRequest(good)))
})

test('requires the fields it cannot work without', () => {
  const errors = validateRequest({})
  for (const field of ['name', 'email', 'projectName', 'description', 'engagement']) {
    assert.equal(errors[field], 'required', `${field} should be required`)
  }
})

test('leaves timeline and budget optional', () => {
  const errors = validateRequest({ ...good, timeline: '', budget: '' })
  assert.ok(isValid(errors))
})

test('rejects an unparseable email', () => {
  assert.equal(validateRequest({ ...good, email: 'jane.example.com' }).email, 'invalid')
  assert.equal(validateRequest({ ...good, email: 'jane@example' }).email, 'invalid')
})

test('rejects a description too thin to judge scope', () => {
  assert.equal(validateRequest({ ...good, description: 'build me an app' }).description, 'tooShort')
})

test('caps every field so the endpoint cannot be used as storage', () => {
  for (const [field, limit] of Object.entries(LIMITS)) {
    const errors = validateRequest({ ...good, [field]: 'x'.repeat(limit.max + 1) })
    assert.equal(errors[field], 'tooLong', `${field} should be length-capped`)
  }
})

test('only accepts the three engagement values', () => {
  for (const type of ENGAGEMENT_TYPES) {
    assert.ok(isValid(validateRequest({ ...good, engagement: type })))
  }
  assert.equal(validateRequest({ ...good, engagement: 'barter' }).engagement, 'required')
})

test('trims input and drops empty optional fields to null', () => {
  const s = toSubmission({ ...good, name: '  Jane Doe  ', timeline: '  ', budget: '' })
  assert.equal(s.name, 'Jane Doe')
  assert.equal(s.timeline, null)
  assert.equal(s.budget, null)
})

test('keeps nothing beyond the declared fields', () => {
  const s = toSubmission({ ...good, referrer: 'https://example.com', website: 'spam' })
  assert.deepEqual(
    Object.keys(s).sort(),
    ['budget', 'description', 'email', 'engagement', 'name', 'projectName', 'timeline'],
  )
})
