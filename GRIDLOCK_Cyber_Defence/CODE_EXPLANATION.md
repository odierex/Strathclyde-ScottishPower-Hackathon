# GRIDLOCK — Explain the Code to the Judges

## The system in 20 seconds

"We kept the scoring engine and approved cyber question bank separate from our visuals. The data defines the incident and its rules, the game-state module controls the playthrough, the network module translates phase progress and scores into a clickable map, and the app module draws everything and handles input. We added a pure comparison module, plus tests for the new functions."

## Flow (the most useful diagram to understand)

```
ScottishPower challenge.json + questions.json
                 |
                 v
        gridlock/game.js   <-- scoring controls.mjs (supplied, untouched)
                 |
      +----------+-------------+
      v                        v
network.js                 compare.js
(map states and           (alternative scoring
 explanations)            after final report)
      |                        |
      +----------+-------------+
                 v
            gridlock/app.js
            renders website
                 |
           index.html + style.css
                 |
         Node.js serve.mjs serves files (no game API/database)
```

## Exact code responsibilities

### `1-foundation/data/challenge.json`
This is sponsor-provided data: 18 possible control purchases, costs, categories, four approved phase stories, budget £3,000,000 and the score each control earns in each phase. **We do not edit the cyber content or scores.**

### `1-foundation/data/questions.json`
40 original multiple-choice behaviour questions with answer keys, explanations, phases, and tiers. The game takes eight fixed, phase-linked questions (two per phase); fixed selection helps make the demo repeatable. Original text is never changed.

### `1-foundation/starter/controls.mjs`
`validateData` checks valid cyber scenario data; `scoreSelection(challenge, selectedIds)` verifies a unique, affordable selection containing all three categories and returns phase contributions, spending and overall score. It is pure: same input means same output. **We reused this original module without modifications.**

### `gridlock/game.js`
`GridlockGame` contains all the mutable state: selected purchases, whether they are locked, current phase, question index, individual answers, and behaviour points. The flow is `controls` → `briefing` → `checkpoint` → `summary`, repeated four times, then `results`. Invalid transitions throw controlled errors; controls cannot change after confirmation; answer points cannot be awarded twice. `reset()` clears the run.

### `gridlock/network.js`
`SYSTEMS` and `LINKS` define six fictional systems and their schematic connections. `PHASE_NODE` defines the active system for each attack phase. `nodeState()` labels active, visited, pending and recovery nodes. `phaseMetrics()` groups **official phase contributions** by Prevent/Detect/Respond and creates **illustrative learning labels** about visibility and readiness. `nodeInsight()` makes per-system explanations. The map does not change the official cyber scenario; it **shows the consequences** of previously selected controls.

### `gridlock/compare.js`
`swapControl()` and `compareBasket()` make a **new alternative selection** only when all official rules allow it. The function calls the original `scoreSelection` twice and returns original and alternative totals, cost and phase score differences. The original run is never modified. Example: swapping `P7` for `P3` after the demo basket changes the score from 38 to 35.

### `gridlock/app.js`
`boot()` fetches approved JSON data and creates the game object. `render()` produces the screens, map nodes, selection cards, questions and final report. Click listeners handle each button. The countdown gives 30 seconds per question, offers a pause, and calls `game.answer(null)` at time-out; a timed-out question earns zero. Every user-provided/JSON value interpolated into HTML goes through `safe()` to escape HTML characters.

### `gridlock/style.css` and `gridlock/index.html`
HTML is the lightweight entry page. CSS handles the dark UI, node positions, attack path indicators, controls, readable text, focus outlines and mobile layout. There is no 3D dependency or external API.

### `1-foundation/starter/serve.mjs` and `package.json`
`npm start` serves the files locally. `npm test` runs the supplied unit tests and ours. The server is NOT a multiplayer backend, and the game does NOT require a database or online AI.

## A design decision the judges may ask about

**Q: Why not make the attacker genuinely stop when the best controls are selected?**

A: "The approved tabletop scenario always takes the organisation through all four phases. We didn't want to invent a new cyber scoring model or falsely imply that one purchased control guarantees protection. Our map visually follows the fixed attack while the original scoring engine measures how the chosen controls perform. That keeps the learning accurate and easy to check."

**Q: Why separate `network.js` from `game.js`?**

A: "The same scoring game could be presented as a Map Room or an Incident Room. The game module owns the rules and state; the network module only decides how to show those results. We can change the theme without changing the approved security calculations."

**Q: How do you know the score is correct?**

A: "We call ScottishPower's original `scoreSelection`, not our own copy. Our tests check official expected values, and the comparison feature checks that the per-phase differences add up to the total score difference."

**Q: Where is your backend?**

A: "The Node.js server just serves static local files. A backend database or live multiplayer would add deployment and reliability risks without improving the core learning experience in the time available. All game logic runs locally in the browser."

**Q: How did AI help?**

A: "We used AI-assisted coding to produce a starting structure and interface. We still need to understand it ourselves, verify the sponsor's scoring behavior, run a full playthrough, and explain tests and design trade-offs. The running app never calls an online AI service."

**Q: What is the current limitation?**

A: "The network is schematic, not a physical or network-level simulation, and the attackers' actions follow four fixed approved stages. Our dynamic consequences are control-point contributions, explanatory labels and comparisons rather than a fully branching incident engine. Multiplayer and content editing by facilitators are not included."

## Demonstration and code walk-through

1. Show `challenge.json` and `controls.mjs`: "The rules are supplied and unchanged."
2. Show `game.js` `confirmControls()` and `answer()`: "We enforce locks and correct answer scoring."
3. Show `network.js` `phaseMetrics()`: "These category scores power the changing map detail and status."
4. Show `compare.js` `swapControl()`: "We calculate a real alternative without changing the original."
5. Run `npm test`: "This validates the scoring behavior, transitions, graph and comparison."

## Useful limitations to disclose

- No persistent saves: refreshing resets the game.
- One shared screen, not multiplayer.
- The map's connections are **schematic**. No real ScottishPower infrastructure is modelled.
- Behaviour points and UI labels are team decisions, not official control scores.
- Eight preselected questions are used per playthrough; all 40 stay available in supplied data.
- No online AI, new controls editor or external accounts.


## Drag-and-drop question answers (StrathPower update)

The displayed **StrathPower** business name is configured in `gridlock/config.js` (the supplied ScottishPower challenge data remains untouched). In `gridlock/app.js`, `questionCard()` renders a visible drop area and answer letters. `dragstart`, `dragover`, `drop` and `dragend` make the letters draggable with a mouse. Pointer events (`pointerdown`, `pointermove`, `pointerup`) allow a user to drag the letter tile by touch; a temporary floating letter indicates what is being moved. A user can also click, tap or keyboard-activate an ordinary answer button. In each case `selectAnswer()` only **selects** the proposed answer; `game.answer()` in `gridlock/game.js` is invoked only when the player presses **Submit Answer**, so an accidental drop does not lose points. After answer submission or timer expiry, the options lock and the original question explanation appears. A thin countdown progress bar is shown, but the timer rules are unchanged. The design for the drop box, ghost letter and feedback is in `gridlock/style.css`.
