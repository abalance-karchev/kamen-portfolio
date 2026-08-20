import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CONTENT } from '../src/data/content.js'

test('defines English and Bulgarian content dictionaries', () => {
  assert.deepEqual(Object.keys(CONTENT).sort(), ['bg', 'en'])
  assert.equal(CONTENT.en.nav.links[0].label, 'Home')
  assert.equal(CONTENT.bg.nav.links[0].label, 'Начало')
})

test('defines language switch labels for both directions', () => {
  assert.equal(CONTENT.en.languageSwitch.options.bg.name, 'Bulgarian')
  assert.equal(CONTENT.bg.languageSwitch.options.en.name, 'Английски')
  assert.match(CONTENT.en.languageSwitch.ariaLabel.bg, /Bulgarian/)
  assert.match(CONTENT.bg.languageSwitch.ariaLabel.en, /английски/i)
})
