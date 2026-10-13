import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPure, plain } from './load-app.mjs';
const { MotionData: Data, MotionCore: Core, MotionState: State, MotionViewModel: Model } = loadPure();

test('grid models cover all finite control combinations without DOM access', () => {
  for (const prefix of ['none','pri','u']) for (const outerPo of [false,true]) for (const tense of State.values.tense) for (const number of State.values.number) for (const person of State.values.person) for (const gender of State.values.gender) {
    const state = { ...State.initialState(), prefix, outerPo, tense, number, person, gender };
    const model = Model.grid(state);
    assert.equal(model.rows.length,14);
    assert.deepEqual(plain(model.visibility), { number: tense !== 'infinitive', person: ['present','future'].includes(tense), gender: tense === 'past' && number === 'singular' });
    for (const row of model.rows) for (const direction of ['uni','multi']) for (const variant of row.cells[direction]) {
      const description = Model.describeForm(variant,tense,number==='plural',person,gender);
      assert(description.form === null || typeof description.form === 'string');
    }
  }
});
test('all popup models have the requested row and column structure', () => {
  for (const prefix of ['none','pri','u']) for (const outerPo of [false,true]) for (const tense of State.values.tense) for (const f of Data.motionFamilies) for (const direction of ['uni','multi']) {
    const model = Model.conjugation({ ...State.initialState(), prefix, outerPo, tense },f.id,direction);
    for (const section of model.sections) {
      assert.equal(section.rows.length,tense==='past'?4:3);
      assert.equal(section.columns.length,tense==='past'?2:3);
      for (const row of section.rows) assert.equal(row.cells.length,tense==='past'?1:2);
    }
  }
});
test('infinitive popup defaults to present, including perfective dashes', () => {
  const state = { ...State.initialState(), prefix: 'pri' };
  const model = Model.conjugation(state,'walk','uni');
  assert(model.context.includes('present'));
  assert(model.sections[0].rows.every(row=>row.cells.every(cell=>cell.form===null)));
  assert(model.sections[0].notes.some(note=>note.includes('no present tense')));
});
test('popup and grid derive forms from the same linguistic core', () => {
  const state = { ...State.initialState(), tense:'future', prefix:'u', outerPo:true };
  const popup = Model.conjugation(state,'transport','multi');
  const variant = Core.selectedVariants(Data.motionFamilies.find(f=>f.id==='transport'),'multi','u',true,'future',false)[0];
  assert.equal(popup.sections[0].rows[0].cells[0].form,Core.formFor(variant,'future',false,'1','masculine'));
  assert.equal(popup.sections[0].rows[0].cells[0].inappropriate,false);
});
test('UI status keeps semantic mismatch, grammatical gaps and usage information distinct', () => {
  const walk=Data.motionFamilies.find(f=>f.id==='walk');
  const singular=Core.selectedVariants(walk,'multi','u',true,'future',false)[0];
  const description=Model.describeForm(singular,'future',false,'1','masculine');
  assert.equal(description.unavailable,false); assert.equal(description.inappropriate,true);
  const present=Model.describeForm(singular,'present',false,'1','masculine');
  assert.equal(present.unavailable,true); assert(present.reason.includes('no present tense'));
});
