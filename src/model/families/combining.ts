import type { OperatorFamily, OperatorMapping } from '../types.ts';

export const combining: OperatorFamily = {
  id: 'combining',
  name: 'Combining',
  category: 'Combining',
  invariants: [
    'subscribes to several sources at once',
    'each output combines one value per source (one slot per source)',
    'source values fill slots unchanged',
  ],
  axes: [
    {
      id: 'trigger',
      name: 'Emission trigger',
      question: 'Which event fires an output?',
      variants: [
        { id: 'any-source', name: 'any source emits' },
        { id: 'primary', name: 'only the primary emits' },
        { id: 'full-tuple', name: 'a full tuple is available' },
        { id: 'completion', name: 'all sources complete' },
      ],
    },
    {
      id: 'alignment',
      name: 'Slot alignment',
      question: 'Which value fills each slot?',
      variants: [
        { id: 'latest', name: 'latest snapshot' },
        { id: 'indexed', name: 'index-aligned queue' },
        { id: 'final', name: 'final value' },
      ],
    },
    {
      id: 'input',
      name: 'Input form',
      question: 'How are the sources supplied?',
      variants: [
        { id: 'static-creation', name: 'static creation function' },
        { id: 'with-suffix', name: '*With operator suffix' },
        { id: 'higher-order', name: 'source is higher-order (*All)' },
        { id: 'operator', name: 'operator with extra sources' },
      ],
    },
  ],
  notes: [
    'withLatestFrom is combineLatest with a demoted trigger — one coordinate difference.',
    "zip's index alignment forces unbounded buffering of the faster source.",
    'race is NOT combining: it keeps one slot total — selection over sources.',
  ],
};

export const combiningMappings: OperatorMapping[] = [
  { operator: 'combineLatest', familyId: 'combining', status: 'current', coordinates: { trigger: 'any-source', alignment: 'latest', input: 'static-creation' } },
  { operator: 'combineLatestWith', familyId: 'combining', status: 'current', coordinates: { trigger: 'any-source', alignment: 'latest', input: 'with-suffix' } },
  { operator: 'combineLatestAll', familyId: 'combining', status: 'current', coordinates: { trigger: 'any-source', alignment: 'latest', input: 'higher-order' } },
  { operator: 'withLatestFrom', familyId: 'combining', status: 'current', coordinates: { trigger: 'primary', alignment: 'latest', input: 'operator' } },
  { operator: 'zip', familyId: 'combining', status: 'current', coordinates: { trigger: 'full-tuple', alignment: 'indexed', input: 'static-creation' } },
  { operator: 'zipWith', familyId: 'combining', status: 'current', coordinates: { trigger: 'full-tuple', alignment: 'indexed', input: 'with-suffix' } },
  { operator: 'zipAll', familyId: 'combining', status: 'current', coordinates: { trigger: 'full-tuple', alignment: 'indexed', input: 'higher-order' } },
  { operator: 'forkJoin', familyId: 'combining', status: 'current', coordinates: { trigger: 'completion', alignment: 'final', input: 'static-creation' } },
  { operator: 'combineAll', familyId: 'combining', status: 'deprecated', replacedBy: 'combineLatestAll', coordinates: { trigger: 'any-source', alignment: 'latest', input: 'higher-order' } },
];
