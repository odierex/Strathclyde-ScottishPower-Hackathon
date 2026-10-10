# Our game — hand-in note (COMPLETE THE BRACKETED FIELDS)

## Team

- **Team name:** [ADD]
- **Team members:** [ADD ALL NAMES]
- **Name of game:** GRIDLOCK: Cyber Defence
- **Fictional business:** Northstar Energy Services
- **Where to change the names:** `gridlock/config.js` (the `GAME_CONFIG` object)

## What we built

- **Level reached:** Stretch (Map Room theme + Rewind & Compare capability)
- **Theme:** Map Room
- **Stretch capability:** Rewind & Compare; one-control replacement using the original scoring engine

## How to run it

1. Open the project root folder (where `package.json` is located) and install Node.js 20 or newer.
2. Run `npm test` and check for zero failures.
3. Run `npm start`, then open http://127.0.0.1:8080 in a browser. No npm packages need installing.

## A walkthrough that works

1. In **Security Controls**, select `P5`, `P6`, `P7`, `D1`, `R1`, `R2`, `R4` for £2,550,000.
2. Deploy defences and open **Network Map**. Click nodes to read phase-linked information.
3. For each phase, press **Begin Decisions**, answer both timed questions, review the phase, and advance.
4. After phase 4, examine the report and original control score of 38. For all correct answers the behaviour score is 40.
5. In **Rewind & Compare**, remove `P7` and add `P3`. The alternative is 35 control points at £2,350,000; the original remains 38 at £2,550,000.
6. Start New Simulation to reset.

## How it is built

- **Organisation:** `game.js` handles state/transitions; `network.js` the map; `compare.js` the alternative plan; `app.js` screens/interaction; `style.css` appearance; `controls.mjs` supplied scoring.
- **Game state:** `GridlockGame` instance in `gridlock/game.js` owns selection, confirmed results, current phase, question progress and answers.
- **Theme separated from scoring:** map geometry and visual state in `network.js`; official calculations remain in the unchanged `1-foundation/starter/controls.mjs`.
- **Design decision:** One shared-screen web game rather than live multiplayer. We prioritised accessible visuals, deterministic scoring and tests within the hackathon timeframe.

## How questions change the game

Two original phase-linked questions per phase (eight total) are selected by the `PHASE_QUESTIONS` list in `game.js`. Correct answers earn 5 team-chosen behaviour points; incorrect or timed-out answers earn 0. Each checkpoint uses two 30-second questions with pause. The original wording, answers and explanations remain in `questions.json`. Behaviour points are kept separate from control points and added in the final report.

## Tests

- **What tests cover:** sponsor-provided data/scoring, control validation, budget, locking selections, all four phases, one-answer-only rule, unanswered questions, reset, map nodes/path, category sums, comparison validity and preserving original results.
- **How to run them:** `npm test` from project root.
- **One test we are glad we wrote:** comparison checks the official phase-difference sum matches the difference in total scores, without modifying the original purchased basket. This helps prevent attractive but misleading comparison visuals.

## What does not work yet / limits

- Illustrative network-map topology only; not a live grid or actual network penetration simulation.
- The approved attacker storyline is fixed through all four phases. Map feedback shows points and context, not a physically simulated stop/containment outcome.
- No multiplayer, saved games, cloud data, online AI, or no-code scenario authoring.
- Uses 8 preselected phase-aligned questions per game rather than randomly drawing from all 40.
- **[ADD any new bugs or unfinished changes found during the team's own testing.]**

## Where AI tools helped

- AI assistance was used to draft the interface, JavaScript modules, tests, documentation and presentation outline. The team must verify, edit and understand the result before submitting. The running game calls no AI service.
- **[ADD what team members personally checked, modified, tested or contributed.]**

## Credits

- ScottishPower StrathHack26: challenge story, control catalogue, question bank and scoring module.
- Interface and simulation code built for the team with AI-assisted drafting; final testing and adaptation are the team's responsibility.
- No external libraries, fonts, images or third-party runtime APIs required.
