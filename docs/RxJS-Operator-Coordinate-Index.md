# RxJS Operator Coordinate Index

**Generated from `src/model/` — do not edit by hand.**
Regenerate with `node scripts/generate-index.ts`.

Every runtime export of `rxjs`, `rxjs/operators`, `rxjs/ajax`, `rxjs/fetch`,
and `rxjs/webSocket` appears exactly once: either mapped onto Operator Tree
coordinates (see `RxJS-Operator-Trees.md`) or deliberately excluded.
A `{a \| b}` coordinate means the operator covers several variants of that
axis, chosen per call via arguments or config.

## Selection

### Selection

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `defaultIfEmpty` | current | empty: default | the empty-policy axis standalone |
| `distinct` | current | criterion: uniqueness, polarity: keep, anchor: everywhere, empty: silent | scope: entire history; optional key selector and flush notifier |
| `distinctUntilChanged` | current | criterion: uniqueness, polarity: keep, anchor: everywhere, empty: silent | scope: adjacent values only |
| `distinctUntilKeyChanged` | current | criterion: uniqueness, polarity: keep, anchor: everywhere, empty: silent | adjacent scope with a selected key |
| `elementAt` | current | criterion: position, polarity: keep, anchor: front, empty: {default \| error} |  |
| `filter` | current | criterion: predicate, polarity: keep, anchor: everywhere, empty: silent |  |
| `first` | current | criterion: {predicate \| position}, polarity: keep, anchor: front, empty: {default \| error} |  |
| `ignoreElements` | current | criterion: predicate, polarity: drop, anchor: everywhere | drops every value; only the terminal notification survives |
| `last` | current | criterion: {predicate \| position}, polarity: keep, anchor: back, empty: {default \| error} |  |
| `race` | current | — | selection over SOURCES: the first source to emit wins, the others are dropped |
| `raceWith` | current | — | operator form of race |
| `skip` | current | criterion: count, polarity: drop, anchor: front |  |
| `skipLast` | current | criterion: count, polarity: drop, anchor: back |  |
| `skipUntil` | current | criterion: notifier, polarity: drop, anchor: front |  |
| `skipWhile` | current | criterion: predicate, polarity: drop, anchor: front |  |
| `take` | current | criterion: count, polarity: keep, anchor: front, empty: silent |  |
| `takeLast` | current | criterion: count, polarity: keep, anchor: back, empty: silent |  |
| `takeUntil` | current | criterion: notifier, polarity: keep, anchor: front, empty: silent |  |
| `takeWhile` | current | criterion: predicate, polarity: keep, anchor: front, empty: silent | inclusive flag decides whether the boundary value belongs to the kept region |
| `throwIfEmpty` | current | empty: error | the empty-policy axis standalone |

## Transformation

### Transformation

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `map` | current | projection: computed |  |
| `timeInterval` | current | projection: time-metadata | map preset: v => ({ value: v, interval since previous }) |
| `timestamp` | current | projection: time-metadata | map preset: v => ({ value: v, timestamp }) |
| `mapTo` | deprecated → `map(() => value)` | projection: constant |  |
| `pluck` | deprecated → `map(v => v.key)` | projection: property-path |  |

## State

### Accumulation

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `count` | current | cadence: on-completion, seed: explicit, fn: counter |  |
| `max` | current | cadence: on-completion, seed: first-value, fn: comparator-keep |  |
| `min` | current | cadence: on-completion, seed: first-value, fn: comparator-keep |  |
| `reduce` | current | cadence: on-completion, seed: {explicit \| first-value}, fn: free | errors on an empty source without a seed |
| `scan` | current | cadence: every-transition, seed: {explicit \| first-value}, fn: free |  |
| `toArray` | current | cadence: on-completion, seed: explicit, fn: array-append |  |

## Grouping

### Grouping

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `buffer` | current | materialization: array, rule: boundary, trigger: notifier, determination: fixed, topology: contiguous |  |
| `bufferCount` | current | materialization: array, rule: boundary, trigger: count, determination: fixed, topology: {contiguous \| overlapping \| gapped} |  |
| `bufferTime` | current | materialization: array, rule: boundary, trigger: duration, determination: fixed, topology: {contiguous \| overlapping \| gapped} |  |
| `bufferToggle` | current | materialization: array, rule: boundary, trigger: notifier, determination: dynamic, topology: {contiguous \| overlapping \| gapped} | independent open and close boundaries |
| `bufferWhen` | current | materialization: array, rule: boundary, trigger: notifier, determination: dynamic, topology: contiguous |  |
| `groupBy` | current | materialization: inner-observable, rule: key, determination: dynamic | groups interleave instead of tiling the timeline; duration selector = dynamic group lifetime |
| `pairwise` | current | materialization: tuple, rule: boundary, trigger: count, determination: fixed, topology: overlapping | bufferCount(2, 1) materialized as a tuple |
| `partition` | current | materialization: split, rule: key | boolean key; returns exactly two Observables |
| `window` | current | materialization: inner-observable, rule: boundary, trigger: notifier, determination: fixed, topology: contiguous |  |
| `windowCount` | current | materialization: inner-observable, rule: boundary, trigger: count, determination: fixed, topology: {contiguous \| overlapping \| gapped} |  |
| `windowTime` | current | materialization: inner-observable, rule: boundary, trigger: duration, determination: fixed, topology: {contiguous \| overlapping \| gapped} |  |
| `windowToggle` | current | materialization: inner-observable, rule: boundary, trigger: notifier, determination: dynamic, topology: {contiguous \| overlapping \| gapped} |  |
| `windowWhen` | current | materialization: inner-observable, rule: boundary, trigger: notifier, determination: dynamic, topology: contiguous |  |

## Timing

### Throttle

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `throttle` | current | duration: dynamic, edge: {leading \| trailing \| both} |  |
| `throttleTime` | current | duration: fixed, edge: {leading \| trailing \| both} | default { leading: true, trailing: false } |

### Audit

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `audit` | current | duration: dynamic |  |
| `auditTime` | current | duration: fixed |  |

### Debounce

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `debounce` | current | duration: dynamic |  |
| `debounceTime` | current | duration: fixed |  |

### Sample

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `sample` | current | trigger: notifier |  |
| `sampleTime` | current | trigger: periodic |  |

### Delay

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `delay` | current | displacement: {relative \| absolute-date}, start: immediate |  |
| `delayWhen` | current | displacement: dynamic, start: {immediate \| notifier} | dynamic per-value delays may reorder the output |

## Flattening

### Flattening / Concurrency

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `concat` | current | overlap: queue, concurrency: limited, input: static-creation, state: stateless, recursion: none | concatAll over a fixed list of sources |
| `concatAll` | current | overlap: queue, concurrency: limited, input: higher-order, state: stateless, recursion: none |  |
| `concatMap` | current | overlap: queue, concurrency: limited, input: project, state: stateless, recursion: none |  |
| `concatWith` | current | overlap: queue, concurrency: limited, input: with-suffix, state: stateless, recursion: none |  |
| `exhaustAll` | current | overlap: drop-new, input: higher-order, state: stateless, recursion: none |  |
| `exhaustMap` | current | overlap: drop-new, input: project, state: stateless, recursion: none |  |
| `expand` | current | overlap: alongside, concurrency: {unbounded \| limited}, input: project, state: stateless, recursion: recursive |  |
| `merge` | current | overlap: alongside, concurrency: {unbounded \| limited}, input: static-creation, state: stateless, recursion: none | mergeAll over a fixed list of sources |
| `mergeAll` | current | overlap: alongside, concurrency: {unbounded \| limited}, input: higher-order, state: stateless, recursion: none |  |
| `mergeMap` | current | overlap: alongside, concurrency: {unbounded \| limited}, input: project, state: stateless, recursion: none |  |
| `mergeScan` | current | overlap: alongside, concurrency: {unbounded \| limited}, input: project, state: accumulating, recursion: none |  |
| `mergeWith` | current | overlap: alongside, concurrency: unbounded, input: with-suffix, state: stateless, recursion: none |  |
| `switchAll` | current | overlap: kill-previous, input: higher-order, state: stateless, recursion: none |  |
| `switchMap` | current | overlap: kill-previous, input: project, state: stateless, recursion: none |  |
| `switchScan` | current | overlap: kill-previous, input: project, state: accumulating, recursion: none |  |
| `concatMapTo` | deprecated → `concatMap(() => inner$)` | overlap: queue, concurrency: limited, input: project, state: stateless, recursion: none |  |
| `exhaust` | deprecated → `exhaustAll` | overlap: drop-new, input: higher-order, state: stateless, recursion: none |  |
| `flatMap` | deprecated → `mergeMap` | overlap: alongside, concurrency: {unbounded \| limited}, input: project, state: stateless, recursion: none |  |
| `mergeMapTo` | deprecated → `mergeMap(() => inner$)` | overlap: alongside, concurrency: {unbounded \| limited}, input: project, state: stateless, recursion: none |  |
| `switchMapTo` | deprecated → `switchMap(() => inner$)` | overlap: kill-previous, input: project, state: stateless, recursion: none |  |

## Combining

### Combining

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `combineLatest` | current | trigger: any-source, alignment: latest, input: static-creation |  |
| `combineLatestAll` | current | trigger: any-source, alignment: latest, input: higher-order |  |
| `combineLatestWith` | current | trigger: any-source, alignment: latest, input: with-suffix |  |
| `forkJoin` | current | trigger: completion, alignment: final, input: static-creation |  |
| `withLatestFrom` | current | trigger: primary, alignment: latest, input: operator |  |
| `zip` | current | trigger: full-tuple, alignment: indexed, input: static-creation |  |
| `zipAll` | current | trigger: full-tuple, alignment: indexed, input: higher-order |  |
| `zipWith` | current | trigger: full-tuple, alignment: indexed, input: with-suffix |  |
| `combineAll` | deprecated → `combineLatestAll` | trigger: any-source, alignment: latest, input: higher-order |  |

## Sharing

### Sharing

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `connect` | current | connector: {subject \| custom}, connection: manual | scoped multicast of the source inside one pipe |
| `connectable` | current | connector: {subject \| custom}, connection: manual |  |
| `share` | current | connector: {subject \| custom}, connection: auto, reset-refcount: {on \| off \| dynamic}, reset-complete: {on \| off \| dynamic}, reset-error: {on \| off \| dynamic} |  |
| `shareReplay` | current | connector: replay, connection: auto, reset-refcount: {on \| off}, reset-complete: off, reset-error: on | reset-refcount defaults to off unless { refCount: true } |
| `multicast` | deprecated → `share({ connector }) / connectable` | connector: custom, connection: manual |  |
| `publish` | deprecated → `share() / connectable` | connector: subject, connection: manual |  |
| `publishBehavior` | deprecated → `connectable with BehaviorSubject` | connector: custom, connection: manual |  |
| `publishLast` | deprecated → `connectable with AsyncSubject` | connector: custom, connection: manual |  |
| `publishReplay` | deprecated → `shareReplay` | connector: replay, connection: manual |  |
| `refCount` | deprecated → `share()` | connection: auto |  |

## Error / Repetition

### Resubscription

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `repeat` | current | trigger: complete, count: {infinite \| fixed}, delay: {none \| fixed \| dynamic} |  |
| `retry` | current | trigger: error, count: {infinite \| fixed}, delay: {none \| fixed \| dynamic}, counter-reset: {on \| off} |  |
| `repeatWhen` | deprecated → `repeat({ delay: count => notifier$ })` | trigger: complete, count: infinite, delay: dynamic |  |
| `retryWhen` | deprecated → `retry({ delay: (error, count) => notifier$ })` | trigger: error, count: infinite, delay: dynamic |  |

### Substitution

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `catchError` | current | trigger: error, replacement: {selected \| source-itself} |  |
| `onErrorResumeNext` | current | trigger: any-terminal, replacement: selected | exists as static creation function and as operator |
| `onErrorResumeNextWith` | current | trigger: any-terminal, replacement: selected |  |

## Creation

### Creation

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `ajax` | current | origin: resource | entry point rxjs/ajax |
| `animationFrames` | current | origin: clock |  |
| `bindCallback` | current | origin: callback |  |
| `bindNodeCallback` | current | origin: callback |  |
| `defer` | current | origin: lazy-factory |  |
| `EMPTY` | current | termination: complete |  |
| `from` | current | origin: collection, scheduling: {default \| explicit} |  |
| `fromEvent` | current | origin: event |  |
| `fromEventPattern` | current | origin: event |  |
| `fromFetch` | current | origin: resource | entry point rxjs/fetch |
| `generate` | current | origin: iteration, scheduling: {default \| explicit} |  |
| `iif` | current | origin: conditional |  |
| `interval` | current | origin: clock, scheduling: {default \| explicit} |  |
| `NEVER` | current | termination: never |  |
| `of` | current | origin: literal, scheduling: default |  |
| `range` | current | origin: iteration, scheduling: {default \| explicit} |  |
| `scheduled` | current | origin: collection, scheduling: explicit |  |
| `throwError` | current | termination: error |  |
| `timer` | current | origin: clock, scheduling: {default \| explicit} | timer(0, ms) is interval(ms) without the initial wait |
| `using` | current | origin: resource |  |
| `webSocket` | current | origin: resource | entry point rxjs/webSocket |
| `empty` | deprecated → `EMPTY` | termination: complete |  |
| `never` | deprecated → `NEVER` | termination: never |  |
| `pairs` | deprecated → `from(Object.entries(obj))` | origin: collection |  |

## Observation

### Side-effect

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `finalize` | current | hook: teardown | one hook unifying complete, error and unsubscribe |
| `tap` | current | hook: {values \| subscription} |  |

## Interrogation

### Interrogation

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `every` | current | question: all-match, answer: boolean |  |
| `find` | current | question: any-match, answer: value | differs from first(p) only in empty policy: undefined instead of error |
| `findIndex` | current | question: any-match, answer: index |  |
| `isEmpty` | current | question: is-empty, answer: boolean |  |
| `sequenceEqual` | current | question: sequence-equal, answer: boolean |  |
| `single` | current | question: single-match, answer: value | adds a cardinality assertion: errors on more than one match |

## Injection

### Injection

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `endWith` | current | edge: trailing | an errored source never reaches its trailing edge |
| `startWith` | current | edge: leading |  |

## Watchdog

### Watchdog

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `timeout` | current | scope: {first \| each}, deadline: {relative \| absolute-date}, breach: {error \| substitute} |  |
| `timeoutWith` | deprecated → `timeout({ with: () => fallback$ })` | scope: {first \| each}, deadline: {relative \| absolute-date}, breach: substitute |  |

## Reification

### Reification

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `dematerialize` | current | direction: lower |  |
| `materialize` | current | direction: lift |  |

## Scheduling (meta)

### Scheduling

| Operator | Status | Coordinates | Notes |
| --- | --- | --- | --- |
| `observeOn` | current | stage: emission |  |
| `subscribeOn` | current | stage: subscription |  |

## Excluded exports

| Export | Reason |
| --- | --- |
| `AjaxError` | error class |
| `AjaxResponse` | class / machinery, not an operator behavior |
| `AjaxTimeoutError` | error class |
| `animationFrame` | scheduler instance |
| `animationFrameScheduler` | scheduler instance |
| `ArgumentOutOfRangeError` | error class |
| `asap` | scheduler instance |
| `asapScheduler` | scheduler instance |
| `async` | scheduler instance |
| `asyncScheduler` | scheduler instance |
| `AsyncSubject` | class / machinery, not an operator behavior |
| `BehaviorSubject` | class / machinery, not an operator behavior |
| `config` | utility / consumption, not stream behavior |
| `ConnectableObservable` | class / machinery, not an operator behavior |
| `EmptyError` | error class |
| `firstValueFrom` | utility / consumption, not stream behavior |
| `identity` | utility / consumption, not stream behavior |
| `isObservable` | utility / consumption, not stream behavior |
| `lastValueFrom` | utility / consumption, not stream behavior |
| `noop` | utility / consumption, not stream behavior |
| `NotFoundError` | error class |
| `Notification` | class / machinery, not an operator behavior |
| `NotificationKind` | class / machinery, not an operator behavior |
| `ObjectUnsubscribedError` | error class |
| `observable` | utility / consumption, not stream behavior |
| `Observable` | class / machinery, not an operator behavior |
| `pipe` | utility / consumption, not stream behavior |
| `queue` | scheduler instance |
| `queueScheduler` | scheduler instance |
| `ReplaySubject` | class / machinery, not an operator behavior |
| `Scheduler` | class / machinery, not an operator behavior |
| `SequenceError` | error class |
| `Subject` | class / machinery, not an operator behavior |
| `Subscriber` | class / machinery, not an operator behavior |
| `Subscription` | class / machinery, not an operator behavior |
| `TimeoutError` | error class |
| `UnsubscriptionError` | error class |
| `VirtualAction` | class / machinery, not an operator behavior |
| `VirtualTimeScheduler` | class / machinery, not an operator behavior |
| `WebSocketSubject` | class / machinery, not an operator behavior |

## Totals

- Families: 21
- Mapped operators: 140 (120 current, 20 deprecated)
- Excluded exports: 40
