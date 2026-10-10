# Our game — DRAFT FOR THE TEAM TO CHECK AND COMPLETE

> Fill in your actual team information, check every claim against your final version, and remove this instruction before submitting. Do not claim any feature you have removed or modified.

## Team

- **Team name:** [ADD TEAM NAME]
- **Team members:** [ADD ALL TEAM MEMBERS]
- **Name of our game:** Night Shift: The Incident Room
- **Name of our fictional business:** Northstar Energy Services
- **Where each name is set:** `incident-room/config.js` (the `GAME_CONFIG` object)

## What we built

- **Level reached:** Extend (the Foundation game plus the Incident Room theme)
- **Theme:** Incident Room
- **Stretch capability:** None. We focused on a complete core game and responsive themed interface.

## How to run it

1. Install **Node.js 20 or later**. Open a terminal in the top project folder (beside `package.json`).
2. Run `npm test`, then `npm start`. Open `http://127.0.0.1:8080/` in your browser. No `npm install` is needed.

## A walkthrough that works

1. Open the Controls tab and buy `P5`, `P6`, `P7`, `D1`, `R1`, `R2` and `R4`. This costs £2,550,000.
2. Confirm the purchase. The scoring engine reports 38 total control points across the four phases (14, 10, 8, 6).
3. Read the phase briefing, start the checkpoint and answer two questions. The explanation appears after each answer.
4. Review the control contributions. Repeat for Phases 2–4 and open the Final Incident Report.
5. Use Play Again to reset.

## How it is built

- **Code organisation:** `incident-room/game.js` contains the gameplay state and rules. `incident-room/app.js` builds the pages, handles input and runs the question timer. `incident-room/events.js` holds themed incident messages. `incident-room/style.css` handles the visual design. `1-foundation/starter/controls.mjs` is the unchanged supplied scoring engine.
- **Game state:** The `IncidentGame` object holds selected purchases, scoring results, current phase and question, submitted answers and behaviour score. The browser holds state in memory; a full page reload restarts the simulation.
- **Theme vs scoring:** The incident messages are presentation-only and stored separately from `challenge.json`; the control score comes exclusively from the official `scoreSelection` function.
- **Design decision:** We chose a client-side JavaScript game with a minimal local Node server rather than a database-backed system. This limits complexity and makes the single-screen training game easy to demonstrate and test.

## How the questions change the game

Two supplied, phase-linked questions appear after each of the four phases, with a 30-second timer per question and a facilitator pause option. A correct answer adds 5 behaviour points. Incorrect or unanswered questions add zero. Players cannot score the same question twice, and each question shows its original explanation. Behaviour points appear separately from control points and are included in the final total.

## Tests

- **Coverage:** `1-foundation/tests` checks the supplied engine and question data. `incident-room/tests/game.test.mjs` checks purchasing, budget limits, missing categories, locked selections, correct/incorrect/timed-out questions, duplicate-answer prevention, four-phase progression and reset.
- **How to run:** `npm test` from the root folder.
- **Useful test:** The duplicate-answer test makes sure a player cannot earn repeated points by submitting the same answer again.

## What does not work yet / limitations

- Single-browser game, not cooperative multiplayer; game state is not saved across page reloads.
- The phase messages and the company-status indicators are illustrative training features, not a physical attack simulator or a real estimate of infrastructure damage.
- Two of the supplied 40 questions are used in each phase. The full question bank remains available as data, but the game does not present all 40 in a single playthrough.
- No optional Stretch capability has been implemented.

## Where AI tools helped

ChatGPT (OpenAI) assisted with initial HTML/CSS/JavaScript implementation, integration of the provided scoring code, new game logic and tests, documentation, and browser walkthrough. [TEAM: Add any other AI assistance; explain what your team actually reviewed, changed, tested and understood.]

## Credits

- ScottishPower's supplied scenario data, question bank, official control-scoring engine, local server, and starter tests.
- Interface, illustrative messages, icons and game code created for this hackathon prototype with AI assistance (see above).
