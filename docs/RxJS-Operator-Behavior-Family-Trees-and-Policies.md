# RxJS Operator Behavior: Family Trees and Policies

## A behavioral classification for understanding RxJS operators

### Executive summary

The strongest insight from this discussion is that RxJS operators are easier to understand when we stop treating the API as a flat catalog of unrelated operator names.

Instead, we can describe RxJS operators in two complementary layers:

1. **RxJS Family Trees classify behavior.**
2. **RxJS Policies specify behavior.**

A Family Tree starts from a **root behavior**, then decomposes that behavior into **variant axes**, and finally into the **variants** available on each axis. A concrete operator behavior is a valid combination of those variants.

The Policies framework then describes that concrete behavior precisely along the semantic dimensions:

```text
Source
Trigger
Value
Cardinality
Time
Concurrency
Cancellation
Termination
```

Together they give us both:

```text
Family Tree = behavioral structure
Policies    = behavioral semantics
```

or, as one complete chain:

```text
Operator Category
      ↓
Root Behavior
      ↓
Variant Axes
      ↓
Concrete Behavior
      ↓
RxJS Operator / Configuration
      ↓
Policy Profile
```

This is a better RxJS operator classification than a flat list of categories such as filtering, transformation, utility, or combination, because it explains not only **where an operator belongs**, but also **how the behaviors inside an operator family differ**.

---

# 1. Root behavior, variant axes, and variants

The basic model is:

```text
Root Behavior
│
├── 1. Variant Axis A
│      ├── Variant A1
│      └── Variant A2
│
├── 2. Variant Axis B
│      ├── Variant B1
│      ├── Variant B2
│      └── Variant B3
│
└── ...
```

The terminology is important:

- **Root behavior** — what the operator family fundamentally does.
- **Variant axis** — one independent behavioral dimension that can vary.
- **Variant** — one choice on a variant axis.
- **Concrete behavior** — one valid combination of variants across the axes.
- **RxJS operator/configuration** — the API mechanism used to implement that concrete behavior.

This gives the general formula:

```text
Concrete Behavior
=
Root Behavior
× Variant Axis 1
× Variant Axis 2
× ...
```

The Family Tree therefore describes a **behavioral space**, not merely a list of exported function names.

---

# 2. Why Family Trees are better than flat operator lists

A flat API may present:

```text
throttle
throttleTime
```

That naming does not immediately reveal that `throttle` actually contains multiple independent behavioral choices.

The Family Tree exposes them:

```text
throttle
│
├── 1. Duration policy
│      ├── fixed
│      └── dynamic / selected
│
└── 2. Edge policy
       ├── leading
       ├── trailing
       └── leading + trailing
```

Now the behavioral space becomes obvious:

```text
Throttle Behavior
=
Duration Policy
× Edge Policy
```

with:

```text
Duration Policy
= { fixed, dynamic/selected }

Edge Policy
= { leading, trailing, leading+trailing }
```

Therefore:

```text
2 × 3 = 6 concrete throttle behaviors
```

The API names themselves do not make those six behaviors visible. The Family Tree does.

---

# 3. Timing behavior needs an explicit temporal visualization

A major insight from the timing discussion is that ordinary operator names — and even ordinary marble diagrams — often fail to show **where the temporal pause/window is located relative to the emitted value**.

For timing operators, a small temporal geometry makes the behavior immediately visible.

## Leading behavior

```text
v------
```

Meaning:

```text
emit first
then temporal window / suppression period
```

## Trailing behavior

```text
------v
```

Meaning:

```text
temporal window first
then emit
```

## Leading + trailing

```text
v------v
```

Meaning:

```text
emit at front edge
then temporal window
then emit latest at back edge
```

## Periodic sampling

```text
---|---|---|---
   v   v   v
```

Meaning:

```text
an independent periodic clock decides when to inspect the latest new value
```

This suggests an important extension to marble-style explanations:

> **Do not only show emitted values. Also show timers, gates, silence intervals, and temporal windows explicitly.**

Ordinary marbles show the observable layer. Timing explanations should also expose the operator-control layer.

```text
Observable layer
    values occurring over time

Operator-control layer
    timer / gate / temporal window
```

---

# 4. The meaning of `Time` in timing operators

The suffix `Time` is too general to explain the actual temporal role.

For example:

```text
throttleTime  → throttle duration

debounceTime  → silence duration

auditTime     → audit-window duration

sampleTime    → sampling period
```

Therefore a better conceptual vocabulary is:

```text
throttle → ignore for

debounce → silent for

audit    → fixed window

sample   → periodic take
```

The important principle is:

> **The temporal parameter supplies a duration or period; the root behavior determines what that duration or period means for the dataflow.**

---

# 5. Throttle Family Tree

## Root behavior

`throttle` suppresses source values during a throttle window and determines which edge of that window is allowed to emit.

```text
throttle
│
├── 1. Duration policy
│   │
│   ├── fixed duration
│   │      throttleTime(...)
│   │
│   └── dynamic / selected duration
│          throttle(value => duration$)
│
└── 2. Edge policy
    │
    ├── leading
    │      v------
    │
    ├── trailing
    │      ------v
    │
    └── leading + trailing
           v------v
```

The six concrete behaviors are:

```text
fixed   × leading
fixed   × trailing
fixed   × leading+trailing

dynamic × leading
dynamic × trailing
dynamic × leading+trailing
```

A user-facing vocabulary can make these hidden policies explicit:

```text
throttleDurationLeading(ms)                v------
throttleDurationTrailing(ms)               ------v
throttleDurationLeadingTrailing(ms)        v------v

throttleLeading(durationSelector)          v-----?
throttleTrailing(durationSelector)         -----?v
throttleLeadingTrailing(durationSelector)  v-----?v
```

The `?` means that the dynamic duration Observable decides where the throttle boundary occurs.

This leads to a useful API-design rule:

> **If a configuration option changes the qualitative behavior of an operator, that behavioral choice should preferably be visible in the operator expression rather than hidden in a default config object.**

For throttle, `leading` and `trailing` determine **which values survive and where they are emitted relative to the throttle window**. They are therefore behavioral policies, not merely tuning parameters.

---

# 6. Window Family Tree

## Root behavior

`window` partitions/routes source values into **inner Observables**.

```text
Observable<T>
      ↓
Observable<Observable<T>>
```

The tree we found easiest to understand is:

```text
window
│
├── count
│   ├── fixed/external
│   │   ├── contiguous
│   │   ├── overlapping
│   │   └── gapped
│   │
│   └── dynamic/selected
│       ├── contiguous
│       ├── overlapping
│       └── gapped
│
├── duration
│   ├── fixed/external
│   │   ├── contiguous
│   │   ├── overlapping
│   │   └── gapped
│   │
│   └── dynamic/selected
│       ├── contiguous
│       ├── overlapping
│       └── gapped
│
└── notifier
    ├── fixed/external
    │   ├── contiguous
    │   ├── overlapping
    │   └── gapped
    │
    └── dynamic/selected
        ├── contiguous
        ├── overlapping
        └── gapped
```

This gives three major dimensions:

```text
Boundary Trigger
= count | duration | notifier

Boundary Determination
= fixed/external | dynamic/selected

Window Topology
= contiguous | overlapping | gapped
```

A useful refinement is that **boundary means where window membership starts and/or stops**.

For contiguous windows, a boundary often does both jobs:

```text
[------W1------][------W2------]
                ↑
             boundary
             stop W1
             start W2
```

For independent openings and closings, such as toggle-style behavior:

```text
start
  ↓
  [--------- window ---------]
                             ↑
                            stop
```

Independent boundaries permit overlapping and gapped topologies.

---

# 7. Buffer Family Tree

## Root behavior

`buffer` is the materialized counterpart of `window`.

It collects source values into arrays:

```text
Observable<T>
      ↓
Observable<T[]>
```

The behavioral tree mirrors `window` closely:

```text
buffer
│
├── count
│   ├── fixed/external
│   │   ├── contiguous
│   │   ├── overlapping
│   │   └── gapped
│   │
│   └── dynamic/selected
│       ├── contiguous
│       ├── overlapping
│       └── gapped
│
├── duration
│   ├── fixed/external
│   │   ├── contiguous
│   │   ├── overlapping
│   │   └── gapped
│   │
│   └── dynamic/selected
│       ├── contiguous
│       ├── overlapping
│       └── gapped
│
└── notifier
    ├── fixed/external
    │   ├── contiguous
    │   ├── overlapping
    │   └── gapped
    │
    └── dynamic/selected
        ├── contiguous
        ├── overlapping
        └── gapped
```

The strongest correspondence is:

```text
buffer                         window
│                              │
emits Array<T>                 emits Observable<T>
│                              │
└──────── same grouping questions ────────┘

count
 duration
 notifier
 fixed/dynamic determination
 contiguous/overlapping/gapped topology
```

This shows that `buffer` and `window` share nearly the same behavioral coordinate system; the fundamental difference is whether the group is **materialized as an array** or remains a **live inner Observable**.

---

# 8. Audit Family Tree

## Root behavior

`audit` opens a non-restarting window when a source value arrives, remembers the latest source value during that window, and emits that latest value when the window ends.

```text
audit
│
├── 1. Duration policy
│   ├── fixed duration
│   │      auditTime(duration)
│   │
│   └── dynamic/selected duration
│          audit(value => duration$)
│
└── invariants
    ├── source value starts window
    ├── later values do NOT restart window
    ├── remember latest value
    └── emit at trailing edge
           ------v
```

The real variant axis is therefore:

```text
Audit
=
Duration Policy

{ fixed, dynamic/selected }
```

The trailing-edge emission is part of the audit root behavior itself.

---

# 9. Debounce Family Tree

## Root behavior

`debounce` requires a period of silence before the latest value is emitted.

Each new source value restarts/cancels the pending silence test.

```text
debounce
│
├── 1. Silence-duration policy
│   ├── fixed duration
│   │      debounceTime(duration)
│   │
│   └── dynamic/selected duration
│          debounce(value => duration$)
│
└── invariants
    ├── each source value starts a wait
    ├── next source value restarts the wait
    ├── previous pending value is discarded
    └── latest value emits after silence
           ------v
```

The core visual model is:

```text
value
  ↓
[--- silence duration ---]
                        ↓
                      emit

------v
```

but every new value moves the effective silence window again.

---

# 10. Sample Family Tree

## Root behavior

`sample` takes the latest new source value whenever a sampling trigger occurs.

```text
sample
│
├── 1. Sampling-trigger policy
│   ├── fixed periodic trigger
│   │      sampleTime(period)
│   │
│   └── external notifier
│          sample(notifier$)
│
└── invariants
    ├── trigger asks for a snapshot
    ├── take latest new source value
    └── emit nothing if no new value exists
```

Fixed periodic:

```text
---|---|---|---
   v   v   v
```

External notifier:

```text
-------n---------n------>
       ↓         ↓
     sample    sample
```

This is distinct from `audit`, `debounce`, and `throttle` because the sampling trigger may come from an **independent clock or notifier**, rather than from the source value starting a suppression/silence window.

---

# 11. Delay Family Tree

## Root behavior

`delay` moves delivery later in time. Unlike throttle/audit/debounce, delay is not primarily selecting one value from competing values; it temporally displaces the values themselves.

```text
delay
│
├── 1. Value-delay policy
│   ├── fixed relative duration
│   │      delay(duration)
│   │
│   ├── fixed absolute due date
│   │      delay(date)
│   │
│   └── dynamic/selected per value
│          delayWhen(value => duration$)
│
└── 2. Subscription-start policy
    ├── immediate
    └── external notifier
           subscriptionDelay$
```

Fixed relative delay:

```text
v------→------v
```

Dynamic per-value delays may differ:

```text
A → [----------] → A
B → [---]        → B
C → [----------------] → C
```

Because delays can differ per value, dynamic delay may even change output ordering.

---

# 12. The timing families side by side

The root word tells us what the temporal boundary means:

```text
throttle
  duration determines a suppression window
  leading/trailing decides which edge emits

  v------
  ------v
  v------v


audit
  duration determines a non-restarting observation window
  latest value emits at the end

  ------v


debounce
  duration determines required silence
  every new value restarts the wait

  ------v


sample
  period/notifier determines when to inspect latest new value

  ---|---|---|---
     v   v   v


delay
  duration determines temporal displacement of the value itself

  v------→------v
```

This makes their differences much clearer than the shared `...Time` naming.

---

# 13. Domain functions should remain separate from RxJS plumbing

The Teleprompter example reinforced another important rule:

> **Keep the RxJS mechanism visible; give domain names to the pure functions passed into the operators.**

Prefer:

```ts
map(toEventKey),
filter(isArrowKey),
map(toDirection)
```

over hiding `map` and `filter` inside trivial domain-named custom operators.

The pipeline then exposes both levels at once:

```text
RxJS mechanism      Domain meaning

map                 toEventKey
filter              isArrowKey
map                 toDirection
scan                moveCursor
```

The resulting code reads like the dataflow while retaining the standard RxJS transformation machinery.

This also helps tooling: a debugger can see both the RxJS operator and the typed domain function supplied to it.

---

# 14. Normalize physical events into a small domain vocabulary

The Teleprompter also demonstrated the value of early normalization.

Keyboard and wheel events were both converted into the same domain value:

```text
KeyboardEvent ─┐
               ├──→ Direction (-1 | +1)
WheelEvent ────┘
```

After normalization, the rest of the application no longer cares which physical source produced the movement.

```text
physical input
    ↓
normalize
    ↓
domain value
    ↓
state transition
    ↓
view
```

This is a strong RxJS FP pattern because it keeps domain meaning in pure functions and lets RxJS only move those values over time.

---

# 15. Family Trees as an RxJS classification system

The Family Tree idea scales beyond timing operators.

At the top level we can classify RxJS by **behavioral categories**, and under each category define **root behaviors**.

For example:

```text
RxJS Operators
│
├── Selection
│   ├── take
│   ├── skip
│   ├── filter
│   └── distinct
│
├── Transformation
│   ├── map
│   └── expand
│
├── State
│   └── scan
│
├── Grouping
│   ├── buffer
│   └── window
│
├── Timing
│   ├── throttle
│   ├── audit
│   ├── debounce
│   ├── sample
│   └── delay
│
├── Flattening / Concurrency
│   ├── merge
│   ├── switch
│   ├── concat
│   └── exhaust
│
├── Combining
│   ├── combine
│   ├── zip
│   └── race
│
├── Sharing
│   ├── share
│   └── publish
│
└── Error / Repetition
    ├── retry
    └── repeat
```

Each root can then receive its own Family Tree.

The classification hierarchy becomes:

```text
Category
   ↓
Root Behavior
   ↓
Variant Axes
   ↓
Variants
   ↓
Concrete Behavior
   ↓
RxJS API mapping
```

This is semantically stronger than simply grouping exported names by topic.

---

# 16. Family Trees and Policies complete each other

These are the two strongest descriptive frameworks we now have.

## Family Trees

Family Trees answer:

```text
What is the root behavior?
What parts of the behavior can vary?
What variants exist on each axis?
Which concrete behaviors are possible?
How does RxJS expose them?
```

Therefore:

> **Family Trees classify RxJS behavior.**

## Policies

The Policies framework answers:

```text
Source
Trigger
Value
Cardinality
Time
Concurrency
Cancellation
Termination
```

Therefore:

> **Policies specify RxJS behavior.**

Together:

```text
FAMILY TREE
    ↓
select a concrete behavior
    ↓
POLICY PROFILE
    ↓
state exactly what that behavior does
```

Or:

```text
Family Tree = map of the behavioral space
Policies    = coordinates and semantics of one point in that space
```

This relationship is the central result.

---

# 17. A canonical template for future operator analysis

For every RxJS root operator family, use this process.

## Step 1 — Identify the root behavior

Ask:

```text
What does this operator fundamentally do to values over time?
```

Example:

```text
throttle → suppress values during a window
window   → route values into inner Observable groups
buffer   → collect values into array groups
sample   → snapshot the latest new value when triggered
```

## Step 2 — Identify independent variant axes

Ask:

```text
Which semantic choices can vary independently?
```

For throttle:

```text
Duration policy
Edge policy
```

For window:

```text
Boundary trigger
Boundary determination
Topology
```

## Step 3 — List variants on each axis

Example:

```text
Duration policy
├── fixed
└── dynamic/selected

Edge policy
├── leading
├── trailing
└── leading+trailing
```

## Step 4 — Generate valid concrete behaviors

Conceptually:

```text
Root
× Axis 1
× Axis 2
× ...
```

Not every theoretical combination must be valid or represented by RxJS.

This is useful because the tree can reveal:

```text
implemented combinations
invalid combinations
redundant combinations
holes in the RxJS API surface
```

## Step 5 — Map each valid behavior to the official RxJS API

Example:

```text
throttle
+ fixed duration
+ trailing edge

→ throttleTime(..., config)
```

The behavioral model comes first; the RxJS exported function is the implementation mapping.

## Step 6 — Add an explicit temporal visualization where relevant

Examples:

```text
leading          v------
trailing         ------v
both             v------v
periodic         ---|---|---
delay            v------→------v
```

## Step 7 — Describe the chosen behavior with the Policies framework

```text
Source
Trigger
Value
Cardinality
Time
Concurrency
Cancellation
Termination
```

This gives a complete semantic description of the Family Tree leaf.

---

# 18. Final formulation

The central model can be stated compactly:

> **An RxJS operator family has a root behavior. The root behavior is specialized by one or more independent behavioral variant axes. Each axis contains explicit variants. A concrete RxJS behavior is a valid combination of those variants. The official RxJS operator names and configuration objects are implementation mappings onto that behavioral space.**

And:

> **Family Trees provide the behavioral taxonomy; RxJS Policies provide the semantic specification of each concrete behavior.**

This gives us a new way to study RxJS:

```text
Do not memorize operator names first.

Understand the root behavior.
        ↓
Understand its behavioral axes.
        ↓
Understand the variants.
        ↓
See the concrete behavior visually.
        ↓
Map it to the official RxJS operator.
        ↓
Specify it precisely with Policies.
```

The result is a classification that makes hidden operator behavior visible, exposes configuration choices as semantic dimensions, provides a natural place for temporal visualizations, and reduces the RxJS API from a large collection of names into a smaller number of understandable behavioral families.

---

# 19. Two complementary descriptions of RxJS

The overall conclusion of the discussion is therefore:

```text
                  RxJS BEHAVIOR
                       │
          ┌────────────┴────────────┐
          │                         │
     FAMILY TREES                POLICIES
          │                         │
 classify behavior             specify behavior
          │                         │
 root behavior                Source
 variant axes                Trigger
 variants                    Value
 concrete behavior           Cardinality
 API mapping                  Time
                              Concurrency
                              Cancellation
                              Termination
          │                         │
          └────────────┬────────────┘
                       │
              COMPLETE DESCRIPTION
              OF OPERATOR BEHAVIOR
```

**Family Trees tell us which behavior we have. Policies tell us exactly what that behavior does.**
