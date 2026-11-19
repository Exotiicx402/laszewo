import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import assert from 'node:assert/strict'

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
const gate = html.match(/<script>([\s\S]*?)<\/script>/)[1]
const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8')
const completedKey = 'laszewo:intro:completed'

function visit({ storage = new Map(), reduced = false, hash = '', search = '', type = 'navigate', blocked = false } = {}) {
  const classes = new Set()
  const timers = []
  const context = vm.createContext({
    localStorage: {
      getItem: key => { if (blocked) throw Error('Storage unavailable'); return storage.get(key) },
      setItem: (key, value) => { if (blocked) throw Error('Storage unavailable'); storage.set(key, value) },
    },
    document: { documentElement: { classList: { add: value => classes.add(value), remove: value => classes.delete(value) } } },
    location: { hash, search },
    URLSearchParams,
    matchMedia: () => ({ matches: reduced }),
    performance: { getEntriesByType: () => [{ type }] },
    setTimeout: callback => timers.push(callback),
  })
  vm.runInContext(gate, context)
  return { pending: () => classes.has('intro-pending'), timers, classes, context, storage }
}

test('a visit does not count until the intro finishes', () => {
  const storage = new Map()
  assert.equal(visit({ storage }).pending(), true)
  assert.equal(storage.size, 0)
  assert.equal(visit({ storage, type: 'reload' }).pending(), true)
  storage.set(completedKey, '1')
  assert.equal(visit({ storage }).pending(), false)
  assert.equal(visit({ storage, type: 'reload' }).pending(), false)
})

test('the premature legacy flag does not suppress the fixed intro', () => {
  assert.equal(visit({ storage: new Map([['laszewo:intro:seen', '1']]) }).pending(), true)
})

test('the review URL replays a previously completed intro', () => {
  const storage = new Map([[completedKey, '1']])
  assert.equal(visit({ storage, search: '?intro=1' }).pending(), true)
  assert.equal(visit({ storage, search: '?intro=0' }).pending(), false)
})

for (const [name, options] of [
  ['reduced motion', { reduced: true }],
  ['deep links', { hash: '#music' }],
  ['history restoration', { type: 'back_forward' }],
]) test(`${name} opens directly to the site without consuming the intro`, () => {
  const page = visit(options)
  assert.equal(page.pending(), false)
  assert.equal(page.storage.size, 0)
  assert.equal(visit({ ...options, search: '?intro=1' }).pending(), false)
})

test('blocked storage does not stop intro playback', () => assert.equal(visit({ blocked: true }).pending(), true))

test('a failed main script cannot leave the opening curtain stuck', () => {
  const page = visit()
  assert.equal(page.pending(), true)
  page.timers.forEach(callback => callback())
  assert.equal(page.pending(), false)
  assert.equal(page.storage.size, 0)
})

const flush = () => new Promise(resolve => setImmediate(resolve))

async function playback(options = {}) {
  const page = visit(options)
  const window = new EventTarget()
  const document = new EventTarget()
  const animations = []
  const animate = () => {
    let resolve, reject
    const finished = new Promise((yes, no) => { resolve = yes; reject = no })
    const animation = { finished, finish: resolve, cancel: () => reject(Error('Canceled')) }
    animations.push(animation)
    return animation
  }
  const header = { inert: false }
  const main = { inert: false }
  const gif = { naturalWidth: 800, decode: () => Promise.resolve() }
  const nodes = {
    '.hero': { addEventListener() {}, classList: { toggle() {} } },
    '.brand': { querySelector: () => gif, animate, getBoundingClientRect: () => ({ width: 82, height: 41, left: 50, top: 30 }) },
    '.site-intro': { animate },
    '.site-header': header,
    main,
    '#year': {},
  }
  document.documentElement = { classList: {
    contains: name => page.classes.has(name),
    remove: (...names) => names.forEach(name => page.classes.delete(name)),
    replace: (from, to) => { page.classes.delete(from); page.classes.add(to) },
    toggle: (name, on) => on ? page.classes.add(name) : page.classes.delete(name),
  } }
  document.querySelector = selector => nodes[selector]
  document.hidden = false
  Object.assign(page.context, {
    document, window, AbortController,
    innerWidth: 1280, innerHeight: 720,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    clearTimeout() {}, setInterval() {}, clearInterval() {},
  })
  vm.runInContext(app, page.context)
  await flush()
  return { ...page, window, animations, header, main }
}

test('completion is saved only after both animations finish', async () => {
  const page = await playback()
  assert.equal(page.main.inert, true)
  assert.equal(page.storage.has(completedKey), false)
  page.animations[0].finish()
  await flush()
  assert.equal(page.storage.has(completedKey), false)
  page.animations[1].finish()
  await flush()
  assert.equal(page.storage.get(completedKey), '1')
  assert.equal(page.main.inert, false)
  assert.equal(page.header.inert, false)
  assert.equal(visit({ storage: page.storage }).pending(), false)
})

test('skipping during playback does not mark a canceled animation completed', async () => {
  const page = await playback()
  page.window.dispatchEvent(new Event('wheel'))
  await flush()
  assert.equal(page.storage.has(completedKey), false)
  assert.equal(page.main.inert, false)
  assert.equal(page.classes.has('intro-running'), false)
  assert.equal(visit({ storage: page.storage }).pending(), true)
})

test('failed animation and safety timeout release the site without saving completion', async () => {
  for (const stop of [page => page.animations[0].cancel(), page => page.timers.at(-1)()]) {
    const page = await playback()
    stop(page)
    await flush()
    assert.equal(page.storage.has(completedKey), false)
    assert.equal(page.main.inert, false)
    assert.equal(page.classes.has('intro-running'), false)
  }
})

test('storage write failure still releases the completed intro', async () => {
  const page = await playback({ blocked: true })
  page.animations.forEach(animation => animation.finish())
  await flush()
  assert.equal(page.main.inert, false)
  assert.equal(page.classes.has('intro-running'), false)
})
