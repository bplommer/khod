import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { loadPure, sourceRoot, plain } from './load-app.mjs';
import { fixture, Element, descendants } from './dom-fixture.mjs';
function app(timers={setTimeout:()=>0,clearTimeout(){}}){const context=loadPure();const dom=fixture(readFileSync(sourceRoot+'index.html','utf8'));Object.assign(context,timers);vm.runInContext(readFileSync(sourceRoot+'presentation.js','utf8'),context);const ui=context.MotionUI.start(dom.document,dom.window);return{...dom,ui};}

test('source adapter renders and syncs actual control event handlers',()=>{
  const {elements:e,choose,ui}=app();choose('tense-past');choose('gender-feminine');choose('pronoun-ty');
  assert(e['verb-rows'].text.includes('ты шла'));assert.equal(ui.getState().person,'1');
  choose('tense-present');assert.equal(ui.getState().person,'2');assert(e['gender-options'].hidden);assert(e['verb-rows'].text.includes('ты идёшь'));
  choose('plural');assert(e['verb-rows'].text.includes('вы идёте'));
});
test('click, keyboard opening, info-icon separation and dialog focus restoration',()=>{
  const {elements:e,ui}=app();ui.dispatch({type:'tense',value:'future'});
  const cell=e['verb-rows'].children[0].children[1];cell.fire('click');assert(e['conjugation-dialog'].open);assert.equal(descendants(e['conjugation-content'],'table').length,1);
  e['conjugation-close'].fire('click');assert(!e['conjugation-dialog'].open);assert(cell.focused);
  cell.fire('keydown',{key:'Enter',preventDefault(){}});assert(e['conjugation-dialog'].open);e['conjugation-dialog'].close();
  cell.fire('click',{target:{closest:()=>true}});assert(!e['conjugation-dialog'].open);
});
test('usage tooltip hover/tap/focus and dismiss behaviour',()=>{
  const {elements:e,document,ui}=app({setTimeout(fn){fn();return 0;},clearTimeout(){}});ui.dispatch({type:'prefix',value:'pri'});ui.dispatch({type:'tense',value:'future'});
  const button=descendants(e['verb-rows'],'button').find(node=>node.className==='irregular-label');assert(button);
  button.fire('pointerenter');assert(!e['usage-tooltip'].hidden);assert(e['usage-tooltip'].text.includes('directional imperfective'));
  button.fire('click',{stopPropagation(){}});button.fire('click',{stopPropagation(){}});assert(e['usage-tooltip'].hidden);
  button.fire('focus');document.fire('keydown',{key:'Escape'});assert(e['usage-tooltip'].hidden);
  button.fire('click',{stopPropagation(){}});document.fire('click',{target:new Element('outside')});assert(e['usage-tooltip'].hidden);
});
test('sticky controls use the half-height boundary and visual viewport',()=>{
  const {elements:e,window}=app();e['control-panel'].rect={height:400};window.fire('resize');assert(e['control-panel'].classes.has('is-sticky'));
  e['control-panel'].rect.height=401;window.fire('resize');assert(!e['control-panel'].classes.has('is-sticky'));
  window.visualViewport={height:600};e['control-panel'].rect.height=300;window.fire('resize');assert(e['control-panel'].classes.has('is-sticky'));
});

test('irregular explanation waits 100ms and cancels on leave, Escape and rerender',()=>{
  let next=0;const pending=new Map();
  const timers={setTimeout(fn,delay){const id=++next;pending.set(id,{fn,delay});return id;},clearTimeout(id){pending.delete(id);}};
  const {elements:e,ui,document}=app(timers);
  ui.dispatch({type:'prefix',value:'pri'});
  const button=descendants(e['verb-rows'],'button').find(node=>node.className==='irregular-label');
  assert(button);assert.equal(button.text,'irregular');assert.equal(button.attrs.title,undefined);
  button.fire('pointerenter');assert(e['usage-tooltip'].hidden);
  const task=[...pending.values()].find(task=>task.delay===100);assert(task);task.fn();
  assert(!e['usage-tooltip'].hidden);assert(e['usage-tooltip'].text.includes('directional imperfective'));
  document.fire('keydown',{key:'Escape'});assert(e['usage-tooltip'].hidden);
  button.fire('pointerenter');button.fire('pointerleave');assert(![...pending.values()].some(task=>task.delay===100));
  button.fire('focus');document.fire('keydown',{key:'Escape'});assert(![...pending.values()].some(task=>task.delay===100));
  button.fire('pointerenter');ui.dispatch({type:'prefix',value:'none'});assert(![...pending.values()].some(task=>task.delay===100));
});

test('pronoun selector hides for infinitives and retains the selected subject',()=>{
  const {elements:e,choose,ui}=app();
  assert(e['pronoun-options'].hidden);
  for(const tense of ['past','present','future']) {
    choose('tense-'+tense);assert(!e['pronoun-options'].hidden);
  }
  choose('pronoun-vy');choose('tense-infinitive');
  assert(e['pronoun-options'].hidden);assert.equal(ui.getState().pronoun,'vy');
  choose('tense-present');assert(!e['pronoun-options'].hidden);assert(e['pronoun-vy'].checked);
  assert(e['verb-rows'].text.includes('вы идёте'));
});


test('po is an exclusive prefix choice and updates grid and popup',()=>{
  const {elements:e,choose,ui}=app();
  assert.equal(e['outer-po'],undefined);assert.equal(e['distributive-comparison'],undefined);
  choose('prefix-pri');choose('prefix-po');choose('tense-future');
  assert.equal(ui.getState().prefix,'po');assert(!e['prefix-pri'].checked);assert(e['prefix-po'].checked);
  assert(e['verb-rows'].text.includes('пойду́'));assert(e['verb-rows'].text.includes('похожу́'));
  e['verb-rows'].children[0].children[2].fire('click');assert(e['conjugation-context'].text.includes('по-'));
  assert(e['conjugation-content'].text.includes('похожу́'));
  choose('prefix-u');assert(!e['prefix-po'].checked);assert(e['verb-rows'].text.includes('уйду́'));
  assert.throws(()=>ui.dispatch({type:'outerPo',value:true}));
});
