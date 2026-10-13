'use strict';

// Pure presentation models: no HTML, DOM queries, event handlers or browser APIs.
globalThis.MotionViewModel = (() => {
  const { motionFamilies } = MotionData;
  const { settingsFor, selectedVariants, formFor } = MotionCore;
  function describeForm(variant, tense, isPlural, person, gender) {
    const form = formFor(variant, tense, isPlural, person, gender);
    const inappropriate = ['semantic', 'unidiomatic'].includes(variant.status);
    const reason = !['not-modelled', 'ungrammatical'].includes(variant.status) && tense === 'present' && variant.aspect === 'perfective'
      ? 'Perfective verbs have no present tense. Select Future for the simple future form.'
      : variant.explanation;
    return { form, unavailable: form === null, inappropriate, reason };
  }
  function grid(state) {
    const settings = settingsFor(state.prefix);
    const columns = Object.fromEntries(['uni', 'multi'].map((direction, index) => {
      const aspect = settings.aspects[direction];
      return [direction, {
        title: settings.titles[index], hint: settings.hints[index],
        meta: aspect === null ? 'not modelled' : aspect + (state.tense === 'infinitive' ? '' : ' · ' + state.tense + (state.tense === 'present' && aspect === 'perfective' ? ' · unavailable' : ''))
      }];
    }));
    const rows = motionFamilies.map(family => ({ family, cells: Object.fromEntries(['uni', 'multi'].map(direction =>
      [direction, selectedVariants(family, direction, state.prefix)])) }));
    const subject = MotionState.subject(state);
    const mode = state.tense[0].toUpperCase() + state.tense.slice(1) + (subject ? ' · ' + subject : '') + ' · ' + settings.label;
    const descriptions = rows.flatMap(row => ['uni', 'multi'].flatMap(direction => row.cells[direction].map(variant =>
      describeForm(variant, state.tense, state.number === 'plural', state.person, state.gender))));
    const emptyExplanation = descriptions.every(cell => cell.unavailable)
      ? [...new Set(descriptions.map(cell => cell.reason).filter(Boolean))].join(' ') || 'No forms are available for this selection.'
      : null;
    const perfectivePresent = state.tense === 'present' && Object.values(settings.aspects).every(aspect => aspect === 'perfective');
    const emptyPanel = emptyExplanation ? {
      tense: state.tense[0].toUpperCase() + state.tense.slice(1) + ' tense',
      meta: perfectivePresent ? 'Both forms are perfective' : '',
      title: perfectivePresent ? 'No present-tense forms' : 'No available forms',
      explanation: perfectivePresent ? 'Perfective verbs have no present tense. Both по- forms describe a completed or bounded action.' : emptyExplanation,
      next: perfectivePresent ? 'Select Future to see their simple future forms.' : ''
    } : null;
    return { settings, columns, rows, mode, emptyExplanation, emptyPanel, visibility: MotionState.visibility(state) };
  }
  function conjugation(state, familyId, direction) {
    const family = motionFamilies.find(family => family.id === familyId);
    if (!family || !['uni', 'multi'].includes(direction)) throw new TypeError('Unknown conjugation target');
    const tense = state.tense === 'infinitive' ? 'present' : state.tense;
    const settings = settingsFor(state.prefix);
    const variants = selectedVariants(family, direction, state.prefix);
    const sections = variants.map((variant, variantIndex) => {
      function cell(isPlural, person, gender) {
        const selected = selectedVariants(family, direction, state.prefix)[variantIndex];
        const description = describeForm(selected, tense, isPlural, person, gender);
        const subject = tense === 'past'
          ? (isPlural ? 'они́' : { masculine: 'он', feminine: 'она́', neuter: 'оно́' }[gender])
          : (isPlural ? { '1': 'мы', '2': 'вы', '3': 'они́' }[person] : { '1': 'я', '2': 'ты', '3': 'он / она́ / оно́' }[person]);
        return { ...description, subject };
      }
      const rows = tense === 'past'
        ? [['Masculine', false, 'masculine'], ['Feminine', false, 'feminine'], ['Neuter', false, 'neuter'], ['Plural', true, 'masculine']].map(([label, plural, gender]) => ({ label, cells: [cell(plural, '3', gender)] }))
        : ['1', '2', '3'].map((person, index) => ({ label: ['1st person', '2nd person', '3rd person'][index], cells: [cell(false, person, 'masculine'), cell(true, person, 'masculine')] }));
      const singularVariant = selectedVariants(family, direction, state.prefix)[variantIndex];
      const reason = describeForm(singularVariant, tense, false, '3', 'masculine').reason;
      const irregularNote = family.directionalImperfective?.explanation;
      const hasIrregularNote = irregularNote && variant.note?.includes(irregularNote);
      const note = hasIrregularNote ? variant.note.replace(irregularNote, '').trim() : variant.note;
      const notes = [reason, note, variant.usageInfo, tense === 'past' ? 'Past forms agree in gender / number, not person; я and ты can also take masculine or feminine forms.' : 'Third-person singular gender changes the pronoun, not the verb.'].filter(Boolean);
      return { infinitive: variant.infinitive || '—', meta: [variant.aspect, tense].filter(Boolean).join(' · '), columns: tense === 'past' ? ['Gender / number', 'Form'] : ['Person', 'Singular', 'Plural'], rows, notes, irregularNote: hasIrregularNote ? irregularNote : null };
    });
    return { title: family.movement, context: settings.label + ' · ' + tense + (state.tense === 'infinitive' ? ' (shown for infinitive selection)' : ''), sections };
  }
  return Object.freeze({ grid, conjugation, describeForm });
})();
