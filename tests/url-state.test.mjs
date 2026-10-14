import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPure, plain, sourceRoot } from './load-app.mjs';
import { fixture, descendants } from './dom-fixture.mjs';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const { MotionURL: codec, MotionState: State, MotionData: Data } = loadPure();
test('every valid state, including latent infinitive and past selections, round-trips', () => {
  for (const tense of State.values.tense) for (const pronoun of State.values.pronoun)
    for (const person of State.values.person) for (const number of State.values.number)
      for (const gender of State.values.gender) for (const prefix of State.values.prefix)
        for (const showObjects of State.values.showObjects) {
          const state = codec.normalize({tense, pronoun, person, number, gender, prefix, showObjects});
          assert.deepEqual(plain(codec.decode(codec.encode(state)).state), plain(state));
        }
});
test('all popup targets round-trip and serialization has stable field order', () => {
  for (const family of Data.motionFamilies) for (const direction of ['uni', 'multi']) {
    const popup = {family: family.id, direction};
    const encoded = codec.encode(State.initialState(), popup);
    assert.deepEqual(plain(codec.decode(encoded).popup), popup);
    assert.equal(codec.encode(codec.decode(encoded).state, codec.decode(encoded).popup), encoded);
    assert(encoded.startsWith('v=1&tense=infinitive&prefix=none&pronoun=ya&person=1&number=singular&gender=masculine&showObjects=true'));
  }
});
test('partial, malformed, duplicate and unsupported-version URLs validate independently', () => {
  assert.deepEqual(plain(codec.decode('').state), plain(State.initialState()));
  const decoded = codec.decode('v=1&tense=past&pronoun=ona&person=2&number=plural&gender=bogus&prefix=pri&showObjects=false&popup=walk&direction=bad');
  assert.deepEqual(plain(decoded), {state: {tense:'past',pronoun:'ona',person:'2',number:'singular',gender:'feminine',prefix:'pri',showObjects:false}, popup:null});
  for (const input of ['v=2&tense=past', 'tense=%ZZ&showObjects=no&popup=unknown&direction=uni', 'tense=bogus&tense=past'])
    assert.deepEqual(plain(codec.decode(input)), {state:plain(State.initialState()),popup:null});
  assert.equal(codec.decode('tense=past&unknown=x').state.tense, 'past');
});
for (const href of ['https://khod.example/index.html#anchor', 'http://localhost/index.html', 'file:///tmp/khod.html?unrelated=1']) {
  test('URL mode and history ownership: ' + href, () => {
    const state = {...State.initialState(), person:'2',gender:'feminine',showObjects:false};
    const url = codec.write(href,state,{family:'walk',direction:'multi'});
    assert.deepEqual(plain(codec.read(url)), {state:plain(state),popup:{family:'walk',direction:'multi'}});
    const parsed = new URL(url);
    assert((parsed.protocol === 'file:' ? parsed.hash : parsed.search).includes('v=1'));
    const dom = fixture('', href); const snapshots = [];
    const history = loadPure().MotionHistory.start(dom.window, snapshot => snapshots.push(plain(snapshot)));
    const length = dom.window.history.length;
    history.update(state); assert.equal(dom.window.history.length,length);
    history.open({family:'walk',direction:'uni'}); assert.equal(dom.window.history.length,length+1);
    dom.window.history.back(); assert.equal(snapshots.at(-1).popup,null);
    dom.window.history.forward(); assert.equal(snapshots.at(-1).popup.family,'walk');
    // Recreate the integration just as on reload; history.state is retained.
    dom.window.events = {}; // Reload replaces the document's listeners.
    const reloaded = loadPure().MotionHistory.start(dom.window, snapshot => snapshots.push(plain(snapshot)));
    reloaded.close(); assert.equal(codec.read(dom.window.location.href).popup,null);
    dom.window.history.forward(); assert.equal(codec.read(dom.window.location.href).popup.family,'walk');
    const direct = fixture('', url);
    direct.window.history.replaceState({foreign:true, khodHistory:{version:1,owner:'https://other.example/',id:'foreign',parent:'unknown'}},'',url);
    const link = loadPure().MotionHistory.start(direct.window, snapshot => snapshots.push(plain(snapshot)));
    assert(link.initial.popup);
    direct.window.events = {};
    const reloadLink = loadPure().MotionHistory.start(direct.window, snapshot => snapshots.push(plain(snapshot)));
    reloadLink.close(); assert.equal(codec.read(direct.window.location.href).popup,null);
    assert.equal(direct.window.history.length,1); assert.equal(direct.window.history.state.foreign,true);
  });
}
test('presentation restores popup URL on startup and Back/Forward without extra entries', () => {
  const dom = fixture(readFileSync(sourceRoot+'index.html','utf8'));
  const context = loadPure(); Object.assign(context, {setTimeout:()=>0,clearTimeout(){}});
  vm.runInContext(readFileSync(sourceRoot+'presentation.js','utf8'),context);
  context.MotionUI.start(dom.document,dom.window);
  const cell = descendants(dom.elements['verb-rows'],'td')[0]; cell.fire('click');
  assert.equal(dom.window.history.length,2); assert(dom.elements['conjugation-dialog'].open);
  dom.window.history.back(); assert(!dom.elements['conjugation-dialog'].open); assert(cell.focused);
  dom.window.history.forward(); assert(dom.elements['conjugation-dialog'].open);
  dom.window.fire('hashchange'); assert.equal(dom.window.history.length,2);
  dom.elements['conjugation-close'].fire('click'); assert(!dom.elements['conjugation-dialog'].open);
});
test('asynchronous Back is requested once despite repeated dismissals', () => {
  const dom = fixture('', 'https://khod.example/');
  let applied; const history = loadPure().MotionHistory.start(dom.window, value => { applied = value; });
  history.open({family:'walk',direction:'uni'});
  const back = dom.window.history.back.bind(dom.window.history);
  let requests = 0; dom.window.history.back = () => { requests++; };
  history.close(); history.close(); history.open({family:'walk',direction:'multi'});
  assert.equal(requests,1); assert.equal(dom.window.history.length,2);
  back(); assert.equal(applied.popup,null);
});
test('direct popup startup, backdrop and native Escape/close keep the app entry', () => {
  for (const dismissal of ['button', 'backdrop', 'native']) {
    const dom = fixture(readFileSync(sourceRoot+'index.html','utf8'), 'file:///tmp/khod.html#v=1&tense=past&pronoun=ona&popup=walk&direction=uni');
    // An unrelated prior page must not be traversed even when history is long.
    dom.window.history.pushState(null,'',dom.window.location.href);
    const context = loadPure(); Object.assign(context,{setTimeout:()=>0,clearTimeout(){}});
    vm.runInContext(readFileSync(sourceRoot+'presentation.js','utf8'),context);
    const ui = context.MotionUI.start(dom.document,dom.window);
    assert(dom.elements['conjugation-dialog'].open); assert.equal(ui.getState().gender,'feminine');
    const dialog = dom.elements['conjugation-dialog'];
    if (dismissal === 'button') dom.elements['conjugation-close'].fire('click');
    else if (dismissal === 'backdrop') dialog.fire('click',{clientX:0,clientY:0});
    else dialog.close(); // Native Escape ultimately emits the dialog's close event.
    assert(!dialog.open); assert.equal(codec.read(dom.window.location.href).popup,null);
    assert.equal(dom.window.history.length,2);
    assert(dom.elements['verb-rows'].children[0].children[1].focused);
  }
});
test('plain HTTP without randomUUID can own popup entries', () => {
  const dom = fixture('', 'http://khod.example/');
  dom.window.crypto = {getRandomValues: array => { array.set([1,2,3,4]); return array; }};
  const history = loadPure().MotionHistory.start(dom.window,()=>{});
  history.open({family:'walk',direction:'uni'}); history.close();
  assert.equal(codec.read(dom.window.location.href).popup,null);
});
