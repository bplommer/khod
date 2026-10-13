# Khod

A dependency-free browser application for exploring Russian verbs of motion. Development sources are separate readable files; the release is one standalone HTML file. Both versions execute the same JavaScript.

## Run locally

Open `index.html` directly in your browser. No server, installation, build step or network connection is required. Ordered classic scripts allow direct `file://` execution.

Alternatively, open `dist/russian-motion-verbs.html`, the standalone release.

## Test and package

These development commands require Node.js 20 or later, with no npm packages:

```sh
node --test
node package.mjs
```

Packaging writes `dist/russian-motion-verbs.html`. An optional output path can be supplied:

```sh
node package.mjs /path/to/russian-motion-verbs.html
```

Packaging is optional for source execution. It embeds assets marked `data-inline` in `index.html`, in their existing order. It preserves formatting and does not transpile or minify. It rejects paths outside the source directory and embedded closing tags that would terminate a script/style block.

## Architecture

| File | Responsibility |
| --- | --- |
| `index.html` | Static page structure and ordered asset references |
| `styles.css` | Layout, responsive styles, dialogs and tooltips |
| `linguistic-data.js` | Base paradigms, bound stems, prefix meanings and usage metadata |
| `linguistic-core.js` | Pure prefix composition, semantic classification and inflection |
| `application-state.js` | Pure immutable state transitions and agreement constraints |
| `view-model.js` | Pure grid and conjugation-popup descriptions |
| `presentation.js` | DOM rendering, events, sticky controls, tooltip and native dialog |
| `bootstrap.js` | Start the browser adapter |
| `package.mjs` | Optional release generation |
| `tests/` | Permanent logic, model, adapter and packaging tests |

Each layer has one explicit namespace (`MotionData`, `MotionCore`, `MotionState`, `MotionViewModel`, `MotionUI`); implementation details live inside closures. Dependencies follow the script order in `index.html`. The first four layers have no browser dependencies and execute unchanged in Node's VM. Browser code does not implement agreement or inflection rules.

`MotionUI.start(document, window)` returns `dispatch(action)` and `getState()`. The running instance is exposed as `motionApp` for browser-console inspection.

## State and actions

State stores `prefix`, `outerPo`, `tense`, `pronoun`, `number`, `person`, and `gender`. Controls project this state instead of storing it. Public updates return a new object without mutating their input:

```js
const before = MotionState.initialState();
const after = MotionState.updateState(before, {
  type: 'pronoun',
  value: 'ty'
});
```

Action types match the state fields. Person uses `'1'`, `'2'`, `'3'`; other permitted values are in `MotionState.values`. `outerPo` takes a boolean.

Pronoun selection changes only agreement features needed by the tense. Past has no person inflection, so selecting я or ты preserves latent person until present/future requires it. Masculine/feminine past can retain я/ты; neuter uses оно. Infinitive retains latent agreement features. Gender controls appear only for singular past; third-person gender is also remembered for subject transitions.

`MotionViewModel.grid(state)` produces control visibility, column metadata and derived variants. `MotionViewModel.conjugation(state, familyId, direction)` produces the popup table. Infinitive uses present in that popup, including dashes for perfectives with no present tense.

## Extending the linguistic model

Each movement label and base paradigm is stored once. Prefixing uses them except where a family provides a changed bound stem or an explicit exception. Distributive по- composes with the inner form rather than storing copied paradigms.

- Surface forms and stress belong to paradigms or bound-stem exceptions.
- Prefix meaning and aspect behaviour belong to prefix descriptions.
- Distribution over movers versus moved objects belongs to the motion family.
- Grammatical gaps, semantic mismatch and usage frequency remain separate concepts.

The current stress rule applies to при-, у-, and по-. A prefix such as вы- needs a different stress policy. Productive/uncommon forms are compositional predictions, not a claim that every derived word is equally established. This refactor preserves the previous linguistic model rather than conducting a new linguistic audit.

## Tests and limits

`node --test` runs 25 named tests, including:

- Curated irregular/stress examples, tense/aspect rules, stem changes and distribution.
- Exhaustive paradigm-completeness checks.
- Immutable state transitions, minimal agreement changes and hidden-state retention.
- All 432 grid combinations and all 672 popup targets/tense combinations.
- DOM-adapter event handlers, dialog/tooltip behaviour and sticky-height thresholds.
- Exact source embedding, packaged/source model parity and packaging guards.
- A compact SHA-256 regression baseline covering pre-refactor derived variants.

The regression baseline proves compatibility, not linguistic correctness. Curated examples provide separate expected results. Update the baseline deliberately after checking an intentional model change, not merely to make a failing test pass.

The DOM fixture tests application behaviour but does not emulate CSS layout, native focus trapping or browser rendering. After presentation changes, check both source and packaged pages in a real browser:

1. Pronoun/tense changes retain agreement and hidden choices.
2. Cells open by click or Enter/Space; Escape/Close restore focus.
3. Info icons work by hover, focus and tap without opening the dialog.
4. Tables and tooltips remain usable at narrow widths and browser zoom.
5. Sticky controls respect the half-viewport limit after resizing and option changes.

The tests need no browser installation. Real-browser automation can be added later without changing the application's runtime or packaging architecture.
