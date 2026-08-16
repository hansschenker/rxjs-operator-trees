# RxJS Recurring Axes

## The cross-family reference

The strongest result of the Operator Tree catalog (`RxJS-Operator-Trees.md`)
is that **a small set of variant axes recurs across unrelated families**.
The same behavioral question is asked again and again; only the family
changes. Learning an axis once therefore explains dozens of operators.

This document is the reference for those axes. Each entry gives:

- **Meaning** — the question the axis asks, independent of any family
- **Variants** — what each choice on the axis means
- **Where it appears** — families and operators that carry the axis
- **What it explains** — consequences, naming patterns, composition
  identities, and API holes

The seven recurring axes:

```text
1. Determination        fixed vs dynamic/selected
2. Trigger kind         count / duration / notifier / predicate
3. Edge                 leading vs trailing
4. Latest-value memory  one-slot cache, conflation on purpose
5. Overlap policy       alongside / queue / kill previous / drop newcomer
6. Input form           static creation / *With / *All / *Map
7. Empty policy         silent / default / error
```

---

# 1. Determination — fixed vs dynamic/selected

## Meaning

Is a behavioral parameter decided **once, statically**, when the pipeline
is built — or **computed at runtime**, per value or per event, by a
selector function or notifier?

## Variants

```text
fixed              a literal value; every activation behaves identically
                   throttleTime(300)

dynamic/selected   a function runs per value/event and returns the
                   duration, notifier, or key that governs this activation
                   throttle(v => durationFor(v))
```

## Where it appears

```text
throttle duration      throttleTime(ms)      throttle(v => d$)
audit duration         auditTime(ms)         audit(v => d$)
debounce silence       debounceTime(ms)      debounce(v => d$)
delay displacement     delay(ms)             delayWhen(v => d$)
buffer boundary        bufferTime(ms)        bufferWhen(() => c$)
group lifetime         —                     groupBy(k, { duration })
share reset            resetOnX: boolean     resetOnX: () => n$
retry/repeat delay     { delay: ms }         { delay: () => n$ }
uniqueness key         the value itself      keySelector
creation               of(...)               defer(() => source)
```

## What it explains

- **The `...Time` suffix is this axis in disguise**: every `xxxTime`
  operator is the fixed variant of `xxx`.
- **Dynamic subsumes fixed**: `throttle(() => timer(ms))` ≡
  `throttleTime(ms)`. The fixed variants are ergonomic presets, not
  separate behaviors.
- The axis reaches beyond values: `defer` applies it to **creation**
  (which Observable to become is decided per subscriber), and
  `share({ resetOnRefCountZero: () => timer(1000) })` applies it to
  **teardown** (a grace period instead of a boolean).

---

# 2. Trigger kind — count / duration / notifier / predicate

## Meaning

When a family needs a **moment to act** — stop taking, close a group,
snapshot the latest value — what kind of event defines that moment?

## Variants

```text
count       after n values have passed
duration    after a span of time has elapsed
notifier    when another Observable emits
predicate   when a value-level test changes its answer
```

## Where it appears

```text
              count            duration          notifier        predicate
selection     take(n)          —                 takeUntil(n$)   takeWhile(p)
buffer        bufferCount(n)   bufferTime(ms)    buffer(n$)      —
window        windowCount(n)   windowTime(ms)    window(n$)      —
sample        —                sampleTime(ms)    sample(n$)      —
```

## What it explains

- **The empty cells are API holes**: there is no `bufferWhile(p)` and no
  `takeTime(ms)` — those behaviors must be composed
  (`takeUntil(timer(ms))`, groups closed by a predicate-driven notifier).
- **Notifier is the universal trigger**: count and duration are encodable
  as notifiers — `buffer(interval(ms))` ≈ `bufferTime(ms)`,
  `takeUntil(timer(ms))` is the missing `takeTime`. The count/duration
  variants are optimized, self-documenting shorthands.
- **Predicate is the odd one out**: it needs access to the values
  themselves, which is why it exists in Selection (which inspects values)
  but not in Sample (whose trigger is independent of values by invariant).

---

# 3. Edge — leading vs trailing

## Meaning

Every interval — a throttle window, a whole sequence, a subscription
lifetime — has two ends. **Which end does the behavior act on?**

## Variants

```text
leading     act at the opening edge      v------
trailing    act at the closing edge      ------v
both        act at both edges            v------v
```

## Where it appears

```text
throttle edges        leading | trailing | both       the variant axis
audit / debounce      trailing                        part of the INVARIANT
take / takeLast       front / back of the sequence    Selection's anchor
first / last          the same anchor + error empty-policy
startWith / endWith   inject before / inject after    Injection's edge
```

## What it explains

- **Trailing requires waiting**: `takeLast` must buffer until completion,
  `endWith` can never fire on an errored source, throttle's trailing edge
  holds a pending value. Leading acts immediately — which is why `take`
  can complete early and unsubscribe.
- **The same choice can be variant or invariant**: throttle offers the
  edge as a choice; audit and debounce have trailing baked into their
  identity. Where an axis sits in the tree (INVARIANT vs VARIANTS branch)
  is itself informative.

---

# 4. Latest-value memory

## Meaning

A **one-slot cache**: every newer value overwrites the older one, and the
slot is read at a decision moment. Conflation is the point — intermediate
values are deliberately lost, only the most current survives.

## Where it appears

```text
audit, debounce          the pending value during the window / silence
sample                   the latest NEW value since the last trigger
combineLatest,           the latest value per source slot
withLatestFrom
shareReplay(1),          the latest value replayed to late subscribers
BehaviorSubject
```

## What it explains

- These operators are **lossy but always current** — the natural fit for
  UI state, sensor readings, and anything where only "now" matters.
- The contrast axis is **queue memory**: `zip` and `concatMap` remember
  *everything* (index-aligned, unbounded queues) where `combineLatest`
  and `audit` remember *one*. "How much does this operator remember, and
  what evicts it?" separates conflating operators from buffering ones —
  and predicts memory behavior under a fast producer.

---

# 5. Overlap policy — alongside / queue / kill previous / drop newcomer

## Meaning

**New work arrives while previous work is still live.** There are exactly
four answers, and they recur at two levels: in Flattening the "work" is an
inner subscription; in Rate-Limiting/Timing it is a time window holding a
pending value.

## Variants

```text
alongside       run both                     merge family
queue           newcomer waits for a slot    concat family
kill previous   newcomer replaces it         switch family
drop newcomer   busy means ignored           exhaust family
```

## Where it appears

```text
flattening      mergeMap | concatMap | switchMap | exhaustMap
timing          debounce = kill previous     new value cancels the pending
                                             silence timer and value
rate-limiting   throttle = drop newcomer     values during a live window
                                             are ignored (leading edge)
```

## What it explains

- The temporal operators **are** flattening policies applied to timer
  inners (≈ up to completion details):

  ```text
  debounceTime(t)         ≈  switchMap(v => timer(t).pipe(map(() => v)))
  throttleTime(t) leading ≈  exhaustMap(v =>
                                concat(of(v), timer(t).pipe(ignoreElements())))
  ```

  `switchMap : debounce :: exhaustMap : throttle` — one analogy that
  makes four operators predict each other.
- Cancellation lives on this axis: *kill previous* is the only policy
  that unsubscribes live work; *drop newcomer* the only one that never
  starts it.

---

# 6. Input form — static creation / *With / *All / *Map

## Meaning

The same multi-source behavior can be reached from **different starting
shapes**: a list of sources known up front, a source joined by companions
mid-pipe, a stream of streams, or values projected into streams. The
behavior is identical; only the entry point differs.

## Variants

```text
static creation     all sources known up front      merge(a$, b$)
*With suffix        companions join mid-pipe        a$.pipe(mergeWith(b$))
*All higher-order   a stream of streams flattens    higher$.pipe(mergeAll())
*Map projected      values become streams           src$.pipe(mergeMap(f))
```

## Where it appears

```text
                static           *With                 *All               *Map
merge           merge(a$, b$)    mergeWith(b$)         mergeAll()         mergeMap(f)
concat          concat(a$, b$)   concatWith(b$)        concatAll()        concatMap(f)
zip             zip(a$, b$)      zipWith(b$)           zipAll()           —
combineLatest   combineLatest    combineLatestWith     combineLatestAll   —
race            race(a$, b$)     raceWith(b$)          —                  —
forkJoin        forkJoin([...])  —                     —                  —
iif             iif(c, a$, b$)   —                     —                  —
```

## What it explains

- **The naming grammar of RxJS**: the root word names the behavior, the
  suffix names the input form. `mergeMap` is not a new behavior — it is
  merge entered through projection.
- The empty cells are holes: no `raceAll`, no `forkJoin` operator form,
  no `iifWith` — compose them when needed.

---

# 7. Empty policy — silent / default / error

## Meaning

A behavior that **may produce nothing** must decide what "nothing" means
when the source ends: is emptiness normal, defaulted, or exceptional?

## Variants

```text
silent     complete without emitting          take(1) on an empty source
default    emit a given fallback value        first(p, defaultValue)
error      throw EmptyError                   first() on an empty source
```

## Where it appears

```text
first vs take(1)         identical selection, different empty policy
last vs takeLast(1)      the same pair at the trailing edge
find vs first(p)         find emits undefined; first(p) errors
elementAt(i, d?)         default | error
reduce without seed      errors on an empty source
forkJoin                 silent: any empty input empties the whole join
defaultIfEmpty(d)        the default policy as a standalone operator
throwIfEmpty(f)          the error policy as a standalone operator
```

## What it explains

- **The axis exists as standalone operators** — `defaultIfEmpty` /
  `throwIfEmpty` retrofit an empty policy onto ANY pipeline, which yields
  the composition identity:

  ```text
  first()  ≡  take(1) + throwIfEmpty()
  ```

- Pairs that look like duplicates (`first`/`take(1)`, `find`/`first(p)`)
  differ in exactly this one coordinate. When two operators seem
  interchangeable, check their empty policies before swapping them.

---

# Summary

```text
axis                  question it asks
─────────────────────────────────────────────────────────────────────────
Determination         decided up front, or computed per value/event?
Trigger kind          what kind of event marks the decision moment?
Edge                  which end of the interval does the behavior act on?
Latest-value memory   how much is remembered — one conflated slot?
Overlap policy        new work during live work: both, wait, replace, drop?
Input form            which starting shape reaches this behavior?
Empty policy          what does "produced nothing" mean at completion?
```

Most operators are one root behavior plus two or three answers to these
seven questions. That is why the catalog stays small while the API surface
looks large.
