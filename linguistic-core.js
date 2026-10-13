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
        const forms = prefix.kind === 'unprefixed'
          ? { ...paradigm }
          : Object.fromEntries(Object.entries(paradigm).map(([field, form]) => [field, attachPrefix(prefix.surface, form)]));
        return { ...forms, aspect: prefix.aspects[direction], status: 'valid', ...(note && index === 0 ? { note } : {}) };
      });
    }

    // Outer distributive по- is an operation on an existing directional
    // prefixed motion verb (perfective or imperfective), not a stored cross-product.
    // Distribution can be over subjects or, with transitive verbs, objects.
    function settingsFor(innerPrefix, outerPo) {
      if (!outerPo) return prefixSettings[innerPrefix];
      if (innerPrefix === 'none') return prefixSettings.po;
      const inner = prefixSettings[innerPrefix];
      const action = innerPrefix === 'pri' ? 'arrive' : 'leave';
      return {
        label: 'по- + ' + inner.label,
        aspects: { uni: 'perfective', multi: 'perfective' },
        titles: ['Distributive perfective', 'Distributive perfective'],
        hints: ['From the inner perfective', 'From the inner imperfective'],
        info: 'Outer по-: all/many movers ' + action + ', or multiple objects are brought / taken away, successively. Both columns are perfective. Some formations are productive but uncommon; singular transitive subjects are valid with multiple objects.'
      };
    }

    function selectedVariants(family, direction, innerPrefix, outerPo, tense, isPlural) {
      if (!outerPo) return variantsFor(family, direction, innerPrefix);
      if (innerPrefix === 'none') return variantsFor(family, direction, 'po');
      const blocked = family.distributiveBlocked?.[direction];
      if (blocked) return [{ status: 'ungrammatical', explanation: blocked }];
      return variantsFor(family, direction, innerPrefix).map(variant => {
        const forms = Object.fromEntries(Object.entries(variant)
          .filter(([key]) => /^(infinitive|nonpast[123](sg|pl)|past(M|F|N|Pl))$/.test(key))
          .map(([key, form]) => [key, attachPrefix('по', form)]));
        const singularReading = tense !== 'infinitive' && !isPlural && family.distributedParticipants === 'movers';
        const usageNote = family.distributiveUsage[direction] === 'productive'
          ? 'Productive / uncommon formation: interpretable in a suitable distributive context; not presented as a frequent everyday word.'
          : '';
        const participantNote = family.distributedParticipants === 'objects'
          ? 'Distribution may be over multiple moved objects or people, so a singular subject is valid.'
          : '';
        return {
          ...variant,
          ...forms,
          aspect: 'perfective',
          status: singularReading ? 'semantic' : 'valid',
          note: variant.note,
          usageInfo: [usageNote, participantNote].filter(Boolean).join(' '),
          ...(singularReading ? { explanation: 'Distributive по- requires multiple movers. This form is inappropriate for a single-individual reading; a collective singular subject can work.' } : {})
        };
      });
    }

    const futureAuxiliaries = { '1sg': 'бу́ду', '2sg': 'бу́дешь', '3sg': 'бу́дет', '1pl': 'бу́дем', '2pl': 'бу́дете', '3pl': 'бу́дут' };
    function formFor(variant, tense, isPlural, person, gender) {
      if (['ungrammatical', 'not-modelled'].includes(variant.status) || (tense === 'present' && variant.aspect === 'perfective')) return null;
      if (tense === 'infinitive') return variant.infinitive;
      if (tense === 'past') return variant[isPlural ? 'pastPl' : { masculine: 'pastM', feminine: 'pastF', neuter: 'pastN' }[gender]];
      const agreement = person + (isPlural ? 'pl' : 'sg');
      return tense === 'future' && variant.aspect === 'imperfective'
        ? futureAuxiliaries[agreement] + ' ' + variant.infinitive
        : variant['nonpast' + agreement];
    }

  return Object.freeze({ attachPrefix, variantsFor, settingsFor, selectedVariants, formFor });
})();
