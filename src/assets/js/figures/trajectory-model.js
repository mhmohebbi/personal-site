// Geometry for Figure 1 (a computer-use trajectory). Shared by the build-time
// SVG renderer and the in-browser animation so both always agree.

export const VIEW = { w: 560, h: 340 };

export const SEARCH = { x: 124, y: 46, w: 272, h: 24 };
export const SAVE = { x: 482, y: 46, w: 64, h: 24 };
export const RESULTS = { x: 120, y: 92, w: 428, rowH: 36, gap: 8, count: 7, clipTop: 81 };
export const SCROLL_PX = 88; // two rows
export const PICK_ROW = 3;
export const QUERY = 'counterfactual';

export const START = { x: 62, y: 214 };
export const REST = { x: 536, y: 118 }; // where the pointer settles after the last action

// One entry per action a_t. Keyboard actions inherit the pointer position.
export const STEPS = [
  { kind: 'click', x: 226, y: 58, label: 'click(226, 58)' },
  { kind: 'type', x: 226, y: 58, label: `type("${QUERY}")` },
  { kind: 'key', x: 226, y: 58, label: 'key("Enter")' },
  { kind: 'scroll', x: 252, y: 278, label: 'scroll(0, +2)' },
  { kind: 'click', x: 300, y: 154, label: 'click(300, 154)' },
  { kind: 'click', x: 514, y: 58, label: 'click(514, 58)' },
];

export const rowY = (i, scrolled = 0) => RESULTS.y + i * (RESULTS.rowH + RESULTS.gap) - scrolled;

/** A gently bowed quadratic Bézier between two pointer positions, or null if they coincide. */
export function segment(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.hypot(dx, dy) < 1) return null;
  const bow = 0.1;
  const cx = (a.x + b.x) / 2 - dy * bow;
  const cy = (a.y + b.y) / 2 + dx * bow;
  return `M${a.x} ${a.y}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}`;
}

/** Marker positions: keyboard actions at the same spot fan out to the right. */
export function markers() {
  const out = [];
  let prev = null;
  let stack = 0;
  STEPS.forEach((s, i) => {
    stack = prev && prev.x === s.x && prev.y === s.y ? stack + 1 : 0;
    out.push({ i, x: s.x + 14 + stack * 19, y: s.y + 22 });
    prev = s;
  });
  return out;
}
