import { describe, expect, it } from 'vitest';
import { familyById, mappingsForFamily } from '../model/index.ts';
import { coversVariant, isCompleteSelection, matchingOperators, searchOperators } from './selector.ts';

const selectionFamily = familyById('selection');
const selectionMappings = mappingsForFamily('selection');
const names = (list: { operator: string }[]): string[] => list.map((m) => m.operator);

describe('coversVariant', () => {
  it('matches single and array coordinates', () => {
    expect(coversVariant({ edge: 'leading' }, 'edge', 'leading')).toBe(true);
    expect(coversVariant({ edge: ['leading', 'trailing'] }, 'edge', 'trailing')).toBe(true);
    expect(coversVariant({ edge: 'leading' }, 'edge', 'trailing')).toBe(false);
    expect(coversVariant({}, 'edge', 'leading')).toBe(false);
  });
});

describe('matchingOperators', () => {
  it('resolves count × keep × front to take', () => {
    const matches = names(
      matchingOperators(selectionMappings, { criterion: 'count', polarity: 'keep', anchor: 'front' }),
    );
    expect(matches).toContain('take');
    expect(matches).not.toContain('takeLast');
    expect(matches).not.toContain('skip');
  });

  it('ignores unconstrained axes (null)', () => {
    const matches = names(matchingOperators(selectionMappings, { criterion: 'count', polarity: null }));
    expect(matches).toEqual(expect.arrayContaining(['take', 'takeLast', 'skip', 'skipLast']));
  });

  it('exposes holes in the API surface', () => {
    const matches = matchingOperators(selectionMappings, {
      criterion: 'notifier',
      polarity: 'keep',
      anchor: 'back',
      empty: 'silent',
    });
    expect(matches).toEqual([]);
  });

  it('finds throttleTime for the trailing edge via its array coordinate', () => {
    const matches = names(matchingOperators(mappingsForFamily('throttle'), { duration: 'fixed', edge: 'trailing' }));
    expect(matches).toEqual(['throttleTime']);
  });
});

describe('isCompleteSelection', () => {
  it('requires one variant per axis', () => {
    if (!selectionFamily) throw new Error('selection family missing');
    expect(isCompleteSelection(selectionFamily, { criterion: 'count' })).toBe(false);
    expect(
      isCompleteSelection(selectionFamily, {
        criterion: 'count',
        polarity: 'keep',
        anchor: 'front',
        empty: 'silent',
      }),
    ).toBe(true);
  });
});

describe('searchOperators', () => {
  it('ranks prefix matches before substring matches', () => {
    const hits = names(searchOperators(selectionMappings, 'last'));
    expect(hits[0]).toBe('last');
    expect(hits).toContain('takeLast');
    expect(hits).toContain('skipLast');
    expect(hits.indexOf('last')).toBeLessThan(hits.indexOf('takeLast'));
  });

  it('returns nothing for an empty query', () => {
    expect(searchOperators(selectionMappings, '  ')).toEqual([]);
  });
});
