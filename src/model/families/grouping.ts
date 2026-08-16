import type { OperatorFamily, OperatorMapping } from '../types.ts';

export const grouping: OperatorFamily = {
  id: 'grouping',
  name: 'Grouping',
  category: 'Grouping',
  invariants: [
    'every source value is routed into one or more groups, unchanged',
    'the output emits the groups themselves',
    'a partition rule decides group membership',
  ],
  axes: [
    {
      id: 'materialization',
      name: 'Materialization',
      question: 'What form does a group take?',
      variants: [
        { id: 'array', name: 'array' },
        { id: 'inner-observable', name: 'inner Observable' },
        { id: 'tuple', name: 'fixed-size tuple' },
        { id: 'split', name: 'fixed set of output Observables' },
      ],
    },
    {
      id: 'rule',
      name: 'Partition rule',
      question: 'What decides membership?',
      variants: [
        { id: 'boundary', name: 'temporal boundaries' },
        { id: 'key', name: 'value key' },
      ],
    },
    {
      id: 'trigger',
      name: 'Boundary trigger',
      question: 'What kind of event is a boundary?',
      variants: [
        { id: 'count', name: 'count' },
        { id: 'duration', name: 'duration' },
        { id: 'notifier', name: 'notifier' },
      ],
    },
    {
      id: 'determination',
      name: 'Boundary determination',
      question: 'Fixed up front or selected dynamically?',
      variants: [
        { id: 'fixed', name: 'fixed / external' },
        { id: 'dynamic', name: 'dynamic / selected' },
      ],
    },
    {
      id: 'topology',
      name: 'Topology',
      question: 'How do groups relate on the timeline?',
      variants: [
        { id: 'contiguous', name: 'contiguous' },
        { id: 'overlapping', name: 'overlapping' },
        { id: 'gapped', name: 'gapped' },
      ],
    },
  ],
  notes: [
    'buffer and window share the same coordinate system; only materialization differs.',
    'The second argument of bufferCount/bufferTime is the topology axis in disguise.',
  ],
};

export const groupingMappings: OperatorMapping[] = [
  { operator: 'buffer', familyId: 'grouping', status: 'current', coordinates: { materialization: 'array', rule: 'boundary', trigger: 'notifier', determination: 'fixed', topology: 'contiguous' } },
  { operator: 'bufferCount', familyId: 'grouping', status: 'current', coordinates: { materialization: 'array', rule: 'boundary', trigger: 'count', determination: 'fixed', topology: ['contiguous', 'overlapping', 'gapped'] } },
  { operator: 'bufferTime', familyId: 'grouping', status: 'current', coordinates: { materialization: 'array', rule: 'boundary', trigger: 'duration', determination: 'fixed', topology: ['contiguous', 'overlapping', 'gapped'] } },
  { operator: 'bufferToggle', familyId: 'grouping', status: 'current', coordinates: { materialization: 'array', rule: 'boundary', trigger: 'notifier', determination: 'dynamic', topology: ['contiguous', 'overlapping', 'gapped'] }, notes: 'independent open and close boundaries' },
  { operator: 'bufferWhen', familyId: 'grouping', status: 'current', coordinates: { materialization: 'array', rule: 'boundary', trigger: 'notifier', determination: 'dynamic', topology: 'contiguous' } },
  { operator: 'window', familyId: 'grouping', status: 'current', coordinates: { materialization: 'inner-observable', rule: 'boundary', trigger: 'notifier', determination: 'fixed', topology: 'contiguous' } },
  { operator: 'windowCount', familyId: 'grouping', status: 'current', coordinates: { materialization: 'inner-observable', rule: 'boundary', trigger: 'count', determination: 'fixed', topology: ['contiguous', 'overlapping', 'gapped'] } },
  { operator: 'windowTime', familyId: 'grouping', status: 'current', coordinates: { materialization: 'inner-observable', rule: 'boundary', trigger: 'duration', determination: 'fixed', topology: ['contiguous', 'overlapping', 'gapped'] } },
  { operator: 'windowToggle', familyId: 'grouping', status: 'current', coordinates: { materialization: 'inner-observable', rule: 'boundary', trigger: 'notifier', determination: 'dynamic', topology: ['contiguous', 'overlapping', 'gapped'] } },
  { operator: 'windowWhen', familyId: 'grouping', status: 'current', coordinates: { materialization: 'inner-observable', rule: 'boundary', trigger: 'notifier', determination: 'dynamic', topology: 'contiguous' } },
  { operator: 'groupBy', familyId: 'grouping', status: 'current', coordinates: { materialization: 'inner-observable', rule: 'key', determination: 'dynamic' }, notes: 'groups interleave instead of tiling the timeline; duration selector = dynamic group lifetime' },
  { operator: 'pairwise', familyId: 'grouping', status: 'current', coordinates: { materialization: 'tuple', rule: 'boundary', trigger: 'count', determination: 'fixed', topology: 'overlapping' }, notes: 'bufferCount(2, 1) materialized as a tuple' },
  { operator: 'partition', familyId: 'grouping', status: 'current', coordinates: { materialization: 'split', rule: 'key' }, notes: 'boolean key; returns exactly two Observables' },
];
