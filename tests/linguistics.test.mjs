import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPure } from './load-app.mjs';
const { MotionData: Data, MotionCore: Core } = loadPure();
const family = id => Data.motionFamilies.find(f => f.id === id);
const verb = (id, direction, prefix = 'none') => Core.selectedVariants(family(id), direction, prefix)[0];

test('independent irregular and stress examples', () => {
  for (const [id, direction, prefix, key, expected] of [
    ['walk','uni','none','nonpast1sg','иду́'], ['vehicle','multi','none','nonpast1sg','е́зжу'],
    ['run','uni','none','nonpast3pl','бегу́т'], ['fly','uni','none','nonpast3pl','летя́т'],
    ['walk','uni','pri','nonpast1sg','приду́'], ['walk','uni','u','infinitive','уйти́'],
    ['walk','uni','po','pastF','пошла́'], ['walk','uni','pri','pastPl','пришли́'],
    ['vehicle','multi','pri','infinitive','приезжа́ть'], ['swim','multi','u','infinitive','уплыва́ть'],
    ['crawl','multi','pri','infinitive','приполза́ть'], ['drag','multi','u','infinitive','ута́скивать'],
    ['roll','multi','pri','infinitive','прика́тывать'], ['carry','uni','none','pastN','несло́'],
    ['swim','uni','pri','pastPl','приплы́ли'], ['crawl','uni','pri','pastPl','приползли́']
  ]) assert.equal(Core.variantsFor(family(id), direction, prefix)[0][key], expected);
});
test('aspect, present gaps, and both future constructions', () => {
  const arriving = verb('walk','uni','pri'), arrivingOften = verb('walk','multi','pri');
  assert.equal(Core.formFor(arriving,'present',false,'1','masculine'),null);
  assert.equal(Core.formFor(arriving,'future',false,'1','masculine'),'приду́');
  assert.equal(Core.formFor(arrivingOften,'future',true,'2','masculine'),'бу́дете приходи́ть');
  assert.equal(Core.formFor(arrivingOften,'present',true,'2','masculine'),'прихо́дите');
  assert.equal(verb('walk','multi','po').aspect,'perfective');
});
test('single po prefix keeps onset and limited-duration meanings', () => {
  assert.equal(verb('vehicle','uni','po').infinitive,'пое́хать');
  assert.equal(verb('walk','multi','po').infinitive,'походи́ть');
  assert.equal(Core.formFor(verb('walk','multi','po'),'future',false,'1','masculine'),'похожу́');
  assert.equal(Core.formFor(verb('walk','multi','po'),'present',false,'1','masculine'),null);
});
test('climbing alternatives converge only in directional imperfectives', () => {
  assert.equal(Core.variantsFor(family('climb'),'multi','none').length,2);
  assert.equal(Core.variantsFor(family('climb'),'multi','po').length,2);
  assert.equal(Core.variantsFor(family('climb'),'multi','pri').length,1);
});
test('every generated paradigm is complete and stress marks combine with vowels', () => {
  const fields = ['infinitive','nonpast1sg','nonpast2sg','nonpast3sg','nonpast1pl','nonpast2pl','nonpast3pl','pastM','pastF','pastN','pastPl'];
  for (const f of Data.motionFamilies) for (const direction of ['uni','multi']) for (const prefix of ['none','pri','u','po']) {
    for (const variant of Core.selectedVariants(f,direction,prefix)) {
      if (variant.status === 'ungrammatical') continue;
      for (const field of fields) {
        assert.equal(typeof variant[field],'string');
        assert(!/[`´]/.test(variant[field]));
        assert(!/(?<![аеёиоуыэюя])́/u.test(variant[field]));
      }
    }
  }
});
