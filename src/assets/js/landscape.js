// Hero backdrop: a slowly drifting reward landscape drawn as contour lines, with
// a few agents climbing it by noisy gradient ascent. Reaching a summit ends the
// episode and the agent respawns. The pointer raises a hill of its own. Lines
// are thinned out behind the `clear` element so the text over them stays calm.

const TAU = Math.PI * 2;
const CELL = 10; // px between field samples
const STEP = 0.085; // field units between contour levels
const BASE = -1.2; // lowest contour level
const LEVELS = 40;
const FLAT = 0.17; // levels this close to zero are skipped, leaving the lowlands open
const PEAK = 1.0; // levels at or above this are drawn in the accent colour

// Marching squares: for each corner mask (tl=8, tr=4, br=2, bl=1), the edges
// (0 top, 1 right, 2 bottom, 3 left) joined by each segment.
const CASES = [
  null, [3, 2], [2, 1], [3, 1], [0, 1], [0, 1, 3, 2], [0, 2], [3, 0],
  [3, 0], [0, 2], [3, 0, 2, 1], [0, 1], [3, 1], [2, 1], [3, 2], null,
];

function seeded(seed) {
  // mulberry32: the same landscape on every visit.
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeHills(rand) {
  const n = 8;
  return Array.from({ length: n }, (_, k) => ({
    hx: (k + 0.15 + rand() * 0.7) / n, // home, as a fraction of the canvas
    hy: 0.12 + rand() * 0.76,
    rx: 50 + rand() * 150, // drift radius, px
    ry: 30 + rand() * 90,
    wx: 0.035 + rand() * 0.05, // drift speed, rad/s
    wy: 0.03 + rand() * 0.05,
    px: rand() * TAU,
    py: rand() * TAU,
    a: k % 3 === 2 ? -(0.4 + rand() * 0.35) : 0.75 + rand() * 0.55,
    s: 120 + rand() * 110, // spread, px
  }));
}

export function mountLandscape(canvas, { reduced, clear }) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const root = document.documentElement;
  const hills = makeHills(seeded(7));
  const live = []; // this frame's hills: { x, y, a, k }
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0, seen: false };
  const agents = [];
  const pulses = [];
  const buckets = Array.from({ length: LEVELS }, () => []);

  let W = 0;
  let H = 0;
  let cols = 0;
  let rows = 0;
  let vals = new Float32Array(0);
  let calm = null; // ellipse behind the text: { x, y, rx, ry }
  let colors = { line: '#999', accent: '#c43d1e' };
  let t = 40; // seconds; starts mid-drift so the first frame is not symmetric
  let running = false;
  let visible = false;
  let last = 0;
  let raf = 0;

  const readColors = () => {
    const css = getComputedStyle(root);
    colors = { line: css.getPropertyValue('--fig-ink').trim(), accent: css.getPropertyValue('--accent').trim() };
  };

  /* ---------- the field ---------- */

  function place() {
    live.length = 0;
    const scale = Math.min(1, Math.max(0.6, W / 1200));
    for (const h of hills) {
      const s = h.s * scale;
      live.push({
        x: h.hx * W + h.rx * Math.sin(h.wx * t + h.px),
        y: h.hy * H + h.ry * Math.sin(h.wy * t + h.py),
        a: h.a,
        k: 1 / (2 * s * s),
      });
    }
    if (pointer.a > 0.005) live.push({ x: pointer.x, y: pointer.y, a: pointer.a, k: 1 / (2 * 105 * 105) });
  }

  function field(x, y) {
    let v = 0.15 * Math.sin(x / 190 + t * 0.09) * Math.sin(y / 140 - t * 0.06);
    for (let i = 0; i < live.length; i++) {
      const h = live[i];
      const dx = x - h.x;
      const dy = y - h.y;
      v += h.a * Math.exp(-(dx * dx + dy * dy) * h.k);
    }
    return v;
  }

  function contours() {
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) vals[j * cols + i] = field(i * CELL, j * CELL);
    }
    for (const b of buckets) b.length = 0;

    for (let j = 0; j < rows - 1; j++) {
      const y0 = j * CELL;
      for (let i = 0; i < cols - 1; i++) {
        const x0 = i * CELL;
        const p = j * cols + i;
        const a = vals[p];
        const b = vals[p + 1];
        const c = vals[p + cols + 1];
        const d = vals[p + cols];
        const lo = Math.min(a, b, c, d);
        const hi = Math.max(a, b, c, d);
        const l0 = Math.max(0, Math.ceil((lo - BASE) / STEP));
        const l1 = Math.min(LEVELS - 1, Math.floor((hi - BASE) / STEP));
        for (let l = l0; l <= l1; l++) {
          const L = BASE + l * STEP;
          const edges = CASES[((a > L) << 3) | ((b > L) << 2) | ((c > L) << 1) | (d > L)];
          if (!edges) continue;
          const out = buckets[l];
          for (const e of edges) {
            if (e === 0) out.push(x0 + (CELL * (L - a)) / (b - a), y0);
            else if (e === 1) out.push(x0 + CELL, y0 + (CELL * (L - b)) / (c - b));
            else if (e === 2) out.push(x0 + (CELL * (L - d)) / (c - d), y0 + CELL);
            else out.push(x0, y0 + (CELL * (L - a)) / (d - a));
          }
        }
      }
    }
  }

  /* ---------- agents ---------- */

  function spawn(agent) {
    agent.x = W * (0.04 + Math.random() * 0.92);
    agent.y = H * (0.08 + Math.random() * 0.84);
    agent.h = Math.random() * TAU;
    agent.still = 0;
    agent.walked = 0;
    agent.trail = [];
    return agent;
  }

  function fitAgents() {
    const n = Math.round(Math.min(5, Math.max(2, W / 340)));
    while (agents.length < n) agents.push(spawn({}));
    agents.length = n;
  }

  function stepAgent(g, dt) {
    const e = 2;
    const gx = (field(g.x + e, g.y) - field(g.x - e, g.y)) / (2 * e);
    const gy = (field(g.x, g.y + e) - field(g.x, g.y - e)) / (2 * e);
    const slope = Math.min(1, Math.hypot(gx, gy) * 300);
    const height = field(g.x, g.y);

    // Steer up the gradient, with exploration noise; wander a little on flat ground.
    let turn = Math.atan2(gy, gx) - g.h;
    turn = Math.atan2(Math.sin(turn), Math.cos(turn));
    g.h += turn * Math.min(1, 2.4 * dt) + (Math.random() - 0.5) * 2.6 * Math.sqrt(dt);
    const speed = 48 * slope + (height < 0.3 ? 12 : 0);
    const dx = Math.cos(g.h) * speed * dt;
    const dy = Math.sin(g.h) * speed * dt;
    g.x += dx;
    g.y += dy;

    g.walked += Math.hypot(dx, dy);
    if (g.walked > 7) {
      g.walked = 0;
      g.trail.push(g.x, g.y);
      if (g.trail.length > 64) g.trail.splice(0, 2);
    }

    g.still = slope < 0.06 && height > 0.45 ? g.still + dt : 0;
    if (g.still > 0.6) {
      pulses.push({ x: g.x, y: g.y, age: 0 });
      spawn(g);
    } else if (g.x < -40 || g.y < -40 || g.x > W + 40 || g.y > H + 40) {
      spawn(g);
    }
  }

  /* ---------- drawing ---------- */

  function draw(dt) {
    place();
    contours();
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';

    for (let l = 0; l < LEVELS; l++) {
      const segs = buckets[l];
      const L = BASE + l * STEP;
      if (!segs.length || Math.abs(L) < FLAT) continue;
      const major = l % 4 === 0;
      ctx.strokeStyle = L >= PEAK ? colors.accent : colors.line;
      ctx.globalAlpha = L >= PEAK ? 0.42 : L < 0 ? 0.45 : major ? 1 : 0.7;
      ctx.lineWidth = major ? 1.1 : 0.75;
      ctx.beginPath();
      for (let s = 0; s < segs.length; s += 4) {
        ctx.moveTo(segs[s], segs[s + 1]);
        ctx.lineTo(segs[s + 2], segs[s + 3]);
      }
      ctx.stroke();
    }

    if (calm) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.translate(calm.x, calm.y);
      ctx.scale(calm.rx, calm.ry);
      const fade = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      fade.addColorStop(0, 'rgba(0,0,0,0.62)');
      fade.addColorStop(0.55, 'rgba(0,0,0,0.45)');
      fade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fade;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }

    if (reduced) return (ctx.globalAlpha = 1);

    ctx.fillStyle = colors.accent;
    ctx.strokeStyle = colors.accent;
    for (const g of agents) {
      stepAgent(g, dt);
      const n = g.trail.length / 2;
      for (let i = 0; i < n; i++) {
        ctx.globalAlpha = 0.12 + 0.5 * (i / n);
        ctx.beginPath();
        ctx.arc(g.trail[2 * i], g.trail[2 * i + 1], 1.3, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 6.5, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 2.6, 0, TAU);
      ctx.fill();
    }

    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.age += dt;
      const k = p.age / 1.1;
      if (k >= 1) {
        pulses.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = 0.7 * (1 - k);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 + 22 * (1 - Math.pow(1 - k, 3)), 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    t += dt;

    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 7);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 7);
    pointer.a += (pointer.ta - pointer.a) * Math.min(1, dt * 2.2);

    draw(dt);
    raf = requestAnimationFrame(frame);
  }

  const sync = () => {
    const should = visible && !document.hidden && !reduced;
    if (should && !running) {
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };

  /* ---------- wiring ---------- */

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / CELL) + 1;
    rows = Math.ceil(H / CELL) + 1;
    vals = new Float32Array(cols * rows);
    if (clear) {
      const box = clear.getBoundingClientRect();
      calm = {
        x: box.left - rect.left + box.width * 0.45,
        y: box.top - rect.top + box.height * 0.5,
        rx: box.width * 0.62,
        ry: box.height * 0.68,
      };
    }
    fitAgents();
    if (!running) draw(0);
  }

  readColors();
  new ResizeObserver(resize).observe(canvas);
  canvas.classList.add('is-on');

  const recolor = () => {
    readColors();
    if (!running) draw(0);
  };
  new MutationObserver(recolor).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(canvas);
  document.addEventListener('visibilitychange', sync);

  if (reduced) return;

  const aim = (evt) => {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    pointer.ta = inside ? 1.15 : 0;
    if (!inside) return;
    pointer.tx = x;
    pointer.ty = y;
    if (!pointer.seen) {
      // Rise where the pointer is instead of sliding in from the corner.
      pointer.seen = true;
      pointer.x = x;
      pointer.y = y;
    }
  };
  addEventListener('pointermove', aim, { passive: true });
  addEventListener('pointerdown', aim, { passive: true });
  const release = (evt) => {
    if (evt.pointerType !== 'mouse') pointer.ta = 0;
  };
  addEventListener('pointerup', release, { passive: true });
  addEventListener('pointercancel', release, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => (pointer.ta = 0));
}
