# The Incident Room — StrathHack 2026

A browser-based cyber-awareness training game using the **supplied ScottishPower game data and scoring engine**. Matches the team's dark Incident Room mockup, with **no Help item** in the navigation.

## Quick start

Requires **Node.js 20 or later**; no `npm install` or internet access required.

```bash
npm test
npm start
```

Open **http://127.0.0.1:8080/** in a browser. Press Ctrl+C to stop the server.
If port 8080 is taken, on Linux/macOS use `PORT=3000 npm start`.

**Do not double-click `index.html`:** browsers will block fetching its JSON in `file://` mode.

## Playthrough

1. Open **Controls**, choose at least one **Prevent**, **Detect** and **Respond** control and stay within £3,000,000.
2. Click **Confirm controls & begin attack**. Purchases are now locked.
3. Review Phase 1 (Delivery) and click **Start behaviour checkpoint**.
4. Answer two original behavioural questions. Each has a **30-second timer** and a **Pause timer** button; unanswered questions time out for zero points. After each response, read the original explanation and continue.
5. Review Phase 1 results, then continue through Phases 2–4.
6. View the **Final Incident Report**, then choose **Play Again** to restart.

## Features

- Three purchase categories, £3m budget, 18 available controls, 3 pre-existing defences displayed but not purchasable.
- Real four-phase scenario and scores, using the official `scoreSelection` function unchanged.
- Two supplied behavioural questions per phase, with original text, options, answer and explanations; +5 for correct, 0 otherwise.
- Incident messages displayed as fictional emails, operations updates, calls and ransomware notice; dynamic illustrative company status and category scores.
- Controls, Company Status, and Incident Room navigation (Help intentionally removed).
- Separate control and behavioural scores, individual phase breakdowns, learning debrief and full reset.
- Semantic HTML, keyboard-operable controls, visible focus, accessible colour-independent labels, mobile layouts and reduced-motion support.
- Tests covering purchases, budgets, duplicate scoring, phase progression, timeout behaviour and resets.

## Structure

```text
1-foundation/data/challenge.json       Official scenario, control costs and phase points
1-foundation/data/questions.json       Official 40 questions
1-foundation/starter/controls.mjs      Unmodified official scoring engine
1-foundation/starter/serve.mjs         Supplied local server (home path changed to this game)
1-foundation/tests/                   Supplied tests
incident-room/index.html             Game page + local SVG icon symbols
incident-room/style.css              Responsive visual design
incident-room/app.js                 Page rendering, navigation, timer, UI events
incident-room/game.js                Game rules and player state (doesn't depend on DOM)
incident-room/events.js              Fictional illustrative messages for the theme
incident-room/tests/game.test.mjs    Tests for our new game logic
incident-room/config.js               Team-editable game and business names
```

## What is official vs team-authored?

- **Official and unchanged:** controls/scoring module, `challenge.json`, `questions.json`, supplied tests.
- **Team-authored:** HTML/CSS and gameplay code; illustrative message/story presentation; +5 points per correct question; progress indicators. These indicators are *illustrative*, not real risk calculations.
- **One local server change:** the supplied server's home address now redirects to `/incident-room/index.html` rather than the example demo page.
- No database, external service, framework, account, CDN, or online AI call is needed.
- The reference mockup shows a phishing email as an example. The playable questions show the **exact official question-bank wording**, so the illustrated email does not replace quiz content.

## Customise

The team-editable game and fictional business names are defined together in `incident-room/config.js`. The visible game heading remains **The Incident Room** to match the requested mockup; the distinctive full game name is **Night Shift: The Incident Room**, and the fictional business is **Northstar Energy Services**. Change those values in `config.js` if the team chooses different names. To customise the ScottishPower challenge-sponsor label, edit the `.brand strong` text in `incident-room/app.js`. This is a hackathon prototype, not an official ScottishPower service.

**Do not change control IDs, categories, costs or phase scores without confirming with the challenge organisers**: the official rules and automated tests rely on them.

## Suggested presentation route

For a quick demonstration use `P5, P6, P7, D1, R1, R2, R4` as the purchased controls. This costs £2,550,000 and the official engine gives phase control scores **14, 10, 8, 6** (total **38**). Demonstrate one correct question (+5), a wrong answer (0), the phase result and the final report. Use the existing tests to explain the architecture.

## Submission reminders

Commit this project with the completed **OUR_GAME.md or OUR_GAME.docx** before the submission deadline; the blank original form is **not** completed by this code. Add your actual team names, your design choices, test instructions, known limitations, credits, and any AI assistance accurately.
