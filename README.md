# Talk: the outbox pattern with a relay, JDBC Source and Debezium

**View online:** https://machado-vitor.github.io/outbox-pattern-talk/outbox-pattern.html

`outbox-pattern.html` is the deck: 10 minutes, for developers. It is a single file that opens offline in
any browser (double-click), no server needed.

- 9 talk slides (about 8:45 at 140 words per minute), with the script and timing for each slide in the notes.
- 8 backup slides after "Thank you" for Q&A: outbox DDL, relay loop, producer settings, scaling the relay,
  consumer dedupe, Debezium config, slot and binlog monitoring, purging. Those not taken from the POCs say
  "illustrative, not from the POCs".
- Code uses VS Code colors (Light+ theme); yellow marks what to talk about, red marks the trap.

Keys: → or space next, ← back, F fullscreen, N toggles notes, P opens presenter mode in a second synced
window, with a timer and the script.

## Editing

The source is `html/outbox-pattern.src.html`. In a `<pre data-lang="java|sql|json">` block, wrap the part
to highlight in `⟦…⟧` (yellow) or `⟦!…⟧` (red). Then:

```sh
npm install      # first time only: npx playwright install chromium
npm run build    # highlights code with Shiki, renders the mermaid diagrams, rewrites outbox-pattern.html
```

Every snippet cited as `file:lines` is copied verbatim from the POCs.
