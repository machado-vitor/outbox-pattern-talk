// Builds ../outbox-pattern.html, a single file that opens offline, from outbox-pattern.src.html:
// 1. colours every <pre data-lang> with Shiki (VS Code "Light+" theme), turning ⟦…⟧ into a yellow
//    mark and ⟦!…⟧ into a red one; 2. renders the mermaid diagrams to SVG in Chromium.
// Usage (from slides/): npm run build
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { codeToHtml } from 'shiki'
import { chromium } from 'playwright-chromium'

const here = new URL('.', import.meta.url)
const unescape = t => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')

async function highlight(lang, raw) {
  let code = '', marks = [], open = null
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '⟦') { open = { start: code.length, cls: raw[i + 1] === '!' ? 'hl2' : 'hl' }; if (raw[i + 1] === '!') i++ }
    else if (raw[i] === '⟧') { marks.push({ start: open.start, end: code.length, properties: { class: open.cls } }); open = null }
    else code += raw[i]
  }
  const out = await codeToHtml(code, { lang, theme: 'light-plus', decorations: marks })
  return out.slice(out.indexOf('<code>') + 6, out.lastIndexOf('</code>'))
}

let src = readFileSync(new URL('outbox-pattern.src.html', here), 'utf8')
const blocks = [...src.matchAll(/(<pre[^>]*data-lang="(\w+)"[^>]*>[\s\S]*?<code>)([\s\S]*?)(<\/code><\/pre>)/g)]
for (const [all, head, lang, body, tail] of blocks)
  src = src.replace(all, head + await highlight(lang, unescape(body)) + tail)
if (src.includes('⟦')) throw new Error('unmatched ⟦ mark')

const tmp = new URL('.build.tmp.html', here)
writeFileSync(tmp, src)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 980, height: 552 } }) // scale 1: mermaid measures labels without the stage scale
await page.goto(tmp.href)
await page.waitForFunction(() => window.__rendered === true, null, { timeout: 30000 })
const html = await page.evaluate(() => {
  document.querySelectorAll('script[data-build]').forEach(s => s.remove())
  document.body.classList.remove('rendering', 'presenter', 'shownotes')
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'))
  return '<!doctype html>\n' + document.documentElement.outerHTML
})
await browser.close()
rmSync(tmp)
const out = fileURLToPath(new URL('../outbox-pattern.html', here))
writeFileSync(out, html)
console.log('ok', out, html.length, 'bytes,', blocks.length, 'code blocks')
