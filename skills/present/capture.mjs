// Captures product footage from a running app at presentation size, and records where each
// shot's panel and focus element sit so the video can crop and push in on them.
//
//   npm i puppeteer-core
//   node capture.mjs <out-dir>
//
// Replace the example flow at the bottom with the app's own flows.
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const [out] = process.argv.slice(2)
if (!out) throw new Error('usage: node capture.mjs <out-dir>')
fs.mkdirSync(out, { recursive: true })

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// Presentation size: about 1200px wide at 3x, so the UI reads at video size without being
// drawn past half its real resolution. For a phone, use { width: 390, height: 844, deviceScaleFactor: 3 }.
const viewport = { width: 1200, height: 800, deviceScaleFactor: 3 }

// What each shot is about: [panel to crop to, element to push in on], as CSS selectors whose
// last match is used. Their boxes are saved to rects.json, in screenshot pixels.
const FOCUS = {
  // 'help-answer': ['.chat-panel', '.chat-log > .msg-agent'],
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const rects = {}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-first-run', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
})

/** A page in its own browser context: its own storage, so each person is separate. */
async function person() {
  const page = await (await browser.createBrowserContext()).newPage()
  await page.setViewport(viewport)
  return page
}

/** Screenshots the page as <name>.png and records the shot's rects if FOCUS names it. */
async function shot(page, name) {
  await sleep(600) // let entrance animations finish
  await page.screenshot({ path: path.join(out, `${name}.png`) })
  if (FOCUS[name]) {
    rects[name] = await page.evaluate(
      ([panel, focus], scale) => {
        const box = (sel) => {
          const all = document.querySelectorAll(sel)
          const r = all[all.length - 1]?.getBoundingClientRect()
          return r && { x: Math.round(r.x * scale), y: Math.round(r.y * scale), w: Math.round(r.width * scale), h: Math.round(r.height * scale) }
        }
        return { crop: box(panel), focus: box(focus) }
      },
      FOCUS[name],
      viewport.deviceScaleFactor,
    )
    fs.writeFileSync(path.join(out, 'rects.json'), JSON.stringify(rects, null, 1))
  }
  console.log('shot', name)
}

/** Waits until the page's text includes `text`: the proof a moment happened. */
async function waitText(page, text, timeout = 45000) {
  await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout, polling: 500 }, text)
}

/** Waits until `selector`'s text stops changing for `quietMs`: a streamed reply is done. */
async function settle(page, selector = 'main', quietMs = 4000, timeout = 60000) {
  const start = Date.now()
  let last = ''
  let since = Date.now()
  while (Date.now() - start < timeout) {
    const now = await page.evaluate((s) => document.querySelector(s)?.innerText ?? '', selector)
    if (now !== last) {
      last = now
      since = Date.now()
    } else if (Date.now() - since > quietMs) return
    await sleep(500)
  }
}

/** Types into `selector` like a person and presses Enter. */
async function type(page, selector, text) {
  await page.waitForSelector(`${selector}:not([disabled])`, { timeout: 30000 })
  await page.click(selector)
  await page.type(selector, text, { delay: 8 })
  await page.keyboard.press('Enter')
}

// ---------- the flows: replace with the app's own ----------

const visitor = await person()
await visitor.goto(BASE + '/', { waitUntil: 'networkidle2' })
await sleep(1500)
await shot(visitor, 'home')

// Example: a customer asks a question and the reply streams in.
// const customer = await person()
// await customer.goto(BASE + '/help', { waitUntil: 'networkidle2' })
// await type(customer, '#message', 'Where is my order 1234?')
// await waitText(customer, 'order 1234')
// await settle(customer, '.chat-log')
// await shot(customer, 'help-answer')

await browser.close()
