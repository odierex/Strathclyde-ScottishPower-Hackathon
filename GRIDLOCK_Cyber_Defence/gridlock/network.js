/**
 * Pure visualisation adapter; DOES NOT replace the supplied control scoring.
 * The ransomware story reaches phase 4 regardless of investments, as required.
 * The map represents an illustrative organisation, not a real energy grid.
 */
export const SYSTEMS = [
  {id:'mail', name:'Email gateway', type:'Entry point', x:95, y:120, detail:'The phishing message appears convincing. Email security and staff awareness matter.', phase:0},
  {id:'laptop', name:'Employee laptop', type:'Compromised endpoint', x:296, y:120, detail:'Malicious software executes on a fictional employee laptop.', phase:0},
  {id:'office', name:'Office network', type:'Internal connectivity', x:505, y:120, detail:'The attacker searches for paths into other business systems.', phase:1},
  {id:'identity', name:'Identity services', type:'Account access', x:505, y:292, detail:'An impersonated IT caller attempts to obtain a sign-in code.', phase:2},
  {id:'files', name:'Document server', type:'Business documents', x:296, y:292, detail:'Business files are targeted and encrypted before the day shift.', phase:3},
  {id:'backup', name:'Backup store', type:'Recovery capability', x:95, y:292, detail:'Backup restores can support recovery; backups are not a guarantee against data exposure.', phase:3},
];
export const LINKS = [
  ['mail','laptop'], ['laptop','office'], ['office','identity'], ['identity','files'], ['files','backup'],
];
export const PHASE_NODE = ['laptop','office','identity','files'];

export function currentMapPhase(game) {
  if (!game.result) return -1;
  return game.phaseIndex;
}

export function phaseMetrics(game, phaseIndex) {
  if (!game.result || !Number.isInteger(phaseIndex) || phaseIndex < 0 || phaseIndex > 3) {
    return {prevent:0,detect:0,respond:0,total:0,visibility:'Unassessed',response:'Unassessed'};
  }
  const rows = game.result.phases[phaseIndex].contributions;
  const byCategory = {Prevent:0, Detect:0, Respond:0};
  for (const {id,points} of rows) {
    const category = game.challenge.controls.find(control=>control.id===id)?.category;
    if (category) byCategory[category] += points;
  }
  return {
    prevent:byCategory.Prevent,detect:byCategory.Detect,respond:byCategory.Respond,
    total:byCategory.Prevent+byCategory.Detect+byCategory.Respond,
    visibility:byCategory.Detect >= 4 ? 'Strong evidence' : byCategory.Detect > 0 ? 'Partial evidence' : 'Limited evidence',
    response:byCategory.Respond >= 4 ? 'Well prepared' : byCategory.Respond > 0 ? 'Some coverage' : 'Limited coverage',
  };
}

export function nodeState(nodeId, game) {
  const p = currentMapPhase(game);
  if (p < 0) return 'idle';
  const node = SYSTEMS.find(s=>s.id===nodeId);
  if (!node) return 'idle';
  if (node.id === 'backup') return p === 3 ? 'recovery' : 'idle';
  if (node.phase < p) return 'visited';
  if (node.phase === p) return node.id === PHASE_NODE[p] ? 'active' : 'visited';
  return 'pending';
}

export function nodeInsight(nodeId,game) {
  const node=SYSTEMS.find(s=>s.id===nodeId);
  if(!node) return null;
  const phase=game.challenge.phases[node.phase];
  const contributions = game.result?.phases[node.phase].contributions
    .filter(row=>row.points>0).map(row=>({
      ...row,control:game.challenge.controls.find(c=>c.id===row.id),
    })).sort((a,b)=>b.points-a.points) ?? [];
  return {node,phase,contributions,metrics:phaseMetrics(game,node.phase)};
}
