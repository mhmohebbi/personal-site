// Data and scales for Figure 3 (counterfactual residual augmentation).
// Shared by the build-time SVG renderer and the in-browser interaction.

export const VIEW = { w: 560, h: 292 };
export const PLOT = { x0: 40, x1: 500, y0: 14, y1: 256 };
export const DOMAIN = { x: [0, 10], y: [-1.3, 2.5] };
export const DELTAS = [-1.7, -0.85, 0.85, 1.7];

/** The base regressor's fit (illustrative). */
export const f = (x) => Math.sin(0.62 * x) + 0.16 * x;

export const sx = (x) => PLOT.x0 + ((x - DOMAIN.x[0]) / (DOMAIN.x[1] - DOMAIN.x[0])) * (PLOT.x1 - PLOT.x0);
export const sy = (y) => PLOT.y1 - ((y - DOMAIN.y[0]) / (DOMAIN.y[1] - DOMAIN.y[0])) * (PLOT.y1 - PLOT.y0);
export const ix = (px) => DOMAIN.x[0] + ((px - PLOT.x0) / (PLOT.x1 - PLOT.x0)) * (DOMAIN.x[1] - DOMAIN.x[0]);

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic noisy observations y = f(x) + ε. */
export function observations(n = 26, seed = 11) {
  const rand = mulberry32(seed);
  const gauss = () => {
    const u = Math.max(rand(), 1e-9);
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const pts = [];
  for (let i = 0; i < n; i++) {
    const x = 0.25 + ((i + 0.15 + rand() * 0.7) / n) * 9.5;
    const e = Math.max(-1.05, Math.min(1.05, 0.46 * gauss()));
    pts.push({ x: +x.toFixed(3), y: +(f(x) + e).toFixed(3) });
  }
  return pts;
}

/** Counterfactuals of p: same residual, perturbed x, kept inside the plotted domain. */
export function counterfactuals(p, t = 1) {
  const eps = p.y - f(p.x);
  return DELTAS.map((d) => p.x + d * t)
    .map((x) => ({ x, y: f(x) + eps, inside: x > 0.15 && x < 9.85 }));
}

/** An SVG path for g(x) = f(x) + offset over the full domain. */
export function curvePath(offset = 0, from = DOMAIN.x[0], to = DOMAIN.x[1], steps = 120) {
  let d = '';
  for (let k = 0; k <= steps; k++) {
    const x = from + ((to - from) * k) / steps;
    d += `${k ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(f(x) + offset).toFixed(1)}`;
  }
  return d;
}

/** Observations that make for a clear demonstration (large-ish residuals, away from edges). */
export function showcase(pts) {
  return pts
    .map((p, i) => ({ i, e: Math.abs(p.y - f(p.x)), x: p.x }))
    .filter((p) => p.e > 0.3 && p.x > 1.4 && p.x < 8.6)
    .map((p) => p.i);
}

/** Baselines for the right-hand curve labels "f(x)" and "f + ε", kept apart when ε is small. */
export function labelYs(eps, gap = 17) {
  const fy = sy(f(DOMAIN.x[1])) + 5;
  const gy = sy(f(DOMAIN.x[1]) + eps) + 5;
  const d = gy - fy;
  if (Math.abs(d) >= gap) return { fy, gy };
  const push = (gap - Math.abs(d)) / 2;
  const sign = d >= 0 ? 1 : -1;
  return { fy: fy - sign * push, gy: gy + sign * push };
}
