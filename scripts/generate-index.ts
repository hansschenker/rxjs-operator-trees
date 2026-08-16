/**
 * Generates docs/RxJS-Operator-Coordinate-Index.md from the typed model.
 * Run with: node scripts/generate-index.ts   (Node 24 native type stripping)
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ALL_FAMILIES, ALL_MAPPINGS, EXCLUDED_EXPORTS, familyById } from '../src/model/index.ts';
import type { Coordinates } from '../src/model/types.ts';

const formatCoordinates = (coordinates: Coordinates): string => {
  const parts = Object.entries(coordinates).map(([axis, variant]) =>
    Array.isArray(variant) ? `${axis}: {${variant.join(' \\| ')}}` : `${axis}: ${variant}`,
  );
  return parts.length > 0 ? parts.join(', ') : '—';
};

const lines: string[] = [
  '# RxJS Operator Coordinate Index',
  '',
  '**Generated from `src/model/` — do not edit by hand.**',
  'Regenerate with `node scripts/generate-index.ts`.',
  '',
  'Every runtime export of `rxjs`, `rxjs/operators`, `rxjs/ajax`, `rxjs/fetch`,',
  'and `rxjs/webSocket` appears exactly once: either mapped onto Operator Tree',
  'coordinates (see `RxJS-Operator-Trees.md`) or deliberately excluded.',
  'A `{a \\| b}` coordinate means the operator covers several variants of that',
  'axis, chosen per call via arguments or config.',
  '',
];

const byCategory = new Map<string, typeof ALL_FAMILIES>();
for (const family of ALL_FAMILIES) {
  const list = byCategory.get(family.category) ?? [];
  list.push(family);
  byCategory.set(family.category, list);
}

for (const [category, families] of byCategory) {
  lines.push(`## ${category}`, '');
  for (const family of families) {
    const mappings = ALL_MAPPINGS.filter((m) => m.familyId === family.id).sort(
      (a, b) => a.status.localeCompare(b.status) || a.operator.localeCompare(b.operator),
    );
    lines.push(`### ${family.name}`, '');
    lines.push('| Operator | Status | Coordinates | Notes |');
    lines.push('| --- | --- | --- | --- |');
    for (const m of mappings) {
      const status = m.status === 'deprecated' ? `deprecated → \`${m.replacedBy ?? ''}\`` : 'current';
      lines.push(`| \`${m.operator}\` | ${status} | ${formatCoordinates(m.coordinates)} | ${m.notes ?? ''} |`);
    }
    lines.push('');
  }
}

lines.push('## Excluded exports', '');
lines.push('| Export | Reason |');
lines.push('| --- | --- |');
for (const e of [...EXCLUDED_EXPORTS].sort((a, b) => a.name.localeCompare(b.name))) {
  lines.push(`| \`${e.name}\` | ${e.reason} |`);
}
lines.push('');

const current = ALL_MAPPINGS.filter((m) => m.status === 'current').length;
const deprecated = ALL_MAPPINGS.filter((m) => m.status === 'deprecated').length;
lines.push('## Totals', '');
lines.push(`- Families: ${ALL_FAMILIES.length}`);
lines.push(`- Mapped operators: ${ALL_MAPPINGS.length} (${current} current, ${deprecated} deprecated)`);
lines.push(`- Excluded exports: ${EXCLUDED_EXPORTS.length}`);
lines.push('');

// familyById is exported for the app; use it here to fail fast on bad data.
for (const m of ALL_MAPPINGS) {
  if (!familyById(m.familyId)) throw new Error(`unknown family: ${m.familyId}`);
}

const out = fileURLToPath(new URL('../docs/RxJS-Operator-Coordinate-Index.md', import.meta.url));
writeFileSync(out, lines.join('\n'));
console.log(`wrote ${out}`);
