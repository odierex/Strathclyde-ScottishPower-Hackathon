import {scoreSelection} from '../1-foundation/starter/controls.mjs';
/** Scores an alternative investment basket without mutating any played round. */
export function compareBasket(challenge, original, alternative) {
  const first = scoreSelection(challenge, original);
  const second = scoreSelection(challenge, alternative);
  return {
    first, second,
    difference: second.total - first.total,
    spendingDifference: second.spent - first.spent,
    phaseDifferences: second.phases.map((p,i)=>p.score-first.phases[i].score),
  };
}
/** Replace one control with another. The original basket is not modified. */
export function swapControl(challenge, original, removeId, addId) {
  if (!original.includes(removeId)) throw new Error('Choose one of your original controls to remove.');
  if (!challenge.controls.some(c=>c.id===addId)) throw new Error('Unknown replacement control.');
  const altered=original.filter(id=>id!==removeId);
  if (altered.includes(addId)) throw new Error('That replacement control is already selected.');
  altered.push(addId);
  return compareBasket(challenge,original,altered);
}
