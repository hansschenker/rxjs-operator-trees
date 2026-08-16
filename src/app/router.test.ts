import { describe, expect, it } from 'vitest';
import { hashForRoute, parseHash } from './router.ts';

describe('parseHash', () => {
  it('parses the recurring view', () => {
    expect(parseHash('#/recurring')).toEqual({ view: 'recurring' });
  });

  it('parses a family route', () => {
    expect(parseHash('#/family/throttle')).toEqual({ view: 'family', familyId: 'throttle', pinned: null });
  });

  it('parses an operator route to its family with the operator pinned', () => {
    expect(parseHash('#/op/switchMap')).toEqual({ view: 'family', familyId: 'flattening', pinned: 'switchMap' });
  });

  it('falls back to the first family for unknown or empty routes', () => {
    const fallback = { view: 'family', familyId: 'selection', pinned: null };
    expect(parseHash('')).toEqual(fallback);
    expect(parseHash('#/family/nope')).toEqual(fallback);
    expect(parseHash('#/op/nope')).toEqual(fallback);
    expect(parseHash('#garbage')).toEqual(fallback);
  });
});

describe('hashForRoute', () => {
  it('round-trips every route shape', () => {
    for (const hash of ['#/recurring', '#/family/throttle', '#/op/switchMap']) {
      expect(hashForRoute(parseHash(hash))).toBe(hash);
    }
  });
});
