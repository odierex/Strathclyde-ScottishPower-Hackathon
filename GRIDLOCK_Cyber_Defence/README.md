# GRIDLOCK: Cyber Defence — StrathHack26

## Admin Studio (new)

You can change the game configuration without touching the supplied ScottishPower files. With `npm start` running, visit **http://127.0.0.1:8080/admin/index.html** (or use the **Admin Studio** sidebar link). Edit question wording and correct answers, control prices and scores, budget, question timing, game names and more. Press **Save version to disk**. Each save becomes a JSON snapshot in `.gridlock-saves/history/`, while `.gridlock-saves/active.json` is loaded when the game is reopened.

Use **History** to see which fields changed and their previous and new values, download any version, restore a previous version, or restore the original. Source files inside `1-foundation/` are never modified. **The Admin Studio is intended for localhost only and has no login system. Do not expose it publicly.** See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for the full walkthrough, limitations and backup advice.


A complete, locally hosted cyber-awareness game with a **Map Room** theme and a **Rewind & Compare** stretch capability. Built for ScottishPower's approved four-phase fictional ransomware scenario.

**Node.js 20+ required. No packages, accounts, database or keys.** All code runs locally in the browser; Node.js only serves static files.

## Start on Windows / Linux / macOS

1. Extract the ZIP. Open a terminal *in this folder* (where `package.json` lives).
2. Run `npm test` and check that all 43 tests pass.
3. Run `npm start`.
4. Open **http://127.0.0.1:8080** in Chrome, Edge or Firefox.
5. Press `Ctrl+C` in the terminal to stop the server.

If the port is occupied, on Windows Command Prompt run `set PORT=3000 && npm start`, or on PowerShell run `$env:PORT=3000; npm start`, then open http://127.0.0.1:3000. On Linux/macOS run `PORT=3000 npm start`.

Windows PowerShell may block `npm.ps1`. Use **Command Prompt** or run `npm.cmd start` / `npm.cmd test`.

No `npm install` step is necessary. Open the site through the local server, **not by double-clicking the HTML file**, because JSON is loaded by `fetch()`.

## Updated: answer interaction and StrathPower

The fictional company displayed in the game is **StrathPower** (editable in `gridlock/config.js`). During every behavioural question, you can **drag an answer letter (A–D) into the answer box** with a mouse. On touchscreens, drag the letter tile with a finger, or simply **tap the answer**. Keyboard players can tab to an answer and press Enter or Space. The selected answer appears in the box, and can be changed until you press **Submit Answer**. A small timer progress bar shows remaining question time; each question still has the original 30-second limit, with Pause/Resume available. Scoring, scenarios, question wording and Rewind & Compare were not changed.

## How to play

1. Select at least one **Prevent**, one **Detect**, and one **Respond** control; stay within **£3 million**. Select each at most once. Three controls are already installed and cannot be purchased.
2. Press **Deploy Defences**. Purchases lock for the run.
3. On the network map, click or tap any of the six **fictional business systems**. The selected system's explanation and control contributions appear below the map.
4. The attacker progresses through four **fixed, approved stages** (Delivery → Discovery → Command & control → Encryption & ransom). The map reveals the path phase by phase. The game is designed to reach the final ransomware stage even with good controls; the controls' **points** are the formal outcome.
5. After each stage, answer **two original behavioural questions** from the supplied 40-question bank. Each question allows **30 seconds**, can be paused, and explains the original answer immediately. Correct answers earn **five team-chosen points**; wrong or timed-out answers earn zero.
6. Review each phase, then advance. The final report shows the original control score, question score, total, phase breakdown and lessons learned.
7. Use **Rewind & Compare** to swap **one** control after a completed game. The official scoring engine checks that the alternative selection is valid and produces a side-by-side **control-only** score comparison. The original score and answers never change.
8. **Start New Simulation** resets purchases, phase progression, answers and scores.

## Demo route that is tested

Select `P5`, `P6`, `P7`, `D1`, `R1`, `R2`, `R4`; this costs **£2,550,000** and scores **38 official control points**. Complete all eight questions. Answering all correctly gives **40 behavioural points** and a final **78**. In Rewind & Compare, remove `P7` and add `P3` to see a valid alternative worth **35 control points**, three fewer than the original.

## File map

| File | Responsibility |
|---|---|
| `gridlock/index.html` | Accessible page entry point, title, stylesheet and JavaScript module |
| `gridlock/style.css` | Dark theme, responsive layout, buttons, cards, network graphics and mobile styles |
| `gridlock/app.js` | Browser user interface, navigation, map rendering, click handlers, question countdown and results |
| `gridlock/game.js` | Game-state machine, purchases, official control score, phases, answers and reset |
| `gridlock/network.js` | Map nodes, edges, attacker route, selected-system explanation and category-based phase indicators |
| `gridlock/compare.js` | Rewind & Compare alternate control selections; calls original scorer without changing the original playthrough |
| `gridlock/config.js` | Change game and fictional business names in one place |
| `1-foundation/starter/controls.mjs` | **Unmodified official** data validator and control scoring engine |
| `1-foundation/starter/serve.mjs` | Supplied Node.js local static server with only the homepage changed to `/gridlock/index.html` |
| `1-foundation/data/challenge.json` | **Unmodified supplied** £3m budget, 18 controls, four scenario phases and official per-control points |
| `1-foundation/data/questions.json` | **Unmodified supplied** 40 cyber behavioural questions and explanations |
| `1-foundation/tests/*` | Original scoring and data tests |
| `gridlock/tests/*` | New state-machine, graph and comparison tests |
| `PRESENTATION_SCRIPT.md` | Ready-to-rehearse eight-minute team talk and demo sequence |
| `CODE_EXPLANATION.md` | What the code does, technical decisions and likely judge questions |
| `OUR_GAME.md` | Hand-in note; **fill in team members before committing** |

## Distinguish core score from theme effects

- **Official scoring:** comes only from `scoreSelection(challenge, selectedIds)` in the supplied `controls.mjs`. The chosen controls score in *every* phase and no control purchases occur mid-attack.
- **Question scoring:** the team adds 5 points for each secure answer. All supplied question text, options, correct choices and explanations are preserved as-is.
- **Illustrative map effects:** path colour, selected-system explanation and aggregate Prevent/Detect/Respond category totals explain the score and progress. These **do not** claim to simulate a real network, actual cyber damage, or changing real incidents.
- **Stretch comparison:** uses the **same official scoring module** with a valid alternative list; no alternate cybersecurity events are generated.

## Team hand-in checklist

- [ ] Fill in team name, members and known limitations in `OUR_GAME.md`.
- [ ] Run `npm test`, run the game on a fresh copy and complete a full playthrough.
- [ ] Ensure each team member can explain one module, one design decision and one test.
- [ ] Confirm with organisers whether the current `challenge.json` and `controls.mjs` are the authoritative versions, because older files describe a different round-based engine.
- [ ] Credit AI assistance and confirm the final UI text with the sponsor's representatives.
- [ ] Commit the full project to GitHub by **Sunday 11 October at 12:00**; prepare an **8-minute presentation and 2-minute questions**.
