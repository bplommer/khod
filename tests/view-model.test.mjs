import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPure, plain } from './load-app.mjs';
const { MotionData: Data, MotionCore: Core, MotionState: State, MotionViewModel: Model } = loadPure();

test('grid models cover all finite control combinations without DOM access', () => {
  for (const prefix of ['none','pri','u','po']) for (const tense of State.values.tense) for (const number of State.values.number) for (const person of State.values.person) for (const gender of State.values.gender) {
    const state = { ...State.initialState(), prefix, tense, number, person, gender };
    const model = Model.grid(state);
    assert.equal(model.rows.length,14);
    assert.deepEqual(plain(model.visibility), { pronoun: !['infinitive', 'imperative'].includes(tense), number: tense !== 'infinitive', person: ['present','future'].includes(tense), gender: tense === 'past' && number === 'singular' });
    for (const row of model.rows) for (const direction of ['uni','multi']) for (const variant of row.cells[direction]) {
      const description = Model.describeForm(variant,tense,number==='plural',person,gender);
      assert(description.form === null || typeof description.form === 'string');
    }
  }
});
test('all popup models have the requested row and column structure', () => {
  for (const prefix of ['none','pri','u','po']) for (const tense of State.values.tense) for (const f of Data.motionFamilies) for (const direction of ['uni','multi']) {
    const model = Model.conjugation({ ...State.initialState(), prefix, tense },f.id,direction);
    for (const section of model.sections) {
      assert.equal(section.rows.length,tense==='past'?4:tense==='imperative'?2:3);
      assert.equal(section.columns.length,['past','imperative'].includes(tense)?2:3);
      for (const row of section.rows) assert.equal(row.cells.length,['past','imperative'].includes(tense)?1:2);
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
  const state = { ...State.initialState(), tense:'future', prefix:'po' };
  const popup = Model.conjugation(state,'transport','multi');
  const variant = Core.selectedVariants(Data.motionFamilies.find(f=>f.id==='transport'),'multi','po')[0];
  assert.equal(popup.sections[0].rows[0].cells[0].form,Core.formFor(variant,'future',false,'1','masculine'));
  assert.equal(popup.sections[0].rows[0].cells[0].inappropriate,false);
});
test('UI status keeps available forms and grammatical gaps distinct', () => {
  const walk=Data.motionFamilies.find(f=>f.id==='walk');
  const singular=Core.selectedVariants(walk,'multi','po')[0];
  const description=Model.describeForm(singular,'future',false,'1','masculine');
  assert.equal(description.unavailable,false); assert.equal(description.inappropriate,false);
  const present=Model.describeForm(singular,'present',false,'1','masculine');
  assert.equal(present.unavailable,true); assert(present.reason.includes('no present tense'));
});


test('ехать imperative is available with a usage note scoped to the unprefixed imperative', () => {
  const vehicle = Data.motionFamilies.find(f => f.id === 'vehicle');
  const variant = Core.selectedVariants(vehicle,'uni','none')[0];
  for (const plural of [false,true]) {
    const description = Model.describeForm(variant,'imperative',plural,'2','masculine');
    assert.equal(description.form,plural ? 'поезжа́йте / езжа́йте' : 'поезжа́й / езжа́й');
    assert.equal(description.unavailable,false);
    assert.equal(description.inappropriate,false);
    assert.match(description.reason,/accepted by several modern dictionaries/);
    assert.match(description.reason,/conservative guides prefer поезжа́й/);
  }
  const popup = Model.conjugation({...State.initialState(),tense:'imperative'},'vehicle','uni');
  assert.deepEqual(plain(popup.sections[0].rows.map(row=>row.cells[0].form)),['поезжа́й / езжа́й','поезжа́йте / езжа́йте']);
  assert(popup.sections[0].notes.some(note=>note.includes('conservative guides')));
  for (const tense of ['infinitive','past','present','future']) {
    assert.equal(Model.describeForm(variant,tense,false,'2','masculine').reason,undefined);
    assert(!Model.conjugation({...State.initialState(),tense},'vehicle','uni').sections[0].notes.some(note=>note.includes('conservative guides')));
  }
  for (const prefix of ['pri','u','po']) {
    const prefixed = Model.conjugation({...State.initialState(),tense:'imperative',prefix},'vehicle','uni');
    assert(!prefixed.sections[0].notes.some(note=>note.includes('conservative guides')));
  }
  assert.equal(Model.describeForm(Core.selectedVariants(vehicle,'multi','none')[0],'imperative',false,'2','masculine').reason,undefined);
});

test('both vehicle paradigms explain the shared imperative only in imperative mode', () => {
  for (const prefix of ['none','po']) {
    const state={...State.initialState(),prefix,tense:'imperative',person:'2'};
    const variant=Model.grid(state).rows.find(row=>row.family.id==='vehicle').cells.uni[0];
    const description=Model.describeForm(variant,'imperative',false,'2','masculine');
    assert(description.reason.includes(prefix==='none' ? 'both е́хать and пое́хать' : 'also an imperative form of е́хать'));
    assert.equal(variant.aspect,prefix==='none' ? 'imperfective' : 'perfective');
    const section=Model.conjugation(state,'vehicle','uni').sections[0];
    assert(section.notes.includes(description.reason));
    assert.deepEqual(plain(section.rows.map(row=>row.cells[0].form)),prefix==='none'
      ? ['поезжа́й / езжа́й','поезжа́йте / езжа́йте'] : ['поезжа́й','поезжа́йте']);
    for (const tense of ['infinitive','past','present','future']) {
      assert(!Model.conjugation({...state,tense},'vehicle','uni').sections[0].notes.some(note=>note.includes('both verbs')||note.includes('both е́хать')));
    }
  }
});
