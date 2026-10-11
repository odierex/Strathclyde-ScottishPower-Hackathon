import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {ConfigStore,validateConfig,summarizeChanges,clone} from '../config-store.mjs';
import {GridlockGame} from '../../gridlock/game.js';

const sourceFolder=new URL('../../1-foundation/data/',import.meta.url);
async function fixture(t){
 const temp=await mkdtemp(path.join(os.tmpdir(),'gridlock-admin-'));
 t.after(()=>rm(temp,{recursive:true,force:true}));
 const dir=path.join(temp,'1-foundation','data');await mkdir(dir,{recursive:true});
 for(const f of ['challenge.json','questions.json'])await writeFile(path.join(dir,f),await readFile(new URL(f,sourceFolder)));
 return new ConfigStore(temp);
}
test('original configuration loads, validates and uses the StrathPower name',async t=>{
 const store=await fixture(t);const current=await store.current();assert.equal(current.revision,'original');
 assert.equal(current.config.branding.businessName,'StrathPower');assert.equal(current.config.challenge.budget,3000000);
 assert.equal(validateConfig(current.config),true);
});
test('save creates a disk record, surviving a fresh ConfigStore instance',async t=>{
 const s=await fixture(t);const baseline=await s.current();const updated=clone(baseline.config);
 updated.challenge.phases[0].scores.P5=19;updated.questionBank.questions.find(q=>q.id==='Q02').question='Custom invoice example';updated.branding.businessName='StrathPower Academy';updated.gameplay.pointsPerCorrectAnswer=7;
 const result=await s.save(updated,{expectedRevision:'original',note:'Update learning rules'});
 const reopened=new ConfigStore(s.root);const active=await reopened.current();assert.equal(active.revision,result.revision);
 assert.equal(active.config.challenge.phases[0].scores.P5,19);assert.equal(active.config.gameplay.pointsPerCorrectAnswer,7);
 const g=new GridlockGame(active.config.challenge,active.config.questionBank,active.config);assert.equal(g.pointsPerCorrectAnswer,7);
 for(const id of ['P5','P6','P7','D1','R1','R2','R4'])g.toggleControl(id);
 g.confirmControls();g.revealPhase();g.answer(g.currentQuestion.correct);
 assert.equal(g.behaviourScore,7);assert.ok(g.result.total>38);
 const history=await s.history();assert.equal(history.length,1);assert.match(history[0].changes,/score/);
 const original=await reopened.original();assert.equal(original.challenge.phases[0].scores.P5,3);
 assert.equal(original.questionBank.questions.find(q=>q.id==='Q02').question,baseline.config.questionBank.questions.find(q=>q.id==='Q02').question);
});
test('restore original keeps earlier versions and adds an audit entry',async t=>{
 const s=await fixture(t);const v=(await s.current()).config;const edited=clone(v);edited.challenge.budget=3100000;
 const first=await s.save(edited,{expectedRevision:'original',note:'budget adjusted'});
 const reverted=await s.restore('original',{expectedRevision:first.revision,note:'return to original'});
 assert.equal((await s.current()).config.challenge.budget,3000000);
 assert.equal((await s.snapshot(first.revision)).config.challenge.budget,3100000);
 assert.equal((await s.history()).length,2);
 const again=await s.restore(first.revision,{expectedRevision:reverted.revision,note:'repeat modified budget'});
 assert.equal((await s.current()).config.challenge.budget,3100000);
 assert.equal((await s.history()).length,3);
 assert.equal((await s.snapshot(again.revision)).action,'restore');
});
test('invalid costs, duplicate questions and overlong checkpoints cannot be saved',async t=>{
 const s=await fixture(t);const cleanConfig=(await s.current()).config;
 const config=clone(cleanConfig);config.challenge.controls[0].cost=-1;
 await assert.rejects(s.save(config,{expectedRevision:'original'}),/cost/);
 const dupe=clone(cleanConfig);dupe.questionBank.questions.push(clone(dupe.questionBank.questions[0]));
 await assert.rejects(s.save(dupe,{expectedRevision:'original'}),/Duplicate question/);
 const long=clone(cleanConfig);long.gameplay.questionSeconds=90;
 await assert.rejects(s.save(long,{expectedRevision:'original'}),/two-minute/);
 assert.equal((await s.history()).length,0);
});
test('stale revision saves cannot overwrite newer work',async t=>{
 const s=await fixture(t);const config=(await s.current()).config;
 await s.save(config,{expectedRevision:'original'});
 await assert.rejects(s.save(config,{expectedRevision:'original'}),/Another version is active/);
 assert.equal((await s.history()).length,1);
});
test('assignment rejects missing or wrong-phase questions',async t=>{
 const s=await fixture(t);const orig=(await s.current()).config;
 const bad=clone(orig);bad.gameplay.phaseQuestions[1]=['Q02'];
 assert.throws(()=>validateConfig(bad),/different phase/);
 const missing=clone(orig);missing.gameplay.phaseQuestions[0]=['NOT_FOUND'];
 assert.throws(()=>validateConfig(missing),/not found/);
 const duplicate=clone(orig);duplicate.gameplay.phaseQuestions[0]=['Q02','Q02'];
 assert.throws(()=>validateConfig(duplicate),/assigned more than once/);
});
test('custom controls can be added with valid scores in all four phases',async t=>{
 const s=await fixture(t);const config=clone((await s.current()).config);
 config.challenge.controls.push({id:'X1',name:'Training extension',category:'Prevent',cost:100000,description:'Example',use_case:'Testing',limitation:'Training only'});
 for(const p of config.challenge.phases)p.scores.X1=2;
 assert.equal(validateConfig(config),true);
 const saved=await s.save(config,{expectedRevision:'original',note:'add custom control'});
 assert.equal((await s.snapshot(saved.revision)).config.challenge.controls.length,19);
});
test('change summaries list edited controls, scores and questions',async t=>{
 const s=await fixture(t);const original=(await s.current()).config;const modified=clone(original);
 modified.challenge.controls[0].cost+=500;modified.challenge.phases[0].scores.P1+=1;modified.questionBank.questions[0].question+='?';
 assert.match(summarizeChanges(original,modified),/control/);assert.match(summarizeChanges(original,modified),/score/);assert.match(summarizeChanges(original,modified),/question/);
});
