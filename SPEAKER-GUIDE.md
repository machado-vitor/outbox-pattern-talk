# Speaker guide

The talk in one sentence: **three publishers move rows from the same outbox table to Kafka, and where each one
keeps its "already published" mark decides what you lose.** The relay marks the row, Debezium follows the commit
log, the JDBC Source trusts an id cursor, and only the JDBC Source loses an event.

The script is spoken English on purpose: short sentences, common words, contractions, no idioms. The audience
is Brazilian developers working in the US, with different levels of English. Every block starts with a bold
anchor: read the anchor, look up, and say the rest in your own words. If you lose your place, read the yellow
block in the presenter window; it is complete.

Hard limit: 10 minutes. About 1,160 spoken words: 8:55 at a calm 130 words per minute. The time next to each
slide is its budget and the clock reading at which you should leave it.

The run of show and the stage script below are generated from the slide notes by `npm run build`, so they
always match what the presenter window (P) and the script page (S) show. Edit the notes in
`html/outbox-pattern.src.html`, not this section.

## Run of show

<!-- run-of-show:start -->
| # | Slide | Clicks | Budget | Leave by |
|---|---|---|---|---|
| 1 | Outbox: relay vs JDBC Source vs Debezium | 0 | 0:30 | 0:30 |
| 2 | The outbox: the event is a row in the order's own transaction | 1 | 0:45 | 1:15 |
| 3 | The publishers: one table, three readers | 3 | 0:40 | 1:55 |
| 4 | The scenario: A gets the lower id, but commits after B | 5 | 1:15 | 3:10 |
| 5 | Relay: the mark is in the row, written after the ack | 5 | 1:05 | 4:15 |
| 6 | JDBC Source: the mark is an id cursor, assigned before the commit | 4 | 1:00 | 5:15 |
| 7 | Debezium: the mark is a position in the commit log | 3 | 0:55 | 6:10 |
| 8 | Debezium in production: same guarantee, different incident | 2 | 1:00 | 7:10 |
| 9 | Side by side: what you write, where the mark lives, what you lose | 3 | 0:30 | 7:40 |
| 10 | Which one? Two questions, then a default | 3 | 0:40 | 8:20 |
| 11 | Takeaway: where the mark lives decides what you lose | 2 | 0:35 | 8:55 |
| 12+ | Backup slides for Q&A | | | |
<!-- run-of-show:end -->

**Checkpoints.** Leave slide 4 at 3:10, leave slide 8 at 7:10. If you leave slide 8 after 7:50, skip
slide 9 (say "the table is in the repo") and go to the decision: that saves 30 seconds. If you are still
late, slide 10 can be one sentence: "many writers means no JDBC Source; Debezium if you need latency and commit
order and someone owns the slot or the binlog; otherwise the relay."

## Before you start

1. Open `outbox-pattern.html` in Chrome or Firefox (double-click; no server needed). Browser zoom at 100%.
2. Press **P**: a second window opens with the current slide, the script and a timer. Drag it to your laptop
   screen, put the main window on the projector, press **F** there for fullscreen.
3. In the presenter window the script is one block per click. The yellow block is what to say now; the
   blocks above are done, the ones below come next. The label on each block says what that click puts on
   screen. "leave this slide by m:ss" sits next to the clock and turns red when you are late. **+** and **−**
   resize the text.
4. Each block says, above the text, what that click shows and what the slide highlights with an orange ring
   at that moment, so you do not need to point. The text is only what you say. A green "click →" at the end of the block means press → or space ("next slide →" is
   also just →). An amber "pause" appears only four times in the whole talk: two seconds of silence, look at
   the room.
5. Press **S** for the whole script in a clean page, one block per click, same tags: read it on a tablet, or
   print it (Cmd+P) as paper notes.
6. Press **reset** in the presenter window when you say the first word. Press **Home** so both windows are on
   slide 1, click 0. The windows stay in sync; drive from either. Clicking on the slide does nothing: only the
   keyboard changes slides, so you can point with the mouse freely.
7. Other keys: **←** back, **N** notes over the stage (if the second screen fails), **End** jumps to the last
   backup slide, then **←** walks back through them. The URL hash `#12.0` opens backup slide 12 directly.
8. Rehearse slide 4 twice: five clicks, and the yellow flash shows what changed on each click. Rehearse slide
   8 once: the disk bars fill by themselves in the first three seconds, talk over them.

## Presenting over Zoom, one screen

Share only the deck window; keep the script in a second, unshared window beside it.

1. Open the deck without browser toolbars, as a Chrome app window:
   ```sh
   open -na "Google Chrome" --args --app="https://machado-vitor.github.io/outbox-pattern-talk/outbox-pattern.html"
   ```
   (or `--app="file:///path/to/outbox-pattern.html"` for the local file). Put it on the left, about two
   thirds of the screen wide. Do not press F: the slide scales to the window.
2. Press **P**. Drag the presenter window to the right third and make it narrow: under 760 px wide it shows
   only the clock and the script, no slide preview, because the deck is right there.
3. In Zoom: **Share Screen → the deck window** (title "Outbox: relay, JDBC Source and Debezium"), not the
   desktop. Viewers see only that window, even when another window overlaps it on your screen.
4. Click once inside the presenter window so it has the keyboard. **→** advances both windows.
5. You do not need to point: at each click the slide draws an orange ring around what you are talking about
   (the code lines, the row, the card). If you want to point at something else, move the mouse over the deck
   window: a red dot follows it and is part of the shared window; it fades 1.5 s after you stop. Moving the
   mouse does not take the keyboard away from the presenter window, and clicking on the slide does nothing.
6. Before the call: Do Not Disturb on, Slack and mail closed, Zoom's own toolbar out of the deck window, and
   a two-minute trial share with a colleague or a second device to confirm they see the red dot and the slide
   changes.

## Slide by slide

Each block is one click. The line above the quote says what the click shows and what the slide rings in
orange at that moment; the quote is what you say; "→ click" means press →. Colors on every slide: blue is the relay, red the JDBC Source, green
Debezium.

<!-- script:start -->
### 1 · Outbox: relay vs JDBC Source vs Debezium

Budget 0:30, leave by 0:30 · 0 clicks

**On open** · title slide
> **Hi everyone, I'm Vitor.** Today I'm going to talk about the outbox pattern, and more specifically about how you get the rows from the outbox table into Kafka. I ran the same outbox three ways: a relay I wrote myself, Confluent's JDBC Source connector, and Debezium, all on real Postgres, MySQL and Kafka. For each one I'll show how it works, what it costs, and when I'd use it. **→ next slide**

### 2 · The outbox: the event is a row in the order's own transaction

Budget 0:45, leave by 1:15 · 1 click

**On open** · the diagram, without the publisher · **highlight** the box 'one transaction'
> **Quick recap of the problem.** You save the order, then you send the event to Kafka. If the service dies between those two, the order is there but the event never goes out. And you can't put Kafka inside the database transaction. So, the outbox: the event is a row, in the same transaction as the order. If the order rolls back, the row goes away with it. **→ click**

**Click 1** · the publisher node and the line at the bottom · **highlight** the publisher? node
> **But someone still has to take that row to Kafka.** I'll call that the publisher. And it has to know which rows it already sent. That's where the three differ. **→ next slide**

### 3 · The publishers: one table, three readers

Budget 0:40, leave by 1:55 · 3 clicks

**On open** · the map · **highlight** the outbox table
> **So, three publishers, same table.** **→ click**

**Click 1** · the relay line · **highlight** the relay box
> **The relay** is a process you write yourself. Every second it reads the table, sends the new rows, and marks them as sent. **→ click**

**Click 2** · the JDBC Source line · **highlight** the JDBC Source box
> **The JDBC Source** is a Kafka Connect connector: a JSON file, no code. It also polls the table, but it keeps a cursor, the highest id it has seen. **→ click**

**Click 3** · the Debezium line · **highlight** the WAL / binlog box
> **And Debezium**, also on Kafka Connect. This one is CDC: it doesn't read the table, it reads the transaction log, the WAL in Postgres or the binlog in MySQL. **→ next slide**

### 4 · The scenario: A gets the lower id, but commits after B

Budget 1:15, leave by 3:10 · 5 clicks

**On open** · empty table, three cards · **highlight** the three cards
> **Okay, here's the case that shows the difference.** Two transactions write to the outbox at the same time, and the three publishers read it. **→ click**

**Click 1** · A: INSERT · row 1, state open · **highlight** row 1
> **Transaction A** inserts a row, gets id 1, but doesn't commit yet. The row is there, but nobody can see it. **→ click**

**Click 2** · B: INSERT + COMMIT · row 2, COMMIT B in the log · **highlight** row 2
> **Transaction B** comes in, gets id 2, and commits right away. Notice: the id is given at INSERT, not at COMMIT. **→ click**

**Click 3** · publishers read · B in all three topics, cursor = 2 · **highlight** cursor = 2 on the JDBC card
> **Now the publishers read.** They only see id 2, so all three publish B. The JDBC Source saves its cursor: 2. **→ click**

**Click 4** · A: COMMIT · row 1 committed, COMMIT A in the log · **highlight** row 1, now committed
> **Then A commits.** Id 1 shows up, but it's lower than the cursor. And this is normal with concurrent transactions. **→ click**

**Click 5** · publishers read again · relay and Debezium publish A, the JDBC card turns red · **highlight** the red line on the JDBC card
> **The publishers read again.** The relay publishes A, because published_at is still null. Debezium publishes A, in commit order. And the JDBC Source? Nothing. A is in the table, below the cursor, and no query will ever ask for it. **PAUSE** Confluent's own docs say it: incrementing mode always loses some data. Okay, now each one in detail. **→ next slide**

### 5 · Relay: the mark is in the row, written after the ack

Budget 1:05, leave by 4:15 · 5 clicks

**On open** · the loop code · **highlight** the SELECT lines
> **Let's start with the relay.** This is the loop. Select rows where published_at is null. **→ click**

**Click 1** · the send line · **highlight** kafka.send … .get()
> **Send each one**, wait for the ack. If a send fails, nothing gets marked. **→ click**

**Click 2** · the UPDATE and the main loop · **highlight** the last two lines
> **After the batch**, one UPDATE sets published_at. Sleep a second, go again. **→ click**

**Click 3** · card: Why A came out · **highlight** the card
> **And that's why A was published.** The relay asks "is this row published?", not "is the id bigger than the last one I saw?". **→ click**

**Click 4** · card: The cost, a duplicate · **highlight** the second e2 chip
> **The cost is a duplicate.** Say Kafka gets the event, and the relay dies before the UPDATE. The next loop sends the same row again, and the topic has the same event_id twice. The consumer just drops the second one. **→ click**

**Click 5** · card: What you get · **highlight** the card
> **Latency** is the poll interval. The table grows, so you delete old rows. And you get one class, no special database setup, and when something breaks, you can debug it. **→ next slide**

### 6 · JDBC Source: the mark is an id cursor, assigned before the commit

Budget 1:00, leave by 5:15 · 4 clicks

**On open** · the connector JSON · **highlight** mode and the cursor column
> **Now the JDBC Source.** No code, just this JSON. Mode incrementing, and the cursor column is id. **→ click**

**Click 1** · the query line · **highlight** the query
> **And a query.** It filters on published_at, but the connector never writes that column, so the filter does nothing. **→ click**

**Click 2** · the query that actually runs · **highlight** the WHERE id > ? line
> **This is the query that actually runs.** The connector adds "id bigger than the cursor", and the cursor lives in Kafka Connect: after B, it's 2. **→ click**

**Click 3** · card: Why A was lost · **highlight** the card
> **So that's why A was lost.** The id was given at INSERT. A committed below the cursor, and nothing ever asks for it again. No error, no log line, nothing. **→ click**

**Click 4** · cards: Timestamp mode? and Where it is fine · **highlight** the card 'Where it is fine'
> **Timestamp mode** with a delay only makes the window smaller. So the JDBC Source is fine for a single-writer table, or an old system without CDC. Not for an outbox with many writers. **→ next slide**

### 7 · Debezium: the mark is a position in the commit log

Budget 0:55, leave by 6:10 · 3 clicks

**On open** · the connector JSON · **highlight** slot, publication, snapshot
> **Then Debezium.** Also no code: this JSON replaces the relay. A replication slot, a publication with just the outbox table, and snapshot mode no_data. **→ click**

**Click 1** · the EventRouter lines · **highlight** the transform
> **Then the EventRouter transform** turns each outbox INSERT into a Kafka record: key is the aggregate_id, event_id and event_type in headers, the payload as value. **→ click**

**Click 2** · the MySQL line · **highlight** the line under the code
> **MySQL:** same transform, plus a server id and a schema history topic. **→ click**

**Click 3** · the three cards · **highlight** the card 'Why A came out, in commit order'
> **There's no query here.** Debezium reads the log from the slot, in commit order. A's commit came after B's, so the position can't skip it. You get commit order, milliseconds of latency, zero application code. And if the connector goes down, the slot keeps the WAL, so nothing is lost. **→ next slide**

### 8 · Debezium in production: same guarantee, different incident

Budget 1:00, leave by 7:10 · 2 clicks

**On open** · the Postgres card; the disk bars fill by themselves · **highlight** the two disk bars
> **The cost of Debezium is operations**, and it depends on the database. Postgres needs wal_level logical, so a restart. The slot keeps the WAL until the connector confirms it, so a stopped connector fills the disk. With a limit, the slot gets invalidated instead: you lose the gap, and the connector stops with an error. **→ click**

**Click 1** · the MySQL card · **highlight** the MySQL card
> **On MySQL** the binlog is on by default, but nothing holds it for Debezium. If the connector is down longer than the retention, you lose events, and the connector stops with an error. The default retention is thirty days. **→ click**

**Click 2** · the line at the bottom
> **So, same guarantee, different incident:** full disk, or lost events. Both times the connector stops with an error, so you know. Monitor the slot and the binlog age. **→ next slide**

### 9 · Side by side: what you write, where the mark lives, what you lose

Budget 0:30, leave by 7:40 · 3 clicks

**On open** · the table · **highlight** the row 'What you write'
> **Here's everything side by side.** What you write: a class, a JSON, a JSON. **→ click**

**Click 1** · row 2 · **highlight** the row 'Where the mark lives'
> **Where the mark lives:** in the row, in an id, in a log position. **→ click**

**Click 2** · row 3 · **highlight** the row 'Late commit'
> **The late commit:** next loop, lost, commit order. The other rows are for reference. **→ click**

**Click 3** · the line at the bottom
> **PAUSE** **So the difference is not polling versus CDC.** The relay polls and it's safe. The JDBC Source polls and loses data. The difference is where the mark lives. **PAUSE** **→ next slide**

### 10 · Which one? Two questions, then a default

Budget 0:40, leave by 8:20 · 3 clicks

**On open** · empty
> **So how do you choose?** Two questions, then a default. **→ click**

**Click 1** · question 1, JDBC Source out · **highlight** the red box
> **Does the outbox have many writers?** Almost always yes, so the JDBC Source is out. Keep it for read replicas and old systems without CDC. **→ click**

**Click 2** · question 2, Debezium · **highlight** the green box
> **Do you need low latency and commit order**, and will someone take care of the slot or the binlog? Then Debezium: zero application code, one more thing to operate. **→ click**

**Click 3** · the default, relay, and the Postgres / MySQL line · **highlight** the blue box
> **If not, the relay.** You own the code, the database needs nothing special, and you can debug everything. Postgres or MySQL: same guarantee, different incident. **→ next slide**

### 11 · Takeaway: where the mark lives decides what you lose

Budget 0:35, leave by 8:55 · 2 clicks

**On open** · takeaway · **highlight** the ✓ line
> **So the main idea:** where the mark lives decides what you lose. In the row, or in a log position, a late commit is never skipped. **→ click**

**Click 1** · the ✗ line · **highlight** the ✗ line
> **In an id cursor**, like the JDBC Source or your own "last id I saw", it's lost with no error. When Debezium loses events, the connector stops, so you know. **→ click**

**Click 2** · the ! line · stay here for questions, End = backups · **highlight** the ! line
> **Relay and Debezium** can still send twice, so dedupe by event_id. **PAUSE** Before you pick a publisher, check where it keeps its mark. Thank you! **→ next slide**
<!-- script:end -->

## Q&A prep

Stay on the takeaway slide for questions; the repo link is on it. Press **End** to reach the backups. Short
answers, and the backup slide to jump to (slide numbers as the presenter window shows them).

- **"Can't Kafka transactions or the idempotent producer solve the dual write?"** No: Kafka transactions
  cover Kafka topics, not your database, and the idempotent producer dedupes retries inside one producer
  session; a restart is a new session. The relay even runs with `retries=0` and idempotence off because it
  owns the retry through `published_at`. Backup 14.
- **"Why not fix the JDBC Source with timestamp mode?"** `timestamp+incrementing` with a delay only works if
  every transaction finishes within the delay, and `now()` in Postgres is the transaction's start, so a long
  transaction still lands "in the past". It narrows the window; it does not close it. Slide 6, last card.
- **"How do you scale the relay?"** One active instance via an advisory lock keeps order; `FOR UPDATE SKIP
  LOCKED` lets N relays share the table but loses order across them; sharding on `hash(aggregate_id)` keeps
  per-aggregate order. The POC runs one instance. Backup 15.
- **"How does the consumer dedupe?"** An inbox table keyed by `event_id`: insert `ON CONFLICT DO NOTHING` and
  apply the effect in one transaction, then commit the Kafka offset. If the effect is an external API call,
  pass `event_id` as its idempotency key. Backup 16.
- **"Is Debezium exactly-once?"** No. At-least-once: after a restart it replays from the last offset it
  committed, so the same event can appear twice. Same dedupe by `event_id`. Slide 11, third line.
- **"What about LISTEN/NOTIFY for the relay?"** A wake-up optimization: keep the polling loop as the safety
  net, use NOTIFY to cut the one-second latency. It does not change where the mark lives.
- **"How do you monitor the slot and the binlog?"** Postgres: `pg_replication_slots`, retained WAL and
  `safe_wal_size`; alert on an inactive slot and on retained WAL growing. For a quiet outbox set
  `heartbeat.interval.ms` so the slot keeps advancing. MySQL: `binlog_expire_logs_seconds` and `SHOW BINARY
  LOGS`. Drop the slot when you retire the connector. Backup 18.
- **"Postgres failover: does the slot survive?"** Before Postgres 17, logical slots were not replicated to the
  standby, so after a failover the connector needs a new slot and you can get a gap; Postgres 17 adds
  synchronized slots. On managed services check what the provider supports. Say this as "check your version
  and provider", not as a guarantee.
- **"And on a managed MySQL, like RDS or Cloud SQL?"** The provider decides the binlog retention, and the
  defaults are much shorter than 30 days, or zero on RDS unless you set it. Check your provider; the deck
  stays with self-managed MySQL on purpose.
- **"Why `snapshot.mode=no_data`?"** The outbox is a queue: the old rows were already published by whatever
  ran before. The cost is that rows written before streaming starts are never published, so register the
  connector before the service takes traffic. `never` is no longer a valid value; use `no_data`.
- **"Does the outbox table get cleaned under Debezium?"** Either delete the row in the same transaction (the
  EventRouter ignores deletes) or run a purge. The relay purges by `published_at`. Backup 19.
- **"Did you measure latency or throughput?"** No. The POCs show behavior, not performance. No controlled
  public benchmark compares the three on the same outbox; the vendor numbers are milliseconds for CDC and the
  poll interval for the pollers.
- **"Versions?"** Postgres 18.6, MySQL 8.4, Kafka 4.4.0, kafka-connect-jdbc 10.9.9, Debezium 3.7.0.Final,
  Java 26. The footer of slide 1.

## Delivery

- Read the bold anchor, look at the audience, say the rest in your words. The blocks are complete, so you can
  fall back to reading at any time without losing anything.
- Pause after every click and let the flash settle before you speak. A pause feels long to you and short to
  the room.
- Say the two key sentences slowly: "no query will ever ask for it" (slide 4) and "the difference is where
  the mark lives" (slide 9).
- Names: Debezium is "deh-BEE-zee-um"; WAL is said as a word, "wall"; `acks=all` is "acks all"; pgoutput is
  "p-g-output".
- Never apologize for the JDBC Source: the slide says where it is fine. The talk is a comparison, not an
  attack.
