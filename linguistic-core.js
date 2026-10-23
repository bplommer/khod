'use strict';

globalThis.MotionCore = (() => {
const { motionFamilies, usageNotes, prefixSettings } = MotionData;
    // These three prefixes preserve lexical stress. A monosyllable without an
    // explicit accent gains one when prefixation makes the word polysyllabic.
    // ё already indicates stress. This is not a rule for every Russian prefix:
    // e.g. вы- would require a different stress policy.
    function attachPrefix(prefix, form) {
      const vowels = [...form.matchAll(/[аеёиоуыэюя]/g)];
      if (!form.includes('́') && !form.includes('ё') && vowels.length === 1) {
        const index = vowels[0].index;
        form = form.slice(0, index + 1) + '́' + form.slice(index + 1);
      }
      return prefix + form;
    }

    function variantsFor(family, direction, prefixKey) {
      const prefix = prefixSettings[prefixKey];
      let paradigms = family.base[direction];
      let stemChange;
      // Directional prefixes select a different imperfective stem in some families.
      // по- 'for a while' instead keeps the ordinary multidirectional paradigm.
      if (prefix.kind === 'directional' && direction === 'multi' && family.directionalImperfective) {
        stemChange = family.directionalImperfective;
        paradigms = [stemChange.forms];
      } else if (prefix.kind !== 'unprefixed' && direction === 'uni' && family.prefixedUnidirectional) {
        const bound = family.prefixedUnidirectional;
        paradigms = [{ ...bound.forms, ...(bound.overrides[prefixKey] || {}) }];
      }
      const usage = usageNotes[family.id]?.[prefixKey];
      const note = [usage?.[direction] || usage?.both, stemChange?.explanation].filter(Boolean).join(' ');
      return paradigms.map((paradigm, index) => {
        if (prefix.kind !== 'unprefixed' && direction === 'uni' && family.prefixedImperative) {
          paradigm = { ...paradigm, imperativeSg: family.prefixedImperative };
        }
        const forms = prefix.kind === 'unprefixed'
          ? { ...paradigm }
          : Object.fromEntries(Object.entries(paradigm).map(([field, form]) => [field, form === null ? null : attachPrefix(prefix.surface, form)]));
        return { ...forms, aspect: prefix.aspects[direction], status: 'valid', ...(note && index === 0 ? { note } : {}) };
      });
    }

    function settingsFor(prefix) {
      return prefixSettings[prefix];
    }

    function selectedVariants(family, direction, prefix) {
      return variantsFor(family, direction, prefix);
    }

    const futureAuxiliaries = { '1sg': 'бу́ду', '2sg': 'бу́дешь', '3sg': 'бу́дет', '1pl': 'бу́дем', '2pl': 'бу́дете', '3pl': 'бу́дут' };
    function formFor(variant, tense, isPlural, person, gender) {
      if (['ungrammatical', 'not-modelled'].includes(variant.status) || (tense === 'present' && variant.aspect === 'perfective')) return null;
      if (tense === 'infinitive') return variant.infinitive;
      if (tense === 'imperative') return person !== '2' || variant.imperativeSg === null
        ? null : isPlural ? attachPrefix('', variant.imperativeSg) + 'те' : variant.imperativeSg;
      if (tense === 'past') return variant[isPlural ? 'pastPl' : { masculine: 'pastM', feminine: 'pastF', neuter: 'pastN' }[gender]];
      const agreement = person + (isPlural ? 'pl' : 'sg');
      return tense === 'future' && variant.aspect === 'imperfective'
        ? futureAuxiliaries[agreement] + ' ' + variant.infinitive
        : variant['nonpast' + agreement];
    }

  return Object.freeze({ attachPrefix, variantsFor, settingsFor, selectedVariants, formFor });
})();

