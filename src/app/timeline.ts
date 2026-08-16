import type { Link, Span, Trace } from './simulate.ts';
import { svgEl } from './svg.ts';

const W = 760;
const PAD = 30;
const SWEEP = '5s';

let clipCounter = 0;

/** Greedy interval coloring so overlapping spans (delay) stack into lanes. */
function assignLanes(spans: Span[]): number {
  const laneEnds: number[] = [];
  for (const span of [...spans].sort((a, b) => a.start - b.start)) {
    let lane = laneEnds.findIndex((end) => end <= span.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    span.lane = lane;
    laneEnds[lane] = span.end;
  }
  return Math.max(1, laneEnds.length);
}

/**
 * Renders a trace as a two-layer temporal diagram:
 * input track (observable layer), control track (operator-control layer:
 * windows, timers, ticks), output track (observable layer). A sweep
 * animation reveals the timeline left to right; remount to replay.
 */
export function renderTimeline(trace: Trace): SVGSVGElement {
  const lanes = assignLanes(trace.spans);
  const laneH = 18;
  const yIn = 32;
  const ctrlTop = 54;
  const ctrlBottom = ctrlTop + lanes * laneH;
  const yOut = ctrlBottom + 28;
  const yAxis = yOut + 22;
  const H = yAxis + 20;
  const x = (t: number): number => PAD + (t / trace.length) * (W - 2 * PAD);

  const clipId = `tl-clip-${++clipCounter}`;
  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'timeline',
    role: 'img',
    'aria-label': 'temporal diagram: input values, operator-control layer, output values',
  });

  svg.append(
    svgEl(
      'defs',
      {},
      svgEl(
        'clipPath',
        { id: clipId },
        svgEl(
          'rect',
          { x: '0', y: '0', width: '0', height: String(H) },
          svgEl('animate', { attributeName: 'width', from: '0', to: String(W), dur: SWEEP, fill: 'freeze' }),
        ),
      ),
    ),
  );

  for (let t = 0; t <= trace.length; t += 5) {
    svg.append(
      svgEl('line', { x1: String(x(t)), y1: '16', x2: String(x(t)), y2: String(yAxis), class: 'tl-grid' }),
      svgEl('text', { x: String(x(t)), y: String(yAxis + 14), class: 'tl-axis-text', 'text-anchor': 'middle' }, String(t)),
    );
  }
  svg.append(
    svgEl('text', { x: '2', y: String(yIn + 3), class: 'tl-track-label' }, 'in'),
    svgEl('text', { x: '2', y: String((ctrlTop + ctrlBottom) / 2 + 3), class: 'tl-track-label' }, 'ctl'),
    svgEl('text', { x: '2', y: String(yOut + 3), class: 'tl-track-label' }, 'out'),
  );

  const g = svgEl('g', { 'clip-path': `url(#${clipId})` });

  for (const span of trace.spans) {
    const width = Math.max(2, x(span.end) - x(span.start));
    g.append(
      svgEl('rect', {
        x: String(x(span.start)),
        y: String(ctrlTop + (span.lane ?? 0) * laneH + 2),
        width: String(width),
        height: String(laneH - 5),
        rx: '4',
        class: span.cancelled ? 'tl-span tl-span-cancelled' : 'tl-span',
      }),
    );
  }

  for (const t of trace.ticks) {
    const missed = trace.missedTicks.includes(t);
    g.append(
      svgEl('line', {
        x1: String(x(t)),
        y1: String(ctrlTop),
        x2: String(x(t)),
        y2: String(ctrlBottom),
        class: missed ? 'tl-tick tl-tick-missed' : 'tl-tick',
      }),
    );
    if (missed) g.append(svgEl('circle', { cx: String(x(t)), cy: String(ctrlTop - 5), r: '3', class: 'tl-missed-dot' }));
  }

  const links: Link[] = [...trace.links];
  for (const o of trace.outputs) if (o.sourceT !== undefined) links.push({ fromT: o.sourceT, toT: o.t });
  for (const link of links) {
    g.append(
      svgEl('line', {
        x1: String(x(link.fromT)),
        y1: String(yIn + 10),
        x2: String(x(link.toT)),
        y2: String(yOut - 10),
        class: 'tl-link',
      }),
    );
  }

  for (const m of trace.inputs) {
    g.append(
      svgEl('circle', { cx: String(x(m.t)), cy: String(yIn), r: '9', class: m.dropped ? 'tl-in tl-dropped' : 'tl-in' }),
      svgEl(
        'text',
        { x: String(x(m.t)), y: String(yIn + 3.5), class: m.dropped ? 'tl-in-label tl-dropped-label' : 'tl-in-label', 'text-anchor': 'middle' },
        m.label,
      ),
    );
  }

  for (const m of trace.outputs) {
    if (m.label.length > 1) {
      const pillW = m.label.length * 6.5 + 10;
      g.append(
        svgEl('rect', {
          x: String(x(m.t) - pillW / 2),
          y: String(yOut - 9),
          width: String(pillW),
          height: '18',
          rx: '9',
          class: 'tl-out',
        }),
        svgEl('text', { x: String(x(m.t)), y: String(yOut + 3.5), class: 'tl-out-label tl-out-label-wide', 'text-anchor': 'middle' }, m.label),
      );
    } else {
      g.append(
        svgEl('circle', { cx: String(x(m.t)), cy: String(yOut), r: '9', class: 'tl-out' }),
        svgEl('text', { x: String(x(m.t)), y: String(yOut + 3.5), class: 'tl-out-label', 'text-anchor': 'middle' }, m.label),
      );
    }
  }

  svg.append(g);

  svg.append(
    svgEl(
      'line',
      { x1: '0', y1: '14', x2: '0', y2: String(yAxis), class: 'tl-playhead' },
      svgEl('animateTransform', { attributeName: 'transform', type: 'translate', from: '0 0', to: `${W} 0`, dur: SWEEP, fill: 'freeze' }),
      svgEl('animate', { attributeName: 'opacity', values: '1;1;0', keyTimes: '0;0.96;1', dur: '5.2s', fill: 'freeze' }),
    ),
  );

  return svg;
}
