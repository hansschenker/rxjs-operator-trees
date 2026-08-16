import type { Coordinates, OperatorFamily, OperatorMapping } from '../model/types.ts';

/** One chosen variant per axis; null means the axis is unconstrained. */
export type Selection = Record<string, string | null>;

export function coversVariant(coordinates: Coordinates, axisId: string, variantId: string): boolean {
  const value = coordinates[axisId];
  if (value === undefined) return false;
  return Array.isArray(value) ? value.includes(variantId) : value === variantId;
}

export function matchesSelection(mapping: OperatorMapping, selection: Selection): boolean {
  return Object.entries(selection).every(
    ([axisId, variantId]) => variantId === null || coversVariant(mapping.coordinates, axisId, variantId),
  );
}

export function matchingOperators(mappings: OperatorMapping[], selection: Selection): OperatorMapping[] {
  return mappings.filter((mapping) => matchesSelection(mapping, selection));
}

export function isCompleteSelection(family: OperatorFamily, selection: Selection): boolean {
  return family.axes.every((axis) => selection[axis.id] != null);
}

export function searchOperators(mappings: OperatorMapping[], query: string): OperatorMapping[] {
  const q = query.trim().toLowerCase();
  if (q === '') return [];
  const starts = mappings.filter((m) => m.operator.toLowerCase().startsWith(q));
  const contains = mappings.filter(
    (m) => !m.operator.toLowerCase().startsWith(q) && m.operator.toLowerCase().includes(q),
  );
  return [...starts, ...contains];
}
