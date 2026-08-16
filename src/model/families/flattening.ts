import type { OperatorFamily, OperatorMapping } from '../types.ts';

export const flattening: OperatorFamily = {
  id: 'flattening',
  name: 'Flattening / Concurrency',
  category: 'Flattening',
  invariants: [
    'each source value maps to an inner Observable',
    'output values are inner values, unchanged',
    'the operator manages the lifetime of inner subscriptions',
  ],
  axes: [
    {
      id: 'overlap',
      name: 'Overlap policy',
      question: 'A new inner arrives while another is live — what happens?',
      variants: [
        { id: 'alongside', name: 'run alongside' },
        { id: 'queue', name: 'queue until a slot' },
        { id: 'kill-previous', name: 'kill the previous' },
        { id: 'drop-new', name: 'drop the newcomer' },
      ],
    },
    {
      id: 'concurrency',
      name: 'Concurrency limit',
      question: 'How many inners may be live at once?',
      variants: [
        { id: 'unbounded', name: 'unbounded' },
        { id: 'limited', name: 'n slots (n = 1 is queueing)' },
      ],
    },
    {
      id: 'input',
      name: 'Input form',
      question: 'Where do the inner Observables come from?',
      variants: [
        { id: 'project', name: 'project each value (*Map)' },
        { id: 'higher-order', name: 'source is higher-order (*All)' },
        { id: 'static-creation', name: 'static creation function' },
        { id: 'with-suffix', name: '*With operator suffix' },
      ],
    },
    {
      id: 'state',
      name: 'State across inners',
      question: 'Is an accumulator threaded through the inners?',
      variants: [
        { id: 'stateless', name: 'stateless' },
        { id: 'accumulating', name: 'accumulating' },
      ],
    },
    {
      id: 'recursion',
      name: 'Recursion',
      question: 'Does the output feed back as input?',
      variants: [
        { id: 'none', name: 'no' },
        { id: 'recursive', name: 'output re-enters as input' },
      ],
    },
  ],
  notes: [
    'concatMap(f) ≡ mergeMap(f, 1): queueing is the alongside policy with one slot.',
    'switch is the only policy that unsubscribes a live inner; exhaust the only one that never subscribes.',
  ],
};

export const flatteningMappings: OperatorMapping[] = [
  { operator: 'mergeMap', familyId: 'flattening', status: 'current', coordinates: { overlap: 'alongside', concurrency: ['unbounded', 'limited'], input: 'project', state: 'stateless', recursion: 'none' } },
  { operator: 'mergeAll', familyId: 'flattening', status: 'current', coordinates: { overlap: 'alongside', concurrency: ['unbounded', 'limited'], input: 'higher-order', state: 'stateless', recursion: 'none' } },
  { operator: 'concatMap', familyId: 'flattening', status: 'current', coordinates: { overlap: 'queue', concurrency: 'limited', input: 'project', state: 'stateless', recursion: 'none' } },
  { operator: 'concatAll', familyId: 'flattening', status: 'current', coordinates: { overlap: 'queue', concurrency: 'limited', input: 'higher-order', state: 'stateless', recursion: 'none' } },
  { operator: 'switchMap', familyId: 'flattening', status: 'current', coordinates: { overlap: 'kill-previous', input: 'project', state: 'stateless', recursion: 'none' } },
  { operator: 'switchAll', familyId: 'flattening', status: 'current', coordinates: { overlap: 'kill-previous', input: 'higher-order', state: 'stateless', recursion: 'none' } },
  { operator: 'exhaustMap', familyId: 'flattening', status: 'current', coordinates: { overlap: 'drop-new', input: 'project', state: 'stateless', recursion: 'none' } },
  { operator: 'exhaustAll', familyId: 'flattening', status: 'current', coordinates: { overlap: 'drop-new', input: 'higher-order', state: 'stateless', recursion: 'none' } },
  { operator: 'mergeScan', familyId: 'flattening', status: 'current', coordinates: { overlap: 'alongside', concurrency: ['unbounded', 'limited'], input: 'project', state: 'accumulating', recursion: 'none' } },
  { operator: 'switchScan', familyId: 'flattening', status: 'current', coordinates: { overlap: 'kill-previous', input: 'project', state: 'accumulating', recursion: 'none' } },
  { operator: 'expand', familyId: 'flattening', status: 'current', coordinates: { overlap: 'alongside', concurrency: ['unbounded', 'limited'], input: 'project', state: 'stateless', recursion: 'recursive' } },
  { operator: 'merge', familyId: 'flattening', status: 'current', coordinates: { overlap: 'alongside', concurrency: ['unbounded', 'limited'], input: 'static-creation', state: 'stateless', recursion: 'none' }, notes: 'mergeAll over a fixed list of sources' },
  { operator: 'mergeWith', familyId: 'flattening', status: 'current', coordinates: { overlap: 'alongside', concurrency: 'unbounded', input: 'with-suffix', state: 'stateless', recursion: 'none' } },
  { operator: 'concat', familyId: 'flattening', status: 'current', coordinates: { overlap: 'queue', concurrency: 'limited', input: 'static-creation', state: 'stateless', recursion: 'none' }, notes: 'concatAll over a fixed list of sources' },
  { operator: 'concatWith', familyId: 'flattening', status: 'current', coordinates: { overlap: 'queue', concurrency: 'limited', input: 'with-suffix', state: 'stateless', recursion: 'none' } },
  { operator: 'flatMap', familyId: 'flattening', status: 'deprecated', replacedBy: 'mergeMap', coordinates: { overlap: 'alongside', concurrency: ['unbounded', 'limited'], input: 'project', state: 'stateless', recursion: 'none' } },
  { operator: 'exhaust', familyId: 'flattening', status: 'deprecated', replacedBy: 'exhaustAll', coordinates: { overlap: 'drop-new', input: 'higher-order', state: 'stateless', recursion: 'none' } },
  { operator: 'mergeMapTo', familyId: 'flattening', status: 'deprecated', replacedBy: 'mergeMap(() => inner$)', coordinates: { overlap: 'alongside', concurrency: ['unbounded', 'limited'], input: 'project', state: 'stateless', recursion: 'none' } },
  { operator: 'concatMapTo', familyId: 'flattening', status: 'deprecated', replacedBy: 'concatMap(() => inner$)', coordinates: { overlap: 'queue', concurrency: 'limited', input: 'project', state: 'stateless', recursion: 'none' } },
  { operator: 'switchMapTo', familyId: 'flattening', status: 'deprecated', replacedBy: 'switchMap(() => inner$)', coordinates: { overlap: 'kill-previous', input: 'project', state: 'stateless', recursion: 'none' } },
];
