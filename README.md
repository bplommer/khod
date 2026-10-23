# Ход

A dependency-free browser application for exploring Russian verbs of motion. Development sources are separate readable files; an optional standalone HTML file can be generated locally. Both versions execute the same JavaScript.

## Run locally

Open `index.html` directly in your browser. No server, installation, build step or network connection is required. Ordered classic scripts allow direct `file://` execution.

To use a standalone version, run `node package.mjs` first, then open the generated `dist/russian-motion-verbs.html`. Generated releases are ignored by Git and are not committed.

## Test and package

These development commands require Node.js 20 or later, with no npm packages:

```sh
node --test
node package.mjs
```

Packaging writes `dist/russian-motion-verbs.html` into the ignored `dist/` directory. An optional output path can be supplied:

```sh
node package.mjs /path/to/russian-motion-verbs.html
```

Packaging is optional for source execution. It embeds assets marked `data-inline` in `index.html`, in their existing order. It preserves formatting and does not transpile or minify. It rejects paths outside the source directory and embedded closing tags that would terminate a script/style block.

## Enable the pre-push test hook

After cloning, enable the committed hooks for this checkout:

```sh
git config --local core.hooksPath .githooks
```

The pre-push hook runs `node --test` from the repository root and blocks the push if tests fail or Node.js is unavailable. It requires Node.js 20 or later and no npm packages. Each checkout needs this one-time configuration because Git does not enable committed hooks automatically.

## Architecture

| File | Responsibility |
| --- | --- |
| `index.html` | Static page structure and ordered asset references |
| `styles.css` | Layout, responsive styles, dialogs and tooltips |
| `linguistic-data.js` | Base paradigms, bound stems, prefix meanings and usage metadata |
| `linguistic-core.js` | Pure prefix composition, semantic classification and inflection |
| `application-state.js` | Pure immutable state transitions and agreement constraints |
| `view-model.js` | Pure grid and conjugation-popup descriptions |
| `url-state.js` | Pure, versioned URL encoding and validation |
| `browser-history.js` | Browser history ownership and navigation |
| `presentation.js` | DOM rendering, events, sticky controls, tooltip and native dialog |
| `bootstrap.js` | Start the browser adapter |
| `package.mjs` | Optional release generation |
| `tests/` | Permanent logic, model, adapter and packaging tests |

Each layer has one explicit namespace (`MotionData`, `MotionCore`, `MotionState`, `MotionViewModel`, `MotionUI`); implementation details live inside closures. Dependencies follow the script order in `index.html`. The first four layers have no browser dependencies and execute unchanged in Node's VM. Browser code does not implement agreement or inflection rules.

`MotionUI.start(document, window)` returns `dispatch(action)` and `getState()`. The running instance is exposed as `motionApp` for browser-console inspection.

## State and actions

State stores `prefix`, `tense`, `pronoun`, `number`, `person`, `gender`, and `showObjects`. Controls project this state instead of storing it. Public updates return a new object without mutating their input:

```js
const before = MotionState.initialState();
const after = MotionState.updateState(before, {
  type: 'pronoun',
  value: 'ty'
});
```

Action types match the state fields. Person uses `'1'`, `'2'`, `'3'`; other permitted values are in `MotionState.values`. Prefix choices are `none`, `pri`, `u`, and `po`; they are mutually exclusive.

Pronoun selection changes only agreement features needed by the tense. Past has no person inflection, so selecting я or ты preserves latent person until present/future requires it. All three past singular genders can retain я/ты. Infinitive retains latent agreement features. Gender controls appear only for singular past; third-person gender is also remembered for subject transitions.

`MotionViewModel.grid(state)` produces control visibility, column metadata and derived variants. `MotionViewModel.conjugation(state, familyId, direction)` produces the popup table. Infinitive uses present in that popup, including dashes for perfectives with no present tense.

## Extending the linguistic model

Each movement label and base paradigm is stored once. Prefixing uses them except where a family provides a changed bound stem or an explicit exception. The single по- prefix gives onset and limited-duration meanings; distributive combinations with other prefixes are not included.

- Surface forms and stress belong to paradigms or bound-stem exceptions.
- Prefix meaning and aspect behaviour belong to prefix descriptions.
- Grammatical gaps, semantic mismatch and usage frequency remain separate concepts.

The current stress rule applies to при-, у-, and по-. A prefix such as вы- needs a different stress policy. 

## Tests and limits

`node --test` runs the tests, including:

- Curated irregular/stress examples, tense/aspect rules, stem changes and both single-prefix по- meanings.
- Exhaustive paradigm-completeness checks.
- Immutable state transitions, minimal agreement changes and hidden-state retention.
- All 288 grid combinations and all 448 popup targets/tense combinations.
- DOM-adapter event handlers, dialog/tooltip behaviour and sticky-height thresholds.
- Exact source embedding, packaged/source model parity and packaging guards.
- A compact SHA-256 regression baseline covering the retained single-prefix variants.

The regression baseline proves compatibility, not linguistic correctness. Curated examples provide separate expected results. Update the baseline deliberately after checking an intentional model change, not merely to make a failing test pass.

The DOM fixture tests application behaviour but does not emulate CSS layout, native focus trapping or browser rendering. After presentation changes, check both source and packaged pages in a real browser:

1. Pronoun/tense changes retain agreement and hidden choices.
2. Cells open by click or Enter/Space; Escape/Close restore focus.
3. Info icons work by hover, focus and tap without opening the dialog.
4. Tables and tooltips remain usable at narrow widths and browser zoom.
5. Sticky controls respect the half-viewport limit after resizing and option changes.

The tests need no browser installation. Real-browser automation can be added later without changing the application's runtime or packaging architecture.

## Shareable URLs and navigation

Every selection is recorded in the URL, including hidden agreement features and
whether object pronouns are shown. Transient tooltip, focus and scroll state are
not recorded. HTTP/HTTPS pages use query parameters; directly opened `file://`
pages use fragment parameters, so both source and standalone pages work from disk.

```text
?v=1&tense=past&prefix=pri&pronoun=ona&person=2&number=singular&gender=feminine&showObjects=false&popup=walk&direction=uni
#v=1&tense=past&prefix=pri&pronoun=ona&person=2&number=singular&gender=feminine&showObjects=false&popup=walk&direction=uni
```

Parameters are emitted in the order shown. `v=1` is the schema version.
`tense`, `prefix`, `pronoun`, `person`, `number` and `gender` use the values in
`MotionState.values`; `showObjects` is `true` or `false`. Optional `popup` is a
family ID from `MotionData.motionFamilies`, and `direction` is `uni` or `multi`.
Both popup parameters must be valid to open a dialog. Missing or invalid fields
fall back to defaults individually; subject agreement is then reconciled using
the same rules as controls. Hidden values are retained wherever agreement allows.
Unknown fields are ignored, duplicate fields use the first value, and an
unsupported version restores defaults. A missing version is accepted as version 1.
Startup and navigation canonicalize the URL with validated values.

Control changes replace the current history entry without loading the page or
adding Back steps. Opening a popup pushes one entry. Back closes it and Forward
reopens it; Close, Escape and backdrop dismissal return to its underlying entry.
A directly opened popup link closes by replacing its entry, keeping you in Khod.
Entry ownership and popup-parent IDs are stored in `history.state`, surviving
reloads. URL state alone never implies ownership of the preceding entry. Copied
links therefore have direct-link behaviour, even if copied from an owned popup.
HTTP URLs retain unrelated fragments; file URLs retain unrelated query strings.
The active state parameter section is canonicalized rather than retaining unknown
parameters. No server routes, runtime dependencies or mandatory build are needed.

The URL tests exhaustively round-trip agreement selections, check malformed and
partial inputs, both URL modes, owned/direct popup entries and ownership after
reload. History tests use a deterministic adapter; they do not substitute for
native browser verification. Check Back/Forward, Escape, backdrop dismissal and
focus after reloading both source and packaged pages in each target browser.

Verification for this change: all 40 Node tests and standalone packaging passed.
Native browser automation was attempted with a separate headless Chrome profile,
but Chrome aborted during startup in the execution environment. Native history,
Escape handling and focus trapping therefore remain unverified in Chrome/Safari.
