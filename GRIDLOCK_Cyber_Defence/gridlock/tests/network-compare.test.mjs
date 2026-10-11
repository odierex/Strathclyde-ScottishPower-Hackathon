import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GridlockGame} from '../game.js';
import {SYSTEMS, LINKS, PHASE_NODE, phaseMetrics, nodeState, nodeInsight} from '../network.js';
import {compareBasket,swapControl} from '../compare.js';
import {scoreSelection} from '../../1-foundation/starter/controls.mjs';
const load=async name=>JSON.parse(await readFile(new URL('../../1-foundation/data/'+name,import.meta.url),'utf8'));
const challenge=await load('challenge.json'),questions=await load('questions.json');
const basket=['P5','P6','P7','D1','R1','R2','R4'];
function game(){const g=new GridlockGame(challenge,questions);basket.forEach(c=>g.toggleControl(c));g.confirmControls();return g;}

test('network map has six uniquely identified selectable business systems',()=>{
 assert.equal(SYSTEMS.length,6);assert.equal(new Set(SYSTEMS.map(s=>s.id)).size,6);
 assert.equal(LINKS.length,5);for(const [a,b] of LINKS){assert.ok(SYSTEMS.some(s=>s.id===a));assert.ok(SYSTEMS.some(s=>s.id===b));}
});
test('four attack phases resolve to recognised systems',()=>{
 assert.equal(PHASE_NODE.length,4);
 assert.deepEqual(PHASE_NODE,['laptop','office','identity','files']);
});
test('the active attack node changes each phase',()=>{
 const g=game();for(let i=0;i<4;i++){
   g.phaseIndex=i;
   assert.equal(nodeState(PHASE_NODE[i],g),'active');
 }
 assert.equal(nodeState('backup',g),'recovery');
});
test('phase metrics separate Prevent Detect Respond and exactly match official score',()=>{
 const g=game();for(let i=0;i<4;i++){
   const m=phaseMetrics(g,i);
   assert.equal(m.prevent+m.detect+m.respond,g.result.phases[i].score);
   assert.ok(['Strong evidence','Partial evidence','Limited evidence'].includes(m.visibility));
 }
});
test('node inspector retrieves official control contributions',()=>{
 const g=game();const detail=nodeInsight('office',g);
 assert.equal(detail.node.phase,1);
 assert.equal(detail.metrics.total,g.result.phases[1].score);
 assert.ok(detail.contributions.every(x=>x.points>0&&x.control));
});
test('comparison matches scoring engine, does not mutate original',()=>{
 const original=[...basket];const alternative=original.filter(x=>x!=='P7').concat('P3');
 const c=compareBasket(challenge,original,alternative);
 assert.deepEqual(c.first,scoreSelection(challenge,original));
 assert.deepEqual(c.second,scoreSelection(challenge,alternative));
 assert.equal(c.phaseDifferences.reduce((a,b)=>a+b,0),c.difference);
 assert.deepEqual(basket,original);
});
test('swap is validated against budget, category coverage and ownership',()=>{
 assert.throws(()=>swapControl(challenge,basket,'P1','P3'),/original controls/);
 assert.throws(()=>swapControl(challenge,basket,'P7','P5'),/already selected/);
 assert.throws(()=>swapControl(challenge,basket,'P7','P2'),/Over budget/);
 const result=swapControl(challenge,basket,'R4','D3');
 assert.equal(result.first.total,38);
 assert.equal(result.second.chosen.includes('R4'),false);
 assert.equal(result.second.chosen.includes('D3'),true);
});
test('removing only category representative fails even in comparison',()=>{
 const original=['P5','D1','R1'];assert.throws(()=>swapControl(challenge,original,'D1','P1'),/Missing: Detect/);
});
