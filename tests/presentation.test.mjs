import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { loadPure, sourceRoot, plain } from './load-app.mjs';
import { fixture, Element, descendants } from './dom-fixture.mjs';
function app(timers={setTimeout:()=>0,clearTimeout(){}}){const context=loadPure();const dom=fixture(readFileSync(sourceRoot+'index.html','utf8'));Object.assign(context,timers);vm.runInContext(readFileSync(sourceRoot+'presentation.js','utf8'),context);const ui=context.MotionUI.start(dom.document,dom.window);return{...dom,ui};}

test('main grid shows an explanation only when every selected form is unavailable',()=>{
  const {elements:e,choose}=app();
  choose('prefix-po');choose('tense-present');
  assert(e['verb-table-wrap'].hidden);
  assert.equal(e['verb-rows'].children.length,0);
  assert(!e['empty-panel'].hidden);
  assert.equal(e['empty-title'].text,'No present-tense forms');
  assert.equal(e['empty-meta'].text,'Both forms are perfective');
  assert.equal(e['empty-explanation'].text,'Perfective verbs have no present tense. Both по- forms describe a completed or bounded action.');
  assert.equal(e['empty-next'].text,'Select Future to see their simple future forms.');
  choose('tense-future');
  assert(!e['verb-table-wrap'].hidden);assert(e['empty-panel'].hidden);
  assert(e['verb-rows'].text.includes('пойду́'));
  choose('tense-present');choose('prefix-pri');
  assert(!e['verb-table-wrap'].hidden);assert(e['empty-panel'].hidden);
  assert(e['verb-rows'].text.includes('—'));assert(e['verb-rows'].text.includes('прихожу́'));
  choose('prefix-none');
  assert(!e['verb-table-wrap'].hidden);assert(e['verb-rows'].text.includes('иду́'));
});

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

test('object examples use family semantics and the checkbox controls grid and popup',()=>{
  const {elements:e,choose,ui}=app();
  const rows=()=>e['verb-rows'].children;
  assert(e['show-objects'].checked);
  assert(!rows()[0].text.includes('что́-то'));
  for(const [index,object] of [[8,'что́-то/кого́-то'],[9,'что́-то/кого́-то'],[10,'кого́-то'],[11,'что́-то/кого́-то'],[12,'что́-то'],[13,'кого́-то']]) {
    const pronouns=descendants(rows()[index],'span').filter(node=>node.className==='pronoun');
    assert.equal(pronouns.length,2);
    assert(pronouns.every(node=>node.text===' '+object));
  }
  choose('tense-present');
  assert(rows()[8].text.includes('я несу́ что́-то/кого́-то'));
  rows()[8].children[1].fire('click');
  assert(e['conjugation-content'].text.includes('что́-то/кого́-то'));
  e['conjugation-dialog'].close();
  e['show-objects'].checked=false;e['show-objects'].fire('change');
  assert.equal(ui.getState().showObjects,false);
  assert(!e['verb-rows'].text.includes('что́-то'));
  assert(e['verb-rows'].text.includes('я несу́'));
  rows()[8].children[1].fire('click');
  assert(!e['conjugation-content'].text.includes('что́-то'));
  e['conjugation-dialog'].close();
  choose('prefix-pri');
  choose('show-objects');
  assert(!rows()[8].children[1].text.includes('что́-то'));
  assert(rows()[8].children[2].text.includes('что́-то/кого́-то'));
  choose('tense-future');assert(rows()[8].children[1].text.includes('что́-то/кого́-то'));
});

test('neuter selection keeps я and ты and renders their past forms',()=>{
  for(const pronoun of ['ya','ty']) {
    const {elements:e,choose,ui}=app();
    choose('tense-past');choose('pronoun-'+pronoun);choose('gender-neuter');
    assert.equal(ui.getState().pronoun,pronoun);
    assert(e['pronoun-'+pronoun].checked);assert(e['gender-neuter'].checked);
    assert(e['verb-rows'].text.includes((pronoun==='ya'?'я':'ты')+' шло'));
    choose('tense-present');choose('tense-past');
    assert(e['gender-neuter'].checked);
    assert(e['verb-rows'].text.includes((pronoun==='ya'?'я':'ты')+' шло'));
  }
});
