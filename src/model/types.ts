/**
 * Data model for RxJS Operator Trees.
 *
 * Every family has exactly two conceptual branches:
 *  - INVARIANT: statements that are always true for every member
 *  - VARIANTS:  independent axes, each offering explicit variants
 *
 * A concrete behavior = invariant + one variant per applicable axis.
 * Operator mappings assign RxJS API names to those coordinates.
 */

export type MappingStatus = 'current' | 'deprecated';

export interface Variant {
  id: string;
  name: string;
  /** Temporal glyph where meaningful, e.g. "v------" */
  glyph?: string;
  description?: string;
}

export interface Axis {
  id: string;
  name: string;
  /** The behavioral question this axis answers. */
  question?: string;
  variants: Variant[];
}

export interface OperatorFamily {
  id: string;
  name: string;
  /** Display grouping, e.g. the five timing families share "Timing". */
  category: string;
  invariants: string[];
  axes: Axis[];
  notes?: string[];
}

/**
 * Coordinates map axis id -> variant id(s).
 * An array means the operator covers several variants of that axis
 * (chosen per call via arguments/config). Omitted axes do not apply.
 */
export type Coordinates = Record<string, string | string[]>;

export interface OperatorMapping {
  /** Export name in rxjs / rxjs sub-entry points. */
  operator: string;
  familyId: string;
  coordinates: Coordinates;
  status: MappingStatus;
  /** For deprecated operators: the current expression of the same coordinates. */
  replacedBy?: string;
  notes?: string;
}

export interface Exclusion {
  name: string;
  reason: string;
}
