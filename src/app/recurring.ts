export interface RecurringMember {
  familyId: string;
  axisId: string;
}

export interface RecurringGroup {
  title: string;
  /** The question this axis asks, independent of any family. */
  meaning: string;
  /** Consequences, identities, and holes the axis explains. */
  description: string;
  members: RecurringMember[];
}

/**
 * The cross-cutting result of the catalog: a small set of variant axes
 * recurs across unrelated families. Full reference: docs/RxJS-Recurring-Axes.md
 */
export const RECURRING_GROUPS: RecurringGroup[] = [
  {
    title: '1. Determination — fixed vs dynamic/selected',
    meaning:
      'Is a behavioral parameter decided once, statically, when the pipeline is built — or computed at runtime, per value or event, by a selector function or notifier?',
    description:
      'Every xxxTime operator is the fixed variant of xxx. Dynamic subsumes fixed: throttle(() => timer(ms)) ≡ throttleTime(ms) — the fixed variants are ergonomic presets. The axis even reaches creation (defer) and teardown (share reset grace periods).',
    members: [
      { familyId: 'throttle', axisId: 'duration' },
      { familyId: 'audit', axisId: 'duration' },
      { familyId: 'debounce', axisId: 'duration' },
      { familyId: 'delay', axisId: 'displacement' },
      { familyId: 'grouping', axisId: 'determination' },
      { familyId: 'resubscription', axisId: 'delay' },
      { familyId: 'sharing', axisId: 'reset-refcount' },
    ],
  },
  {
    title: '2. Trigger kind — count / duration / notifier / predicate',
    meaning:
      'When a family needs a moment to act — stop taking, close a group, snapshot a value — what kind of event defines that moment?',
    description:
      'take(n) / takeUntil / takeWhile and bufferCount / bufferTime / buffer(n$) are the same axis in different families. Notifier is the universal trigger (buffer(interval(ms)) ≈ bufferTime(ms)); the empty cells — no bufferWhile, no takeTime — are holes in the API surface.',
    members: [
      { familyId: 'selection', axisId: 'criterion' },
      { familyId: 'grouping', axisId: 'trigger' },
      { familyId: 'sample', axisId: 'trigger' },
    ],
  },
  {
    title: '3. Edge — leading vs trailing',
    meaning:
      'Every interval — a throttle window, a whole sequence, a subscription lifetime — has two ends. Which end does the behavior act on?',
    description:
      'Trailing requires waiting: takeLast buffers until completion, endWith never fires on an errored source. Leading acts immediately, which is why take can complete early. In throttle the edge is a variant; in audit and debounce trailing is part of the invariant.',
    members: [
      { familyId: 'throttle', axisId: 'edge' },
      { familyId: 'injection', axisId: 'edge' },
      { familyId: 'selection', axisId: 'anchor' },
    ],
  },
  {
    title: '4. Latest-value memory',
    meaning:
      'A one-slot cache: every newer value overwrites the older one, and the slot is read at a decision moment. Conflation is the point — only the most current value survives.',
    description:
      'audit/debounce hold the pending value, sample the latest since the last trigger, combineLatest/withLatestFrom one per source slot, shareReplay(1) one across subscribers. The contrast is queue memory: zip and concatMap remember everything, combineLatest remembers one.',
    members: [
      { familyId: 'audit', axisId: 'duration' },
      { familyId: 'sample', axisId: 'trigger' },
      { familyId: 'combining', axisId: 'alignment' },
      { familyId: 'sharing', axisId: 'connector' },
    ],
  },
  {
    title: '5. Overlap policy — alongside / queue / kill previous / drop newcomer',
    meaning:
      'New work arrives while previous work is still live. There are exactly four answers — and they recur for inner subscriptions (flattening) and for time windows holding a pending value (rate-limiting, timing).',
    description:
      'The temporal operators are flattening policies applied to timer inners: debounceTime(t) ≈ switchMap(v => timer(t).pipe(map(() => v))); throttle leading ≈ exhaustMap. switchMap : debounce :: exhaustMap : throttle.',
    members: [{ familyId: 'flattening', axisId: 'overlap' }],
  },
  {
    title: '6. Input form — static creation / *With / *All / *Map',
    meaning:
      'The same multi-source behavior reached from different starting shapes: sources known up front, companions joining mid-pipe, a stream of streams, or values projected into streams.',
    description:
      'The naming grammar of RxJS: the root word names the behavior, the suffix names the input form — mergeMap is merge entered through projection. Empty cells are holes: no raceAll, no forkJoin operator, no iifWith.',
    members: [
      { familyId: 'flattening', axisId: 'input' },
      { familyId: 'combining', axisId: 'input' },
      { familyId: 'source-selection', axisId: 'input' },
    ],
  },
  {
    title: '7. Empty policy — silent / default / error',
    meaning:
      'A behavior that may produce nothing must decide what "nothing" means at completion: normal, defaulted, or exceptional?',
    description:
      'first vs take(1), last vs takeLast(1), find vs first(p) differ in exactly this coordinate. defaultIfEmpty / throwIfEmpty are the axis as standalone operators, giving the identity first() ≡ take(1) + throwIfEmpty().',
    members: [{ familyId: 'selection', axisId: 'empty' }],
  },
];
