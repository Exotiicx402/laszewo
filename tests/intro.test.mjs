import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import assert from 'node:assert/strict'

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
const gate = html.match(/<script>([\s\S]*?)<\/script>/)[1]

function visit({ storage = new Map(), reduced = false, hash = '', type = 'navigate', blocked = false } = {}) {
  const classes = new Set()
  const timers = []
  vm.runInNewContext(gate, {
    localStorage: {
      getItem: key => { if (blocked) throw Error('Storage unavailable'); return storage.get(key) },
      setItem: (key, value) => storage.set(key, value),
    },
    document: { documentElement: { classList: { add: value => classes.add(value), remove: value => classes.delete(value) } } },
    location: { hash },
    matchMedia: () => ({ matches: reduced }),
    performance: { getEntriesByType: () => [{ type }] },
    setTimeout: callback => timers.push(callback),
  })
  return { pending: () => classes.has('intro-pending'), timers }
}

test('only the first visit in a browser shows the intro', () => {
  const storage = new Map()
  assert.equal(visit({ storage }).pending(), true)
  assert.equal(visit({ storage }).pending(), false)
  assert.equal(visit({ storage, type: 'reload' }).pending(), false)
})

for (const [name, options] of [
  ['reduced motion', { reduced: true }],
  ['deep links', { hash: '#music' }],
  ['history restoration', { type: 'back_forward' }],
  ['unavailable storage', { blocked: true }],
]) test(`${name} opens directly to the site`, () => assert.equal(visit(options).pending(), false))

test('a failed main script cannot leave the opening curtain stuck', () => {
  const page = visit()
  assert.equal(page.pending(), true)
  page.timers.forEach(callback => callback())
  assert.equal(page.pending(), false)
})
