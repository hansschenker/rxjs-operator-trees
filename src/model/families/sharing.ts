import type { Axis, OperatorFamily, OperatorMapping } from '../types.ts';

const resetAxis = (id: string, name: string): Axis => ({
  id,
  name,
  question: 'Reset the connection when this happens?',
  variants: [
    { id: 'on', name: 'yes' },
    { id: 'off', name: 'no' },
    { id: 'dynamic', name: 'after a notifier (grace period)' },
  ],
});

export const sharing: OperatorFamily = {
  id: 'sharing',
  name: 'Sharing',
  category: 'Sharing',
  invariants: [
    'at most one live subscription to the source at a time',
    'values are multiplexed unchanged to every subscriber',
    'a subject-like connector sits between source and subscribers',
  ],
  axes: [
    {
      id: 'connector',
      name: 'Connector / replay',
      question: 'What does a late subscriber see?',
      variants: [
        { id: 'subject', name: 'nothing replayed (Subject)' },
        { id: 'replay', name: 'latest N replayed (ReplaySubject)' },
        { id: 'custom', name: 'custom subject factory' },
      ],
    },
    {
      id: 'connection',
      name: 'Connection',
      question: 'When does the source subscription start?',
      variants: [
        { id: 'auto', name: 'on first subscriber (refCount)' },
        { id: 'manual', name: 'manual connect()' },
      ],
    },
    resetAxis('reset-refcount', 'Reset on refCount zero'),
    resetAxis('reset-complete', 'Reset on complete'),
    resetAxis('reset-error', 'Reset on error'),
  ],
  notes: [
    'shareReplay is share with a ReplaySubject connector and specific reset defaults.',
    'The classic "shareReplay never unsubscribes" pitfall is the coordinate reset-refcount: off.',
  ],
};

export const sharingMappings: OperatorMapping[] = [
  { operator: 'share', familyId: 'sharing', status: 'current', coordinates: { connector: ['subject', 'custom'], connection: 'auto', 'reset-refcount': ['on', 'off', 'dynamic'], 'reset-complete': ['on', 'off', 'dynamic'], 'reset-error': ['on', 'off', 'dynamic'] } },
  { operator: 'shareReplay', familyId: 'sharing', status: 'current', coordinates: { connector: 'replay', connection: 'auto', 'reset-refcount': ['on', 'off'], 'reset-complete': 'off', 'reset-error': 'on' }, notes: 'reset-refcount defaults to off unless { refCount: true }' },
  { operator: 'connectable', familyId: 'sharing', status: 'current', coordinates: { connector: ['subject', 'custom'], connection: 'manual' } },
  { operator: 'connect', familyId: 'sharing', status: 'current', coordinates: { connector: ['subject', 'custom'], connection: 'manual' }, notes: 'scoped multicast of the source inside one pipe' },
  { operator: 'multicast', familyId: 'sharing', status: 'deprecated', replacedBy: 'share({ connector }) / connectable', coordinates: { connector: 'custom', connection: 'manual' } },
  { operator: 'publish', familyId: 'sharing', status: 'deprecated', replacedBy: 'share() / connectable', coordinates: { connector: 'subject', connection: 'manual' } },
  { operator: 'publishBehavior', familyId: 'sharing', status: 'deprecated', replacedBy: 'connectable with BehaviorSubject', coordinates: { connector: 'custom', connection: 'manual' } },
  { operator: 'publishLast', familyId: 'sharing', status: 'deprecated', replacedBy: 'connectable with AsyncSubject', coordinates: { connector: 'custom', connection: 'manual' } },
  { operator: 'publishReplay', familyId: 'sharing', status: 'deprecated', replacedBy: 'shareReplay', coordinates: { connector: 'replay', connection: 'manual' } },
  { operator: 'refCount', familyId: 'sharing', status: 'deprecated', replacedBy: 'share()', coordinates: { connection: 'auto' } },
];
