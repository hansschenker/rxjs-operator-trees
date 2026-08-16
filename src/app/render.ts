import { ALL_FAMILIES, ALL_MAPPINGS, familyById, mappingsForFamily } from '../model/index.ts';
import type { Axis, OperatorMapping } from '../model/types.ts';
import { el } from './dom.ts';
import { RECURRING_GROUPS } from './recurring.ts';
import { hashForRoute, parseHash } from './router.ts';
import { simulateAudit, simulateDebounce, simulateDelay, simulateSample, simulateThrottle } from './simulate.ts';
import type { Trace } from './simulate.ts';
import { renderTimeline } from './timeline.ts';
import { isCompleteSelection, matchingOperators, searchOperators, coversVariant } from './selector.ts';
import type { Selection } from './selector.ts';

interface AppState {
  view: 'family' | 'recurring';
  familyId: string;
  selection: Selection;
  pinned: string | null;
  query: string;
}

const LEGEND_ITEMS: Record<string, Array<[string, string]>> = {
  throttle: [
    ['lg-dot-in', 'source value'],
    ['lg-dot-in lg-dropped', 'suppressed (dropped)'],
    ['lg-win', 'throttle window'],
    ['lg-dot-out', 'emission'],
    ['lg-link', 'source → emission'],
  ],
  audit: [
    ['lg-dot-in', 'source value'],
    ['lg-dot-in lg-dropped', 'superseded'],
    ['lg-win', 'audit window (no restart)'],
    ['lg-dot-out', 'emission at close'],
    ['lg-link', 'source → emission'],
  ],
  debounce: [
    ['lg-dot-in', 'source value'],
    ['lg-dot-in lg-dropped', 'superseded'],
    ['lg-win', 'silence timer'],
    ['lg-win lg-cancel', 'restarted timer'],
    ['lg-dot-out', 'emission after full silence'],
    ['lg-link', 'source → emission'],
  ],
  sample: [
    ['lg-dot-in', 'source value'],
    ['lg-dot-in lg-dropped', 'never sampled'],
    ['lg-tick', 'sampling trigger'],
    ['lg-tick lg-missed', 'trigger, no new value'],
    ['lg-dot-out', 'snapshot'],
    ['lg-link', 'source → snapshot'],
  ],
  delay: [
    ['lg-dot-in', 'source value'],
    ['lg-win', 'displacement'],
    ['lg-dot-out', 'delayed delivery'],
    ['lg-link', 'source → delivery'],
  ],
};

const legendFor = (familyId: string): HTMLElement =>
  el(
    'div',
    { class: 'leg' },
    ...(LEGEND_ITEMS[familyId] ?? []).map(([glyph, label]) =>
      el('span', { class: 'leg-item' }, el('span', { class: glyph }), label),
    ),
  );

const formatCoordinates = (mapping: OperatorMapping): string =>
  Object.entries(mapping.coordinates)
    .map(([axis, v]) => `${axis}: ${Array.isArray(v) ? v.join(' | ') : v}`)
    .join('   ') || '(source-level behavior — see notes)';

export function renderApp(root: HTMLElement): void {
  const state: AppState = {
    view: 'family',
    familyId: ALL_FAMILIES[0].id,
    selection: {},
    pinned: null,
    query: '',
  };

  const content = el('div', { class: 'content' });

  const update = (partial: Partial<AppState>): void => {
    Object.assign(state, partial);
    renderContent();
  };

  const openFamily = (familyId: string, pinned: string | null = null): void => {
    update({ view: 'family', familyId, pinned, selection: {}, query: '' });
    searchInput.value = '';
  };

  const searchInput = el('input', {
    class: 'search',
    type: 'search',
    placeholder: 'Find an operator… (reverse lookup)',
    oninput: () => update({ query: searchInput.value }),
  });

  const header = el(
    'header',
    { class: 'header' },
    el('div', { class: 'brand' }, el('h1', {}, 'RxJS Operator Trees'), el('p', {}, 'invariant + variants = concrete behavior')),
    searchInput,
    el(
      'nav',
      { class: 'views' },
      el('button', { class: 'view-btn', onclick: () => update({ view: 'family', query: '' }) }, 'Families'),
      el('button', { class: 'view-btn', onclick: () => update({ view: 'recurring', query: '' }) }, 'Recurring axes'),
    ),
  );

  const hashForState = (): string =>
    hashForRoute(
      state.view === 'recurring'
        ? { view: 'recurring' }
        : { view: 'family', familyId: state.familyId, pinned: state.pinned },
    );

  const applyHash = (): void => {
    const route = parseHash(window.location.hash);
    if (route.view === 'recurring') update({ view: 'recurring', query: '' });
    else openFamily(route.familyId, route.pinned);
  };

  root.replaceChildren(header, content);
  window.addEventListener('hashchange', () => {
    if (window.location.hash !== hashForState()) applyHash();
  });
  applyHash();

  function renderContent(): void {
    if (state.query.trim() !== '') {
      content.replaceChildren(renderSearch());
      return;
    }
    content.replaceChildren(
      renderSidebar(),
      state.view === 'recurring' ? renderRecurring() : renderFamily(),
    );
    if (window.location.hash !== hashForState()) window.location.hash = hashForState();
  }

  function renderSidebar(): HTMLElement {
    const nav = el('aside', { class: 'sidebar' });
    let lastCategory = '';
    for (const family of ALL_FAMILIES) {
      if (family.category !== lastCategory) {
        lastCategory = family.category;
        nav.append(el('div', { class: 'category' }, family.category));
      }
      const active = state.view === 'family' && state.familyId === family.id;
      nav.append(
        el(
          'button',
          { class: `family-btn${active ? ' active' : ''}`, onclick: () => openFamily(family.id) },
          family.name,
        ),
      );
    }
    return nav;
  }

  function renderFamily(): HTMLElement {
    const family = familyById(state.familyId);
    if (!family) return el('main', { class: 'main' }, 'Unknown family');
    const mappings = mappingsForFamily(family.id);
    const pinnedMapping = state.pinned !== null ? mappings.find((m) => m.operator === state.pinned) : undefined;
    const matches = matchingOperators(mappings, state.selection);
    const complete = isCompleteSelection(family, state.selection);

    const invariants = el(
      'section',
      { class: 'card invariant' },
      el('h3', {}, 'INVARIANT'),
      el('p', { class: 'hint' }, 'always true for every member of this family'),
      el('ul', {}, ...family.invariants.map((line) => el('li', {}, line))),
    );

    const axes = el(
      'section',
      { class: 'card' },
      el('h3', {}, 'VARIANTS'),
      el('p', { class: 'hint' }, 'pick one variant per axis to resolve a concrete behavior'),
      ...family.axes.map((axis) => renderAxis(axis, pinnedMapping)),
      el('button', { class: 'clear', onclick: () => update({ selection: {}, pinned: null }) }, 'clear selection'),
    );

    const results = el(
      'section',
      { class: 'card results' },
      el('h3', {}, complete ? 'Concrete behavior' : 'Matching operators'),
      ...(matches.length === 0
        ? [
            el(
              'p',
              { class: 'hole' },
              complete
                ? 'No operator at these coordinates — a hole in the API surface. Compose it from the nearest neighbors.'
                : 'No operator matches this partial selection.',
            ),
          ]
        : matches.map((m) => renderOperatorCard(m))),
    );

    const notes =
      family.notes && family.notes.length > 0
        ? el('section', { class: 'card notes' }, el('h3', {}, 'What the tree explains'), el('ul', {}, ...family.notes.map((n) => el('li', {}, n))))
        : el('span', {});

    return el(
      'main',
      { class: 'main' },
      el('div', { class: 'family-head' }, el('h2', {}, family.name), el('span', { class: 'badge' }, family.category)),
      invariants,
      axes,
      temporalDiagram(family.id) ?? el('span', {}),
      results,
      notes,
    );
  }

  function temporalDiagram(familyId: string): HTMLElement | null {
    const sel = state.selection;
    const durVariant = (axisId: string): 'fixed' | 'dynamic' => (sel[axisId] === 'dynamic' ? 'dynamic' : 'fixed');
    let trace: Trace;
    let caption: string;
    switch (familyId) {
      case 'throttle': {
        const e = sel['edge'];
        const edge = e === 'trailing' || e === 'both' ? e : 'leading';
        const d = durVariant('duration');
        trace = simulateThrottle(d, edge);
        caption = `${d === 'fixed' ? 'throttleTime(5)' : 'throttle(v => d$)  — window length varies'} · ${edge} edge`;
        break;
      }
      case 'audit': {
        const d = durVariant('duration');
        trace = simulateAudit(d);
        caption = d === 'fixed' ? 'auditTime(5)' : 'audit(v => d$)  — window length varies';
        break;
      }
      case 'debounce': {
        const d = durVariant('duration');
        trace = simulateDebounce(d);
        caption = d === 'fixed' ? 'debounceTime(5)' : 'debounce(v => d$)  — silence length varies';
        break;
      }
      case 'sample': {
        const trigger = sel['trigger'] === 'notifier' ? 'notifier' : 'periodic';
        trace = simulateSample(trigger);
        caption = trigger === 'periodic' ? 'sampleTime(5)' : 'sample(notifier$)  — irregular triggers';
        break;
      }
      case 'delay': {
        const mode = sel['displacement'] === 'dynamic' ? 'dynamic' : 'relative';
        trace = simulateDelay(mode);
        caption = mode === 'relative' ? 'delay(5)' : 'delayWhen(v => timer(d(v)))  — note the reordering';
        break;
      }
      default:
        return null;
    }
    const host = el('div', { class: 'timeline-host' });
    const mount = (): void => host.replaceChildren(renderTimeline(trace));
    mount();
    return el(
      'section',
      { class: 'card timeline-card' },
      el('h3', {}, 'Temporal diagram — two layers'),
      el(
        'p',
        { class: 'hint' },
        'Observable layer: source values in, emissions out. Operator-control layer (ctl): the windows, timers and triggers between them. The diagram follows the selected variants.',
      ),
      el('p', { class: 'timeline-caption' }, el('code', {}, caption)),
      host,
      legendFor(familyId),
      el('button', { class: 'clear', onclick: mount }, 'replay'),
    );
  }

  function renderAxis(axis: Axis, pinnedMapping: OperatorMapping | undefined): HTMLElement {
    const chips = axis.variants.map((variant) => {
      const selected = state.selection[axis.id] === variant.id;
      const pinned = pinnedMapping !== undefined && coversVariant(pinnedMapping.coordinates, axis.id, variant.id);
      return el(
        'button',
        {
          class: `variant${selected ? ' selected' : ''}${pinned ? ' pinned' : ''}`,
          onclick: () =>
            update({
              selection: { ...state.selection, [axis.id]: selected ? null : variant.id },
              pinned: null,
            }),
        },
        variant.name,
        variant.glyph !== undefined ? el('span', { class: 'glyph' }, ` ${variant.glyph}`) : '',
      );
    });
    return el(
      'div',
      { class: 'axis' },
      el('div', { class: 'axis-name' }, axis.name, axis.question !== undefined ? el('span', { class: 'question' }, ` — ${axis.question}`) : ''),
      el('div', { class: 'chips' }, ...chips),
    );
  }

  function renderOperatorCard(mapping: OperatorMapping): HTMLElement {
    return el(
      'article',
      { class: 'op-card', onclick: () => update({ pinned: mapping.operator, selection: {} }) },
      el(
        'div',
        { class: 'op-head' },
        el('code', { class: 'op-name' }, mapping.operator),
        mapping.status === 'deprecated'
          ? el('span', { class: 'badge deprecated' }, `deprecated → ${mapping.replacedBy ?? ''}`)
          : el('span', {}),
      ),
      el('div', { class: 'op-coords' }, formatCoordinates(mapping)),
      mapping.notes !== undefined ? el('p', { class: 'op-notes' }, mapping.notes) : el('span', {}),
    );
  }

  function renderSearch(): HTMLElement {
    const hits = searchOperators(ALL_MAPPINGS, state.query);
    return el(
      'main',
      { class: 'main wide' },
      el('h2', {}, `Operators matching “${state.query.trim()}”`),
      ...(hits.length === 0
        ? [el('p', { class: 'hole' }, 'No operator with that name.')]
        : hits.map((m) => {
            const family = familyById(m.familyId);
            return el(
              'article',
              { class: 'op-card', onclick: () => openFamily(m.familyId, m.operator) },
              el(
                'div',
                { class: 'op-head' },
                el('code', { class: 'op-name' }, m.operator),
                el('span', { class: 'badge' }, family?.name ?? m.familyId),
                m.status === 'deprecated' ? el('span', { class: 'badge deprecated' }, 'deprecated') : el('span', {}),
              ),
              el('div', { class: 'op-coords' }, formatCoordinates(m)),
            );
          })),
    );
  }

  function renderRecurring(): HTMLElement {
    return el(
      'main',
      { class: 'main' },
      el('h2', {}, 'Recurring variant axes'),
      el('p', { class: 'hint' }, 'A small set of axes recurs across unrelated families — learn the axis once, understand dozens of operators.'),
      ...RECURRING_GROUPS.map((group) =>
        el(
          'section',
          { class: 'card' },
          el('h3', {}, group.title),
          el('p', { class: 'axis-meaning' }, group.meaning),
          el('p', { class: 'hint' }, group.description),
          ...group.members.map((member) => {
            const family = familyById(member.familyId);
            const axis = family?.axes.find((a) => a.id === member.axisId);
            if (!family || !axis) return el('span', {});
            return el(
              'button',
              { class: 'recurring-row', onclick: () => openFamily(family.id) },
              el('span', { class: 'row-family' }, `${family.name} › ${axis.name}`),
              el('span', { class: 'row-variants' }, axis.variants.map((v) => v.name).join('  ·  ')),
            );
          }),
        ),
      ),
    );
  }
}
