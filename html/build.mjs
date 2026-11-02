// Builds ../outbox-pattern.html, a single file that opens offline, from outbox-pattern.src.html:
// 1. colours every <pre data-lang> with Shiki (VS Code "Light+" theme), turning ⟦…⟧ into a yellow
//    mark and ⟦!…⟧ into a red one; 2. renders the mermaid diagrams to SVG in Chromium;
// 3. regenerates the run of show and the stage script in ../SPEAKER-GUIDE.md from the slide notes.
// Usage: npm run build
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
writeGuide(src)
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
writeFileSync(out, html.replace('<html lang="en">', `<html lang="en" data-build="${new Date().toISOString()}">`)) // stamp for the stale-cache guard
console.log('ok', out, html.length, 'bytes,', blocks.length, 'code blocks')

// The guide's "Run of show" table and "Slide by slide" section mirror the notes: one block per click,
// with what the click shows (data-on), what it highlights (data-point), the speech, and "→ click".
function writeGuide(src) {
  const strip = t => t.replace(/<b>([\s\S]*?)<\/b>/g, '**$1**').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  const talk = [...src.matchAll(/<section class="slide([^"]*)"[^>]*>([\s\S]*?)<\/section>/g)]
    .filter(m => !m[1].includes('backup')).map((m, k) => {
      const body = m[2], notes = /<aside class="notes" data-time="([^"]*)">([\s\S]*?)<\/aside>/.exec(body)
      const [budget, leave] = notes[1].split(' · running ')
      const ps = [...notes[2].matchAll(/<p data-on="([^"]*)"(?: data-focus="[^"]*")?(?: data-point="([^"]*)")?>([\s\S]*?)<\/p>/g)]
        .map(p => ({ on: p[1], point: p[2] || '', text: strip(p[3].replace(/<i class="do p">pause<\/i>/g, '**PAUSE**')) }))
      return { n: k + 1, title: strip(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(body)[1]), budget, leave, ps }
    })
  const show = ['| # | Slide | Clicks | Budget | Leave by |', '|---|---|---|---|---|',
    ...talk.map(s => `| ${s.n} | ${s.title} | ${s.ps.length - 1} | ${s.budget} | ${s.leave} |`),
    `| ${talk.length + 1}+ | Backup slides for Q&A | | | |`].join('\n')
  const script = talk.map(s => `### ${s.n} · ${s.title}\n\nBudget ${s.budget}, leave by ${s.leave} · ${s.ps.length - 1} click${s.ps.length === 2 ? '' : 's'}\n\n`
    + s.ps.map((p, k) => `**${k ? 'Click ' + k : 'On open'}** · ${p.on}${p.point ? ` · **highlight** ${p.point}` : ''}\n> ${p.text} **→ ${k < s.ps.length - 1 ? 'click' : 'next slide'}**`).join('\n\n')).join('\n\n')
  const path = fileURLToPath(new URL('../SPEAKER-GUIDE.md', here))
  let md = readFileSync(path, 'utf8')
  const fill = (tag, text) => {
    const re = new RegExp(`(<!-- ${tag}:start -->)[\\s\\S]*?(<!-- ${tag}:end -->)`)
    if (!re.test(md)) throw new Error(`SPEAKER-GUIDE.md lacks the ${tag} markers`)
    md = md.replace(re, `$1\n${text}\n$2`)
  }
  fill('run-of-show', show); fill('script', script)
  writeFileSync(path, md)
  const words = talk.flatMap(s => s.ps.map(p => p.text.replace(/\*\*PAUSE\*\*/g, ''))).join(' ').split(/\s+/).filter(Boolean).length
  console.log('guide ok,', talk.length, 'talk slides,', words, 'spoken words')
}
