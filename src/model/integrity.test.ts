import { describe, expect, it } from 'vitest';
import { ALL_FAMILIES, ALL_MAPPINGS, familyById } from './index.ts';

describe('model integrity', () => {
  it('has unique family ids', () => {
    const ids = ALL_FAMILIES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique axis ids per family and unique variant ids per axis', () => {
    for (const family of ALL_FAMILIES) {
      const axisIds = family.axes.map((a) => a.id);
      expect(new Set(axisIds).size, `family ${family.id}`).toBe(axisIds.length);
      for (const axis of family.axes) {
        const variantIds = axis.variants.map((v) => v.id);
        expect(new Set(variantIds).size, `axis ${family.id}.${axis.id}`).toBe(variantIds.length);
      }
    }
  });

  it('gives every family at least one invariant, and every axis at least two variants', () => {
    for (const family of ALL_FAMILIES) {
      expect(family.invariants.length, `family ${family.id}`).toBeGreaterThan(0);
      for (const axis of family.axes) {
        expect(axis.variants.length, `axis ${family.id}.${axis.id}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('resolves every mapping coordinate to an existing axis and variant', () => {
    for (const mapping of ALL_MAPPINGS) {
      const family = familyById(mapping.familyId);
      expect(family, `${mapping.operator} → unknown family ${mapping.familyId}`).toBeDefined();
      if (!family) continue;
      for (const [axisId, variantIds] of Object.entries(mapping.coordinates)) {
        const axis = family.axes.find((a) => a.id === axisId);
        expect(axis, `${mapping.operator}: unknown axis ${axisId}`).toBeDefined();
        if (!axis) continue;
        const ids = Array.isArray(variantIds) ? variantIds : [variantIds];
        for (const id of ids) {
          expect(
            axis.variants.some((v) => v.id === id),
            `${mapping.operator}: unknown variant ${axisId}=${id}`,
          ).toBe(true);
        }
      }
    }
  });

  it('gives every family at least one mapped operator', () => {
    for (const family of ALL_FAMILIES) {
      expect(
        ALL_MAPPINGS.some((m) => m.familyId === family.id),
        `family ${family.id} has no operators`,
      ).toBe(true);
    }
  });
});
