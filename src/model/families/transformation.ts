import type { OperatorFamily, OperatorMapping } from '../types.ts';

export const transformation: OperatorFamily = {
  id: 'transformation',
  name: 'Transformation',
  category: 'Transformation',
  invariants: [
    'exactly one output value per source value (1:1 cardinality)',
    'output timing equals source timing',
    'each output is a pure projection of (value, index)',
  ],
  axes: [
    {
      id: 'projection',
      name: 'Projection target',
      question: 'What is each value projected to?',
      variants: [
        { id: 'computed', name: 'computed value' },
        { id: 'constant', name: 'constant' },
        { id: 'property-path', name: 'property path' },
        { id: 'time-metadata', name: 'time metadata attached' },
      ],
    },
  ],
  notes: [
    'map is almost pure invariant — its only variant is the projection function itself.',
  ],
};

export const transformationMappings: OperatorMapping[] = [
  { operator: 'map', familyId: 'transformation', status: 'current', coordinates: { projection: 'computed' } },
  { operator: 'timestamp', familyId: 'transformation', status: 'current', coordinates: { projection: 'time-metadata' }, notes: 'map preset: v => ({ value: v, timestamp })' },
  { operator: 'timeInterval', familyId: 'transformation', status: 'current', coordinates: { projection: 'time-metadata' }, notes: 'map preset: v => ({ value: v, interval since previous })' },
  { operator: 'mapTo', familyId: 'transformation', status: 'deprecated', replacedBy: 'map(() => value)', coordinates: { projection: 'constant' } },
  { operator: 'pluck', familyId: 'transformation', status: 'deprecated', replacedBy: 'map(v => v.key)', coordinates: { projection: 'property-path' } },
];
