import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { packageHtml } from '../package.mjs';
import { sourceRoot, files, loadPure, plain } from './load-app.mjs';
import { fixture } from './dom-fixture.mjs';

test('standalone embeds exact source assets, in order, with no external dependencies',async()=>{
  const html=await packageHtml();
  const scripts=[...html.matchAll(/<script data-source="([^"]+)">\n([\s\S]*?)<\/script>/g)];
  assert.deepEqual(scripts.map(match=>match[1]),files);
  for(const match of scripts)assert.equal(match[2],readFileSync(sourceRoot+match[1],'utf8'));
  assert(!/<script\b[^>]*\bsrc=|<link\b[^>]*\bhref=/.test(html));
  assert(html.includes(readFileSync(sourceRoot+'styles.css','utf8')));
});
test('packaged app boots and has the same API and models as source',async()=>{
  const html=await packageHtml();const dom=fixture(html);const context=vm.createContext({...dom,setTimeout:()=>0,clearTimeout(){}});
  for(const match of html.matchAll(/<script data-source="[^"]+">\n([\s\S]*?)<\/script>/g))vm.runInContext(match[1],context);
  assert.equal(dom.elements['verb-rows'].children.length,14);
  const source=loadPure();assert.deepEqual(plain(context.MotionViewModel.grid(context.MotionState.initialState())),plain(source.MotionViewModel.grid(source.MotionState.initialState())));
  context.motionApp.dispatch({type:'tense',value:'past'});context.motionApp.dispatch({type:'pronoun',value:'ona'});assert(dom.elements['verb-rows'].text.includes('она́ шла'));
});

test('packaging rejects path traversal and closing-script injection',async()=>{
  const {mkdtemp,writeFile,rm}=await import('node:fs/promises');
  const {tmpdir}=await import('node:os');const {join}=await import('node:path');
  const dir=await mkdtemp(join(tmpdir(),'motion-package-test-'));
  try{
    await writeFile(join(dir,'index.html'),'<script src="../outside.js" data-inline></script>');
    await assert.rejects(packageHtml(dir),/leaves/);
    await writeFile(join(dir,'index.html'),'<script src="unsafe.js" data-inline></script>');
    await writeFile(join(dir,'unsafe.js'),'const text = "</script>";');
    await assert.rejects(packageHtml(dir),/closing tag/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
