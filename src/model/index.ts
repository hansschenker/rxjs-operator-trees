import type { Exclusion, OperatorFamily, OperatorMapping } from './types.ts';
import { selection, selectionMappings, sourceSelection, sourceSelectionMappings } from './families/selection.ts';
import { transformation, transformationMappings } from './families/transformation.ts';
import { accumulation, accumulationMappings } from './families/accumulation.ts';
import { grouping, groupingMappings } from './families/grouping.ts';
import { timingFamilies, timingMappings } from './families/timing.ts';
import { flattening, flatteningMappings } from './families/flattening.ts';
import { combining, combiningMappings } from './families/combining.ts';
import { sharing, sharingMappings } from './families/sharing.ts';
import { errorFamilies, errorMappings } from './families/error.ts';
import { creation, creationMappings } from './families/creation.ts';
import { utilityFamilies, utilityMappings } from './families/utility.ts';

export type * from './types.ts';

export const ALL_FAMILIES: OperatorFamily[] = [
  selection,
  sourceSelection,
  transformation,
  accumulation,
  grouping,
  ...timingFamilies,
  flattening,
  combining,
  sharing,
  ...errorFamilies,
  creation,
  ...utilityFamilies,
];

export const ALL_MAPPINGS: OperatorMapping[] = [
  ...selectionMappings,
  ...sourceSelectionMappings,
  ...transformationMappings,
  ...accumulationMappings,
  ...groupingMappings,
  ...timingMappings,
  ...flatteningMappings,
  ...combiningMappings,
  ...sharingMappings,
  ...errorMappings,
  ...creationMappings,
  ...utilityMappings,
];

/**
 * rxjs exports that are deliberately NOT operator behaviors:
 * classes, error types, scheduler instances, and consumption utilities.
 */
export const EXCLUDED_EXPORTS: Exclusion[] = [
  ...[
    'Observable',
    'Subject',
    'BehaviorSubject',
    'ReplaySubject',
    'AsyncSubject',
    'ConnectableObservable',
    'Subscriber',
    'Subscription',
    'Scheduler',
    'VirtualTimeScheduler',
    'VirtualAction',
    'Notification',
    'NotificationKind',
    'WebSocketSubject',
    'AjaxResponse',
  ].map((name) => ({ name, reason: 'class / machinery, not an operator behavior' })),
  ...[
    'ArgumentOutOfRangeError',
    'EmptyError',
    'NotFoundError',
    'ObjectUnsubscribedError',
    'SequenceError',
    'TimeoutError',
    'UnsubscriptionError',
    'AjaxError',
    'AjaxTimeoutError',
  ].map((name) => ({ name, reason: 'error class' })),
  ...[
    'asyncScheduler',
    'async',
    'asapScheduler',
    'asap',
    'queueScheduler',
    'queue',
    'animationFrameScheduler',
    'animationFrame',
  ].map((name) => ({ name, reason: 'scheduler instance' })),
  ...[
    'pipe',
    'noop',
    'identity',
    'isObservable',
    'config',
    'observable',
    'firstValueFrom',
    'lastValueFrom',
  ].map((name) => ({ name, reason: 'utility / consumption, not stream behavior' })),
];

export function familyById(id: string): OperatorFamily | undefined {
  return ALL_FAMILIES.find((f) => f.id === id);
}

export function mappingsForFamily(familyId: string): OperatorMapping[] {
  return ALL_MAPPINGS.filter((m) => m.familyId === familyId);
}

export function mappingForOperator(operator: string): OperatorMapping | undefined {
  return ALL_MAPPINGS.find((m) => m.operator === operator);
}
