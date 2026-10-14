'use strict';

// Owned popup entries carry their underlying entry ID across reloads. A direct
// link is always a base entry: closing it must never traverse unknown history.
globalThis.MotionHistory = (() => {
  function start(window, apply) {
    const history = window.history;
    const key = 'khodHistory';
    const app = new URL(window.location.href); app.search = ''; app.hash = '';
    const owner = app.href;
    let snapshot = MotionURL.read(window.location.href);
    let pendingClose = false;
    function metadata() {
      const value = history.state?.[key];
      return value?.version === 1 && value.owner === owner && typeof value.id === 'string' && (value.parent === null || typeof value.parent === 'string') ? value : null;
    }
    function fresh(parent = null) {
      return { version: 1, owner, id: window.crypto.randomUUID?.() || Array.from(window.crypto.getRandomValues(new Uint32Array(4)), value => value.toString(16)).join('-'), parent };
    }
    function replace(meta = metadata() || fresh()) {
      history.replaceState({ ...history.state, [key]: meta }, '', MotionURL.write(window.location.href, snapshot.state, snapshot.popup));
    }
    replace();
    function navigate() {
      pendingClose = false;
      snapshot = MotionURL.read(window.location.href);
      replace();
      apply(snapshot);
    }
    window.addEventListener('popstate', navigate);
    // Hash edits/navigation can fire both events. Canonical replacement and
    // idempotent presentation avoid pushes and duplicate dialog openings.
    window.addEventListener('hashchange', navigate);
    function update(state) {
      snapshot = { ...snapshot, state };
      replace();
    }
    function open(popup) {
      if (pendingClose) return;
      if (snapshot.popup) { snapshot = { ...snapshot, popup }; replace(); }
      else {
        const parent = metadata().id;
        snapshot = { ...snapshot, popup };
        history.pushState({ ...history.state, [key]: fresh(parent) }, '', MotionURL.write(window.location.href, snapshot.state, popup));
      }
      apply(snapshot);
    }
    function close() {
      if (!snapshot.popup || pendingClose) return;
      if (metadata()?.parent) { pendingClose = true; history.back(); }
      else { snapshot = { ...snapshot, popup: null }; replace(); apply(snapshot); }
    }
    return Object.freeze({ initial: snapshot, update, open, close });
  }
  return Object.freeze({ start });
})();
