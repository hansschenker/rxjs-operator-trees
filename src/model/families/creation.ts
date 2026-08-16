import type { OperatorFamily, OperatorMapping } from '../types.ts';

export const creation: OperatorFamily = {
  id: 'creation',
  name: 'Creation',
  category: 'Creation',
  invariants: [
    'there is no upstream source Observable',
    'values originate from non-observable material',
    'nothing happens until subscribe (one execution per subscriber)',
  ],
  axes: [
    {
      id: 'origin',
      name: 'Origin',
      question: 'Where do the values come from?',
      variants: [
        { id: 'literal', name: 'literal values' },
        { id: 'collection', name: 'existing collection / promise' },
        { id: 'iteration', name: 'iteration' },
        { id: 'clock', name: 'clock' },
        { id: 'event', name: 'event binding' },
        { id: 'lazy-factory', name: 'lazy factory' },
        { id: 'conditional', name: 'conditional' },
        { id: 'resource', name: 'external resource' },
        { id: 'callback', name: 'callback binding' },
      ],
    },
    {
      id: 'termination',
      name: 'Termination preset',
      question: 'Zero-value origins: which terminal remains?',
      variants: [
        { id: 'complete', name: 'complete immediately' },
        { id: 'never', name: 'never terminate' },
        { id: 'error', name: 'error immediately' },
      ],
    },
    {
      id: 'scheduling',
      name: 'Scheduling',
      question: 'Default execution or explicit scheduler?',
      variants: [
        { id: 'default', name: 'default (synchronous where possible)' },
        { id: 'explicit', name: 'explicit scheduler' },
      ],
    },
  ],
  notes: [
    'defer is the determination axis applied to creation itself; iif is defer with a boolean.',
    'EMPTY, NEVER and throwError are the degenerate corners of the origin axis.',
  ],
};

export const creationMappings: OperatorMapping[] = [
  { operator: 'of', familyId: 'creation', status: 'current', coordinates: { origin: 'literal', scheduling: 'default' } },
  { operator: 'from', familyId: 'creation', status: 'current', coordinates: { origin: 'collection', scheduling: ['default', 'explicit'] } },
  { operator: 'range', familyId: 'creation', status: 'current', coordinates: { origin: 'iteration', scheduling: ['default', 'explicit'] } },
  { operator: 'generate', familyId: 'creation', status: 'current', coordinates: { origin: 'iteration', scheduling: ['default', 'explicit'] } },
  { operator: 'interval', familyId: 'creation', status: 'current', coordinates: { origin: 'clock', scheduling: ['default', 'explicit'] } },
  { operator: 'timer', familyId: 'creation', status: 'current', coordinates: { origin: 'clock', scheduling: ['default', 'explicit'] }, notes: 'timer(0, ms) is interval(ms) without the initial wait' },
  { operator: 'animationFrames', familyId: 'creation', status: 'current', coordinates: { origin: 'clock' } },
  { operator: 'fromEvent', familyId: 'creation', status: 'current', coordinates: { origin: 'event' } },
  { operator: 'fromEventPattern', familyId: 'creation', status: 'current', coordinates: { origin: 'event' } },
  { operator: 'defer', familyId: 'creation', status: 'current', coordinates: { origin: 'lazy-factory' } },
  { operator: 'iif', familyId: 'creation', status: 'current', coordinates: { origin: 'conditional' } },
  { operator: 'using', familyId: 'creation', status: 'current', coordinates: { origin: 'resource' } },
  { operator: 'ajax', familyId: 'creation', status: 'current', coordinates: { origin: 'resource' }, notes: 'entry point rxjs/ajax' },
  { operator: 'fromFetch', familyId: 'creation', status: 'current', coordinates: { origin: 'resource' }, notes: 'entry point rxjs/fetch' },
  { operator: 'webSocket', familyId: 'creation', status: 'current', coordinates: { origin: 'resource' }, notes: 'entry point rxjs/webSocket' },
  { operator: 'bindCallback', familyId: 'creation', status: 'current', coordinates: { origin: 'callback' } },
  { operator: 'bindNodeCallback', familyId: 'creation', status: 'current', coordinates: { origin: 'callback' } },
  { operator: 'scheduled', familyId: 'creation', status: 'current', coordinates: { origin: 'collection', scheduling: 'explicit' } },
  { operator: 'EMPTY', familyId: 'creation', status: 'current', coordinates: { termination: 'complete' } },
  { operator: 'NEVER', familyId: 'creation', status: 'current', coordinates: { termination: 'never' } },
  { operator: 'throwError', familyId: 'creation', status: 'current', coordinates: { termination: 'error' } },
  { operator: 'empty', familyId: 'creation', status: 'deprecated', replacedBy: 'EMPTY', coordinates: { termination: 'complete' } },
  { operator: 'never', familyId: 'creation', status: 'deprecated', replacedBy: 'NEVER', coordinates: { termination: 'never' } },
  { operator: 'pairs', familyId: 'creation', status: 'deprecated', replacedBy: 'from(Object.entries(obj))', coordinates: { origin: 'collection' } },
];
