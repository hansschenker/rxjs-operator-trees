import type { OperatorFamily, OperatorMapping } from '../types.ts';

export const sideEffect: OperatorFamily = {
  id: 'side-effect',
  name: 'Side-effect',
  category: 'Observation',
  invariants: [
    'values pass through unchanged',
    'timing passes through unchanged',
    'the operator only observes — it never influences the stream',
  ],
  axes: [
    {
      id: 'hook',
      name: 'Lifecycle hook',
      question: 'Where does the observer look?',
      variants: [
        { id: 'values', name: 'next / error / complete' },
        { id: 'subscription', name: 'subscribe / unsubscribe' },
        { id: 'teardown', name: 'teardown, any reason' },
      ],
    },
  ],
  notes: ['The only family whose entire dataflow behavior is invariant.'],
};

export const interrogation: OperatorFamily = {
  id: 'interrogation',
  name: 'Interrogation',
  category: 'Interrogation',
  invariants: [
    'consumes the sequence to answer a single question',
    'emits exactly one answer, then completes',
    'answers as early as logically possible',
  ],
  axes: [
    {
      id: 'question',
      name: 'Question',
      question: 'What is being asked?',
      variants: [
        { id: 'all-match', name: 'do ALL values match?' },
        { id: 'any-match', name: 'does ANY value match?' },
        { id: 'is-empty', name: 'is the sequence empty?' },
        { id: 'sequence-equal', name: 'equal to another sequence?' },
        { id: 'single-match', name: 'exactly one match?' },
      ],
    },
    {
      id: 'answer',
      name: 'Answer content',
      question: 'What form does the answer take?',
      variants: [
        { id: 'boolean', name: 'boolean' },
        { id: 'value', name: 'the matching value' },
        { id: 'index', name: 'the matching index' },
      ],
    },
  ],
  notes: [
    'The decision point is derived: universal claims refute early and confirm at completion; existential claims confirm at the first match.',
  ],
};

export const injection: OperatorFamily = {
  id: 'injection',
  name: 'Injection',
  category: 'Injection',
  invariants: [
    'all source values pass through unchanged',
    'extra given values are inserted at a sequence edge',
  ],
  axes: [
    {
      id: 'edge',
      name: 'Edge',
      question: 'Which edge receives the injected values?',
      variants: [
        { id: 'leading', name: 'leading (before the source)', glyph: 'v------' },
        { id: 'trailing', name: 'trailing (after completion)', glyph: '------v' },
      ],
    },
  ],
};

export const watchdog: OperatorFamily = {
  id: 'watchdog',
  name: 'Watchdog',
  category: 'Watchdog',
  invariants: [
    'values pass through unchanged while the deadline is met',
    'a temporal deadline is armed at subscribe and after values',
  ],
  axes: [
    {
      id: 'scope',
      name: 'Scope',
      question: 'Which values are guarded?',
      variants: [
        { id: 'first', name: 'first value only' },
        { id: 'each', name: 'every value' },
      ],
    },
    {
      id: 'deadline',
      name: 'Deadline',
      question: 'Relative or absolute?',
      variants: [
        { id: 'relative', name: 'relative duration' },
        { id: 'absolute-date', name: 'absolute date' },
      ],
    },
    {
      id: 'breach',
      name: 'On breach',
      question: 'What happens when the deadline passes?',
      variants: [
        { id: 'error', name: 'error (TimeoutError)' },
        { id: 'substitute', name: 'switch to fallback' },
      ],
    },
  ],
  notes: ['timeout({ with }) is catchError for time instead of for errors.'],
};

export const reification: OperatorFamily = {
  id: 'reification',
  name: 'Reification',
  category: 'Reification',
  invariants: [
    'moves the stream between the value channel and the notification channel — no information is added or lost',
  ],
  axes: [
    {
      id: 'direction',
      name: 'Direction',
      question: 'Lift terminals into values, or lower them back?',
      variants: [
        { id: 'lift', name: 'lift: notifications become values' },
        { id: 'lower', name: 'lower: values become notifications' },
      ],
    },
  ],
};

export const scheduling: OperatorFamily = {
  id: 'scheduling',
  name: 'Scheduling',
  category: 'Scheduling (meta)',
  invariants: [
    'values pass through unchanged',
    'only the execution context of deliveries changes',
  ],
  axes: [
    {
      id: 'stage',
      name: 'Stage',
      question: 'Which stage is rescheduled?',
      variants: [
        { id: 'emission', name: 'emission of notifications' },
        { id: 'subscription', name: 'the subscription itself' },
      ],
    },
  ],
  notes: ['A meta-axis: orthogonal to every family (the Policies "Time" dimension).'],
};

export const utilityFamilies: OperatorFamily[] = [
  sideEffect,
  interrogation,
  injection,
  watchdog,
  reification,
  scheduling,
];

export const utilityMappings: OperatorMapping[] = [
  { operator: 'tap', familyId: 'side-effect', status: 'current', coordinates: { hook: ['values', 'subscription'] } },
  { operator: 'finalize', familyId: 'side-effect', status: 'current', coordinates: { hook: 'teardown' }, notes: 'one hook unifying complete, error and unsubscribe' },
  { operator: 'every', familyId: 'interrogation', status: 'current', coordinates: { question: 'all-match', answer: 'boolean' } },
  { operator: 'find', familyId: 'interrogation', status: 'current', coordinates: { question: 'any-match', answer: 'value' }, notes: 'differs from first(p) only in empty policy: undefined instead of error' },
  { operator: 'findIndex', familyId: 'interrogation', status: 'current', coordinates: { question: 'any-match', answer: 'index' } },
  { operator: 'isEmpty', familyId: 'interrogation', status: 'current', coordinates: { question: 'is-empty', answer: 'boolean' } },
  { operator: 'sequenceEqual', familyId: 'interrogation', status: 'current', coordinates: { question: 'sequence-equal', answer: 'boolean' } },
  { operator: 'single', familyId: 'interrogation', status: 'current', coordinates: { question: 'single-match', answer: 'value' }, notes: 'adds a cardinality assertion: errors on more than one match' },
  { operator: 'startWith', familyId: 'injection', status: 'current', coordinates: { edge: 'leading' } },
  { operator: 'endWith', familyId: 'injection', status: 'current', coordinates: { edge: 'trailing' }, notes: 'an errored source never reaches its trailing edge' },
  { operator: 'timeout', familyId: 'watchdog', status: 'current', coordinates: { scope: ['first', 'each'], deadline: ['relative', 'absolute-date'], breach: ['error', 'substitute'] } },
  { operator: 'timeoutWith', familyId: 'watchdog', status: 'deprecated', replacedBy: 'timeout({ with: () => fallback$ })', coordinates: { scope: ['first', 'each'], deadline: ['relative', 'absolute-date'], breach: 'substitute' } },
  { operator: 'materialize', familyId: 'reification', status: 'current', coordinates: { direction: 'lift' } },
  { operator: 'dematerialize', familyId: 'reification', status: 'current', coordinates: { direction: 'lower' } },
  { operator: 'observeOn', familyId: 'scheduling', status: 'current', coordinates: { stage: 'emission' } },
  { operator: 'subscribeOn', familyId: 'scheduling', status: 'current', coordinates: { stage: 'subscription' } },
];
