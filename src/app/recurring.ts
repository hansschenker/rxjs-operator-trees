export interface RecurringMember {
  familyId: string;
  axisId: string;
}

export interface RecurringGroup {
  title: string;
  description: string;
  members: RecurringMember[];
}

/**
 * The cross-cutting result of the catalog: a small set of variant axes
 * recurs across unrelated families.
 */
export const RECURRING_GROUPS: RecurringGroup[] = [
  {
    title: 'Determination — fixed vs dynamic/selected',
    description:
      'The same choice everywhere: is the parameter a fixed value, or selected per value/event by a function or notifier?',
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
    title: 'Trigger kind — count / duration / notifier / predicate',
    description:
      'take(n) / takeUntil / takeWhile and bufferCount / bufferTime / buffer(n$) are the same axis in different families. Empty cells are holes in the API surface.',
    members: [
      { familyId: 'selection', axisId: 'criterion' },
      { familyId: 'grouping', axisId: 'trigger' },
      { familyId: 'sample', axisId: 'trigger' },
    ],
  },
  {
    title: 'Edge — leading vs trailing',
    description:
      'Throttle edges, startWith/endWith injection, and the front/back anchor of take/takeLast are one geometric idea: which end of a window or sequence.',
    members: [
      { familyId: 'throttle', axisId: 'edge' },
      { familyId: 'injection', axisId: 'edge' },
      { familyId: 'selection', axisId: 'anchor' },
    ],
  },
  {
    title: 'Latest-value memory',
    description:
      'audit, debounce and sample remember the latest value during a window; combineLatest and withLatestFrom remember the latest per source slot; shareReplay(1) remembers the latest across subscribers.',
    members: [
      { familyId: 'audit', axisId: 'duration' },
      { familyId: 'sample', axisId: 'trigger' },
      { familyId: 'combining', axisId: 'alignment' },
      { familyId: 'sharing', axisId: 'connector' },
    ],
  },
];
