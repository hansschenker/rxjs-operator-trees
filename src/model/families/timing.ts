import type { OperatorFamily, OperatorMapping } from '../types.ts';

const durationAxis = (question: string) => ({
  id: 'duration',
  name: 'Duration',
  question,
  variants: [
    { id: 'fixed', name: 'fixed' },
    { id: 'dynamic', name: 'dynamic / selected' },
  ],
});

export const throttleFamily: OperatorFamily = {
  id: 'throttle',
  name: 'Throttle',
  category: 'Timing',
  invariants: [
    'a source value opens a throttle window',
    'during the window further source values are suppressed',
    'the window does not restart on suppressed values',
  ],
  axes: [
    durationAxis('How long is the throttle window?'),
    {
      id: 'edge',
      name: 'Edge',
      question: 'Which edge of the window is allowed to emit?',
      variants: [
        { id: 'leading', name: 'leading', glyph: 'v------' },
        { id: 'trailing', name: 'trailing', glyph: '------v' },
        { id: 'both', name: 'leading + trailing', glyph: 'v------v' },
      ],
    },
  ],
};

export const auditFamily: OperatorFamily = {
  id: 'audit',
  name: 'Audit',
  category: 'Timing',
  invariants: [
    'a source value opens a non-restarting window',
    'the latest value during the window is remembered',
    'that latest value emits when the window closes (trailing edge)',
  ],
  axes: [durationAxis('How long is the audit window?')],
};

export const debounceFamily: OperatorFamily = {
  id: 'debounce',
  name: 'Debounce',
  category: 'Timing',
  invariants: [
    'every source value starts a silence timer',
    'the next value restarts the timer and replaces the pending value',
    'the pending value emits after uninterrupted silence (trailing edge)',
  ],
  axes: [durationAxis('How much silence is required?')],
};

export const sampleFamily: OperatorFamily = {
  id: 'sample',
  name: 'Sample',
  category: 'Timing',
  invariants: [
    'a trigger, independent of source values, requests a snapshot',
    'the snapshot is the latest NEW source value',
    'no new value since the last trigger means no emission',
  ],
  axes: [
    {
      id: 'trigger',
      name: 'Trigger',
      question: 'What requests a snapshot?',
      variants: [
        { id: 'periodic', name: 'periodic clock', glyph: '---|---|---' },
        { id: 'notifier', name: 'external notifier' },
      ],
    },
  ],
};

export const delayFamily: OperatorFamily = {
  id: 'delay',
  name: 'Delay',
  category: 'Timing',
  invariants: [
    'every value survives — nothing competes, nothing is dropped',
    'delivery is displaced later in time',
  ],
  axes: [
    {
      id: 'displacement',
      name: 'Displacement',
      question: 'What determines the displacement?',
      variants: [
        { id: 'relative', name: 'fixed relative duration', glyph: 'v---→---v' },
        { id: 'absolute-date', name: 'fixed absolute date' },
        { id: 'dynamic', name: 'dynamic per value' },
      ],
    },
    {
      id: 'start',
      name: 'Subscription start',
      question: 'When does the subscription itself begin?',
      variants: [
        { id: 'immediate', name: 'immediate' },
        { id: 'notifier', name: 'after a notifier' },
      ],
    },
  ],
};

export const timingFamilies: OperatorFamily[] = [
  throttleFamily,
  auditFamily,
  debounceFamily,
  sampleFamily,
  delayFamily,
];

export const timingMappings: OperatorMapping[] = [
  { operator: 'throttleTime', familyId: 'throttle', status: 'current', coordinates: { duration: 'fixed', edge: ['leading', 'trailing', 'both'] }, notes: 'default { leading: true, trailing: false }' },
  { operator: 'throttle', familyId: 'throttle', status: 'current', coordinates: { duration: 'dynamic', edge: ['leading', 'trailing', 'both'] } },
  { operator: 'auditTime', familyId: 'audit', status: 'current', coordinates: { duration: 'fixed' } },
  { operator: 'audit', familyId: 'audit', status: 'current', coordinates: { duration: 'dynamic' } },
  { operator: 'debounceTime', familyId: 'debounce', status: 'current', coordinates: { duration: 'fixed' } },
  { operator: 'debounce', familyId: 'debounce', status: 'current', coordinates: { duration: 'dynamic' } },
  { operator: 'sampleTime', familyId: 'sample', status: 'current', coordinates: { trigger: 'periodic' } },
  { operator: 'sample', familyId: 'sample', status: 'current', coordinates: { trigger: 'notifier' } },
  { operator: 'delay', familyId: 'delay', status: 'current', coordinates: { displacement: ['relative', 'absolute-date'], start: 'immediate' } },
  { operator: 'delayWhen', familyId: 'delay', status: 'current', coordinates: { displacement: 'dynamic', start: ['immediate', 'notifier'] }, notes: 'dynamic per-value delays may reorder the output' },
];
