import {validateData, scoreSelection} from '../1-foundation/starter/controls.mjs';

// Every question is the unmodified ScottishPower question. These IDs are linked
// to the corresponding phase in questions.json, and never appear twice in a game.
export const PHASE_QUESTIONS = [
  ['Q02', 'Q29'],
  ['Q09', 'Q37'],
  ['Q12', 'Q15'],
  ['Q22', 'Q30'],
];

export const POINTS_PER_CORRECT_ANSWER = 5; // Team-chosen behaviour score.
export const QUESTION_SECONDS = 30;
export const CATEGORIES = ['Prevent', 'Detect', 'Respond'];

export class IncidentGame {
  constructor(challenge, questionBank) {
    validateData(challenge);
    if (!Array.isArray(questionBank?.questions)) throw new Error('Question bank missing questions.');
    this.challenge = challenge;
    this.questions = new Map(questionBank.questions.map(question => [question.id, question]));
    for (let phase = 0; phase < PHASE_QUESTIONS.length; phase++) {
      for (const id of PHASE_QUESTIONS[phase]) {
        const question = this.questions.get(id);
        if (!question || question.phase_id !== challenge.phases[phase].id) {
          throw new Error(`The question ${id} does not match phase ${phase + 1}.`);
        }
      }
    }
    this.reset();
  }

  reset() {
    this.selected = [];
    this.result = null;
    this.phaseIndex = 0;
    this.questionIndex = 0;
    this.answers = [];
    this.behaviourScore = 0;
    this.screen = 'controls'; // controls -> briefing -> checkpoint -> summary -> ... -> results
    this.currentAnswer = null;
  }

  get selectedControls() {
    return this.selected.map(id => this.challenge.controls.find(c => c.id === id));
  }

  get spent() {
    return this.selectedControls.reduce((sum, c) => sum + c.cost, 0);
  }

  get remaining() { return this.challenge.budget - this.spent; }

  get currentPhase() { return this.challenge.phases[this.phaseIndex]; }

  get currentQuestion() {
    if (this.screen !== 'checkpoint') return null;
    return this.questions.get(PHASE_QUESTIONS[this.phaseIndex][this.questionIndex]);
  }

  get phaseResult() { return this.result?.phases[this.phaseIndex] ?? null; }

  get completedPhases() {
    if (this.screen === 'results') return 4;
    if (this.screen === 'summary') return this.phaseIndex + 1;
    return this.phaseIndex;
  }

  toggleControl(id) {
    if (this.result) throw new Error('Purchases are locked. Restart to choose a new set of controls.');
    const control = this.challenge.controls.find(c => c.id === id);
    if (!control) throw new Error(`Unknown control: ${id}`);
    if (this.selected.includes(id)) {
      this.selected = this.selected.filter(chosen => chosen !== id);
      return;
    }
    if (this.spent + control.cost > this.challenge.budget) {
      throw new Error(`${control.name} exceeds your £3,000,000 budget.`);
    }
    this.selected.push(id);
  }

  confirmControls() {
    if (this.result) throw new Error('Purchases are already confirmed.');
    this.result = scoreSelection(this.challenge, this.selected); // official control scoring, unchanged
    this.screen = 'briefing';
  }

  revealPhase() {
    if (this.screen !== 'briefing') throw new Error('The phase is not ready to reveal.');
    this.screen = 'checkpoint';
    this.questionIndex = 0;
    this.currentAnswer = null;
  }

  answer(letter) {
    if (this.screen !== 'checkpoint') throw new Error('No question is currently active.');
    if (this.currentAnswer) throw new Error('This question has already been answered.');
    if (letter !== null && !['A', 'B', 'C', 'D'].includes(letter)) throw new Error('Invalid answer.');
    const q = this.currentQuestion;
    const correct = letter !== null && q.correct === letter;
    const points = correct ? POINTS_PER_CORRECT_ANSWER : 0;
    this.currentAnswer = {id: q.id, selected: letter, correct, points, explanation: q.explanation};
    this.answers.push({...this.currentAnswer, phaseId: this.currentPhase.id});
    this.behaviourScore += points;
    return this.currentAnswer;
  }

  continueAfterAnswer() {
    if (this.screen !== 'checkpoint' || !this.currentAnswer) {
      throw new Error('Answer the question before continuing.');
    }
    if (this.questionIndex + 1 < PHASE_QUESTIONS[this.phaseIndex].length) {
      this.questionIndex++;
      this.currentAnswer = null;
    } else {
      this.screen = 'summary';
    }
  }

  advancePhase() {
    if (this.screen !== 'summary') throw new Error('Complete the checkpoint first.');
    if (this.phaseIndex === this.challenge.phases.length - 1) {
      this.screen = 'results';
    } else {
      this.phaseIndex++;
      this.questionIndex = 0;
      this.screen = 'briefing';
    }
  }

  getTotalScore() { return (this.result?.total ?? 0) + this.behaviourScore; }

  getCurrentControlScore() {
    if (!this.result) return 0;
    const revealed = this.completedPhases + (this.screen === 'checkpoint' ? 1 : 0);
    return this.result.phases.slice(0, revealed).reduce((sum, p) => sum + p.score, 0);
  }

  // These are indicative learning-game UI indicators, not simulated real-world losses.
  getStatus() {
    const labels = ['Moderate', 'Elevated', 'High', 'Critical'];
    const phase = this.result?.phases[this.phaseIndex];
    const detectionPoints = phase?.contributions.reduce((sum, c) => {
      const control = this.challenge.controls.find(item => item.id === c.id);
      return sum + (control?.category === 'Detect' ? c.points : 0);
    }, 0) ?? 0;
    const responsePoints = phase?.contributions.reduce((sum, c) => {
      const control = this.challenge.controls.find(item => item.id === c.id);
      return sum + (control?.category === 'Respond' ? c.points : 0);
    }, 0) ?? 0;
    const score = phase?.score ?? 0;
    const phaseIndex = this.phaseIndex;
    const impactTier = Math.max(0, Math.min(3, phaseIndex + (score < 6 ? 1 : 0) - (score >= 14 ? 1 : 0)));
    return {
      threat: labels[phaseIndex],
      visibility: detectionPoints >= 4 ? 'Strong' : detectionPoints > 0 ? 'Partial' : 'Limited',
      readiness: responsePoints >= 4 ? 'Prepared' : responsePoints > 0 ? 'Developing' : 'Limited',
      impact: ['Low', 'Moderate', 'High', 'Severe'][impactTier],
      detected: detectionPoints > 0 ? phaseIndex + 1 : 0,
      affected: [1, 1, 2, 3][phaseIndex],
    };
  }
}
