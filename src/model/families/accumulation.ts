import type { OperatorFamily, OperatorMapping } from '../types.ts';

export const accumulation: OperatorFamily = {
  id: 'accumulation',
  name: 'Accumulation',
  category: 'State',
  invariants: [
    'holds an accumulator for the lifetime of the subscription',
    'every source value causes a transition acc = f(acc, value, index)',
    'outputs derive from the accumulator',
  ],
  axes: [
    {
      id: 'cadence',
      name: 'Emission cadence',
      question: 'When is the accumulator emitted?',
      variants: [
        { id: 'every-transition', name: 'every transition' },
        { id: 'on-completion', name: 'only at completion' },
      ],
    },
    {
      id: 'seed',
      name: 'Seed',
      question: 'Where does the initial accumulator come from?',
      variants: [
        { id: 'explicit', name: 'explicit seed value' },
        { id: 'first-value', name: 'first source value acts as seed' },
      ],
    },
    {
      id: 'fn',
      name: 'Accumulation function',
      question: 'Free function or preset?',
      variants: [
        { id: 'free', name: 'free' },
        { id: 'array-append', name: 'preset: append to array' },
        { id: 'counter', name: 'preset: counter' },
        { id: 'comparator-keep', name: 'preset: keep by comparator' },
      ],
    },
  ],
  notes: ['reduce = scan + last — the cadence axis is the only difference.'],
};

export const accumulationMappings: OperatorMapping[] = [
  { operator: 'scan', familyId: 'accumulation', status: 'current', coordinates: { cadence: 'every-transition', seed: ['explicit', 'first-value'], fn: 'free' } },
  { operator: 'reduce', familyId: 'accumulation', status: 'current', coordinates: { cadence: 'on-completion', seed: ['explicit', 'first-value'], fn: 'free' }, notes: 'errors on an empty source without a seed' },
  { operator: 'toArray', familyId: 'accumulation', status: 'current', coordinates: { cadence: 'on-completion', seed: 'explicit', fn: 'array-append' } },
  { operator: 'count', familyId: 'accumulation', status: 'current', coordinates: { cadence: 'on-completion', seed: 'explicit', fn: 'counter' } },
  { operator: 'max', familyId: 'accumulation', status: 'current', coordinates: { cadence: 'on-completion', seed: 'first-value', fn: 'comparator-keep' } },
  { operator: 'min', familyId: 'accumulation', status: 'current', coordinates: { cadence: 'on-completion', seed: 'first-value', fn: 'comparator-keep' } },
];
