# GRIDLOCK: Cyber Defence — 8-minute presentation script

**Game:** GRIDLOCK: Cyber Defence  
**Theme:** The Map Room (high-effort option)  
**Stretch feature:** Rewind & Compare  
**Fictional organisation:** Northstar Energy Services  
**Team:** [Add team name and team members]  

**Rehearsal instruction:** Aim for **7 minutes 30 seconds** so you have time for slow page loads and questions. Share these sections across your team. Anyone can use the full script, but only claim the testing and architectural decisions you personally verified. The times below are suggestions; rehearse with a real clock. The demo can be performed using the preselected basket listed below.

## 0:00–0:50 — Introduction (Speaker 1)

> "Hi, we're [team name], and we've built GRIDLOCK: Cyber Defence. Our idea is to turn cyber awareness from a passive training exercise into something you can see and explore. Instead of answering a quiz in isolation, you're responsible for a fictional energy-services company. You have three million pounds to spend on cyber security, and a ransomware attack is about to unfold overnight. Our aim is to show *why* spending choices and individual behaviour both matter. We selected the Map Room concept because it gives the player a clear, visual understanding of the attack without making the experience difficult to learn."

**On screen:** Controls page, showing the £3 million budget.

## 0:50–1:55 — Security investment gameplay (Speaker 1)

> "Before the attack starts, players choose controls from three categories: Prevent, Detect and Respond. Every control has a cost and an explanation. Players must cover all three categories and stay within budget. We keep this logic faithful to the scoring rules ScottishPower supplied. Once the plan is confirmed, no more purchases can be made during the incident. So players have to think about trade-offs ahead of time, just as an organisation would when allocating a limited budget."

**Demo:** Choose these seven controls and click **DEPLOY DEFENCES**:

| ID | Control | Cost |
|---|---|---:|
| P5 | Training and awareness | £250,000 |
| P6 | Email security | £250,000 |
| P7 | Multi-factor authentication and identity management | £400,000 |
| D1 | Security information and event management (SIEM) | £700,000 |
| R1 | Incident response plan | £50,000 |
| R2 | Incident response team - 24/7 | £500,000 |
| R4 | Backup restores | £400,000 |
| | **Total** | **£2,550,000** |

> "That leaves £450,000 unspent. Our aim isn't to reward the biggest spend — it's to help people make a reasoned choice about where security controls are useful."

## 1:55–3:25 — The map and cyber incident (Speaker 2)

> "Here is the part that makes GRIDLOCK different. This isn't a static background or a slide with four questions. We've modelled six named business systems: the email gateway, an employee laptop, the office network, identity services, a document server, and backups. A visible attack path connects them. Each phase focuses attention on a different part of the network."

**Demo:** Click **Employee laptop**, then **Office network**. Show how the selected-system explanation changes.

> "At 16:40 a convincing phishing message reaches an employee. Later, the attacker explores the internal network. At half past three in the morning, a caller pretending to be IT asks for an authentication code. Before the day shift, documents are encrypted. When you select a system, the game tells you what it does, which phase it's associated with, and which of your purchased controls contributed points. For example, a detection system helps reveal evidence of activity. We don't make the misleading claim that detecting an attack automatically stops it."

**Demo:** Point to Prevention, Detection and Response point totals. If time permits, briefly complete Phase 1 before continuing.

> "The underlying attack story is the approved four-phase scenario. What changes with a player's investment is the control performance and how we explain that on the map — not an invented claim about what would happen to a real electricity network."

## 3:25–4:25 — The human-decision checkpoint (Speaker 2)

> "Security is not just technology. After each phase we ask two short questions from ScottishPower's original behavioural question bank. They relate to the incident: suspicious emails, unexpected MFA requests, impersonation or safe data handling. A secure answer earns five additional points, while an incorrect or timed-out answer earns zero. The player immediately sees the approved explanation, so learning happens during the simulation, not just at the end. The timer can be paused to support facilitated sessions."

**Demo:** Press **BEGIN DECISIONS**, answer the first question correctly and submit. Show the explanation. If you want to demonstrate the consequence of a wrong answer instead, deliberately choose a wrong option and show the zero points — *explain that you're doing it for the demo*.

> "This is important because no security tool can substitute for a person reporting a mistake quickly or checking an unexpected request through a trusted channel."

## 4:25–5:30 — Scoring and what we built (Speaker 3)

> "We deliberately separated the official cyber rules from our interface. The challenge file contains the costs, controls and phase scores. ScottishPower's existing `controls.mjs` module checks the budget and produces control scores. We reused that engine without changing its scoring. Our own `game.js` tracks the chosen controls, locks purchases, manages the phase sequence and records the answers. The `network.js` file turns these results into map states, lines and selected-system information. The `app.js` file displays the screens and handles buttons and timers; `style.css` is responsible for the responsive design. Keeping those responsibilities separate makes the app easier to test, maintain and update."

**Demo:** Briefly switch to VS Code and show `game.js`, `network.js`, and `app.js` (or use one clear screenshot of the files).

## 5:30–6:35 — Our stretch feature: Rewind & Compare (Speaker 3)

> "We also wanted the game to teach trade-offs rather than just show a final score. So we implemented Rewind & Compare. After completing the four phases, players can replace one security investment and immediately compare the results for every phase. This runs through the *same official scoring engine* — there is no second set of made-up rules. The original game is preserved, and an alternative that breaks the budget or category rules is rejected."

**Demo:** Open the final report from a previously completed playthrough. Choose **Remove P7** and **Add P3**; click **COMPARE**.

> "With our demonstration investment plan, the original choice earns 38 control points. Swapping P7 for P3 gives 35 control points. That's three points fewer, even though it costs less. You can compare which phases changed, not just the overall total. This lets teams discuss whether the saving is worth the difference in protection in this teaching model."

**Timing tip:** Have a *second browser tab* with a completed game ready to show at this point. Do not spend four minutes clicking through all eight questions during the actual eight-minute presentation.

## 6:35–7:20 — Testing and practical engineering (Speaker 4)

> "We prioritised reliability over unnecessary complexity. The whole application runs locally in a browser; Node.js only serves the files, so there's no database, login, live external API or online AI needed while playing. We tested purchasing rules, duplicate answers, invalid progression, phase scores, map state, category calculations and alternative-control comparisons. Our automated test suite has 43 passing tests. We also walked through the full game in a browser, from purchases to restart, and checked the responsive layout."

**Demo:** In VS Code terminal, run `npm test`, or show the passing test output.

## 7:20–8:00 — Why the game matters (Speaker 1)

> "GRIDLOCK is deliberately a learning simulation, not a real penetration-testing tool. The map is schematic, and the incident follows an approved storyline. But those limits are also a strength: they make the experience safe, explainable and repeatable for training sessions. By combining a clear visual attack path, secure human decisions and a chance to compare alternatives, we've built a game that teaches not only *what* to choose, but *why* the choice matters. Thank you — we're happy to show the code or answer any questions."

---

## Ten-second demo cheat sheet

**Demo controls:** `P5 P6 P7 D1 R1 R2 R4` → **£2,550,000 spent / £450,000 left / 38 control points**.  
**Correct answers for the eight chosen questions:** `Q02 C`, `Q29 A`, `Q09 B`, `Q37 A`, `Q12 C`, `Q15 B`, `Q22 D`, `Q30 D`.  
**All eight correct:** 40 behaviour points → **78 total points**.  
**Rewind comparison:** Replace `P7` with `P3` → **35** alternative control points, down 3; alternative spend **£2,350,000**.

## Likely judge questions and good short answers

**"Is the map a real network simulation?"** No. It is an illustrative model tied to approved phase data and the original scoring, not a live attack model.

**"What changes if the player changes a control?"** The official score contributions, category totals, system explanation and alternate score comparison. The approved incident story and its four stages remain fixed.

**"What did you actually add beyond the starter code?"** Purchase workflow, game-state transitions, map visuals and interaction, question/timer scoring, accessible interface, after-action report, Rewind & Compare, and tests for all added behaviour.

**"What is your strongest engineering decision?"** Separating pure official rules, game state, visual theme and comparison. This avoids hidden assumptions and permits independent testing.

**"What would you improve next?"** A no-code content editor for future approved scenarios, more facilitator controls, and optional shared-device team roles — without changing the official scoring unexpectedly.

**"How did you use AI?"** State the tools you actually used, which code you reviewed, and what you personally tested. Do not imply the app or design was wholly hand-coded if it was AI-assisted.
