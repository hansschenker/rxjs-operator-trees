import { describe, expect, it } from 'vitest';
import * as rxjs from 'rxjs';
import * as rxjsOperators from 'rxjs/operators';
import * as rxjsAjax from 'rxjs/ajax';
import * as rxjsFetch from 'rxjs/fetch';
import * as rxjsWebSocket from 'rxjs/webSocket';
import { ALL_MAPPINGS, EXCLUDED_EXPORTS } from './index.ts';

/** Module-interop artifacts that are not real exports. */
const ARTIFACTS = new Set(['__esModule', 'default', 'module.exports']);

const exportNames = new Set(
  [rxjs, rxjsOperators, rxjsAjax, rxjsFetch, rxjsWebSocket]
    .flatMap((ns) => Object.keys(ns))
    .filter((name) => !ARTIFACTS.has(name)),
);

const mappedNames = ALL_MAPPINGS.map((m) => m.operator);
const excludedNames = new Set(EXCLUDED_EXPORTS.map((e) => e.name));

describe('coverage of the rxjs export surface', () => {
  it('maps every operator exactly once', () => {
    const seen = new Set<string>();
    const duplicates = mappedNames.filter((n) => (seen.has(n) ? true : (seen.add(n), false)));
    expect(duplicates).toEqual([]);
  });

  it('never maps and excludes the same name', () => {
    expect(mappedNames.filter((n) => excludedNames.has(n))).toEqual([]);
  });

  it('accounts for every rxjs export (mapped or deliberately excluded)', () => {
    const mapped = new Set(mappedNames);
    const unaccounted = [...exportNames].filter((n) => !mapped.has(n) && !excludedNames.has(n)).sort();
    expect(unaccounted).toEqual([]);
  });

  it('has no stale mapping or exclusion entries', () => {
    const stale = [...mappedNames, ...excludedNames].filter((n) => !exportNames.has(n)).sort();
    expect(stale).toEqual([]);
  });
});
