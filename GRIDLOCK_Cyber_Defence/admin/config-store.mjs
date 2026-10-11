/** Local-only GRIDLOCK admin config/version storage. Never edits the source pack. */
import {readFile,writeFile,mkdir,readdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {validateData} from '../1-foundation/starter/controls.mjs';

export const DEFAULT_BRANDING={gameName:'GRIDLOCK: Cyber Defence',businessName:'StrathPower',tagline:'Invest wisely. Follow the attacker. Protect your people.'};
export const DEFAULT_GAMEPLAY={pointsPerCorrectAnswer:5,questionSeconds:30,phaseQuestions:[['Q02','Q29'],['Q09','Q37'],['Q12','Q15'],['Q22','Q30']]};
const clean=s=>typeof s==='string'&&s.trim().length>0;
const whole=n=>Number.isSafeInteger(n)&&n>=0;
function insist(ok,message){if(!ok)throw Error(message);}
export const clone=x=>structuredClone(x);

export function validateConfig(value){
 insist(value&&typeof value==='object'&&!Array.isArray(value),'Configuration must be an object.');
 insist(value.version===1,'Configuration version must be 1.');
 insist(value.branding&&typeof value.branding==='object','Missing branding.');
 for(const key of ['gameName','businessName','tagline'])insist(clean(value.branding[key])&&value.branding[key].length<=120,`Branding ${key} must contain 1–120 characters.`);
 validateData(value.challenge);
 insist(value.questionBank&&Array.isArray(value.questionBank.questions),'Question bank must contain a questions array.');
 const seen=new Set(),questions=new Map(),controlIds=new Set(value.challenge.controls.map(c=>c.id));
 for(const q of value.questionBank.questions){
  insist(q&&clean(q.id)&&/^[a-zA-Z0-9_-]{1,24}$/.test(q.id), 'Each question needs a short ID containing letters, numbers, _ or -.');
  insist(!seen.has(q.id),`Duplicate question ID: ${q.id}`);seen.add(q.id);questions.set(q.id,q);
  for(const key of ['category','question','explanation'])insist(clean(q[key]),`${q.id}: missing ${key}.`);
  insist(q.options&&typeof q.options==='object'&&!Array.isArray(q.options),`${q.id}: missing options.`);
  insist(Object.keys(q.options).sort().join(',')==='A,B,C,D',`${q.id}: options must be A, B, C and D.`);
  for(const letter of ['A','B','C','D'])insist(clean(q.options[letter]),`${q.id}: option ${letter} is empty.`);
  insist(['A','B','C','D'].includes(q.correct),`${q.id}: correct answer must be A–D.`);
  insist(q.phase_id===null||value.challenge.phases.some(p=>p.id===q.phase_id),`${q.id}: unknown phase_id.`);
  if(q.related_controls!==undefined){insist(Array.isArray(q.related_controls),`${q.id}: related_controls must be a list.`);
    for(const id of q.related_controls)insist(controlIds.has(id),`${q.id}: unknown related control ${id}.`);
  }
 }
 insist(value.gameplay&&typeof value.gameplay==='object','Missing gameplay settings.');
 const {pointsPerCorrectAnswer,questionSeconds,phaseQuestions}=value.gameplay;
 insist(whole(pointsPerCorrectAnswer)&&pointsPerCorrectAnswer<=1000,'Correct-answer points must be 0–1000.');
 insist(whole(questionSeconds)&&questionSeconds>=10&&questionSeconds<=120,'Question time must be 10–120 seconds.');
 insist(Array.isArray(phaseQuestions)&&phaseQuestions.length===4,'Provide question IDs for exactly four phases.');
 const used=new Set();
 for(let i=0;i<4;i++){
  const ids=phaseQuestions[i];insist(Array.isArray(ids)&&ids.length>0,`Phase ${i+1} needs at least one question.`);
  insist(ids.length*questionSeconds<=120,`Phase ${i+1} exceeds the two-minute checkpoint limit.`);
  for(const id of ids){
   const q=questions.get(id);insist(Boolean(q),`Phase ${i+1}: question ${id} not found.`);
   insist(q.phase_id===null||q.phase_id===value.challenge.phases[i].id,`Question ${id} belongs to a different phase.`);
   insist(!used.has(id),`Question ${id} has been assigned more than once.`);used.add(id);
  }
 }
 return true;
}
function stringify(value){return JSON.stringify(value,null,2)+'\n';}
export function summarizeChanges(before,after){
 const changes=[];
 if(before.branding.gameName!==after.branding.gameName||before.branding.businessName!==after.branding.businessName||before.branding.tagline!==after.branding.tagline)changes.push('branding');
 if(before.challenge.budget!==after.challenge.budget)changes.push('budget');
 const old=new Map(before.challenge.controls.map(c=>[c.id,c]));let controls=0;
 for(const control of after.challenge.controls){if(JSON.stringify(old.get(control.id))!==JSON.stringify(control))controls++;}
 controls+=before.challenge.controls.filter(c=>!after.challenge.controls.some(a=>a.id===c.id)).length;
 if(controls)changes.push(`${controls} control(s)`);
 let scores=0;
 for(let i=0;i<Math.min(before.challenge.phases.length,after.challenge.phases.length);i++){
  const a=before.challenge.phases[i],b=after.challenge.phases[i];
  if(a.title!==b.title||a.story!==b.story||a.local_time!==b.local_time)changes.push(`phase ${i+1} story`);
  for(const id of new Set([...Object.keys(a.scores),...Object.keys(b.scores)]))if(a.scores[id]!==b.scores[id])scores++;
 }
 if(scores)changes.push(`${scores} score(s)`);
 const qBefore=new Map(before.questionBank.questions.map(q=>[q.id,q]));let questions=0;
 for(const q of after.questionBank.questions)if(JSON.stringify(qBefore.get(q.id))!==JSON.stringify(q))questions++;
 questions+=before.questionBank.questions.filter(q=>!after.questionBank.questions.some(a=>a.id===q.id)).length;
 if(questions)changes.push(`${questions} question(s)`);
 if(JSON.stringify(before.gameplay)!==JSON.stringify(after.gameplay))changes.push('gameplay settings');
 return changes.length?changes.join(', '):'No content changes';
}

/** Human-readable, field-level audit trail for reviewing exactly what changed. */
export function detailedChanges(before,after){
 const result=[];
 const describe=(value)=>{
  if(value===undefined)return '(not present)';
  const txt=typeof value==='string'?value:JSON.stringify(value);
  return txt.length>170?txt.slice(0,167)+'…':txt;
 };
 const walk=(a,b,location)=>{
  if(result.length>=300)return;
  if(JSON.stringify(a)===JSON.stringify(b))return;
  if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){
   const keys=new Set([...Object.keys(a),...Object.keys(b)]);
   for(const k of keys)walk(a[k],b[k],location?location+'.'+k:k);
  }else{
   result.push({field:location,before:describe(a),after:describe(b)});
  }
 };
 walk(before,after,'');
 return result;
}

export class ConfigStore{
 constructor(root){this.root=root;this.saveDir=path.join(root,'.gridlock-saves');this.historyDir=path.join(this.saveDir,'history');this.activePath=path.join(this.saveDir,'active.json');this.pending=Promise.resolve();}
 async original(){const [challenge,questionBank]=await Promise.all(['challenge.json','questions.json'].map(f=>readFile(path.join(this.root,'1-foundation/data',f),'utf8').then(JSON.parse)));
  const config={version:1,branding:clone(DEFAULT_BRANDING),gameplay:clone(DEFAULT_GAMEPLAY),challenge,questionBank};validateConfig(config);return config;}
 async activeRecord(){try{return JSON.parse(await readFile(this.activePath,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
 async current(){const rec=await this.activeRecord();return {revision:rec?.revision??'original',savedAt:rec?.savedAt??null,config:rec?.config??await this.original()};}
 async history(){let files=[];try{files=await readdir(this.historyDir);}catch(e){if(e.code!=='ENOENT')throw e;}
  const entries=[];for(const file of files){if(!/^v-[a-z0-9-]+\.json$/.test(file))continue;const rec=JSON.parse(await readFile(path.join(this.historyDir,file),'utf8'));entries.push({revision:rec.revision,savedAt:rec.savedAt,note:rec.note,action:rec.action,changes:rec.changes,changeDetails:rec.changeDetails??[],parent:rec.parent});}
  entries.sort((a,b)=>b.savedAt.localeCompare(a.savedAt));return entries;}
 async snapshot(revision){insist(/^v-[a-z0-9-]+$/.test(revision),'Invalid history revision.');let rec;
  try{rec=JSON.parse(await readFile(path.join(this.historyDir,revision+'.json'),'utf8'));}catch(e){if(e.code==='ENOENT')throw Error('History revision not found.');throw e;}
  return rec;
 }
 async _persist(config,{expectedRevision,note='',action='save'}){
  validateConfig(config);const previous=await this.current();
  insist(expectedRevision===previous.revision,`Another version is active (${previous.revision}). Reload Admin before saving to avoid overwriting it.`);
  const original=await this.original();const revision='v-'+randomUUID();const rec={revision,parent:previous.revision,savedAt:new Date().toISOString(),note:String(note).trim().slice(0,240),action,changes:summarizeChanges(previous.config,config),changeDetails:detailedChanges(previous.config,config),config:clone(config)};
  await mkdir(this.historyDir,{recursive:true});
  const file=path.join(this.historyDir,revision+'.json');await writeFile(file,stringify(rec),{flag:'wx'});
  const tmp=this.activePath+'.tmp-'+randomUUID();await writeFile(tmp,stringify(rec),{flag:'wx'});await rename(tmp,this.activePath);
  return {revision,savedAt:rec.savedAt,changes:rec.changes,originalUnchanged:Boolean(original)};
 }
 async save(config,details){return this.lock(()=>this._persist(config,details));}
 async restore(revision,details){return this.lock(async()=>{
  const original=revision==='original';const config=original?await this.original():(await this.snapshot(revision)).config;
  return this._persist(config,{...details,action:original?'reset-to-original':'restore'});
 });}
 lock(operation){const task=this.pending.then(operation);this.pending=task.catch(()=>{});return task;}
}
