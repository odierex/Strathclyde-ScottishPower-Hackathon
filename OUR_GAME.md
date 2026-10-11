# Our game

Fill this in and commit it with your code by 12:00 on Sunday. Short answers are fine.

There is a Word version, `OUR_GAME.docx`, if you prefer. Fill in one or the other, not both.

## Team

- Team name: Scooby Doo
- Team members: Steven Paton, Mei Jiang, Drishti Kedia, Khulood Sultan
- Name of our game: GRIDLOCK: Cyber Defence
- Name of our fictional business: StrathPower
- Where each name is set, so it can be changed (file and line): config.js, line 3-4

## What we built

- Level reached (Foundation, Extend or Stretch):Stretch
- Theme (Incident Room, Endurance Race, Map Room, our own, or none): Map Room
- Stretch capability, if any: Rewind & Compare

## How to run it

The exact steps from a fresh copy of the repository, including anything that needs installing.

1. Install Node.js 20
2. Download the files from the repo
3. Open the file "GRIDLOCK_Cyber_Defence"
4. Open the terminal with the file path to "\GRIDLOCK_Cyber_Defence\
5. Type "npm test" to ensure all works
6. Type "npm start" to start the game

## A walkthrough that works

One route through the game that we know works, step by step. We will follow it.

1. Open the Controls page.
2. Select controls P5, P6, P7, D1, R1, R2, R4.
3. Confirm the £2,550,000 purchase.
4. Start the simulation. 
5. Follow the attack on the interactive network map.
6. Answer two questions after each phase.
7. Complete all four phases and view the final results.
8. Use Rewind & Compare to test a different investment.
9. Restart the game.

## How it is built

- How the code is organised:
app.js — Interface, buttons and interactions.
game.js — Game progression and scores.
network.js — Interactive network map.
compare.js — Rewind & Compare feature.
style.css — Website design.
config.js — Game and company names.
controls.mjs — Original scoring engine.

- Where the game's state is kept (the budget, what is owned, the answers given): Stored in JavaScript through game.js, including purchased controls, current phase, answers and scores.
- How the theme is kept separate from the scoring: The network map is separate from the scoring engine, so changing the design does not affect the calculations.
- One design decision we made, what else we considered, and why we chose it: We chose a 2D network map instead of 3D because it is easier to understand, maintain and run.

## How the questions change the game

Which questions appear, when, and what a right or wrong answer does.

Players answer two questions after each attack phase.
- Correct answer: +5 points.
- Incorrect answer: 0 points.
- Time expired: 0 points.
- Players can drag answers or click them.
- Explanations appear after answering.
Question points are added to the security control score at the end.

## Tests

- What our tests cover: Budget validation and control selection, Game progression and scoring, Network map behaviour, Rewind & Compare calculations and Question handling and game reset.
- How to run them: run in terminal "npm test"
- One test we are glad we wrote, and why: Rewind & Compare checks that changing a control correctly updates the comparison without changing the original results.

## What does not work yet

Known problems and anything unfinished.

## Where AI tools helped

Which tools we used and for what. What we checked or changed ourselves.

We used ChatGPT & Claude to help develop the interface, JavaScript functions, interactions.

## Credits

Artwork, libraries and anything else we did not make.

