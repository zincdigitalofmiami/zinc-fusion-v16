/**
 * AutoFib Structure Engine
 * Translated from Pine Script v6 — ZINC Digital / Rabid Raccoon
 *
 * Multi-timeframe fibonacci confluence scoring.
 * Picks the best anchor from 5 lookback windows (8/13/21/34/55 bars),
 * determines bull/bear direction, and computes structure levels.
 */

const FIB_PERIODS = [8, 13, 21, 34, 55] as const;
const CONFLUENCE_TOL_PCT = 0.10;
const CHECK_RATIOS = [0.382, 0.5, 0.618] as const;

export interface FibLevel {
  price: number;
  color: string;
  width: number;
}

export interface FibStructure {
  levels: FibLevel[];
  isBull: boolean;
  anchorHigh: number;
  anchorLow: number;
  activePeriod: number;
}

// Colors
const WHITE = "rgba(255, 255, 255, 1)";
const GOLD = "rgba(218, 165, 32, 1)";
const BURNT_ORANGE = "rgba(204, 85, 0, 0.8)";
const BURNT_RED = "rgba(139, 0, 0, 0.8)";

interface WindowRange {
  high: number;
  low: number;
  period: number;
}

function getWindowRanges(
  highs: number[],
  lows: number[],
): WindowRange[] {
  const len = highs.length;
  return FIB_PERIODS.map((period) => {
    const start = Math.max(0, len - period);
    let high = -Infinity;
    let low = Infinity;
    for (let i = start; i < len; i++) {
      if (highs[i] > high) high = highs[i];
      if (lows[i] < low) low = lows[i];
    }
    return { high, low, period };
  });
}

function fibScore(
  h: number,
  l: number,
  allWindows: WindowRange[],
): number {
  const rng = h - l;
  if (rng <= 0) return 0;
  const tol = rng * CONFLUENCE_TOL_PCT * 0.01;
  let score = 0;

  for (const selfRatio of CHECK_RATIOS) {
    const selfLevel = l + rng * selfRatio;
    for (const win of allWindows) {
      const winRng = win.high - win.low;
      if (winRng <= 0) continue;
      for (const cmpRatio of CHECK_RATIOS) {
        const cmpLevel = win.low + winRng * cmpRatio;
        if (Math.abs(selfLevel - cmpLevel) <= tol) {
          score += 1;
        }
      }
    }
  }
  return score;
}

/**
 * Compute AutoFib structure levels from OHLCV bars.
 * Returns null if insufficient data.
 */
export function computeFibStructure(
  highs: number[],
  lows: number[],
  closes: number[],
): FibStructure | null {
  if (highs.length < 8) return null;

  const windows = getWindowRanges(highs, lows);

  // Score each window for confluence
  let bestScore = -1;
  let bestIdx = 0;
  for (let i = 0; i < windows.length; i++) {
    const s = fibScore(windows[i].high, windows[i].low, windows);
    if (s > bestScore) {
      bestScore = s;
      bestIdx = i;
    }
  }

  const anchorHigh = windows[bestIdx].high;
  const anchorLow = windows[bestIdx].low;
  const activePeriod = windows[bestIdx].period;
  const range = anchorHigh - anchorLow;

  if (range <= 0) return null;

  const midpoint = anchorLow + range * 0.5;
  const lastClose = closes[closes.length - 1];
  const isBull = lastClose >= midpoint;
  const base = isBull ? anchorLow : anchorHigh;
  const dir = isBull ? 1.0 : -1.0;

  const fp = (ratio: number) => base + dir * range * ratio;

  const levels: FibLevel[] = [
    { price: fp(0),     color: WHITE,        width: 2 },  // Anchor Low
    { price: fp(0.236), color: BURNT_RED,    width: 1 },  // Down Magnet 2
    { price: fp(0.382), color: BURNT_RED,    width: 1 },  // Down Magnet 1
    { price: fp(0.5),   color: WHITE,        width: 2 },  // Pivot
    { price: fp(0.618), color: BURNT_ORANGE, width: 1 },  // Decision Zone Low
    { price: fp(0.786), color: BURNT_ORANGE, width: 1 },  // Decision Zone High
    { price: fp(1.0),   color: WHITE,        width: 2 },  // Anchor High
    { price: fp(1.236), color: GOLD,         width: 2 },  // Target 1
    { price: fp(1.618), color: GOLD,         width: 2 },  // Target 2
  ];

  return {
    levels,
    isBull,
    anchorHigh,
    anchorLow,
    activePeriod,
  };
}
