'use strict';

// A pure state machine. Hidden features are retained until agreement requires
// changing them. Past has no person inflection; infinitives have no agreement.
globalThis.MotionState = (() => {
  const pronounSpecs = {
    ya: { text: 'я', person: '1', number: 'singular' },
    my: { text: 'мы', person: '1', number: 'plural' },
    ty: { text: 'ты', person: '2', number: 'singular' },
    vy: { text: 'вы', person: '2', number: 'plural' },
    on: { text: 'он', person: '3', number: 'singular', gender: 'masculine' },
    ona: { text: 'она́', person: '3', number: 'singular', gender: 'feminine' },
    ono: { text: 'оно́', person: '3', number: 'singular', gender: 'neuter' },
    oni: { text: 'они́', person: '3', number: 'plural' }
  };
  const values = {
    prefix: ['none', 'pri', 'u', 'po'],
    showObjects: [true, false],
    tense: ['infinitive', 'past', 'present', 'future'],
    person: ['1', '2', '3'],
    number: ['singular', 'plural'],
    gender: ['masculine', 'feminine', 'neuter'],
    pronoun: Object.keys(pronounSpecs)
  };
  function initialState() {
    return { showObjects: true, prefix: 'none', tense: 'infinitive', person: '1', number: 'singular', gender: 'masculine', pronoun: 'ya' };
  }
  function reconcileAgreement(state) {
    if (state.tense === 'infinitive') return state;
    const pronoun = pronounSpecs[state.pronoun];
    state.number = pronoun.number;
    if (state.tense !== 'past') state.person = pronoun.person;
    // Gender is latent in nonpast controls but still remembers a third-person
    // subject, preserving the behaviour of the original application.
    const genderRelevant = pronoun.number === 'singular' && (state.tense === 'past' || pronoun.person === '3');
    if (genderRelevant && pronoun.gender) state.gender = pronoun.gender;
    else if (genderRelevant && state.gender === 'neuter') state.gender = 'masculine';
    return state;
  }
  function reconcileSubject(state, feature) {
    const target = { ...pronounSpecs[state.pronoun] };
    if (feature === 'number') target.number = state.number;
    if (feature === 'person') target.person = state.person;
    if (feature === 'gender' && state.gender === 'neuter' && target.number === 'singular') target.person = '3';
    if (target.person === '3' && target.number === 'singular') target.gender = state.gender;
    const candidate = Object.entries(pronounSpecs).find(([, pronoun]) =>
      pronoun.person === target.person && pronoun.number === target.number &&
      (target.person !== '3' || target.number !== 'singular' || pronoun.gender === target.gender));
    state.pronoun = candidate[0];
    return reconcileAgreement(state);
  }
  function updateState(previous, action) {
    if (!values[action.type]?.includes(action.value)) {
      throw new TypeError('Invalid state action: ' + action.type + ' = ' + action.value);
    }
    const next = { ...previous, [action.type]: action.value };
    if (['pronoun', 'tense'].includes(action.type)) return reconcileAgreement(next);
    if (['number', 'person', 'gender'].includes(action.type)) return reconcileSubject(next, action.type);
    return next;
  }
  function visibility(state) {
    return {
      pronoun: state.tense !== 'infinitive',
      number: state.tense !== 'infinitive',
      person: ['present', 'future'].includes(state.tense),
      gender: state.tense === 'past' && state.number === 'singular'
    };
  }
  function subject(state) {
    return state.tense === 'infinitive' ? '' : pronounSpecs[state.pronoun].text;
  }
  return Object.freeze({ pronounSpecs, values, initialState, reconcileAgreement, updateState, visibility, subject });
})();
