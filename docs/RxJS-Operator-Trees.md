# RxJS Operator Trees: Invariant and Variant Behavior

## A systematic catalog of RxJS root behaviors

This document applies the Family Tree method (see
`RxJS-Operator-Behavior-Family-Trees-and-Policies.md`) to the whole operator
surface, with one refinement: **every tree has exactly two top branches.**

```text
ROOT BEHAVIOR
│
├── INVARIANT      ← what every member of the family always does
│   └── ...
│
└── VARIANTS       ← independent axes; each axis offers explicit variants
    ├── 1. Axis
    │   ├── variant
    │   └── variant
    └── 2. Axis
        └── ...
```

Reading rules:

1. The **INVARIANT** branch is the identity of the family. If a behavior does
   not satisfy every invariant line, it does not belong to this family.
2. Each **VARIANT axis** is an independent behavioral dimension. A concrete
   behavior picks exactly one variant per axis:

   ```text
   Concrete Behavior = INVARIANT + (one variant per axis)
   ```

3. The official RxJS operator names are **mappings** onto those coordinates,
   listed after each tree. Empty coordinates are holes in the API surface.
4. Temporal glyphs follow the established notation:

   ```text
   v------      leading        emit, then window
   ------v      trailing       window, then emit
   v------v     both edges
   ---|---|     periodic       independent clock decides
   v---→---v    displacement   same value, delivered later
   ```

The catalog covers fifteen root behaviors:

```text
 1. Selection          (sibling: Source Selection — race, iif)
 2. Transformation
 3. Accumulation (State)
 4. Grouping
 5. Rate-Limiting & Timing   (throttle, audit, sample | debounce, delay)
 6. Flattening / Concurrency
 7. Combining
 8. Sharing
 9. Resubscription    (retry, repeat; sibling: Substitution / catchError)
10. Creation
11. Side-effect       (tap, finalize)
12. Interrogation     (every, find, isEmpty, ...)
13. Injection         (startWith, endWith)
14. Watchdog          (timeout)
15. Reification       (materialize, dematerialize)
```

Together with the placement rules in §16 these trees give coordinates to every
RxJS v7 export; `RxJS-Operator-Coordinate-Index.md` lists the full mapping.

---

# 1. Selection

```text
SELECTION
│
├── INVARIANT
│   ├── every output value is a source value, passed through unchanged
│   ├── relative source order is preserved
│   ├── the output sequence is a sub-sequence of the input sequence
│   └── the operator never creates values
│
└── VARIANTS
    │
    ├── 1. Criterion — what decides whether a value survives
    │   ├── count
    │   ├── predicate
    │   ├── uniqueness
    │   ├── index / position
    │   └── external notifier
    │
    ├── 2. Polarity — keep or drop what the criterion selects
    │   ├── keep
    │   └── drop
    │
    ├── 3. Anchor — where in the sequence the criterion applies
    │   ├── front        (leading region)
    │   ├── back         (trailing region)
    │   └── everywhere
    │
    └── 4. Empty policy — what happens when nothing was selected
        ├── complete silently
        ├── emit a default value
        └── error
```

## API mapping

```text
take(n)                    count      × keep × front        complete silently
takeLast(n)                count      × keep × back         complete silently
skip(n)                    count      × drop × front
skipLast(n)                count      × drop × back
filter(p)                  predicate  × keep × everywhere
takeWhile(p, inclusive?)   predicate  × keep × front
skipWhile(p)               predicate  × drop × front
takeUntil(stop$)           notifier   × keep × front
skipUntil(start$)          notifier   × drop × front
distinct(key?, flush$?)    uniqueness × keep × everywhere
distinctUntilChanged(...)  uniqueness × keep × everywhere
first(p?, default?)        predicate/position × keep × front   default | error
last(p?, default?)         predicate/position × keep × back    default | error
elementAt(i, default?)     index × keep                        default | error
```

## Sub-axes of uniqueness

```text
uniqueness
├── comparison scope
│   ├── entire history        distinct
│   └── adjacent values only  distinctUntilChanged
├── compared key
│   ├── the value itself
│   └── selected key          keySelector / distinctUntilKeyChanged
└── memory reset
    ├── never
    └── on notifier           distinct(key, flush$)
```

## What the tree explains

- **`first()` vs `take(1)`** differ in exactly one coordinate: the empty
  policy (`error` vs `complete silently`). Selection is identical.
- **Back-anchored variants must buffer until completion.** `takeLast`,
  `skipLast`, and `last` cannot emit before the source completes — a direct
  consequence of the `back` anchor, not an implementation quirk.
- **Front-anchored keep variants complete early.** Once `take(n)` or
  `first()` has what it needs, nothing further can be selected, so the
  output completes and the source is unsubscribed.
- `takeWhile`'s `inclusive` flag is a boundary policy: does the value that
  fails the predicate still belong to the selected region?

## Sibling root: source selection

`race` shares Selection's geometry but operates one level up — it keeps one
**source** and drops the rest, rather than keeping some values:

```text
SOURCE SELECTION
│
├── INVARIANT
│   ├── competes several whole sources; exactly one source survives
│   ├── the winner's values pass through unchanged
│   └── losing sources are unsubscribed, or never subscribed at all
│
└── VARIANTS
    ├── 1. Decision — what picks the winning source
    │   ├── first notification wins    race(a$, b$) / raceWith(b$)
    │   └── condition at subscribe     iif(() => cond, then$, else$)
    │
    └── 2. Input form
        ├── static creation            race(...), iif(...)
        └── *With operator suffix      raceWith(...)
```

What this tree explains:

- In `race`, the first notification of **any** kind wins — a source that
  errors before anyone emits errors the race; an early completion completes
  it. "First to emit a value" is a common misreading.
- **`iif` is reclassified here, out of Creation.** Its values come from the
  two given source Observables, which fails the Creation invariant ("values
  originate from non-observable material"). Behaviorally it is source
  selection whose decision is made by a predicate at subscribe time instead
  of by the sources themselves.
- `condition × *With` is a hole: there is no `iifWith`. Compose it with
  `defer` when needed.

---

# 2. Transformation

```text
TRANSFORMATION
│
├── INVARIANT
│   ├── exactly one output value per source value (1:1 cardinality)
│   ├── output timing equals source timing
│   └── each output is a pure projection of (value, index)
│
└── VARIANTS
    └── 1. Projection target
        ├── computed value        map(project)
        ├── constant              map(() => c)      (mapTo — deprecated)
        └── property path         map(v => v.k)     (pluck — deprecated)
```

## What the tree explains

- `map` is **almost pure invariant**: the family's entire behavior is fixed;
  the only variant is the projection function itself. This is why `map`
  feels so simple — it has no hidden policies.
- **`expand` does not belong here.** Although often listed under
  transformation, `expand` feeds its output back as input and subscribes to
  inner Observables — it satisfies the Flattening invariant, not this one.
  See §6. The tree method reclassifies it.

---

# 3. Accumulation (State)

```text
ACCUMULATION
│
├── INVARIANT
│   ├── holds an accumulator for the lifetime of the subscription
│   ├── every source value causes a transition  acc = f(acc, value, index)
│   └── outputs derive from the accumulator
│
└── VARIANTS
    ├── 1. Emission cadence
    │   ├── every transition       scan
    │   └── only at completion     reduce
    │
    ├── 2. Seed
    │   ├── explicit seed value
    │   └── first source value acts as seed
    │
    └── 3. Accumulation function
        ├── free                   scan(f) / reduce(f)
        └── preset
            ├── append to array    toArray
            ├── counter            count
            └── comparator keep    max / min
```

## What the tree explains

- **`reduce` = `scan` + `last`.** The cadence axis is the only difference;
  composition makes it literal.
- `toArray()` = `reduce((acc, v) => [...acc, v], [])` — a preset, not a new
  behavior.
- `reduce` on an empty source **without a seed** errors — the same empty
  policy dimension that separates `first()` from `take(1)` in Selection.

---

# 4. Grouping

```text
GROUPING
│
├── INVARIANT
│   ├── every source value is routed into one or more groups, unchanged
│   ├── the output emits the groups themselves
│   └── a partition rule decides group membership
│
└── VARIANTS
    ├── 1. Materialization
    │   ├── array                buffer family     Observable<T[]>
    │   └── inner Observable     window family     Observable<Observable<T>>
    │
    ├── 2. Partition rule
    │   ├── temporal boundaries  buffer* / window*
    │   └── value key            groupBy
    │
    ├── 3. Boundary trigger              (boundary-partitioned only)
    │   ├── count
    │   ├── duration
    │   └── notifier
    │
    ├── 4. Boundary determination
    │   ├── fixed / external
    │   └── dynamic / selected
    │
    └── 5. Topology
        ├── contiguous
        ├── overlapping
        └── gapped
```

## API mapping (buffer side; `window*` mirrors 1:1)

```text
bufferCount(n)                count    × fixed    × contiguous
bufferCount(n, m), m < n      count    × fixed    × overlapping
bufferCount(n, m), m > n      count    × fixed    × gapped
bufferTime(span)              duration × fixed    × contiguous
bufferTime(span, i), i < span duration × fixed    × overlapping
bufferTime(span, i), i > span duration × fixed    × gapped
buffer(boundary$)             notifier × external × contiguous
bufferWhen(closingSelector)   notifier × dynamic  × contiguous
bufferToggle(open$, closeSel) notifier × dynamic  × overlapping | gapped
```

## Key-partitioned grouping

```text
groupBy(keySelector, options)
├── key            always dynamic/selected (the keySelector)
├── group value    identity | element selector
├── group lifetime duration selector  → dynamic close, group may reopen
└── connector      subject factory    → overlaps the Sharing axes (§8)
```

## What the tree explains

- The **second argument of `bufferCount`/`bufferTime` is the topology axis
  in disguise**: comparing it to the first argument yields contiguous,
  overlapping, or gapped. The tree makes a numeric relationship into a
  named behavioral choice.
- `bufferToggle` is the only boundary variant with **independent open and
  close boundaries**, which is exactly why it alone reaches the
  overlapping and gapped topologies with notifiers.
- `groupBy` shares the invariant but swaps the partition rule: membership
  by **key**, not by **time region** — so its groups interleave instead of
  tiling the timeline.

---

# 5. Rate-Limiting and Timing

The five temporal sub-roots split into two categories by one test —
**what happens under sustained fire-hose input?**

```text
RATE-LIMITING — bounded output under sustained input
│
├── INVARIANT
│   ├── values are never transformed
│   └── the output rate is bounded: at most one emission per
│       window / period, no matter how fast the source fires
│
└── SUB-ROOTS
    ├── throttle     suppression window, edge choice        → steady drip
    ├── audit        non-restarting window, trailing emit   → steady drip
    └── sample       independent trigger takes snapshots    → steady drip


TIMING — temporal placement, no bounded cadence
│
├── INVARIANT
│   ├── values are never transformed
│   └── a temporal policy decides WHEN delivery happens
│
└── SUB-ROOTS
    ├── debounce     restarting silence, trailing emit      → silence until quiescence
    └── delay        pure temporal displacement             → fire-hose, shifted
```

Under a fire-hose, the rate limiters emit a steady bounded drip; `debounce`
emits **nothing** until the input pauses; `delay` reproduces the fire-hose
later. That behavioral difference — not the shared `...Time` suffix — is
the category boundary.

## The lossless rate limiters live in Grouping (§4)

`bufferTime(t)` / `windowTime(t)` emit at the same bounded cadence as the
lossy limiters, but batch every value instead of picking one:

```text
auditTime(t)  ≈  bufferTime(t) + last value of each batch

lossy     rate-limiting    throttle / audit / sample    keep one, drop the rest
lossless  rate-limiting    bufferTime / windowTime      keep all, in batches
```

They stay in the Grouping family because they share its full coordinate
system with the key-partitioned members (`groupBy`, `partition`), which are
not rate limiters at all.

## 5.1 Throttle

```text
THROTTLE
│
├── INVARIANT
│   ├── a source value opens a throttle window
│   ├── during the window further source values are suppressed
│   └── the window does not restart on suppressed values
│
└── VARIANTS
    ├── 1. Duration
    │   ├── fixed        throttleTime(ms)
    │   └── dynamic      throttle(v => duration$)
    └── 2. Edge
        ├── leading             v------
        ├── trailing            ------v
        └── leading + trailing  v------v
```

```text
2 durations × 3 edges = 6 concrete throttle behaviors
default: { leading: true, trailing: false }
```

## 5.2 Audit

```text
AUDIT
│
├── INVARIANT
│   ├── a source value opens a non-restarting window
│   ├── the latest value during the window is remembered
│   └── that latest value emits when the window closes    ------v
│
└── VARIANTS
    └── 1. Duration
        ├── fixed        auditTime(ms)
        └── dynamic      audit(v => duration$)
```

## 5.3 Sample

```text
SAMPLE
│
├── INVARIANT
│   ├── a trigger, independent of source values, requests a snapshot
│   ├── the snapshot is the latest NEW source value
│   └── no new value since the last trigger → no emission
│
└── VARIANTS
    └── 1. Trigger
        ├── periodic clock       sampleTime(period)    ---|---|---
        └── external notifier    sample(notifier$)
```

## 5.4 Debounce

```text
DEBOUNCE
│
├── INVARIANT
│   ├── every source value starts a silence timer
│   ├── the next value restarts the timer and replaces the pending value
│   └── the pending value emits after uninterrupted silence    ------v
│
└── VARIANTS
    └── 1. Silence duration
        ├── fixed        debounceTime(ms)
        └── dynamic      debounce(v => duration$)
```

## 5.5 Delay

```text
DELAY
│
├── INVARIANT
│   ├── every value survives — nothing competes, nothing is dropped
│   └── delivery is displaced later in time    v------→------v
│
└── VARIANTS
    ├── 1. Displacement
    │   ├── fixed relative duration     delay(ms)
    │   ├── fixed absolute date         delay(date)
    │   └── dynamic per value           delayWhen(v => duration$)
    └── 2. Subscription start
        ├── immediate
        └── after notifier              (subscriptionDelay — deprecated)
```

## The five temporal families side by side

```text
              category        window restarts?  who triggers?     what survives?    glyph
throttle      rate-limiting   no                source value      edge-dependent    v--- / ---v / v---v
audit         rate-limiting   no                source value      latest, at close  ------v
sample        rate-limiting   (no window)       independent       latest new        ---|---|---
                                                clock/notifier                         v   v
debounce      timing          yes               source value      latest, after     ------v
                                                                  full silence
delay         timing          (no window)       source value      everything        v---→---v
```

The invariant branch is what distinguishes them; the variant branches are
nearly identical (`fixed` vs `dynamic` duration everywhere). **The temporal
families differ by invariant, not by variant.**

---

# 6. Flattening / Concurrency

```text
FLATTENING
│
├── INVARIANT
│   ├── each source value maps to an inner Observable
│   ├── output values are inner values, unchanged
│   └── the operator manages the lifetime of inner subscriptions
│
└── VARIANTS
    ├── 1. Overlap policy — a new inner arrives while another is live
    │   ├── run alongside        merge
    │   ├── queue until a slot   concat      (= concurrency limit 1)
    │   ├── kill the previous    switch
    │   └── drop the newcomer    exhaust
    │
    ├── 2. Concurrency limit               (alongside/queue only)
    │   ├── unbounded            mergeMap(f)
    │   └── n slots              mergeMap(f, n)
    │
    ├── 3. Input form
    │   ├── project, then flatten    *Map    mergeMap concatMap switchMap exhaustMap
    │   └── source is higher-order   *All    mergeAll concatAll switchAll exhaustAll
    │
    ├── 4. State across inners
    │   ├── stateless            *Map / *All
    │   └── accumulating         mergeScan / switchScan
    │
    └── 5. Recursion
        └── output re-enters as input      expand(f, concurrency?)
```

## The 4 × 2 grid

```text
              project + flatten    higher-order source
alongside     mergeMap             mergeAll
queued        concatMap            concatAll
kill prev     switchMap            switchAll
drop new      exhaustMap           exhaustAll
```

## What the tree explains

- The four overlap policies answer **one question**: what happens to a new
  inner Observable while a previous inner is still live —
  *alongside, queued, replaces, or dropped*.
- **`concatMap(f)` ≡ `mergeMap(f, 1)`**: queueing is not a separate root
  behavior, it is the alongside policy with a concurrency limit of one.
  The tree collapses two names into one coordinate.
- `expand` is `mergeMap` plus the recursion variant: every output is also
  projected again. Its optional second argument is the same concurrency
  limit axis.
- Cancellation lives here: `switch` is the only policy that **unsubscribes
  a live inner**; `exhaust` is the only one that **never subscribes** to a
  value's inner at all.

---

# 7. Combining

```text
COMBINING
│
├── INVARIANT
│   ├── subscribes to several sources at once
│   ├── each output combines one value per source (one slot per source)
│   └── source values fill slots unchanged
│
└── VARIANTS
    ├── 1. Emission trigger — which event fires an output
    │   ├── any source emits             combineLatest
    │   ├── only the primary emits       withLatestFrom
    │   ├── a full tuple is available    zip
    │   └── all sources complete         forkJoin
    │
    └── 2. Slot alignment — which value fills each slot
        ├── latest snapshot              combineLatest / withLatestFrom
        ├── index-aligned queue          zip
        └── final value                  forkJoin
```

## Coordinates

```text
combineLatest   any source  × latest snapshot
withLatestFrom  primary     × latest snapshot
zip             full tuple  × index-aligned
forkJoin        completion  × final value
```

## What the tree explains

- **`withLatestFrom` is `combineLatest` with a demoted trigger**: the same
  latest-snapshot alignment, but only one source may fire an emission. One
  coordinate difference, not a different concept.
- `zip`'s index alignment forces **unbounded buffering** of the faster
  source — visible from the coordinate, independent of implementation.
- `forkJoin` is the completion corner of the space: trigger and alignment
  both degenerate to "the end".
- **`race` does not belong here.** It emits the winning source's values
  unchanged and drops the other sources entirely — one slot total, not one
  slot per source. It is *Selection applied to sources*, not combination;
  its tree lives in §1 (Source Selection).

---

# 8. Sharing

```text
SHARING
│
├── INVARIANT
│   ├── at most one live subscription to the source at a time
│   ├── values are multiplexed unchanged to every subscriber
│   └── a subject-like connector sits between source and subscribers
│
└── VARIANTS
    ├── 1. Connector / replay
    │   ├── none                Subject           share()
    │   ├── latest N            ReplaySubject     shareReplay(n)
    │   └── custom              share({ connector: () => subject })
    │
    ├── 2. Connection
    │   ├── on first subscriber     share / refCount
    │   └── manual                  connectable(source) + .connect()
    │
    └── 3. Reset policies — each: on | off | dynamic
        ├── resetOnRefCountZero    true | false | () => notifier$
        ├── resetOnComplete        true | false | () => notifier$
        └── resetOnError           true | false | () => notifier$
```

## What the tree explains

- `shareReplay(n)` is not a distinct behavior: it is `share` with a
  `ReplaySubject(n)` connector and specific reset defaults
  (`resetOnError: true`, `resetOnComplete: false`,
  `resetOnRefCountZero: false` unless `refCount: true`).
- The dynamic reset variant enables **grace periods**:
  `resetOnRefCountZero: () => timer(1000)` keeps the source alive for one
  second after the last subscriber leaves — the recurring fixed/dynamic
  axis applied to teardown instead of to values.
- The classic `shareReplay` "source never unsubscribes" pitfall is simply
  the coordinate `resetOnRefCountZero: false` made visible.

---

# 9. Resubscription (Error / Repetition)

```text
RESUBSCRIPTION
│
├── INVARIANT
│   ├── reacts to a terminal notification from the source
│   ├── may subscribe to the SAME source again
│   └── values before the terminal pass through unchanged
│
└── VARIANTS
    ├── 1. Terminal trigger
    │   ├── error        retry
    │   └── complete     repeat
    │
    ├── 2. Count
    │   ├── infinite               retry() / repeat()
    │   └── fixed n                retry(n) / repeat(n)
    │
    ├── 3. Delay before resubscribing
    │   ├── none
    │   ├── fixed                  { delay: ms }
    │   └── dynamic                { delay: (error, count) => notifier$ }
    │
    └── 4. Counter reset                    (retry only)
        └── resetOnSuccess    true | false
```

## Sibling root: substitution

`catchError` shares the trigger but not the invariant — it **replaces** the
source with a different Observable instead of resubscribing to the same one:

```text
SUBSTITUTION
│
├── INVARIANT
│   ├── reacts to an error from the source
│   └── continues with a REPLACEMENT Observable
│
└── VARIANTS
    └── 1. Replacement
        ├── selected from the error      catchError((err, caught$) => fallback$)
        └── retry-equivalent             catchError((_, caught$) => caught$)
```

The escape hatch `caught$` shows the family boundary precisely:
resubscription is substitution where the replacement is the source itself.

---

# 10. Creation

```text
CREATION
│
├── INVARIANT
│   ├── there is no upstream source Observable
│   ├── values originate from non-observable material
│   └── nothing happens until subscribe (one execution per subscriber)
│
└── VARIANTS
    ├── 1. Origin
    │   ├── literal values        of(a, b, c)
    │   ├── existing collection   from(iterable | promise | observable-like)
    │   ├── iteration             range(start, count), generate(...)
    │   ├── clock                 interval(ms), timer(due, period?), animationFrames()
    │   ├── event binding         fromEvent(target, name), fromEventPattern(add, remove)
    │   ├── lazy factory          defer(() => source)
    │   └── external resource     ajax(...), fromFetch(...), webSocket(...), using(...)
    │
    ├── 2. Termination preset — origins with zero values
    │   ├── complete immediately  EMPTY
    │   ├── never terminate       NEVER
    │   └── error immediately     throwError(() => err)
    │
    └── 3. Scheduling
        ├── default (synchronous where possible)
        └── explicit scheduler    scheduled(input, scheduler)
```

## What the tree explains

- **`defer` is the determination axis applied to creation itself**: any fixed
  origin becomes dynamic/selected-per-subscriber by wrapping it in a factory.
- **`iif` does not belong here.** Its values come from the two given source
  Observables, failing this family's invariant — it is source selection
  decided at subscribe time (§1, Source Selection).
- `timer(due, period)` unifies two origins: a one-shot deadline that hands over
  to a clock — which is why `timer(0, ms)` is `interval(ms)` without the
  initial wait.
- `EMPTY`, `NEVER`, and `throwError` are not special operators; they are the
  three degenerate corners of the origin axis where only the terminal
  notification remains.

---

# 11. Side-effect (Observation)

```text
SIDE-EFFECT
│
├── INVARIANT
│   ├── values pass through unchanged
│   ├── timing passes through unchanged
│   └── the operator only observes — it never influences the stream
│
└── VARIANTS
    └── 1. Lifecycle hook
        ├── next / error / complete    tap(fn) / tap({ next, error, complete })
        ├── subscribe / unsubscribe    tap({ subscribe, unsubscribe })
        └── teardown, any reason       finalize(fn)
```

## What the tree explains

- This is the only family whose **entire dataflow behavior is invariant** —
  the variants merely choose *where to look*, never *what happens*.
- `finalize` is `tap` for the end of the subscription regardless of how it
  ended (complete, error, or unsubscribe) — one hook that unifies three exits.

---

# 12. Interrogation (Verdict)

```text
INTERROGATION
│
├── INVARIANT
│   ├── consumes the sequence to answer a single question
│   ├── emits exactly one answer, then completes
│   └── answers as early as logically possible
│
└── VARIANTS
    ├── 1. Question
    │   ├── do ALL values match?       every(p)
    │   ├── does ANY value match?      find(p) / findIndex(p)
    │   ├── is the sequence empty?     isEmpty()
    │   ├── equal to another one?      sequenceEqual(other$)
    │   └── exactly one match?         single(p?)
    │
    └── 2. Answer content
        ├── boolean                    every, isEmpty, sequenceEqual
        ├── the matching value         find, single
        └── the matching index         findIndex
```

## What the tree explains

- The **decision point is not an axis — it is derived from the question's
  logic**: universal claims (`every`, `isEmpty`, `sequenceEqual`) can only be
  *confirmed* at completion but *refuted* by the earliest counterexample;
  existential claims (`find`) confirm at the first match. Like audit's
  trailing edge, earliness is a consequence, not a choice.
- `find(p)` and `first(p)` differ only in empty policy: `find` emits
  `undefined`, `first` errors — the same single-coordinate difference as
  `first()` vs `take(1)` in Selection (§1).
- `single` adds a **cardinality assertion**: it errors when more than one
  value matches, which no Selection operator does.

---

# 13. Injection

```text
INJECTION
│
├── INVARIANT
│   ├── all source values pass through unchanged
│   └── extra given values are inserted at a sequence edge
│
└── VARIANTS
    └── 1. Edge
        ├── leading     startWith(a, b, ...)   before the source's values
        └── trailing    endWith(a, b, ...)     after the source completes
```

## What the tree explains

- The recurring **edge axis** (§17) applied to inserting rather than
  selecting: `startWith`/`endWith` are to injection what `take`/`takeLast`
  are to selection.
- `endWith` values emit only on *completion* — an errored source never
  reaches its trailing edge.

---

# 14. Watchdog

```text
WATCHDOG
│
├── INVARIANT
│   ├── values pass through unchanged while the deadline is met
│   └── a temporal deadline is armed at subscribe and after values
│
└── VARIANTS
    ├── 1. Scope
    │   ├── first value only     timeout({ first })
    │   └── every value          timeout({ each })
    │
    ├── 2. Deadline
    │   ├── relative duration    timeout(ms) / { first: ms, each: ms }
    │   └── absolute date        timeout(date) / { first: date }
    │
    └── 3. On breach
        ├── error                TimeoutError            (default)
        └── substitute           timeout({ with: () => fallback$ })
                                 (legacy: timeoutWith)
```

## What the tree explains

- The `with` variant connects Watchdog to **Substitution** (§9): breaching a
  deadline substitutes a replacement Observable — `timeout({ with })` is
  `catchError` for time instead of for errors.
- Scope `first` vs `each` is the front/everywhere **anchor axis** from
  Selection reappearing on the time dimension.

---

# 15. Reification

```text
REIFICATION
│
├── INVARIANT
│   └── moves the stream between the value channel and the
│       notification channel — no information is added or lost
│
└── VARIANTS
    └── 1. Direction
        ├── lift      materialize()     next/error/complete → Notification values
        └── lower     dematerialize()   Notification values → next/error/complete
```

## What the tree explains

- After `materialize()`, errors and completions are ordinary values — every
  other family (Selection, Grouping, Accumulation, ...) can then operate on
  them. Reification is the escape hatch that makes terminals first-class.

---

# 16. Placements into existing trees

Operators that need **no new family** — the trees above already contain their
coordinates:

```text
pairwise            Grouping      bufferCount(2, 1) materialized as a tuple
partition           Grouping      key-partitioned with a boolean key,
                                  materialized as exactly two Observables
ignoreElements      Selection     keep nothing (predicate false × everywhere);
                                  only the terminal notification survives
timestamp           Transformation  map preset: v => { value: v, timestamp }
timeInterval        Transformation  map preset: v => { value: v, interval }
toArray/count/      Accumulation  presets of the accumulation-function axis (§3)
max/min
defaultIfEmpty(d)   Selection     the empty-policy axis (§1) standalone: default
throwIfEmpty(f)     Selection     the empty-policy axis standalone: error
onErrorResumeNext   Substitution  substitute on ANY terminal, swallowing errors
observeOn /         meta-axis     execution-context scheduling; orthogonal to
subscribeOn                       every family (the Policies "Time" dimension)
```

## The input-form axis for multi-source behavior

Join creation functions, `*With` operators, and `*All` operators are the same
coordinates reached through different **input forms** — the axis already seen
in Flattening (§6, `*Map` vs `*All`):

```text
                static creation        operator suffix        higher-order
merge           merge(a$, b$)          mergeWith(b$)          mergeAll()
concat          concat(a$, b$)         concatWith(b$)         concatAll()
zip             zip(a$, b$)            zipWith(b$)            zipAll()
combineLatest   combineLatest([...])   combineLatestWith(b$)  combineLatestAll()
race            race(a$, b$)           raceWith(b$)           —
forkJoin        forkJoin([...])        —                      —
```

The empty cells are again API-surface holes the table makes visible.

---

# 17. Recurring variant axes

The strongest result of the catalog: **a small set of axes recurs across
unrelated families.** Learning the axes once explains dozens of operators.

## Determination — { fixed, dynamic/selected }

```text
throttle duration      throttleTime(ms)     throttle(v => d$)
audit duration         auditTime(ms)        audit(v => d$)
debounce silence       debounceTime(ms)     debounce(v => d$)
delay displacement     delay(ms)            delayWhen(v => d$)
buffer boundary        bufferTime(ms)       bufferWhen(() => c$)
group lifetime         —                    groupBy(..., { duration })
share reset            resetOnX: boolean    resetOnX: () => n$
retry/repeat delay     { delay: ms }        { delay: () => n$ }
uniqueness key         value itself         keySelector
```

## Trigger kind — { count, duration, notifier, predicate }

```text
              count            duration          notifier        predicate
selection     take(n)          —                 takeUntil(n$)   takeWhile(p)
buffer        bufferCount(n)   bufferTime(ms)    buffer(n$)      —
window        windowCount(n)   windowTime(ms)    window(n$)      —
sample        —                sampleTime(ms)    sample(n$)      —
```

The empty cells are **holes in the API surface** the tree makes visible —
e.g. there is no `bufferWhile(predicate)`; the behavior must be composed.

## Edge — { leading, trailing }

```text
throttle edges           v------ | ------v | v------v
audit / debounce         trailing is part of the INVARIANT, not a variant
take / takeLast          leading / trailing anchor over the whole sequence
first / last             the same anchor, with an error empty-policy
```

## Latest-value memory

```text
audit, debounce          remember latest during a window
sample                   remember latest since last trigger
combineLatest,           remember latest per source slot
withLatestFrom
shareReplay(1)           remember latest across subscribers
```

---

# 18. Reading an operator from its coordinates

Worked example — a search box:

```text
requirement    wait until typing pauses 300 ms, then request,
               abandon the previous request when a new one starts

coordinates    DEBOUNCE      invariant: restarting silence, trailing emit
               + fixed 300ms                      → debounceTime(300)
               SELECTION     uniqueness × adjacent → distinctUntilChanged()
               FLATTENING    kill-previous policy  → switchMap(query => http$)
```

```ts
search$ = input$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(toSearchRequest),
);
```

Each operator in the pipe is one tree, one invariant, and a handful of
chosen variants. Nothing needs to be memorized as a special case.

---

# 19. Summary

```text
ROOT BEHAVIOR
│
├── INVARIANT   the family's identity — what is ALWAYS true
│
└── VARIANTS    independent axes × explicit variants
                one choice per axis = one concrete behavior
                each concrete behavior maps to an RxJS API name
```

- Families differ by **invariant** (throttle vs debounce vs audit).
- Members of a family differ by **variants** (throttleTime vs throttle,
  leading vs trailing).
- A small number of axes — determination, trigger kind, edge,
  latest-memory, concurrency policy — recur across the whole API.
- The tree structure is deliberately regular (invariant lines, axes,
  variants, API mappings) so it can serve directly as the data model for
  the interactive visualization this project will render.
```
