import { describe, expect, it } from 'vitest';
import { familyById } from '../model/index.ts';
import { RECURRING_GROUPS } from './recurring.ts';

describe('recurring axis groups', () => {
  it('has unique titles and non-empty meaning and description', () => {
    const titles = RECURRING_GROUPS.map((g) => g.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const group of RECURRING_GROUPS) {
      expect(group.meaning.length, group.title).toBeGreaterThan(0);
      expect(group.description.length, group.title).toBeGreaterThan(0);
      expect(group.members.length, group.title).toBeGreaterThan(0);
    }
  });

  it('resolves every member to an existing family and axis', () => {
    for (const group of RECURRING_GROUPS) {
      for (const member of group.members) {
        const family = familyById(member.familyId);
        expect(family, `${group.title}: unknown family ${member.familyId}`).toBeDefined();
        expect(
          family?.axes.some((axis) => axis.id === member.axisId),
          `${group.title}: unknown axis ${member.familyId}.${member.axisId}`,
        ).toBe(true);
      }
    }
  });
});
