import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { loadPure, canonical } from './load-app.mjs';
const baseline=JSON.parse(readFileSync(new URL('./compatibility.json',import.meta.url),'utf8'));
test('all derived variants preserve the supported single-prefix regression baseline',()=>{
  const {MotionData:Data,MotionCore:Core}=loadPure();
  const matrix=Data.motionFamilies.flatMap(family=>['uni','multi'].flatMap(direction=>['none','pri','u','po'].flatMap(prefix=>['infinitive','past','present','future'].flatMap(tense=>[false,true].map(plural=>Core.selectedVariants(family,direction,prefix))))));
  const digest=createHash('sha256').update(JSON.stringify(canonical(matrix))).digest('hex');
  assert.equal(digest,baseline.generatedVariantsSha256);
});
