import type { OperatorFamily, OperatorMapping } from '../types.ts';

export const resubscription: OperatorFamily = {
  id: 'resubscription',
  name: 'Resubscription',
  category: 'Error / Repetition',
  invariants: [
    'reacts to a terminal notification from the source',
    'may subscribe to the SAME source again',
    'values before the terminal pass through unchanged',
  ],
  axes: [
    {
      id: 'trigger',
      name: 'Terminal trigger',
      question: 'Which terminal causes a resubscribe?',
      variants: [
        { id: 'error', name: 'error' },
        { id: 'complete', name: 'complete' },
      ],
    },
    {
      id: 'count',
      name: 'Count',
      question: 'How often?',
      variants: [
        { id: 'infinite', name: 'infinite' },
        { id: 'fixed', name: 'fixed n' },
      ],
    },
    {
      id: 'delay',
      name: 'Delay before resubscribing',
      question: 'Wait before trying again?',
      variants: [
        { id: 'none', name: 'none' },
        { id: 'fixed', name: 'fixed duration' },
        { id: 'dynamic', name: 'dynamic notifier' },
      ],
    },
    {
      id: 'counter-reset',
      name: 'Counter reset',
      question: 'Does a success reset the attempt counter?',
      variants: [
        { id: 'on', name: 'yes (resetOnSuccess)' },
        { id: 'off', name: 'no' },
      ],
    },
  ],
};

export const substitution: OperatorFamily = {
  id: 'substitution',
  name: 'Substitution',
  category: 'Error / Repetition',
  invariants: [
    'reacts to a terminal notification from the source',
    'continues with a REPLACEMENT Observable',
  ],
  axes: [
    {
      id: 'trigger',
      name: 'Terminal trigger',
      question: 'Which terminal causes the substitution?',
      variants: [
        { id: 'error', name: 'error' },
        { id: 'any-terminal', name: 'any terminal (errors swallowed)' },
      ],
    },
    {
      id: 'replacement',
      name: 'Replacement',
      question: 'What replaces the source?',
      variants: [
        { id: 'selected', name: 'selected from the error / given list' },
        { id: 'source-itself', name: 'the source itself (caught$)' },
      ],
    },
  ],
  notes: [
    'Resubscription is substitution where the replacement is the source itself.',
  ],
};

export const errorFamilies: OperatorFamily[] = [resubscription, substitution];

export const errorMappings: OperatorMapping[] = [
  { operator: 'retry', familyId: 'resubscription', status: 'current', coordinates: { trigger: 'error', count: ['infinite', 'fixed'], delay: ['none', 'fixed', 'dynamic'], 'counter-reset': ['on', 'off'] } },
  { operator: 'repeat', familyId: 'resubscription', status: 'current', coordinates: { trigger: 'complete', count: ['infinite', 'fixed'], delay: ['none', 'fixed', 'dynamic'] } },
  { operator: 'retryWhen', familyId: 'resubscription', status: 'deprecated', replacedBy: 'retry({ delay: (error, count) => notifier$ })', coordinates: { trigger: 'error', count: 'infinite', delay: 'dynamic' } },
  { operator: 'repeatWhen', familyId: 'resubscription', status: 'deprecated', replacedBy: 'repeat({ delay: count => notifier$ })', coordinates: { trigger: 'complete', count: 'infinite', delay: 'dynamic' } },
  { operator: 'catchError', familyId: 'substitution', status: 'current', coordinates: { trigger: 'error', replacement: ['selected', 'source-itself'] } },
  { operator: 'onErrorResumeNext', familyId: 'substitution', status: 'current', coordinates: { trigger: 'any-terminal', replacement: 'selected' }, notes: 'exists as static creation function and as operator' },
  { operator: 'onErrorResumeNextWith', familyId: 'substitution', status: 'current', coordinates: { trigger: 'any-terminal', replacement: 'selected' } },
];
