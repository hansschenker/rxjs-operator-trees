import type { OperatorFamily, OperatorMapping } from '../types.ts';

export const selection: OperatorFamily = {
  id: 'selection',
  name: 'Selection',
  category: 'Selection',
  invariants: [
    'every output value is a source value, passed through unchanged',
    'relative source order is preserved',
    'the output sequence is a sub-sequence of the input sequence',
    'the operator never creates values',
  ],
  axes: [
    {
      id: 'criterion',
      name: 'Criterion',
      question: 'What decides whether a value survives?',
      variants: [
        { id: 'count', name: 'count' },
        { id: 'predicate', name: 'predicate' },
        { id: 'uniqueness', name: 'uniqueness' },
        { id: 'position', name: 'index / position' },
        { id: 'notifier', name: 'external notifier' },
      ],
    },
    {
      id: 'polarity',
      name: 'Polarity',
      question: 'Keep or drop what the criterion selects?',
      variants: [
        { id: 'keep', name: 'keep' },
        { id: 'drop', name: 'drop' },
      ],
    },
    {
      id: 'anchor',
      name: 'Anchor',
      question: 'Where in the sequence does the criterion apply?',
      variants: [
        { id: 'front', name: 'front (leading region)' },
        { id: 'back', name: 'back (trailing region)' },
        { id: 'everywhere', name: 'everywhere' },
      ],
    },
    {
      id: 'empty',
      name: 'Empty policy',
      question: 'What happens when nothing was selected?',
      variants: [
        { id: 'silent', name: 'complete silently' },
        { id: 'default', name: 'emit a default value' },
        { id: 'error', name: 'error' },
      ],
    },
  ],
  notes: [
    'Back-anchored variants must buffer until the source completes.',
    'Front-anchored keep variants complete early once satisfied.',
  ],
};

export const selectionMappings: OperatorMapping[] = [
  { operator: 'take', familyId: 'selection', status: 'current', coordinates: { criterion: 'count', polarity: 'keep', anchor: 'front', empty: 'silent' } },
  { operator: 'takeLast', familyId: 'selection', status: 'current', coordinates: { criterion: 'count', polarity: 'keep', anchor: 'back', empty: 'silent' } },
  { operator: 'skip', familyId: 'selection', status: 'current', coordinates: { criterion: 'count', polarity: 'drop', anchor: 'front' } },
  { operator: 'skipLast', familyId: 'selection', status: 'current', coordinates: { criterion: 'count', polarity: 'drop', anchor: 'back' } },
  { operator: 'filter', familyId: 'selection', status: 'current', coordinates: { criterion: 'predicate', polarity: 'keep', anchor: 'everywhere', empty: 'silent' } },
  { operator: 'takeWhile', familyId: 'selection', status: 'current', coordinates: { criterion: 'predicate', polarity: 'keep', anchor: 'front', empty: 'silent' }, notes: 'inclusive flag decides whether the boundary value belongs to the kept region' },
  { operator: 'skipWhile', familyId: 'selection', status: 'current', coordinates: { criterion: 'predicate', polarity: 'drop', anchor: 'front' } },
  { operator: 'takeUntil', familyId: 'selection', status: 'current', coordinates: { criterion: 'notifier', polarity: 'keep', anchor: 'front', empty: 'silent' } },
  { operator: 'skipUntil', familyId: 'selection', status: 'current', coordinates: { criterion: 'notifier', polarity: 'drop', anchor: 'front' } },
  { operator: 'distinct', familyId: 'selection', status: 'current', coordinates: { criterion: 'uniqueness', polarity: 'keep', anchor: 'everywhere', empty: 'silent' }, notes: 'scope: entire history; optional key selector and flush notifier' },
  { operator: 'distinctUntilChanged', familyId: 'selection', status: 'current', coordinates: { criterion: 'uniqueness', polarity: 'keep', anchor: 'everywhere', empty: 'silent' }, notes: 'scope: adjacent values only' },
  { operator: 'distinctUntilKeyChanged', familyId: 'selection', status: 'current', coordinates: { criterion: 'uniqueness', polarity: 'keep', anchor: 'everywhere', empty: 'silent' }, notes: 'adjacent scope with a selected key' },
  { operator: 'first', familyId: 'selection', status: 'current', coordinates: { criterion: ['predicate', 'position'], polarity: 'keep', anchor: 'front', empty: ['default', 'error'] } },
  { operator: 'last', familyId: 'selection', status: 'current', coordinates: { criterion: ['predicate', 'position'], polarity: 'keep', anchor: 'back', empty: ['default', 'error'] } },
  { operator: 'elementAt', familyId: 'selection', status: 'current', coordinates: { criterion: 'position', polarity: 'keep', anchor: 'front', empty: ['default', 'error'] } },
  { operator: 'ignoreElements', familyId: 'selection', status: 'current', coordinates: { criterion: 'predicate', polarity: 'drop', anchor: 'everywhere' }, notes: 'drops every value; only the terminal notification survives' },
  { operator: 'defaultIfEmpty', familyId: 'selection', status: 'current', coordinates: { empty: 'default' }, notes: 'the empty-policy axis standalone' },
  { operator: 'throwIfEmpty', familyId: 'selection', status: 'current', coordinates: { empty: 'error' }, notes: 'the empty-policy axis standalone' },
  { operator: 'race', familyId: 'selection', status: 'current', coordinates: {}, notes: 'selection over SOURCES: the first source to emit wins, the others are dropped' },
  { operator: 'raceWith', familyId: 'selection', status: 'current', coordinates: {}, notes: 'operator form of race' },
];
