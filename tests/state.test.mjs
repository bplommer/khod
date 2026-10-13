import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPure, plain } from './load-app.mjs';
const { MotionState: State } = loadPure();
const act = (state, type, value) => State.updateState(state, { type, value });

test('updates are immutable and reject invalid actions', () => {
  const before = State.initialState(), snapshot = plain(before);
  const after = act(before, 'tense', 'past');
  assert.notEqual(after, before); assert.deepEqual(plain(before), snapshot);
  for (const action of [{ type: 'person', value: '4' }, { type: 'outerPo', value: 'yes' }, { type: 'unknown', value: '' }]) assert.throws(() => State.updateState(before, action));
});
test('past я and ты preserve feminine and latent person, then present reconciles person', () => {
  let state = act(State.initialState(), 'tense', 'past');
  state = act(state, 'gender', 'feminine'); assert.equal(state.pronoun, 'ya');
  state = act(state, 'pronoun', 'ty'); assert.equal(state.gender, 'feminine'); assert.equal(state.person, '1');
  state = act(state, 'tense', 'present'); assert.equal(state.person, '2'); assert.equal(state.gender, 'feminine');
});
test('number changes retain subject person and third-singular gender', () => {
  let state = act(State.initialState(), 'tense', 'present');
  state = act(state, 'pronoun', 'ona');
  state = act(state, 'number', 'plural'); assert.equal(state.pronoun, 'oni');
  state = act(state, 'number', 'singular'); assert.equal(state.pronoun, 'ona');
  state = act(state, 'pronoun', 'ty');
  state = act(state, 'number', 'plural'); assert.equal(state.pronoun, 'vy');
  state = act(state, 'tense', 'past'); assert.equal(state.number, 'plural');
});
test('neuter past requires оно; masculine/feminine can retain я', () => {
  let state = act(State.initialState(), 'tense', 'past');
  state = act(state, 'gender', 'neuter'); assert.equal(state.pronoun, 'ono');
  state = act(state, 'pronoun', 'ya'); assert.equal(state.gender, 'masculine');
  state = act(state, 'gender', 'feminine'); assert.equal(state.pronoun, 'ya');
});
test('infinitive changes preserve latent features until a finite tense needs agreement', () => {
  let state = State.initialState();
  const features = [state.person, state.number, state.gender];
  state = act(state, 'pronoun', 'ona'); assert.deepEqual([state.person, state.number, state.gender], features);
  state = act(state, 'tense', 'future'); assert.equal(state.person, '3'); assert.equal(state.gender, 'feminine');
});
test('all pronouns and tenses have consistent agreement and visibility', () => {
  for (const tense of State.values.tense) for (const pronoun of State.values.pronoun) {
    let state = act(act(State.initialState(), 'tense', tense), 'pronoun', pronoun);
    const spec = State.pronounSpecs[pronoun];
    assert.deepEqual(plain(State.visibility(state)), { pronoun: tense !== 'infinitive', number: tense !== 'infinitive', person: ['present', 'future'].includes(tense), gender: tense === 'past' && spec.number === 'singular' });
    if (tense !== 'infinitive') { assert.equal(state.number, spec.number); if (tense !== 'past') assert.equal(state.person, spec.person); }
    for (const number of State.values.number) { state = act(state, 'number', number); assert.equal(State.pronounSpecs[state.pronoun].number, number); }
  }
});
test('prefix changes never change subject/agreement/tense', () => {
  const state = act(act(State.initialState(), 'tense', 'past'), 'pronoun', 'vy');
  for (const [type, value] of [['prefix', 'pri'], ['prefix', 'po']]) {
    const next = act(state, type, value);
    for (const key of ['pronoun', 'person', 'number', 'gender', 'tense']) assert.equal(next[key], state[key]);
  }
});
