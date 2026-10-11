import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GridlockGame, PHASE_QUESTIONS, POINTS_PER_CORRECT_ANSWER} from '../game.js';
import {scoreSelection} from '../../1-foundation/starter/controls.mjs';
const load = async file => JSON.parse(await readFile(new URL('../../1-foundation/data/'+file,import.meta.url),'utf8'));
const challenge = await load('challenge.json');
const questions = await load('questions.json');
const newGame = () => new GridlockGame(challenge,questions);
const basket = ['P5','P6','P7','D1','R1','R2','R4'];
function readyGame() {const game=newGame();basket.forEach(id=>game.toggleControl(id));game.confirmControls();return game;}

test('starts empty with a £3m budget and 18 real controls',()=>{
 const g=newGame();assert.deepEqual(g.selected,[]);assert.equal(g.remaining,3000000);assert.equal(g.challenge.controls.length,18);assert.equal(g.screen,'controls');
});
test('select and deselect update the remaining budget',()=>{
 const g=newGame();g.toggleControl('P5');assert.equal(g.spent,250000);g.toggleControl('P5');assert.equal(g.spent,0);
});
test('cannot purchase beyond the budget',()=>{
 const g=newGame();g.toggleControl('P2');g.toggleControl('D4');g.toggleControl('R2');g.toggleControl('P3');
 assert.throws(()=>g.toggleControl('P7'),/exceeds/);assert.equal(g.remaining,300000);
});
test('cannot lock controls without all 3 categories',()=>{
 const g=newGame();g.toggleControl('P5');assert.throws(()=>g.confirmControls(),/Missing/);assert.equal(g.result,null);
});
test('uses official scoring and locks purchases',()=>{
 const g=readyGame();assert.equal(g.result.total,38);assert.equal(g.result.spent,2550000);assert.deepEqual(g.result,scoreSelection(challenge,basket));assert.throws(()=>g.toggleControl('P1'),/locked/);
});
test('question list belongs to phase and has no repeated IDs',()=>{
 assert.equal(new Set(PHASE_QUESTIONS.flat()).size,8);
 for(let i=0;i<4;i++) for(const id of PHASE_QUESTIONS[i]){
   assert.equal(questions.questions.find(q=>q.id===id).phase_id,challenge.phases[i].id);
 }
});
test('cannot answer before phase is revealed or progress without an answer',()=>{
 const g=readyGame();assert.throws(()=>g.answer('A'),/No question/);g.revealPhase();assert.throws(()=>g.continueAfterAnswer(),/Answer/);
});
test('correct answer receives exactly five points once',()=>{
 const g=readyGame();g.revealPhase();const q=g.currentQuestion;const answer=g.answer(q.correct);
 assert.equal(answer.points,POINTS_PER_CORRECT_ANSWER);assert.equal(g.behaviourScore,5);assert.throws(()=>g.answer(q.correct),/already/);
});
test('wrong and timed-out answers get zero with the original explanation',()=>{
 const g=readyGame();g.revealPhase();const q=g.currentQuestion;
 const wrong=Object.keys(q.options).find(k=>k!==q.correct);const result=g.answer(wrong);
 assert.equal(result.points,0);assert.equal(result.explanation,q.explanation);g.continueAfterAnswer();
 const timed=g.answer(null);assert.equal(timed.points,0);assert.equal(timed.selected,null);assert.equal(g.behaviourScore,0);
});
test('eight questions across four phases produce final result',()=>{
 const g=readyGame();
 for(let i=0;i<4;i++){
  assert.equal(g.screen,'briefing');g.revealPhase();
  for(let j=0;j<2;j++){assert.equal(g.screen,'checkpoint');g.answer(g.currentQuestion.correct);g.continueAfterAnswer();}
  assert.equal(g.screen,'summary');assert.equal(g.phaseIndex,i);g.advancePhase();
 }
 assert.equal(g.screen,'results');assert.equal(g.answers.length,8);assert.equal(g.behaviourScore,40);assert.equal(g.getTotalScore(),78);
});
test('cannot skip phase review and final screen',()=>{
 const g=readyGame();assert.throws(()=>g.advancePhase(),/Complete/);g.revealPhase();assert.throws(()=>g.revealPhase(),/not ready/);
});
test('restart clears score, purchases and phases',()=>{
 const g=readyGame();g.revealPhase();g.answer(g.currentQuestion.correct);g.reset();
 assert.equal(g.behaviourScore,0);assert.equal(g.answers.length,0);assert.equal(g.phaseIndex,0);assert.equal(g.remaining,3000000);assert.equal(g.result,null);
});
