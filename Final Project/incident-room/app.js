import {IncidentGame, PHASE_QUESTIONS, POINTS_PER_CORRECT_ANSWER, QUESTION_SECONDS, CATEGORIES} from './game.js';
import {EVENTS} from './events.js';
import {GAME_CONFIG} from './config.js';

const app = document.querySelector('#app');
let game;
let view = 'controls';
let selectedOption = null;
let timerKey = '';
let secondsRemaining = QUESTION_SECONDS;
let paused = false;
let timerHandle = null;
let toast = '';

const pounds = n => '£' + n.toLocaleString('en-GB');
const safe = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (id, cls = '') => `<svg aria-hidden="true" class="icon ${cls}"><use href="#i-${id}"></use></svg>`;
const niceCategory = cat => ({Prevent:'prevent', Detect:'detect', Respond:'respond'}[cat] ?? '');
const event = () => EVENTS[game.phaseIndex];
const activeQuestionKey = () => game.screen === 'checkpoint' && !game.currentAnswer ? `${game.phaseIndex}:${game.questionIndex}` : '';

function startQuestionTimerIfNeeded() {
  const key = activeQuestionKey();
  if (!key) { stopTimer(); timerKey = ''; return; }
  if (key === timerKey) return;
  stopTimer();
  timerKey = key;
  paused = false;
  secondsRemaining = QUESTION_SECONDS;
  timerHandle = setInterval(() => {
    if (paused || !game || game.screen !== 'checkpoint' || game.currentAnswer) return;
    secondsRemaining = Math.max(0, secondsRemaining - 1);
    const remaining = document.querySelector('#timer-remaining');
    if (remaining) remaining.textContent = `${secondsRemaining}s`;
    if (secondsRemaining === 0) {
      stopTimer();
      game.answer(null);
      selectedOption = null;
      render();
    }
  }, 1000);
}
function stopTimer() { if (timerHandle) clearInterval(timerHandle); timerHandle = null; }
function notify(message) {
  toast = message;
  render();
  setTimeout(() => { if (toast === message) { toast = ''; document.querySelector('.toast')?.remove(); } }, 4500);
}

function header() {
  const progress = game.result ? game.phaseIndex : 0;
  return `<header class="topbar">
    <div class="brand">
      <svg aria-hidden="true" class="brand-mark" viewBox="0 0 56 50"><path d="M11 39C-1 25 12 13 21 4c1 11-1 17-3 23 12-6 18 7 6 15-4 2-8 3-13-3Z" fill="#40d39d"/><path d="M29 37C19 19 31 10 38 2c0 13 4 19 6 27 4 13-10 21-15 8Z" fill="#29a9ff"/><path d="M39 36c-4-10 5-18 12-26 0 11 7 19 3 28-4 8-11 6-15-2Z" fill="#ffbd49"/></svg>
      <div><strong>ScottishPower</strong><small>Cyber Awareness Game</small></div>
    </div>
    <div class="top-title"><h1>${safe(GAME_CONFIG.displayTitle)}</h1><p>Make the right decisions. Protect the business.</p></div>
    <div class="top-progress"><span>Phase ${progress + 1} of 4</span><div class="mini-dots">${game.challenge.phases.map((p, i) => `<i class="${i <= progress ? 'lit' : ''}" aria-hidden="true"></i>`).join('')}</div><strong>${safe(game.challenge.phases[progress].title)}</strong></div>
  </header>`;
}
function nav() {
  const items = [
    {id:'incident', label:'Incident Room', icon:'home'},
    {id:'controls', label:'Controls', icon:'shield'},
    {id:'status', label:'Company Status', icon:'chart'},
  ];
  return `<nav class="nav" aria-label="Game navigation">
    ${items.map(i => `<button type="button" class="nav-item ${view === i.id ? 'active' : ''}" data-action="nav" data-view="${i.id}" ${view===i.id?'aria-current="page"':''}>${icon(i.icon)}<span>${i.label}</span></button>`).join('')}
    <div class="nav-note"><span class="live-dot"></span> Offline training scenario <p>One shared screen • no account needed</p></div>
  </nav>`;
}
function attackProgress() {
  return `<section class="side-card progress-card"><h2>${icon('lock')} Attack Progress</h2><ol class="timeline">${game.challenge.phases.map((p,i) => {
    const current = Boolean(game.result) && game.phaseIndex === i;
    const done = Boolean(game.result) && (i < game.phaseIndex || game.screen === 'results' || (game.screen === 'summary' && i === game.phaseIndex));
    return `<li class="${current ? 'current' : ''} ${done ? 'completed' : ''}"><span class="timeline-dot">${done ? icon('check') : ''}</span><div><strong>Phase ${i+1} — ${safe(['Delivery','Discovery','Command and control','Encryption and ransom'][i])}</strong><small>${safe(p.local_time)}</small></div></li>`;
  }).join('')}</ol></section>`;
}
function statusCard() {
  const s = game.result ? game.getStatus() : {threat:'Not started', visibility:'Not assessed', impact:'None', detected:0, affected:0, readiness:'Not assessed'};
  return `<section class="side-card status-card"><h2>${icon('building')} Company Status</h2><dl>
    <div><dt>Threat level</dt><dd class="${game.result ? 'orange' : 'muted'}">${safe(s.threat)}</dd></div>
    <div><dt>Incidents detected <span class="hint" title="Illustrative visibility indicator based on this phase's detection-control points">ⓘ</span></dt><dd>${s.detected}</dd></div>
    <div><dt>Systems affected <span class="hint" title="Illustrative story estimate; not a real-world loss calculation">ⓘ</span></dt><dd>${s.affected}</dd></div>
    <div><dt>Business impact <span class="hint" title="Illustrative indicator based on attack stage and phase score">ⓘ</span></dt><dd class="${s.impact === 'Low' ? 'green' : 'orange'}">${safe(s.impact)}</dd></div>
  </dl></section>`;
}
function scoreCard() {
  const controls = game.getCurrentControlScore();
  return `<section class="side-card score-card"><h2>${icon('trophy')} Score</h2><dl>
  <div><dt>Company score (controls)</dt><dd>${controls}</dd></div>
  <div><dt>Question score</dt><dd>${game.behaviourScore}</dd></div>
  <div class="total"><dt>Total score so far</dt><dd>${controls + game.behaviourScore}</dd></div>
  </dl></section>`;
}
function budgetCard() {
  const pct = Math.round(100 * game.spent / game.challenge.budget);
  return `<section class="side-card budget-card"><h2>${icon('coins')} Budget <span>${pounds(game.challenge.budget)}</span></h2>
  <div class="budget-track" role="progressbar" aria-valuemin="0" aria-valuemax="3000000" aria-valuenow="${game.spent}" aria-label="Budget spent"><div style="width:${pct}%"></div></div>
  <dl><div><dt>Spent</dt><dd>${pounds(game.spent)}</dd></div><div><dt>Remaining</dt><dd>${pounds(game.remaining)}</dd></div></dl></section>`;
}
function rightRail() { return `<aside class="right-rail">${attackProgress()}${statusCard()}${scoreCard()}${budgetCard()}</aside>`; }

function controlsView() {
  const locked = Boolean(game.result);
  const countByCat = cat => game.selectedControls.filter(c => c.category === cat).length;
  const categoryCards = cat => `<section class="control-group"><div class="group-head"><h3><span class="category-dot ${niceCategory(cat)}"></span>${cat}</h3><span>${countByCat(cat)} selected</span></div>
    <div class="control-grid">${game.challenge.controls.filter(c=>c.category===cat).map(c => {
      const picked = game.selected.includes(c.id);
      return `<button class="control-card ${niceCategory(cat)} ${picked ? 'selected' : ''}" data-action="toggle-control" data-id="${safe(c.id)}" aria-pressed="${picked}" ${locked ? 'disabled' : ''}>
        <span class="control-card-top"><span class="control-id">${safe(c.id)}</span><span class="selection-mark">${picked ? icon('check') : '+'}</span></span>
        <strong>${safe(c.name)}</strong><small>${safe(c.description)}</small>
        <span class="control-card-bottom"><em>${pounds(c.cost)}</em><span>${picked ? 'Selected' : 'Select'}</span></span>
      </button>`;
    }).join('')}</div></section>`;
  return `<div class="page-intro"><div><span class="eyebrow">STEP 01 / PREPARE · ${safe(GAME_CONFIG.fictionalBusiness)}</span><h2>${locked ? 'Your security investments' : 'Build your defences'}</h2><p>Spend up to ${pounds(game.challenge.budget)} on security controls. Select at least one Prevent, Detect and Respond control before the attack begins.</p></div><span class="intro-pill">${game.selected.length} / ${game.challenge.controls.length} chosen</span></div>
  <div class="controls-summary"><div><span>Budget remaining</span><strong>${pounds(game.remaining)}</strong></div><div><span>Selected</span><strong>${game.selected.length} controls</strong></div><div><span>Coverage</span><strong>${CATEGORIES.filter(c=>countByCat(c)>0).length} / 3 categories</strong></div></div>
  <section class="base-defences"><strong>Already in place</strong><span>${game.challenge.already_in_place.map(c=>safe(c.name)).join(' • ')}</span><small>These three controls cannot be bought and score no points.</small></section>
  ${CATEGORIES.map(categoryCards).join('')}
  <div class="control-actions">${!locked ? `<div><strong>Ready to defend the business?</strong><small>Purchases become locked once you confirm.</small></div><button data-action="confirm-controls" class="primary-button">Confirm controls &amp; begin attack ${icon('check')}</button>` : `<div><strong>Security controls locked</strong><small>Restart the simulation to choose different controls.</small></div><button data-action="nav" data-view="incident" class="primary-button">Return to Incident Room →</button>`}</div>`;
}
function emailPanel() {
  const e = event();
  return `<section class="scene-panel"><div class="section-heading"><h2>${icon(e.icon)} ${safe(e.heading)}</h2><time>${safe(e.timestamp)}</time></div>
    <div class="email-paper"><div class="email-sender"><span class="avatar">${safe(e.initials)}</span><div><strong>${safe(e.sender)}</strong><small>${safe(e.role)}</small></div></div>
      <p class="email-subject">${safe(e.subject)}</p><div class="email-body">${e.paragraphs.map(p => `<p>${safe(p)}</p>`).join('')}</div>
      ${e.attachment ? `<div class="attachment"><span class="pdf-icon">PDF</span><div><strong>${safe(e.attachment)}</strong><small>Simulated attachment — do not open</small></div></div>` : ''}
    </div>
  </section>`;
}
function summaryLine(phaseResult) {
  const useful = phaseResult.contributions.filter(c=>c.points>0).sort((a,b)=>b.points-a.points);
  if (!useful.length) return 'No selected control scored in this phase. Consider balancing prevention, detection and response next time.';
  const strongest = useful.slice(0,2).map(c=>game.challenge.controls.find(k=>k.id===c.id).name);
  return `${strongest.join(' and ')} contributed most in this phase. This reflects the supplied teaching-game scores, not a claim that the attack was prevented.`;
}
function briefingOrQuiz() {
  const p = game.currentPhase;
  const phaseResult = game.phaseResult;
  const isBriefing = game.screen === 'briefing';
  const answered = game.currentAnswer;
  const q = game.currentQuestion;
  return `${isBriefing ? `<div class="phase-banner"><span class="eyebrow">INCIDENT ${game.phaseIndex + 1} OF 4 · ${safe(GAME_CONFIG.fictionalBusiness)}</span><h2>Phase ${game.phaseIndex + 1} — ${safe(p.title)}</h2><p>${safe(p.story)}</p></div>` : ''}
    ${emailPanel()}
    ${isBriefing ? `<section class="decision-panel"><div class="decision-top"><h2>${icon('shield')} Your security controls</h2><span class="soft-pill">Phase ${game.phaseIndex+1}</span></div>
       <p class="decision-desc">The attack is underway. Your ${game.selected.length} purchased controls contribute <strong>${phaseResult.score} points</strong> in this phase. You will now answer two realistic cyber-security questions.</p>
       <div class="insight">${safe(summaryLine(phaseResult))}</div>
       <button class="primary-button full" data-action="start-checkpoint">Start behaviour checkpoint →</button></section>` : `
    <section class="decision-panel" aria-labelledby="question-title"><div class="decision-top"><h2 id="question-title">${icon('shield')} Your Decision</h2><span class="soft-pill">Question ${game.questionIndex + 1} of ${PHASE_QUESTIONS[game.phaseIndex].length}</span></div>
      <div class="checkpoint-top"><span>${safe(q.category)} • ${safe(q.tier_label)}</span><span class="timer" aria-label="Time remaining">${icon('clock')} <b id="timer-remaining">${secondsRemaining}s</b></span></div>
      <h3 class="question-text">${safe(q.question)}</h3>
      <div class="choices" role="group" aria-label="Choose one answer">${Object.entries(q.options).map(([letter, text]) => {
        const selected = selectedOption === letter || answered?.selected === letter;
        const revealCorrect = answered && q.correct === letter;
        return `<button type="button" data-action="pick-option" data-choice="${letter}" aria-pressed="${Boolean(selected)}" class="choice ${selected ? 'picked' : ''} ${revealCorrect ? 'right-answer' : ''}" ${answered?'disabled':''}><span class="letter">${letter}</span><span>${safe(text)}</span></button>`;
      }).join('')}</div>
      ${answered ? `<div class="feedback ${answered.correct ? 'correct' : 'incorrect'}" role="status"><strong>${answered.correct ? 'Correct — +'+answered.points+' points' : answered.selected === null ? 'Time is up — 0 points' : 'Not quite — 0 points'}</strong><p>${safe(answered.explanation)}</p><small>Correct answer: ${safe(q.correct)}.</small></div>
        <button data-action="next-question" class="primary-button full">${game.questionIndex + 1 === PHASE_QUESTIONS[game.phaseIndex].length ? 'Review this phase' : 'Next question'} →</button>` : `<div class="question-actions"><button type="button" class="quiet-button" data-action="pause-timer">${paused ? '▶ Resume timer' : 'Ⅱ Pause timer'}</button><button type="button" class="primary-button" data-action="submit-answer" ${!selectedOption?'disabled':''}>Submit Answer</button></div>`}
    </section>`}`;
}
function contributionsPanel(phaseIndex) {
  const result = game.result.phases[phaseIndex];
  const list = [...result.contributions].sort((a,b)=>b.points-a.points);
  return `<div class="contributions"><h3>How your controls performed</h3>${list.map(c => {
    const control = game.challenge.controls.find(k=>k.id===c.id);
    return `<div class="contribution"><div><span class="category-dot ${niceCategory(control.category)}"></span>${safe(control.name)}</div><strong>+${c.points}</strong></div>`;
  }).join('')}</div>`;
}
function phaseSummary() {
  const result = game.phaseResult;
  const phase = game.currentPhase;
  const last = game.phaseIndex === 3;
  const phaseAnswers = game.answers.filter(a=>a.phaseId===phase.id);
  const phasePoints = phaseAnswers.reduce((s,a)=>s+a.points,0);
  return `<div class="page-intro"><div><span class="eyebrow">PHASE ${game.phaseIndex + 1} COMPLETE</span><h2>${safe(phase.title)} — Review</h2><p>The attack continues, but your choices determine your points and what your organisation learns.</p></div></div>
  <div class="result-three"><div><span>Control points</span><strong>${result.score}</strong></div><div><span>Behaviour points</span><strong>${phasePoints}</strong></div><div><span>Phase total</span><strong>${result.score + phasePoints}</strong></div></div>
  <div class="insight wide">${safe(summaryLine(result))}</div>
  ${contributionsPanel(game.phaseIndex)}
  <section class="question-recap"><h3>People decisions</h3>${phaseAnswers.map(a => `<div class="recap-row"><span>${safe(a.id)}</span><span>${a.correct ? 'Answered securely' : a.selected === null ? 'Timed out' : 'Needs improvement'}</span><strong>+${a.points}</strong></div>`).join('')}</section>
  <button class="primary-button wide-action" data-action="advance-phase">${last ? 'See final incident report' : 'Continue to phase '+(game.phaseIndex+2)} →</button>`;
}
function resultsView() {
  const answered = game.answers.filter(a=>a.correct).length;
  const best = game.selectedControls.map(control => ({control, score: game.challenge.phases.reduce((sum, phase) => sum + phase.scores[control.id], 0)})).sort((a,b)=>b.score-a.score).slice(0,3);
  return `<div class="page-intro"><div><span class="eyebrow">SIMULATION COMPLETE</span><h2>Final Incident Report</h2><p>Review the security controls you purchased, your behavioural decisions and the key lessons from the ransomware scenario.</p></div><span class="intro-pill">4 of 4 phases</span></div>
    <div class="result-three"><div><span>Control score</span><strong>${game.result.total}</strong></div><div><span>Behaviour score</span><strong>${game.behaviourScore}</strong></div><div class="featured"><span>Final score</span><strong>${game.getTotalScore()}</strong></div></div>
    <section class="report-section"><h3>What happened</h3><p>${safe(game.challenge.phases.map(p=>p.title).join(' → '))}.</p><p>The scenario assumes the attacker gets in and progresses to encrypted files. Your score shows how your purchased controls helped across the four stages, not whether the attack was completely stopped.</p></section>
    <section class="report-section"><h3>Your strongest control investments</h3>${best.map(({control,score})=>`<div class="report-item"><div><strong>${safe(control.name)}</strong><p>${safe(control.use_case)}</p><small>Limitation: ${safe(control.limitation)}</small></div><b>+${score}</b></div>`).join('')}</section>
    <section class="report-section"><h3>Behaviour and recovery</h3><p>You answered <strong>${answered} of ${game.answers.length}</strong> questions securely. Correct answers earned ${POINTS_PER_CORRECT_ANSWER} points each; incorrect and timed-out answers earned zero.</p><p>In a real incident, report uncertainty early, verify unexpected requests independently and follow approved response procedures.</p></section>
    <section class="report-section"><h3>Phase-by-phase control performance</h3>${game.result.phases.map((p,i)=>`<div class="recap-row"><span>Phase ${i+1}: ${safe(game.challenge.phases[i].title)}</span><strong>+${p.score}</strong></div>`).join('')}</section>
    <div class="report-footer"><span>Spent ${pounds(game.result.spent)} of ${pounds(game.challenge.budget)} · ${pounds(game.result.unspent)} unspent</span><button class="primary-button" data-action="reset">Play Again ↻</button></div>`;
}
function statusView() {
  if (!game.result) return `<div class="page-intro"><div><h2>Company Status</h2><p>Set up your security controls before the incident starts.</p></div></div><button class="primary-button" data-action="nav" data-view="controls">Choose controls →</button>`;
  const s = game.getStatus();
  return `<div class="page-intro"><div><span class="eyebrow">LIVE TRAINING READOUT</span><h2>Company Status</h2><p>A simplified view of this fictional organisation's current preparedness and incident progression.</p></div></div>
    <div class="status-overview"><div><span>Threat level</span><strong>${safe(s.threat)}</strong></div><div><span>Detection visibility</span><strong>${safe(s.visibility)}</strong></div><div><span>Response readiness</span><strong>${safe(s.readiness)}</strong></div><div><span>Indicative impact</span><strong>${safe(s.impact)}</strong></div></div>
    <section class="report-section"><h3>Security coverage</h3><p>Prevention, detection and response work best together. These indicators summarise the controls you selected; they do not represent real measured cyber risk.</p><div class="coverage-cards">${CATEGORIES.map(cat=>`<div class="coverage"><span class="category-dot ${niceCategory(cat)}"></span><strong>${cat}</strong><b>${game.selectedControls.filter(c=>c.category===cat).length} controls</b></div>`).join('')}</div></section>
    <section class="report-section"><h3>Current incident</h3><p>${safe(game.currentPhase.story)}</p></section>
    <button class="primary-button" data-action="nav" data-view="incident">Return to incident →</button>`;
}
function centralPanel() {
  if (view === 'controls') return controlsView();
  if (view === 'status') return statusView();
  if (!game.result) return `<div class="empty-state"><span class="large-symbol">${icon('shield')}</span><h2>The incident is approaching</h2><p>First prepare the fictional company by selecting security controls within your £3 million budget.</p><button class="primary-button" data-action="nav" data-view="controls">Prepare your defences →</button></div>`;
  if (game.screen === 'results') return resultsView();
  if (game.screen === 'summary') return phaseSummary();
  return briefingOrQuiz();
}
function render() {
  if (!game) return;
  const focused = document.activeElement?.closest?.('button[data-action]');
  const selector = focused ? 'button[data-action="' + focused.dataset.action + '"]' + (focused.dataset.id ? '[data-id="' + focused.dataset.id + '"]' : '') + (focused.dataset.view ? '[data-view="' + focused.dataset.view + '"]' : '') + (focused.dataset.choice ? '[data-choice="' + focused.dataset.choice + '"]' : '') : null;
  app.innerHTML = `${header()}<div class="layout">${nav()}<main id="main-content" class="main-panel">${centralPanel()}</main>${rightRail()}</div>${toast ? `<div class="toast" role="alert">${safe(toast)}</div>` : ''}`;
  startQuestionTimerIfNeeded();
  // Avoid overriding pointer and keyboard focus during normal selection changes.
  if (selector) { const replacement = app.querySelector(selector); if (replacement && !replacement.disabled) replacement.focus({preventScroll:true}); }
}

app.addEventListener('click', (e) => {
  const button = e.target.closest('button[data-action]');
  if (!button || button.disabled || !game) return;
  const action = button.dataset.action;
  try {
    switch(action) {
      case 'nav': view = button.dataset.view; break;
      case 'toggle-control': game.toggleControl(button.dataset.id); break;
      case 'confirm-controls': game.confirmControls(); view='incident'; selectedOption=null; break;
      case 'start-checkpoint': game.revealPhase(); selectedOption=null; break;
      case 'pick-option': if (!game.currentAnswer) selectedOption=button.dataset.choice; break;
      case 'submit-answer':
        if (!selectedOption) throw new Error('Select an answer before submitting.');
        game.answer(selectedOption); stopTimer(); break;
      case 'pause-timer': paused=!paused; break;
      case 'next-question':
        game.continueAfterAnswer(); selectedOption=null; break;
      case 'advance-phase': game.advancePhase(); selectedOption=null; view='incident'; break;
      case 'reset': game.reset(); view='controls'; selectedOption=null; stopTimer(); timerKey=''; break;
      default: return;
    }
    toast = '';
    render();
    if (['nav','confirm-controls','start-checkpoint','next-question','advance-phase','reset'].includes(action)) window.scrollTo({top:0,behavior:'instant'});
  } catch (err) { notify(err.message); }
});

async function initialise() {
  try {
    const base = '../1-foundation/data/';
    const [challengeResponse, questionResponse] = await Promise.all([fetch(base+'challenge.json'),fetch(base+'questions.json')]);
    if (!challengeResponse.ok || !questionResponse.ok) throw new Error('Could not load the supplied data files.');
    game = new IncidentGame(await challengeResponse.json(), await questionResponse.json());
    render();
  } catch(err) {
    app.innerHTML = `<div class="fatal"><h1>Couldn't start The Incident Room</h1><p>${safe(err.message)}</p><p>Run <code>npm start</code> from the project folder and visit <code>http://127.0.0.1:8080</code>. Opening the HTML file directly won't load the JSON data.</p></div>`;
  }
}
initialise();
