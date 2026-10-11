import {GridlockGame, PHASE_QUESTIONS, QUESTION_SECONDS, POINTS_PER_CORRECT_ANSWER} from './game.js';
import {GAME_CONFIG} from './config.js';
import {SYSTEMS, LINKS, PHASE_NODE, nodeState, nodeInsight, phaseMetrics} from './network.js';
import {swapControl} from './compare.js';

const root=document.getElementById('app');
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=x=>(x<0?'-':'')+'£'+Math.abs(Number(x)).toLocaleString('en-GB');
const pct=(a,b)=>b?Math.min(100,Math.round(100*a/b)):0;
const catCss=s=>String(s).toLowerCase();
let game,view='controls',selectedNode='laptop',selectedAnswer=null,toast='',timerId=null,timerKey='',secondsLeft=QUESTION_SECONDS,paused=false,comparison=null;
let draggingLetter=null, touchDrag=null, dragGhost=null, suppressChoiceClick=false;
const PHASE_NAMES=['Delivery','Discovery','Command & control','Encryption & ransom'];
const PHASE_TIMES=['MON 16:40','TUE 02:00','TUE 03:30','TUE 06:30'];

function stopTimer(){if(timerId!==null)clearInterval(timerId);timerId=null;}
function currentTimerKey(){return game?.screen==='checkpoint'&&!game.currentAnswer ? `${game.phaseIndex}-${game.questionIndex}` : '';}
function startTimer(){
  const key=currentTimerKey();
  if(!key){stopTimer();timerKey='';return;}
  if(timerKey===key)return;
  stopTimer();timerKey=key;secondsLeft=QUESTION_SECONDS;paused=false;
  timerId=setInterval(()=>{
    if(paused||!game||game.screen!=='checkpoint'||game.currentAnswer)return;
    secondsLeft=Math.max(0,secondsLeft-1);
    const output=document.getElementById('seconds');if(output)output.textContent=`${secondsLeft}s`;
    const bar=document.getElementById('question-timebar');if(bar)bar.style.width=`${100*secondsLeft/QUESTION_SECONDS}%`;
    if(secondsLeft===0){stopTimer();game.answer(null);selectedAnswer=null;render();}
  },1000);
}
function notice(message){toast=message;render();setTimeout(()=>{if(toast===message){toast='';document.querySelector('#notice')?.remove();}},4500);}
function titlebar(){
 const step=game.result?Math.min(3,game.phaseIndex):0;
 return `<header class="topbar"><div class="brand"><span class="brand-mark" aria-hidden="true">◈</span><div><strong>GRID<span>LOCK</span></strong><small>CYBER DEFENCE • STRATHHACK 26</small></div></div><div class="masthead"><strong>${safe(GAME_CONFIG.businessName)}</strong><small>${safe(GAME_CONFIG.tagline)}</small></div><div class="top-status"><span>${game.result?'LIVE SIMULATION':'PREPARATION'}</span><strong>${game.result?`PHASE ${step+1} / 4`:'£3M DEFENCE BUDGET'}</strong><div class="top-track">${game.challenge.phases.map((p,i)=>`<i class="${game.result && i<=step?'on':''}"></i>`).join('')}</div></div></header>`;
}
function nav(){return `<nav class="sidebar" aria-label="Primary navigation"><div class="sidebar-label">COMMAND CENTRE</div>
 ${[
  ['map','Network Map','⬡'],['controls','Security Controls','◈'],['status','Company Status','◉'],['report','Final Report','▤'],
 ].map(([id,label,glyph])=>`<button type="button" data-action="nav" data-view="${id}" class="nav-btn ${view===id?'active':''}" ${id==='report'&&game.screen!=='results'?'disabled title="Complete all phases first"':''}><span aria-hidden="true">${glyph}</span>${label}</button>`).join('')}
 <div class="sidebar-bottom"><span class="dot-green"></span>OFFLINE LEARNING SIMULATION <small>No live customer or grid systems</small></div></nav>`;}
function phaseRail(){return `<div class="phase-strip">${game.challenge.phases.map((p,i)=>`<div class="phase-step ${game.result&&game.phaseIndex===i?'now':''} ${game.result&&(i<game.phaseIndex||game.screen==='results')?'done':''}"><span class="step-num">0${i+1}</span><div><strong>${PHASE_NAMES[i]}</strong><small>${PHASE_TIMES[i]}</small></div></div>`).join('')}</div>`;}
function budgetCompact(){return `<div class="budget-compact"><span>SPENT <strong>${money(game.spent)}</strong></span><span>AVAILABLE <strong>${money(game.remaining)}</strong></span><div class="meter"><i style="width:${pct(game.spent,game.challenge.budget)}%"></i></div></div>`;}
function controlsPage(){
 const locked=Boolean(game.result),counts=cat=>game.selectedControls.filter(c=>c.category===cat).length;
 return `<section class="page-header"><div><span class="eyebrow">01 / BUILD YOUR DEFENCE</span><h1>Spend smart. Defend together.</h1><p>Choose a balanced cyber security strategy for a fictional business. Spend no more than £3,000,000 and select at least one control from every category.</p></div><span class="pill">${game.selected.length} of 18 selected</span></section>
 <div class="overview-grid"><div class="overview"><span>Budget remaining</span><strong>${money(game.remaining)}</strong><div class="meter"><i style="width:${pct(game.spent,game.challenge.budget)}%"></i></div></div><div class="overview"><span>Prevention</span><strong class="green">${counts('Prevent')} controls</strong></div><div class="overview"><span>Detection</span><strong class="blue">${counts('Detect')} controls</strong></div><div class="overview"><span>Response</span><strong class="amber">${counts('Respond')} controls</strong></div></div>
 <div class="already"><strong>ALREADY INSTALLED — NO SCORE</strong><span>${game.challenge.already_in_place.map(c=>safe(c.name)).join('  ·  ')}</span></div>
 ${['Prevent','Detect','Respond'].map(category=>`<section class="category-wrap"><div class="category-title"><h2><span class="marker ${catCss(category)}"></span>${category}</h2><span>${counts(category)} chosen</span></div><div class="controls-grid">${game.challenge.controls.filter(c=>c.category===category).map(c=>{
 const picked=game.selected.includes(c.id);
 return `<button type="button" class="control ${catCss(category)} ${picked?'picked':''}" data-action="toggle" data-id="${safe(c.id)}" aria-pressed="${picked}" ${locked?'disabled':''}><span class="control-head"><b>${safe(c.id)}</b><strong>${picked?'✓ SELECTED':'+ ADD'}</strong></span><span class="control-title">${safe(c.name)}</span><span class="control-description">${safe(c.description)}</span><span class="control-foot">${money(c.cost)}<span>${catCss(category).toUpperCase()}</span></span></button>`;}).join('')}</div></section>`).join('')}
 <div class="sticky-commit"><div><strong>${locked?'Defence plan locked':'Ready to start the attack?'}</strong><span>${locked?'Purchases cannot change during the incident.':'The ScottishPower scoring engine validates all controls when you deploy.'}</span></div><button class="primary" type="button" data-action="${locked?'nav':'confirm'}" ${locked?'data-view="map"':''}>${locked?'Go to network map →':'DEPLOY DEFENCES →'}</button></div>`;
}
function svgLines(){return `<svg viewBox="0 0 600 402" class="network-wires" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="wire" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#187d85"/><stop offset="1" stop-color="#2d556b"/></linearGradient></defs>
 ${LINKS.map(([a,b],i)=>{const A=SYSTEMS.find(n=>n.id===a),B=SYSTEMS.find(n=>n.id===b);const active=game.result && i<=game.phaseIndex;const restore=game.result && i===4 && game.phaseIndex===3;return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="wire ${active?'traced':restore?'restore':''}"/>`;}).join('')}
 </svg>`;}
function networkMap(){return `<div class="map-container"><div class="map-toolbar"><span><i class="pulse-dot"></i> FICTIONAL BUSINESS NETWORK</span><span>${game.result?'ATTACK PATH • PHASE '+(game.phaseIndex+1):'SYSTEMS ONLINE'}</span></div>
 <div class="map-canvas" role="group" aria-label="Selectable business systems and the simulated attack path">${svgLines()}
 ${SYSTEMS.map((sys)=>{const state=nodeState(sys.id,game);return `<button type="button" data-action="node" data-node="${sys.id}" aria-pressed="${selectedNode===sys.id}" class="system-node ${state} ${selectedNode===sys.id?'chosen':''}" style="left:${sys.x/600*100}%;top:${sys.y/402*100}%"><span class="node-icon" aria-hidden="true">${{mail:'✉',laptop:'▣',office:'⬡',identity:'♙',files:'▤',backup:'↺'}[sys.id]}</span><span class="node-name">${safe(sys.name)}</span><small>${state==='active'?'ATTACK HERE':state==='visited'?'ATTACK PATH':state==='recovery'?'RECOVERY':'SYSTEM'}</small></button>`;}).join('')}
 </div><div class="map-legend"><span><i class="legend-dot danger"></i> Current attack</span><span><i class="legend-dot trail"></i> Attacker path</span><span><i class="legend-dot safe"></i> Recovery / unvisited</span></div></div>`;}
function systemInspector(){const insight=nodeInsight(selectedNode,game),{node,phase,metrics,contributions}=insight;
 return `<section class="info-card inspector"><div class="section-bar"><span>SELECTED SYSTEM</span><span class="tiny-code">${safe(node.id.toUpperCase())}</span></div><h3>${safe(node.name)}</h3><p>${safe(node.detail)}</p><div class="inspector-meta"><span>Linked incident</span><strong>Phase ${node.phase+1}: ${safe(PHASE_NAMES[node.phase])}</strong></div>
 ${game.result && node.phase <= game.phaseIndex?`<div class="inspector-meta"><span>Control score in this phase</span><strong>${metrics.total} points</strong></div><div class="mini-list">${contributions.slice(0,3).map(({control,points})=>`<div><span>${safe(control.name)}</span><b>+${points}</b></div>`).join('')||'<p>No selected controls contribute here.</p>'}</div>`:`<p class="muted-small">Details for this phase appear when the attack reaches this system.</p>`}</section>`;
}
function threatPanel(){const p=game.phaseIndex,phase=game.currentPhase,metrics=phaseMetrics(game,p);
 return `<section class="info-card attack-card"><span class="eyebrow warn">INCIDENT ${PHASE_TIMES[p]}</span><h2>${safe(phase.title)}</h2><p>${safe(phase.story)}</p><div class="attack-stats"><div><span>Prevention points</span><b>${metrics.prevent}</b></div><div><span>Detection points</span><b>${metrics.detect}</b></div><div><span>Response points</span><b>${metrics.respond}</b></div></div><div class="learning-note">The attacker continues through all four phases by design. Detection reveals activity; it does not automatically stop it.</div></section>`;
}
function questionCard(){
 const q=game.currentQuestion,answer=game.currentAnswer;
 const locked=Boolean(answer);
 const letter=answer?.selected ?? selectedAnswer;
 const answerLabel=letter?`<strong class="slot-letter">${letter}</strong><span>${safe(q.options[letter])}</span>`:`<strong>DROP A LETTER HERE</strong><small>Drag A, B, C or D into this box</small>`;
 return `<section class="info-card quiz"><div class="section-bar"><span>HUMAN DECISION ${game.questionIndex+1} / ${PHASE_QUESTIONS[game.phaseIndex].length}</span><span id="seconds" class="timer" role="status">${locked?'ANSWERED':paused?'PAUSED':secondsLeft+'s'}</span></div>
 <span class="topic">${safe(q.category)} · ${safe(q.tier_label)}</span><h3>${safe(q.question)}</h3>
 <div class="answer-dropzone ${letter?'filled':''} ${locked?'locked':''}" id="answer-slot" data-dropzone="true" role="status" aria-live="polite"><span class="slot-label">YOUR ANSWER</span><div class="slot-value">${answerLabel}</div></div>
 <p class="drag-hint">Drag a letter into the box, or click/tap an answer below. You can change your choice before submitting.</p>
 <div class="options">${Object.entries(q.options).map(([id,text])=>`<button type="button" draggable="${!locked}" class="answer ${selectedAnswer===id||answer?.selected===id?'selected':''} ${answer&&q.correct===id?'correct':''}" data-action="choose" data-choice="${id}" aria-pressed="${selectedAnswer===id||answer?.selected===id}" ${locked?'disabled':''}><b class="answer-letter" aria-hidden="true">${id}</b><span>${safe(text)}</span></button>`).join('')}</div>
 ${locked?`<div class="feedback" role="status"><b>${answer.correct?`Correct! +${answer.points}`:answer.selected===null?'Time expired • +0':'Not secure • +0'}</b><p>${safe(answer.explanation)}</p><small>Correct option: ${q.correct}</small></div><button class="primary full" data-action="next-question">${game.questionIndex===PHASE_QUESTIONS[game.phaseIndex].length-1?'VIEW PHASE RESULTS':'NEXT DECISION'} →</button>`:`<div class="quiz-actions"><button class="secondary" data-action="pause">${paused?'RESUME':'PAUSE'} TIMER</button><button class="primary" data-action="submit" ${!selectedAnswer?'disabled':''}>SUBMIT ANSWER →</button></div><div class="timebar" aria-hidden="true"><i id="question-timebar" style="width:${100*secondsLeft/QUESTION_SECONDS}%"></i></div>`}
 </section>`;
}

function briefingPanel(){return `<section class="info-card briefing"><span class="eyebrow">SECURITY BRIEFING</span><h3>Follow the intrusion.</h3><p>Inspect the map and select any system to understand its role. Then begin the human-decision checkpoint.</p><div class="data-card"><span>THIS PHASE'S CONTROL SCORE</span><strong>${game.phaseResult.score} pts</strong></div><button class="primary full" data-action="start-quiz">BEGIN DECISIONS →</button></section>`;}
function phaseSummaryPanel(){const p=game.phaseIndex,result=game.phaseResult,answers=game.answers.filter(a=>a.phaseId===game.currentPhase.id),qs=answers.reduce((s,a)=>s+a.points,0);return `<section class="info-card briefing"><span class="eyebrow">PHASE ${p+1} COMPLETE</span><h3>Defence review</h3><div class="two-stats"><div><span>Controls</span><b>${result.score}</b></div><div><span>People</span><b>${qs}</b></div></div><p>${answers.filter(a=>a.correct).length} of ${answers.length} decisions answered securely.</p><div class="contrib-review">${[...result.contributions].sort((a,b)=>b.points-a.points).slice(0,4).map(row=>`<div><span>${safe(game.challenge.controls.find(c=>c.id===row.id)?.name)}</span><b>+${row.points}</b></div>`).join('')}</div><button class="primary full" data-action="advance">${p===3?'FINAL INCIDENT REPORT':'ADVANCE TO PHASE '+(p+2)} →</button></section>`;}
function mapPage(){
 if(!game.result)return `<div class="empty"><div class="empty-icon">⬡</div><span class="eyebrow">PREPARATION REQUIRED</span><h1>Secure the network first.</h1><p>Select at least one control from Prevent, Detect and Respond. Your investment choices will change what the map tells you about the attack.</p><button class="primary" data-action="nav" data-view="controls">CHOOSE CONTROLS →</button></div>`;
 if(game.screen==='results')return reportPage();
 return `<div class="page-header map-heading"><div><span class="eyebrow">02 / ATTACK SIMULATION</span><h1>${safe(PHASE_NAMES[game.phaseIndex])}</h1><p>The map follows an approved four-phase ransomware scenario. Select a system to explore the consequences of your controls.</p></div><span class="phase-badge">PHASE ${game.phaseIndex+1} <span>/ 4</span></span></div>
 ${phaseRail()}<div class="dashboard-grid"><div class="map-column">${networkMap()}<div class="map-bottom"><div><span>CONTROL SCORE</span><strong>${game.getCurrentControlScore()+(game.screen==='briefing'?game.phaseResult.score:0)}</strong></div><div><span>BEHAVIOUR SCORE</span><strong>${game.behaviourScore}</strong></div><div><span>TOTAL SO FAR</span><strong>${game.getCurrentControlScore()+(game.screen==='briefing'?game.phaseResult.score:0)+game.behaviourScore}</strong></div></div><div class="inspector-wrap">${systemInspector()}</div></div>
 <aside class="decision-column">${attackPanelSafe()}${game.screen==='checkpoint'?questionCard():game.screen==='summary'?phaseSummaryPanel():briefingPanel()}</aside></div>`;
}
function attackPanelSafe(){return threatPanel();}
function statusPage(){
 if(!game.result)return `<div class="empty"><h1>Company Status</h1><p>Deploy controls first.</p><button class="primary" data-action="nav" data-view="controls">CHOOSE CONTROLS →</button></div>`;
 const m=phaseMetrics(game,game.phaseIndex),status=game.getStatus();
 return `<section class="page-header"><div><span class="eyebrow">CURRENT SECURITY POSTURE</span><h1>Company status</h1><p>Simple training indicators derived from your selected controls and the phase score, not measurements of real infrastructure.</p></div></section>
 <div class="overview-grid"><div class="overview"><span>Detection visibility</span><strong>${safe(m.visibility)}</strong></div><div class="overview"><span>Response readiness</span><strong>${safe(m.response)}</strong></div><div class="overview"><span>Indicative impact</span><strong>${safe(status.impact)}</strong></div><div class="overview"><span>Current phase</span><strong>${game.phaseIndex+1} / 4</strong></div></div>
 <div class="status-layout">${networkMap()}${systemInspector()}</div><section class="info-card"><h3>Defence investment mix</h3><p>Prevention, detection and response are complementary. More monitoring may reveal an attacker without stopping the underlying incident.</p><div class="category-summary">${['Prevent','Detect','Respond'].map(c=>`<div><span class="marker ${catCss(c)}"></span><strong>${c}</strong><span>${game.selectedControls.filter(x=>x.category===c).length} controls</span></div>`).join('')}</div></section><button class="secondary" data-action="nav" data-view="map">← RETURN TO ATTACK MAP</button>`;
}
function compareControls(){
 if(!comparison)return `<div class="compare-empty">Choose one control to replace and see the alternative scenario without rewriting your original result.</div>`;
 const {first,second,difference,spendingDifference,phaseDifferences}=comparison;
 return `<div class="compare-results"><div class="compare-figures"><div><span>ORIGINAL PLAN</span><strong>${first.total} pts</strong><small>${money(first.spent)}</small></div><div><span>ALTERNATIVE</span><strong>${second.total} pts</strong><small>${money(second.spent)}</small></div><div><span>CHANGE</span><strong class="${difference>=0?'green':'red'}">${difference>=0?'+':''}${difference} pts</strong><small>${spendingDifference>0?'+':''}${money(spendingDifference)}</small></div></div><div class="phase-diffs">${phaseDifferences.map((d,i)=>`<div><span>Phase ${i+1}</span><strong>${d>=0?'+':''}${d}</strong></div>`).join('')}</div><p class="fine-print">The behaviour score is unchanged: this compares only control investments using ScottishPower's original scoring module.</p></div>`;
}
function reportPage(){
 if(game.screen!=='results')return `<div class="empty"><h2>Final report locked</h2><p>Complete all four attack phases first.</p><button class="primary" data-action="nav" data-view="map">RETURN TO SIMULATION</button></div>`;
 const initial=game.result,secure=game.answers.filter(a=>a.correct).length;
 return `<section class="page-header"><div><span class="eyebrow">03 / SIMULATION COMPLETE</span><h1>After-action report.</h1><p>Understand the cyber defences you chose, the people decisions you made, and how another budget choice might change the control score.</p></div><span class="pill">4 OF 4 PHASES COMPLETE</span></section>
 <div class="report-stats"><div><span>CONTROL SCORE</span><strong>${initial.total}</strong></div><div><span>BEHAVIOUR SCORE</span><strong>${game.behaviourScore}</strong></div><div class="highlight"><span>FINAL SCORE</span><strong>${game.getTotalScore()}</strong></div></div>
 <section class="info-card"><div class="section-bar">ATTACK TIMELINE <span>OFFICIAL CONTROL SCORING</span></div><div class="report-phases">${initial.phases.map((p,i)=>`<div><span>0${i+1}</span><strong>${safe(PHASE_NAMES[i])}</strong><b>+${p.score}</b></div>`).join('')}</div></section>
 <section class="info-card lessons"><h2>What the team learned</h2><p>The attacker always reaches the encryption phase in this approved scenario. Investment choices affect the control points and the strength of the defences, rather than rewriting the cyber team's attack sequence.</p><p><strong>${secure} of 8</strong> behaviour questions answered securely. Each correct answer earns ${POINTS_PER_CORRECT_ANSWER} points. You spent ${money(initial.spent)} and kept ${money(initial.unspent)} in reserve.</p><p>Clear reporting, independent verification and a rehearsed incident response are critical during an overnight ransomware attack.</p></section>
 <section class="info-card compare"><div class="section-bar"><span>STRETCH FEATURE</span><span class="pill-mini">REWIND &amp; COMPARE</span></div><h2>What if you'd invested differently?</h2><p>Replace exactly one control from your original plan. We'll recalculate every phase without changing the original game or behaviour points.</p><div class="swap-row"><label>REMOVE <select id="remove-control"><option value="">Choose owned control</option>${game.selectedControls.map(c=>`<option value="${safe(c.id)}">${safe(c.id)} — ${safe(c.name)}</option>`).join('')}</select></label><label>ADD <select id="add-control"><option value="">Choose replacement</option>${game.challenge.controls.filter(c=>!game.selected.includes(c.id)).map(c=>`<option value="${safe(c.id)}">${safe(c.id)} — ${safe(c.name)}</option>`).join('')}</select></label><button class="primary" type="button" data-action="compare">COMPARE →</button></div>${compareControls()}</section>
 <div class="ending"><button class="secondary" type="button" data-action="reset">↻ START NEW SIMULATION</button><span>GRIDLOCK • CYBER AWARENESS TRAINING • SCOTTISHPOWER STRATHHACK26</span></div>`;
}
function render(){
 if(!game)return;
 root.innerHTML=`${titlebar()}<div class="shell">${nav()}<main id="main" class="main" tabindex="-1">${view==='controls'?controlsPage():view==='status'?statusPage():view==='report'?reportPage():mapPage()}</main></div>${toast?`<div class="toast" id="notice" role="alert">${safe(toast)}</div>`:''}`;
 startTimer();
}
function changeView(target){if(target==='report'&&game.screen!=='results')throw Error('Complete the simulation to unlock your report.');view=target;render();window.scrollTo({top:0,behavior:'instant'});}
root.addEventListener('click', e=>{
 const button=e.target.closest('button[data-action]');if(!button||button.disabled||!game)return;
 try{
  switch(button.dataset.action){
   case 'nav':changeView(button.dataset.view);return;
   case 'toggle':game.toggleControl(button.dataset.id);break;
   case 'confirm':game.confirmControls();selectedNode=PHASE_NODE[0];view='map';break;
   case 'node':selectedNode=button.dataset.node;break;
   case 'start-quiz':game.revealPhase();selectedAnswer=null;break;
   case 'choose':if(suppressChoiceClick){suppressChoiceClick=false;return;}if(!game.currentAnswer)selectAnswer(button.dataset.choice);return;
   case 'submit':if(!selectedAnswer)throw Error('Choose an answer first.');game.answer(selectedAnswer);stopTimer();break;
   case 'pause':paused=!paused;break;
   case 'next-question':game.continueAfterAnswer();selectedAnswer=null;break;
   case 'advance':game.advancePhase();selectedNode=PHASE_NODE[game.phaseIndex];if(game.screen==='results')view='report';break;
   case 'compare':{
      const a=document.getElementById('remove-control')?.value,b=document.getElementById('add-control')?.value;
      if(!a||!b)throw Error('Select both the control to remove and the replacement.');
      comparison=swapControl(game.challenge,game.selected,a,b);break;
   }
   case 'reset':stopTouchDrag();game.reset();selectedNode='laptop';selectedAnswer=null;view='controls';comparison=null;timerKey='';stopTimer();break;
   default:return;
  }
  toast='';render();
 }catch(err){notice(err.message);}
});


// Optional pointer/HTML5 dragging; choosing a button works equally well with
// mouse, touch and keyboard. Never submit until the player confirms the answer.
function selectAnswer(letter){
 if(game?.screen!=='checkpoint'||game.currentAnswer||!['A','B','C','D'].includes(letter))return;
 selectedAnswer=letter;render();
 document.getElementById('answer-slot')?.scrollIntoView({block:'nearest'});
}
function isQuizLive(){return game?.screen==='checkpoint'&&!game.currentAnswer&&view==='map';}
function dragHighlight(on){document.getElementById('answer-slot')?.classList.toggle('drag-over',on);}
root.addEventListener('dragstart',event=>{
 const option=event.target.closest('.answer[data-choice]');
 if(!option||!isQuizLive()||!event.dataTransfer){event.preventDefault();return;}
 draggingLetter=option.dataset.choice;
 event.dataTransfer.setData('text/plain',draggingLetter);
 event.dataTransfer.effectAllowed='copy';
 option.classList.add('dragging');
});
root.addEventListener('dragover',event=>{
 if(!draggingLetter||!isQuizLive()||!event.target.closest('[data-dropzone]'))return;
 event.preventDefault();event.dataTransfer.dropEffect='copy';dragHighlight(true);
});
root.addEventListener('dragleave',event=>{
 if(event.target.closest('[data-dropzone]')&&!event.relatedTarget?.closest?.('[data-dropzone]'))dragHighlight(false);
});
root.addEventListener('drop',event=>{
 if(!event.target.closest('[data-dropzone]')||!draggingLetter||!isQuizLive())return;
 event.preventDefault();const letter=draggingLetter;draggingLetter=null;dragHighlight(false);selectAnswer(letter);
});
root.addEventListener('dragend',()=>{draggingLetter=null;dragHighlight(false);root.querySelectorAll('.answer.dragging').forEach(el=>el.classList.remove('dragging'));});

// Browser drag and drop does not reliably support touchscreen dragging.
// Drag the A/B/C/D tile with a finger to the box, or simply tap the option.
function stopTouchDrag(){
 if(dragGhost){dragGhost.remove();dragGhost=null;}
 if(touchDrag?.tile?.hasPointerCapture?.(touchDrag.pointerId)){
  try{touchDrag.tile.releasePointerCapture(touchDrag.pointerId);}catch{}
 }
 touchDrag=null;dragHighlight(false);
}
function inSlot(x,y){const slot=document.getElementById('answer-slot');if(!slot)return false;const r=slot.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
root.addEventListener('pointerdown',event=>{
 if(event.pointerType==='mouse'||!isQuizLive())return;
 const tile=event.target.closest('.answer-letter');
 const option=tile?.closest('.answer[data-choice]');
 if(!option)return;
 touchDrag={pointerId:event.pointerId,tile,letter:option.dataset.choice,x:event.clientX,y:event.clientY,moved:false};
 try{tile.setPointerCapture(event.pointerId);}catch{}
});
root.addEventListener('pointermove',event=>{
 if(!touchDrag||touchDrag.pointerId!==event.pointerId)return;
 const distance=Math.hypot(event.clientX-touchDrag.x,event.clientY-touchDrag.y);
 if(!touchDrag.moved&&distance<9)return;
 if(!touchDrag.moved){
  touchDrag.moved=true;
  dragGhost=document.createElement('div');dragGhost.className='drag-ghost';dragGhost.textContent=touchDrag.letter;
  document.body.append(dragGhost);
 }
 dragGhost.style.left=`${event.clientX}px`;dragGhost.style.top=`${event.clientY}px`;
 dragHighlight(inSlot(event.clientX,event.clientY));
});
root.addEventListener('pointerup',event=>{
 if(!touchDrag||touchDrag.pointerId!==event.pointerId)return;
 const letter=touchDrag.letter,didMove=touchDrag.moved,dropped=didMove&&inSlot(event.clientX,event.clientY);
 stopTouchDrag();
 if(didMove){suppressChoiceClick=true;setTimeout(()=>{suppressChoiceClick=false;},250);}
 if(dropped)selectAnswer(letter);
});
root.addEventListener('pointercancel',()=>stopTouchDrag());

async function boot(){
 try{
  const [c,q]=await Promise.all([
   fetch('../1-foundation/data/challenge.json'),fetch('../1-foundation/data/questions.json')
  ]);
  if(!c.ok||!q.ok)throw Error('Data files were not found.');
  game=new GridlockGame(await c.json(),await q.json());render();
 }catch(err){root.innerHTML=`<div class="fatal"><h1>GRIDLOCK could not load</h1><p>${safe(err.message)}</p><p>Run <code>npm start</code> in the project folder and visit <code>http://127.0.0.1:8080</code>.</p></div>`;}
}
boot();
