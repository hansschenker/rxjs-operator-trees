# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — type-check (`tsc`) then `vite build`; `tsc` runs with `noEmit`, so it is purely a type gate
- `npm test` / `npx vitest run` — Vitest suites (model coverage, integrity, selector logic)
- `node scripts/generate-index.ts` — regenerate `docs/RxJS-Operator-Coordinate-Index.md` from the model (Node 24 runs `.ts` natively via type stripping — that is why `erasableSyntaxOnly` is set)
- `npm run preview` — serve the production build

`vitepress` is installed but unwired (no `.vitepress/` directory). This is not currently a git repository.

## What this project is

An interactive visualization of RxJS operator behavior as **Operator Trees**: each root behavior split into an INVARIANT branch (always true) and VARIANTS branch (independent axes × explicit variants). Framework-less TypeScript — plain DOM element creation via `src/app/dom.ts`; no React, no Vue.

Three layers, in dependency order:

1. **Docs** (`docs/`) — `RxJS-Operator-Behavior-Family-Trees-and-Policies.md` is the founding method document; `RxJS-Operator-Trees.md` is the full invariant/variant catalog; `RxJS-Recurring-Axes.md` explains the seven cross-family recurring axes (mirrored by `src/app/recurring.ts`); `RxJS-Operator-Coordinate-Index.md` is **generated — never edit by hand**.
2. **Model** (`src/model/`) — the trees as typed data: `types.ts`, one file per family group in `families/`, aggregated in `index.ts` with `EXCLUDED_EXPORTS`. `coverage.test.ts` asserts every runtime export of `rxjs`, `rxjs/operators`, `rxjs/ajax`, `rxjs/fetch`, `rxjs/webSocket` is mapped exactly once or deliberately excluded — this test is the definition of "all operators covered". When adding/changing mappings, run the tests, then regenerate the index doc.
3. **App** (`src/app/`) — `selector.ts` (pure matching logic, unit-tested), `render.ts` (family explorer, concrete-behavior selector, reverse lookup, recurring-axes view), `recurring.ts` (cross-family axis groups). Magenta theme (#C2185B) in `src/style.css`.

The founding docs define the conceptual frameworks:

1. **Family Trees** — classify behavior: Category → Root Behavior → Variant Axes → Variants → Concrete Behavior → RxJS API mapping. E.g. throttle = Duration policy {fixed, dynamic} × Edge policy {leading, trailing, leading+trailing} = 6 concrete behaviors.
2. **Policies** — specify one concrete behavior along 8 semantic dimensions: Source, Trigger, Value, Cardinality, Time, Concurrency, Cancellation, Termination.

It also fixes a temporal notation for timing operators (`v------` leading, `------v` trailing, `v------v` both, `---|---|---` periodic sampling, `v------→------v` delay) and the principle that visualizations should show the operator-control layer (timers, gates, windows) alongside emitted values — not just marbles.

When building features here, treat that document as the source of truth for terminology (root behavior, variant axis, variant, concrete behavior, policy profile) and for the tree structures themselves (throttle, window, buffer, audit, debounce, sample, delay are already fully specified in it).

## TypeScript constraints

`tsconfig.json` enables flags that fail the build in non-obvious ways:

- `erasableSyntaxOnly` — no enums, namespaces, or constructor parameter properties; only type-level syntax that can be stripped
- `verbatimModuleSyntax` — type-only imports must use `import type`
- `allowImportingTsExtensions` — imports use explicit `.ts` extensions (see `main.ts` importing `./counter.ts`)
- `noUnusedLocals` / `noUnusedParameters` — unused declarations are build errors
