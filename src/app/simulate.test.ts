import { describe, expect, it } from 'vitest';
import {
  simulateAudit,
  simulateDebounce,
  simulateDelay,
  simulateSample,
  simulateThrottle,
} from './simulate.ts';
import type { Trace } from './simulate.ts';

const out = (trace: Trace): string[] => trace.outputs.map((o) => `${o.label}@${o.t}`);
const dropped = (trace: Trace): string[] => trace.inputs.filter((m) => m.dropped).map((m) => m.label);

describe('simulateThrottle', () => {
  it('leading: emits the opener, suppresses the rest of the window', () => {
    const trace = simulateThrottle('fixed', 'leading');
    expect(out(trace)).toEqual(['a@0', 'd@11', 'e@16']);
    expect(dropped(trace)).toEqual(['b', 'c', 'f', 'g']);
  });

  it('trailing: emits the latest value at the window close', () => {
    const trace = simulateThrottle('fixed', 'trailing');
    expect(out(trace)).toEqual(['c@5', 'd@16', 'g@21']);
    expect(dropped(trace)).toEqual(['a', 'b', 'e', 'f']);
  });

  it('both: emits opener and latest suppressed value', () => {
    const trace = simulateThrottle('fixed', 'both');
    expect(out(trace)).toEqual(['a@0', 'c@5', 'd@11', 'e@16', 'g@21']);
    expect(dropped(trace)).toEqual(['b', 'f']);
  });

  it('dynamic: window lengths vary per opening', () => {
    const trace = simulateThrottle('dynamic', 'leading');
    expect(out(trace)).toEqual(['a@0', 'd@11', 'g@19']);
    expect(trace.spans).toEqual([
      { start: 0, end: 5 },
      { start: 11, end: 19 },
      { start: 19, end: 21 },
    ]);
  });
});

describe('simulateAudit', () => {
  it('emits the latest value at the close of a non-restarting window', () => {
    const trace = simulateAudit('fixed');
    expect(out(trace)).toEqual(['c@5', 'd@16', 'g@21']);
    expect(trace.spans.every((s) => !s.cancelled)).toBe(true);
  });
});

describe('simulateDebounce', () => {
  it('restarts the silence timer on every value and emits after full silence', () => {
    const trace = simulateDebounce('fixed');
    expect(out(trace)).toEqual(['c@9', 'd@16', 'g@24']);
    expect(trace.spans.filter((s) => s.cancelled)).toHaveLength(4);
    expect(dropped(trace)).toEqual(['a', 'b', 'e', 'f']);
  });
});

describe('simulateSample', () => {
  it('periodic: snapshots the latest new value, marks empty ticks', () => {
    const trace = simulateSample('periodic');
    expect(out(trace)).toEqual(['c@5', 'd@15', 'g@20']);
    expect(trace.missedTicks).toEqual([10, 25]);
  });

  it('notifier: irregular triggers snapshot the latest new value', () => {
    const trace = simulateSample('notifier');
    expect(out(trace)).toEqual(['b@3', 'c@9', 'd@14', 'g@21']);
    expect(trace.missedTicks).toEqual([24.5]);
  });
});

describe('simulateDelay', () => {
  it('relative: every value survives, shifted by the same amount', () => {
    const trace = simulateDelay('relative');
    expect(out(trace)).toEqual(['a@5', 'b@7', 'c@9', 'd@16', 'e@21', 'f@22.5', 'g@24']);
    expect(dropped(trace)).toEqual([]);
  });

  it('dynamic: per-value displacement can reorder the output', () => {
    const trace = simulateDelay('dynamic');
    expect(trace.outputs.map((o) => o.label)).toEqual(['a', 'c', 'b', 'd', 'e', 'g', 'f']);
  });
});
