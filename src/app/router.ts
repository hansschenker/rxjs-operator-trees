import { ALL_FAMILIES, familyById, mappingForOperator } from '../model/index.ts';

export interface FamilyRoute {
  view: 'family';
  familyId: string;
  pinned: string | null;
}

export interface RecurringRoute {
  view: 'recurring';
}

export type Route = FamilyRoute | RecurringRoute;

/**
 * Hash routes:
 *   #/recurring        the recurring-axes list
 *   #/family/<id>      a family's tree
 *   #/op/<name>        the operator's family with its coordinates pinned
 * Anything unknown falls back to the first family.
 */
export function parseHash(hash: string): Route {
  if (hash === '#/recurring') return { view: 'recurring' };
  if (hash.startsWith('#/op/')) {
    const mapping = mappingForOperator(decodeURIComponent(hash.slice('#/op/'.length)));
    if (mapping) return { view: 'family', familyId: mapping.familyId, pinned: mapping.operator };
  }
  if (hash.startsWith('#/family/')) {
    const familyId = decodeURIComponent(hash.slice('#/family/'.length));
    if (familyById(familyId)) return { view: 'family', familyId, pinned: null };
  }
  return { view: 'family', familyId: ALL_FAMILIES[0].id, pinned: null };
}

export function hashForRoute(route: Route): string {
  if (route.view === 'recurring') return '#/recurring';
  return route.pinned !== null ? `#/op/${route.pinned}` : `#/family/${route.familyId}`;
}
