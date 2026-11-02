# Talk: the outbox pattern with a relay, JDBC Source and Debezium

**View online:** https://machado-vitor.github.io/outbox-pattern-talk/outbox-pattern.html

`outbox-pattern.html` is the deck: under 10 minutes, for developers. It is a single file that opens offline in
any browser (double-click), no server needed. `SPEAKER-GUIDE.md` has the run of show, the stage script (what
to say, where to point, when to pause, when to click), the cut plan and the Q&A prep; its run of show and
script sections are generated from the slide notes by the build.

- 11 talk slides (about 8:50 at 130 words per minute, in plain spoken English), with the script and timing for each slide in the notes:
  context, the three publishers, the late-commit scenario, one slide per publisher, Debezium in production,
  a side-by-side table, the decision, the takeaway.
- 8 backup slides after "Thank you" for Q&A: outbox DDL, relay loop, producer settings, scaling the relay,
  consumer dedupe, Debezium config, slot and binlog monitoring, purging. Those not taken from the POCs say
  "illustrative, not from the POCs".
- Code uses VS Code colors (Light+ theme); yellow marks what to talk about, red marks the trap.

Keys: → or space next, ← back, F fullscreen, N toggles notes, P opens presenter mode in a second synced
window, with a timer and the script (one block per click, the current one highlighted, with what the click
shows and what the slide highlights above the text), S opens the whole script in a clean, printable page, +
and − resize the notes. At each click the slide draws an orange ring around what the script is talking about
(`data-focus` on the notes block). Moving the mouse over the slide shows a red pointer dot, which is part of the window, so it
shows up in a Zoom window share. A presenter window narrower than 760 px shows only the script, for a
one-screen Zoom setup (see "Presenting over Zoom" in the speaker guide).

## Editing

The source is `html/outbox-pattern.src.html`. In a `<pre data-lang="java|sql|json">` block, wrap the part
to highlight in `⟦…⟧` (yellow) or `⟦!…⟧` (red). In the notes, one `<p data-on="what this click shows">` per
click, `data-focus="selector"` for what the slide rings at that click (a CSS selector, `@n` for one match, or
`line:N-M` for code lines), `data-point="…"` as its human description, and `<i class="do p">pause</i>` for a
pause. Then:

```sh
npm install      # first time only: npx playwright install chromium
npm run build    # highlights code with Shiki, renders the mermaid diagrams, rewrites outbox-pattern.html
```

Every snippet cited as `file:lines` is copied verbatim from the POCs.
