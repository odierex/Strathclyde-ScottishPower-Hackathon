# GRIDLOCK — StrathPower interaction update

## What changed

1. Renamed the **fictional company** in the game header from Northstar Energy Services to **StrathPower**, in `gridlock/config.js`. Kept ScottishPower as the hackathon sponsor and kept their challenge data untouched.
2. `gridlock/app.js`: Added a large **Drop a Letter Here** answer area to each behaviour checkpoint. A mouse can drag any of A–D onto it using native HTML drag-and-drop. A touchscreen can drag the small letter tile via pointer events.
3. Added click, tap and keyboard button fallback. A selected answer appears in the drop area; users can replace it before pressing **Submit Answer**. A drag alone does **not** submit the question.
4. Added a question-timer progress bar and clearer instructions, without modifying its existing 30-second limit, Pause/Resume control or timeout scoring.
5. `gridlock/style.css`: Styled the light drop target, drag-over highlighting and a touch drag letter preview. Reduced-motion settings respected.
6. Updated the README, hand-in note, presentation script (company name), and code explanation.

## What was intentionally kept unchanged

- The official £3 million purchasing rules and `controls.mjs` scorer.
- The supplied 18 controls, attack phases, 40 question texts, correct answers, explanations and scoring data.
- Four phases, original choice-to-score behaviour, network map, Rewind & Compare and final report.
- No extra database, packages, accounts or server endpoints.

## Checks

- `node --check gridlock/app.js`: passed.
- `npm test`: 43 tests passed, 0 failed.
- The new drag/drop should also be checked manually on your team's Windows browser and any phone/tablet used for the demo.

## Run

From the extracted project folder: `npm test`, then `npm start`. Open http://127.0.0.1:8080/.
