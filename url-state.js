'use strict';

// Pure URL codec: no location, history or DOM access.
globalThis.MotionURL = (() => {
  const fields = ['tense', 'prefix', 'pronoun', 'person', 'number', 'gender', 'showObjects'];
  function normalize(input) {
    const state = MotionState.initialState();
    for (const field of fields) if (MotionState.values[field].includes(input[field])) state[field] = input[field];
    return MotionState.reconcileAgreement(state);
  }
  function popupValid(popup) {
    return popup && MotionData.motionFamilies.some(family => family.id === popup.family) && ['uni', 'multi'].includes(popup.direction);
  }
  function decode(parameters) {
    const params = new URLSearchParams(parameters);
    const input = {};
    if (params.get('v') !== null && params.get('v') !== '1') return { state: normalize({}), popup: null };
    for (const field of fields) {
      const value = params.get(field);
      input[field] = field === 'showObjects' ? (value === 'true' ? true : value === 'false' ? false : undefined) : value;
    }
    const popup = { family: params.get('popup'), direction: params.get('direction') };
    return { state: normalize(input), popup: popupValid(popup) ? popup : null };
  }
  function encode(state, popup = null) {
    const params = new URLSearchParams();
    params.set('v', '1');
    const valid = normalize(state);
    for (const field of fields) params.set(field, String(valid[field]));
    if (popupValid(popup)) { params.set('popup', popup.family); params.set('direction', popup.direction); }
    return params.toString();
  }
  function read(href) {
    const url = new URL(href);
    return decode(url.protocol === 'file:' ? url.hash.slice(1) : url.search.slice(1));
  }
  function write(href, state, popup) {
    const url = new URL(href);
    if (url.protocol === 'file:') url.hash = encode(state, popup);
    else url.search = encode(state, popup);
    return url.href;
  }
  return Object.freeze({ normalize, decode, encode, read, write });
})();
