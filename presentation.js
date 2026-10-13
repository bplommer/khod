'use strict';

// Browser adapter: state and linguistic decisions live in the pure layers.
globalThis.MotionUI = (() => {
  function start(document, window) {
    const State = MotionState;
    const Model = MotionViewModel;
    let state = State.initialState();
    const controlPanel = document.getElementById('control-panel');
    function updateStickyControls() {
      const availableHeight = window.visualViewport?.height || window.innerHeight;
      const controlsHeight = controlPanel.getBoundingClientRect().height;
      controlPanel.classList.toggle('is-sticky', controlsHeight > 0 && controlsHeight <= availableHeight / 2);
    }
    // CSS does the scrolling. JS only decides whether the controls leave enough
    // room for the grid, including after wrapping or revealing different options.
    window.addEventListener('resize', updateStickyControls);
    window.visualViewport?.addEventListener('resize', updateStickyControls);
    const controlsResizeObserver = typeof window.ResizeObserver !== 'undefined'
      ? new window.ResizeObserver(updateStickyControls) : null;
    controlsResizeObserver?.observe(controlPanel);

    const rows = document.getElementById('verb-rows');
    const mode = document.getElementById('mode');
    const numberOptions = document.getElementById('number-options');
    const personOptions = document.getElementById('person-options');
    const genderOptions = document.getElementById('gender-options');
    const singular = document.getElementById('singular');
    const plural = document.getElementById('plural');
    const tenseRadios = ['infinitive', 'past', 'present', 'future'].map(key => document.getElementById('tense-' + key));
    const personRadios = ['1', '2', '3'].map(key => document.getElementById('person-' + key));
    const genderRadios = ['masculine', 'feminine', 'neuter'].map(key => document.getElementById('gender-' + key));
    const pronounRadios = Object.keys(State.pronounSpecs).map(key => document.getElementById('pronoun-' + key));
    function subjectFor() { return State.subject(state); }
    function setRadioValue(radios, value) {
      for (const radio of radios) radio.checked = radio.value === value;
    }
    function syncControls() {
      setRadioValue(tenseRadios, state.tense);
      setRadioValue(personRadios, state.person);
      setRadioValue(genderRadios, state.gender);
      setRadioValue(pronounRadios, state.pronoun);
      setRadioValue(prefixRadios, state.prefix);
      singular.checked = state.number === 'singular';
      plural.checked = state.number === 'plural';
      outerPoCheckbox.checked = state.outerPo;
    }
    const outerPoCheckbox = document.getElementById('outer-po');
    const prefixRadios = ['none', 'pri', 'u'].map(key => document.getElementById('prefix-' + key));

    // One floating tooltip serves every usage icon; its fixed position avoids
    // clipping inside the table. A tap pins it; hover/focus gives a transient view.
    const usageTooltip = document.getElementById('usage-tooltip');
    const usageTooltipHost = usageTooltip.parentNode;
    let activeInfoButton = null;
    let tooltipPinned = false;
    let tooltipHideTimer;
    let tooltipShowTimer;

    function positionUsageTooltip() {
      if (!activeInfoButton) return;
      const rect = activeInfoButton.getBoundingClientRect();
      const width = usageTooltip.offsetWidth;
      const height = usageTooltip.offsetHeight;
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
      let top = rect.bottom + 8;
      if (top + height > window.innerHeight - 12) top = rect.top - height - 8;
      top = Math.max(12, Math.min(top, window.innerHeight - height - 12));
      usageTooltip.style.left = left + 'px';
      usageTooltip.style.top = top + 'px';
    }

    function hideUsageTooltip() {
      clearTimeout(tooltipShowTimer);
      clearTimeout(tooltipHideTimer);
      if (activeInfoButton) {
        activeInfoButton.setAttribute('aria-expanded', 'false');
        activeInfoButton.removeAttribute('aria-describedby');
      }
      usageTooltip.hidden = true;
      activeInfoButton = null;
      tooltipPinned = false;
    }

    function showUsageTooltip(button, text, pin = false) {
      clearTimeout(tooltipHideTimer);
      if (activeInfoButton && activeInfoButton !== button) hideUsageTooltip();
      activeInfoButton = button;
      tooltipPinned = pin;
      usageTooltip.textContent = text;
      usageTooltip.hidden = false;
      button.setAttribute('aria-describedby', 'usage-tooltip');
      button.setAttribute('aria-expanded', 'true');
      positionUsageTooltip();
    }

    function scheduleTooltipHide() {
      clearTimeout(tooltipShowTimer);
      clearTimeout(tooltipHideTimer);
      tooltipHideTimer = setTimeout(() => {
        if (!tooltipPinned && document.activeElement !== activeInfoButton) hideUsageTooltip();
      }, 150);
    }

    function appendUsageIcon(cell, text, irregular = false) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = irregular ? 'irregular-label' : 'info-button';
      button.textContent = irregular ? 'irregular' : 'i';
      button.lang = 'en';
      button.setAttribute('aria-label', irregular ? 'Irregular form information' : 'Usage information');
      button.setAttribute('aria-expanded', 'false');
      function revealTooltip() {
        clearTimeout(tooltipShowTimer);
        if (activeInfoButton === button && tooltipPinned) return;
        if (irregular) tooltipShowTimer = setTimeout(() => showUsageTooltip(button, text), 100);
        else showUsageTooltip(button, text);
      }
      button.addEventListener('pointerenter', revealTooltip);
      button.addEventListener('pointerleave', scheduleTooltipHide);
      button.addEventListener('focus', revealTooltip);
      button.addEventListener('blur', scheduleTooltipHide);
      button.addEventListener('click', event => {
        event.stopPropagation();
        clearTimeout(tooltipShowTimer);
        if (activeInfoButton === button && tooltipPinned) hideUsageTooltip();
        else showUsageTooltip(button, text, true);
      });
      cell.append(button);
    }

    usageTooltip.addEventListener('pointerenter', () => clearTimeout(tooltipHideTimer));
    usageTooltip.addEventListener('pointerleave', scheduleTooltipHide);
    document.addEventListener('click', event => {
      if (activeInfoButton && !activeInfoButton.contains(event.target) && !usageTooltip.contains(event.target)) hideUsageTooltip();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') hideUsageTooltip();
    });
    window.addEventListener('resize', positionUsageTooltip);
    window.addEventListener('scroll', positionUsageTooltip, true);

    const conjugationDialog = document.getElementById('conjugation-dialog');
    const conjugationContent = document.getElementById('conjugation-content');
    let conjugationOpener = null;

    function popupFormCell(model) {
      const cell = document.createElement('td');
      const subject = document.createElement('span');
      subject.className = 'popup-subject';
      subject.lang = 'ru';
      subject.textContent = model.subject;
      cell.append(subject);
      const word = document.createElement(!model.unavailable && model.inappropriate ? 's' : 'span');
      word.lang = 'ru';
      word.textContent = model.form || '—';
      cell.append(word);
      return cell;
    }

    function openConjugation(family, direction, prefix, outerPo, selectedTense, opener) {
      hideUsageTooltip();
      const model = Model.conjugation({ ...state, prefix, outerPo, tense: selectedTense }, family.id, direction);
      document.getElementById('conjugation-title').textContent = model.title;
      document.getElementById('conjugation-context').textContent = model.context;
      const fragment = document.createDocumentFragment();
      for (const sectionModel of model.sections) {
        const section = document.createElement('section');
        section.className = 'popup-section';
        const heading = document.createElement('h3');
        heading.lang = 'ru';
        heading.textContent = sectionModel.infinitive;
        section.append(heading);
        const meta = document.createElement('p');
        meta.className = 'popup-note';
        meta.textContent = sectionModel.meta;
        section.append(meta);
        const table = document.createElement('table');
        table.className = 'popup-table';
        const head = document.createElement('thead');
        const headerRow = document.createElement('tr');
        for (const label of sectionModel.columns) {
          const th = document.createElement('th');
          th.scope = 'col';
          th.textContent = label;
          headerRow.append(th);
        }
        head.append(headerRow);
        table.append(head);
        const body = document.createElement('tbody');
        for (const rowModel of sectionModel.rows) {
          const row = document.createElement('tr');
          const th = document.createElement('th');
          th.scope = 'row';
          th.textContent = rowModel.label;
          row.append(th);
          for (const cellModel of rowModel.cells) row.append(popupFormCell(cellModel));
          body.append(row);
        }
        table.append(body);
        section.append(table);
        for (const text of sectionModel.notes) {
          const note = document.createElement('p');
          note.className = 'popup-note';
          note.textContent = text;
          section.append(note);
        }
        if (sectionModel.irregularNote) {
          const note = document.createElement('p');
          note.className = 'popup-note';
          appendIrregularLabel(note, sectionModel.irregularNote);
          section.append(note);
        }
        fragment.append(section);
      }
      conjugationContent.replaceChildren(fragment);
      conjugationDialog.append(usageTooltip);
      conjugationOpener = opener;
      conjugationDialog.showModal();
    }
    document.getElementById('conjugation-close').addEventListener('click', () => conjugationDialog.close());
    conjugationDialog.addEventListener('click', event => {
      if (event.target !== conjugationDialog) return;
      const rect = conjugationDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) conjugationDialog.close();
    });
    conjugationDialog.addEventListener('close', () => {
      hideUsageTooltip();
      usageTooltipHost?.append(usageTooltip);
      conjugationOpener?.focus();
    });

    function appendIrregularLabel(parent, explanation) {
      appendUsageIcon(parent, explanation, true);
    }

    function renderVariant(cell, variant, tense, isPlural, person, gender, irregularExplanation) {
      const { form, unavailable, inappropriate, reason } = Model.describeForm(variant, tense, isPlural, person, gender);
      const word = document.createElement(inappropriate && !unavailable ? 's' : 'span');
      word.className = 'verb-form';
      if (unavailable) {
        word.className += ' unavailable';
        word.textContent = '—';
        word.setAttribute('aria-label', variant.status === 'not-modelled' ? 'Not modelled' : 'No grammatical form for the selected tense');
      } else {
        const subject = subjectFor(tense);
        if (subject) {
          const pronoun = document.createElement('span');
          pronoun.className = 'pronoun';
          pronoun.textContent = subject + ' ';
          word.append(pronoun);
        }
        word.append(document.createTextNode(form));
      }
      if (variant.usageInfo) appendUsageIcon(word, variant.usageInfo);
      cell.append(word);
      const irregularNote = irregularExplanation && variant.note?.includes(irregularExplanation) ? irregularExplanation : null;
      const regularNote = irregularNote ? variant.note.replace(irregularNote, '').trim() : variant.note;
      if (regularNote || irregularNote || reason || inappropriate) {
        const note = document.createElement('span');
        note.className = 'cell-note';
        note.lang = 'en';
        note.textContent = [inappropriate && !unavailable ? (variant.status === 'semantic' ? 'Semantic mismatch.' : 'Unidiomatic here.') : '', reason, regularNote].filter(Boolean).join(' ');
        if (irregularNote) {
          if (note.textContent) note.append(document.createTextNode(' '));
          appendIrregularLabel(note, irregularNote);
        }
        cell.append(note);
      }
    }

    function render() {
      hideUsageTooltip();
      syncControls();
      const model = Model.grid(state);
      const { tense, person, gender, prefix, outerPo } = state;
      const isPlural = state.number === 'plural';
      const settings = model.settings;
      numberOptions.hidden = !model.visibility.number;
      personOptions.hidden = !model.visibility.person;
      genderOptions.hidden = !model.visibility.gender;
      document.getElementById('prefix-info').textContent = settings.info;
      document.getElementById('distributive-comparison').hidden = !outerPo || prefix === 'none';
      for (const direction of ['uni', 'multi']) {
        const column = model.columns[direction];
        document.getElementById(direction + '-title').textContent = column.title;
        document.getElementById(direction + '-hint').textContent = column.hint;
        document.getElementById(direction + '-meta').textContent = column.meta;
      }
      const fragment = document.createDocumentFragment();
      for (const rowModel of model.rows) {
        const family = rowModel.family;
        const row = document.createElement('tr');
        const heading = document.createElement('th');
        heading.scope = 'row';
        heading.textContent = family.movement;
        row.append(heading);
        for (const direction of ['uni', 'multi']) {
          const cell = document.createElement('td');
          cell.lang = 'ru';
          cell.tabIndex = 0;
          cell.setAttribute('aria-haspopup', 'dialog');
          cell.setAttribute('aria-label', 'Show conjugation: ' + family.movement + ', ' + settings.titles[direction === 'uni' ? 0 : 1]);
          cell.addEventListener('click', event => {
            if (event.target.closest?.('.info-button, .irregular-label')) return;
            openConjugation(family, direction, prefix, outerPo, tense, cell);
          });
          cell.addEventListener('keydown', event => {
            if (event.target !== cell || !['Enter', ' '].includes(event.key)) return;
            event.preventDefault();
            openConjugation(family, direction, prefix, outerPo, tense, cell);
          });
          for (const variant of rowModel.cells[direction]) renderVariant(cell, variant, tense, isPlural, person, gender, family.directionalImperfective?.explanation);
          row.append(cell);
        }
        fragment.append(row);
      }
      rows.replaceChildren(fragment);
      mode.textContent = model.mode;
      updateStickyControls();
    }
    function dispatch(action) {
      state = State.updateState(state, action);
      render();
    }
    outerPoCheckbox.addEventListener('change', () => dispatch({ type: 'outerPo', value: outerPoCheckbox.checked }));
    for (const [type, radios] of [['prefix', prefixRadios], ['tense', tenseRadios], ['pronoun', pronounRadios], ['person', personRadios], ['gender', genderRadios]]) {
      for (const radio of radios) radio.addEventListener('change', () => dispatch({ type, value: radio.value }));
    }
    singular.addEventListener('change', () => dispatch({ type: 'number', value: 'singular' }));
    plural.addEventListener('change', () => dispatch({ type: 'number', value: 'plural' }));
    render();
    return Object.freeze({ dispatch, getState: () => ({ ...state }) });

  }
  return Object.freeze({ start });
})();
