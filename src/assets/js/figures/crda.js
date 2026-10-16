// Figure 3: pick an observation, keep its residual, perturb x.

import * as C from './crda-model.js';
import { easeOut, playOnView, sleep, tween } from './anim.js';

const n = (v) => v.toFixed(1);

export function mountCrda(fig, { reduced }) {
  const svg = fig.querySelector('svg');
  const $ = (sel) => svg.querySelector(sel);
  const $$ = (sel) => [...svg.querySelectorAll(sel)];

  const pts = C.observations();
  const showcase = C.showcase(pts);
  const obs = $$('[data-obs] circle');
  const cfs = $$('[data-cf]').map((g) => {
    const [line, foot, pt, tick] = g.children;
    return { g, line, foot, pt, tick };
  });
  const resid = $('[data-resid]');
  const foot = $('[data-foot]');
  const ring = $('[data-ring]');
  const eps = $('[data-eps]');
  const tick = $('[data-tick]');
  const shifted = $('[data-shifted]');
  const shiftLabel = $('[data-shift-label]');
  const curveLabel = $('[data-curve-label]');
  const hit = $('[data-hit]');

  let current = showcase[4];
  let anim = null;

  function placeCounterfactuals(p, t) {
    C.counterfactuals(p, t).forEach((q, k) => {
      const c = cfs[k];
      const x = n(C.sx(q.x));
      const yc = n(C.sy(C.f(q.x)));
      const yp = n(C.sy(q.y));
      c.line.setAttribute('x1', x);
      c.line.setAttribute('x2', x);
      c.line.setAttribute('y1', yc);
      c.line.setAttribute('y2', yp);
      c.foot.setAttribute('cx', x);
      c.foot.setAttribute('cy', yc);
      c.pt.setAttribute('cx', x);
      c.pt.setAttribute('cy', yp);
      c.tick.setAttribute('x1', x);
      c.tick.setAttribute('x2', x);
      c.g.setAttribute('opacity', q.inside ? Math.min(1, t * 3).toFixed(2) : '0');
    });
  }

  function placeSelection(p, grow = 1) {
    const e = p.y - C.f(p.x);
    const x = n(C.sx(p.x));
    const yc = C.sy(C.f(p.x));
    const yp = C.sy(p.y);
    resid.setAttribute('x1', x);
    resid.setAttribute('x2', x);
    resid.setAttribute('y1', n(yc));
    resid.setAttribute('y2', n(yc + (yp - yc) * grow));
    foot.setAttribute('cx', x);
    foot.setAttribute('cy', n(yc));
    ring.setAttribute('cx', x);
    ring.setAttribute('cy', n(yp));
    eps.setAttribute('x', n(C.sx(p.x) + 9));
    eps.setAttribute('y', n((yc + yp) / 2 + 5));
    tick.setAttribute('x1', x);
    tick.setAttribute('x2', x);
    shifted.setAttribute('d', C.curvePath(e));
    const labels = C.labelYs(e);
    curveLabel.setAttribute('y', n(labels.fy));
    shiftLabel.setAttribute('y', n(labels.gy));
    obs.forEach((o, i) => o.classList.toggle('is-sel', i === current));
  }

  async function select(i, animate = !reduced) {
    if (i === current && anim === null && animate) return;
    current = i;
    anim?.abort();
    const p = pts[i];
    if (!animate) {
      placeSelection(p);
      placeCounterfactuals(p, 1);
      return;
    }
    const controller = (anim = new AbortController());
    const { signal } = controller;
    try {
      shifted.setAttribute('opacity', '0');
      shiftLabel.setAttribute('opacity', '0');
      placeCounterfactuals(p, 0);
      await tween(220, (k) => placeSelection(p, k), { ease: easeOut, signal });
      await tween(
        700,
        (k) => {
          placeCounterfactuals(p, k);
          shifted.setAttribute('opacity', (0.6 * k).toFixed(2));
          shiftLabel.setAttribute('opacity', k.toFixed(2));
        },
        { ease: easeOut, signal },
      );
    } catch (err) {
      if (err?.name !== 'AbortError') throw err;
    } finally {
      if (anim === controller) anim = null;
    }
  }

  // Pointer: follow the nearest observation along x.
  let interacted = false;
  const pick = (evt) => {
    const m = svg.getScreenCTM();
    if (!m) return;
    const local = new DOMPoint(evt.clientX, evt.clientY).matrixTransform(m.inverse());
    const x = C.ix(local.x);
    let best = 0;
    pts.forEach((p, i) => {
      if (Math.abs(p.x - x) < Math.abs(pts[best].x - x)) best = i;
    });
    interacted = true;
    intro.stop();
    if (best !== current) select(best);
  };
  hit.addEventListener('pointermove', pick);
  hit.addEventListener('pointerdown', pick);

  // Keyboard: arrows step through observations.
  svg.setAttribute('tabindex', '0');
  svg.addEventListener('keydown', (evt) => {
    const order = pts.map((p, i) => i).sort((a, b) => pts[a].x - pts[b].x);
    const at = order.indexOf(current);
    const step = evt.key === 'ArrowRight' ? 1 : evt.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    evt.preventDefault();
    interacted = true;
    intro.stop();
    select(order[Math.max(0, Math.min(order.length - 1, at + step))]);
  });

  // On first view, walk through a few observations, then wait for the reader.
  const intro = reduced
    ? { stop() {} }
    : playOnView(fig, async (signal) => {
        for (const i of [showcase[1], showcase[6], showcase[4]]) {
          if (interacted) return;
          await select(i);
          await sleep(1900, signal);
        }
      });
}
