import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CONTENT } from '../src/data/content.js'

// The availability page's scarcity claim is only legitimate while it is true.
// These guard the shape of that claim, not its current values — when a slot
// really fills, the counts change and these still pass.
for (const lang of ['en', 'bg']) {
  test(`${lang}: every slot is either open or taken`, () => {
    for (const slot of CONTENT[lang].freelance.slots) {
      assert.ok(['open', 'taken'].includes(slot.status), `bad status: ${slot.status}`)
    }
  })

  test(`${lang}: a taken slot names a real project`, () => {
    for (const slot of CONTENT[lang].freelance.slots.filter(s => s.status === 'taken')) {
      assert.ok(slot.title, 'a taken slot must say what took it')
      assert.ok(slot.body,  'a taken slot must describe the work')
    }
  })

  test(`${lang}: open slots make no claims`, () => {
    for (const slot of CONTENT[lang].freelance.slots.filter(s => s.status === 'open')) {
      assert.equal(slot.title, undefined)
      assert.equal(slot.body, undefined)
    }
  })
}

test('both locales describe the same capacity', () => {
  const count = (lang, status) =>
    CONTENT[lang].freelance.slots.filter(s => s.status === status).length

  assert.equal(CONTENT.en.freelance.slots.length, CONTENT.bg.freelance.slots.length)
  assert.equal(count('en', 'open'), count('bg', 'open'))
  assert.equal(count('en', 'taken'), count('bg', 'taken'))
})
