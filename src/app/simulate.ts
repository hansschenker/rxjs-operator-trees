/**
 * Pure simulators for the temporal families. Every simulator runs the SAME
 * input scenario, so the operators are directly comparable: identical
 * observable layer in, different operator-control layer, different output.
 *
 * The semantics implemented here are the conceptual models specified by the
 * trees in docs/RxJS-Operator-Trees.md §5.
 */

export type DurationVariant = 'fixed' | 'dynamic';
export type ThrottleEdge = 'leading' | 'trailing' | 'both';
export type SampleTrigger = 'periodic' | 'notifier';
export type DelayMode = 'relative' | 'dynamic';

export interface Marble {
  t: number;
  label: string;
  /** For outputs: the time of the source value that produced this emission. */
  sourceT?: number;
  /** For inputs: this value never reaches the output. */
  dropped?: boolean;
}

export interface Span {
  start: number;
  end: number;
  /** A timer that was cut short by a newer value (debounce restarts). */
  cancelled?: boolean;
  /** Render lane, assigned by the renderer for overlapping spans. */
  lane?: number;
}

export interface Trace {
  length: number;
  inputs: Marble[];
  spans: Span[];
  ticks: number[];
  missedTicks: number[];
  outputs: Marble[];
}

/** Shared input: a burst, a lone value, then a second burst. */
const SCENARIO: Marble[] = [
  { t: 0, label: 'a' },
  { t: 2, label: 'b' },
  { t: 4, label: 'c' },
  { t: 11, label: 'd' },
  { t: 16, label: 'e' },
  { t: 17.5, label: 'f' },
  { t: 19, label: 'g' },
];

export const TIMELINE_LENGTH = 26;

const FIXED = 5;
/** Per-index durations for the dynamic/selected variants. */
const VARIED = [5, 8, 2, 6, 3, 7, 4];

const freshInputs = (): Marble[] => SCENARIO.map((m) => ({ ...m }));

const durationAt = (variant: DurationVariant, index: number): number =>
  variant === 'fixed' ? FIXED : VARIED[index % VARIED.length];

const makeTrace = (
  inputs: Marble[],
  spans: Span[],
  outputs: Marble[],
  ticks: number[] = [],
  missedTicks: number[] = [],
): Trace => {
  const sources = new Set(outputs.map((o) => o.sourceT));
  for (const m of inputs) if (!sources.has(m.t)) m.dropped = true;
  return { length: TIMELINE_LENGTH, inputs, spans, ticks, missedTicks, outputs };
};

export function simulateThrottle(duration: DurationVariant, edge: ThrottleEdge): Trace {
  const inputs = freshInputs();
  const spans: Span[] = [];
  const outputs: Marble[] = [];
  let windowEnd = -Infinity;
  let pending: Marble | null = null;
  let windows = 0;
  for (const v of inputs) {
    if (v.t >= windowEnd) {
      if (pending) {
        outputs.push({ t: windowEnd, label: pending.label, sourceT: pending.t });
        pending = null;
      }
      const d = durationAt(duration, windows++);
      spans.push({ start: v.t, end: v.t + d });
      windowEnd = v.t + d;
      if (edge === 'trailing') pending = v;
      else outputs.push({ t: v.t, label: v.label, sourceT: v.t });
    } else if (edge !== 'leading') {
      pending = v;
    }
  }
  if (pending) outputs.push({ t: windowEnd, label: pending.label, sourceT: pending.t });
  return makeTrace(inputs, spans, outputs);
}

export function simulateAudit(duration: DurationVariant): Trace {
  const inputs = freshInputs();
  const spans: Span[] = [];
  const outputs: Marble[] = [];
  let windowEnd = -Infinity;
  let latest: Marble | null = null;
  let windows = 0;
  for (const v of inputs) {
    if (v.t >= windowEnd) {
      if (latest) outputs.push({ t: windowEnd, label: latest.label, sourceT: latest.t });
      const d = durationAt(duration, windows++);
      spans.push({ start: v.t, end: v.t + d });
      windowEnd = v.t + d;
    }
    latest = v;
  }
  if (latest) outputs.push({ t: windowEnd, label: latest.label, sourceT: latest.t });
  return makeTrace(inputs, spans, outputs);
}

export function simulateDebounce(duration: DurationVariant): Trace {
  const inputs = freshInputs();
  const spans: Span[] = [];
  const outputs: Marble[] = [];
  let span: Span | null = null;
  let pending: Marble | null = null;
  for (let i = 0; i < inputs.length; i++) {
    const v = inputs[i];
    if (span && pending && v.t < span.end) {
      span.end = v.t;
      span.cancelled = true;
    } else if (span && pending) {
      outputs.push({ t: span.end, label: pending.label, sourceT: pending.t });
    }
    span = { start: v.t, end: v.t + durationAt(duration, i) };
    spans.push(span);
    pending = v;
  }
  if (span && pending) outputs.push({ t: span.end, label: pending.label, sourceT: pending.t });
  return makeTrace(inputs, spans, outputs);
}

export function simulateSample(trigger: SampleTrigger): Trace {
  const inputs = freshInputs();
  const ticks = trigger === 'periodic' ? [5, 10, 15, 20, 25] : [3, 9, 14, 21, 24.5];
  const outputs: Marble[] = [];
  const missedTicks: number[] = [];
  let taken = -1;
  for (const tick of ticks) {
    let idx = -1;
    for (let i = 0; i < inputs.length; i++) if (inputs[i].t <= tick) idx = i;
    if (idx > taken) {
      outputs.push({ t: tick, label: inputs[idx].label, sourceT: inputs[idx].t });
      taken = idx;
    } else {
      missedTicks.push(tick);
    }
  }
  return makeTrace(inputs, [], outputs, ticks, missedTicks);
}

export function simulateDelay(mode: DelayMode): Trace {
  const inputs = freshInputs();
  const spans: Span[] = [];
  const outputs: Marble[] = [];
  inputs.forEach((v, i) => {
    const d = mode === 'relative' ? FIXED : VARIED[i % VARIED.length];
    spans.push({ start: v.t, end: v.t + d });
    outputs.push({ t: v.t + d, label: v.label, sourceT: v.t });
  });
  outputs.sort((a, b) => a.t - b.t);
  return makeTrace(inputs, spans, outputs);
}
