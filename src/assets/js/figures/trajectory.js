// Figure 1: an agent operating a small app, one action at a time.

import * as T from './trajectory-model.js';
import { along, easeOut, playOnView, sleep, tween } from './anim.js';

export function mountTrajectory(fig, { reduced }) {
  if (reduced) return; // the server-rendered final state is the figure

  const svg = fig.querySelector('svg');
  const $ = (sel) => svg.querySelector(sel);
  const $$ = (sel) => [...svg.querySelectorAll(sel)];

  const cursor = $('[data-cursor]');
  const ripple = $('[data-ripple]');
  const wheel = $('[data-wheel]');
  const field = $('[data-field]');
  const query = $('[data-query]');
  const placeholder = $('[data-placeholder]');
  const caret = $('[data-caret]');
  const save = $('[data-save]');
  const saveLabel = $('[data-save-label]');
  const rowsGroup = $('[data-rows]');
  const rows = $$('[data-row]');
  const picked = rows[T.PICK_ROW];
  const segs = new Map($$('[data-seg]').map((p) => [Number(p.dataset.seg), p]));
  const markers = $$('[data-marker]');
  const logItems = [...fig.querySelectorAll('[data-log] li')];

  const moveCursor = (x, y) => cursor.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);

  function setScroll(px, animate) {
    if (!animate) {
      rowsGroup.style.transition = 'none';
      rowsGroup.style.transform = `translateY(${-px}px)`;
      rowsGroup.getBoundingClientRect();
      rowsGroup.style.transition = '';
    } else {
      rowsGroup.style.transform = `translateY(${-px}px)`;
    }
  }

  function reset() {
    fig.classList.add('is-armed');
    moveCursor(T.START.x, T.START.y);
    field.classList.remove('is-focus');
    query.textContent = '';
    placeholder.setAttribute('opacity', '1');
    caret.setAttribute('opacity', '0');
    save.classList.remove('is-on');
    saveLabel.textContent = 'Save';
    rows.forEach((r) => r.classList.add('is-off'));
    picked.classList.remove('is-picked', 'is-saved');
    setScroll(0, false);
    segs.forEach((p) => (p.style.strokeDashoffset = '1'));
    markers.forEach((m) => m.classList.add('is-off'));
    logItems.forEach((li) => li.classList.remove('is-done', 'is-current'));
    ripple.setAttribute('opacity', '0');
    wheel.setAttribute('opacity', '0');
  }

  async function click(x, y, signal) {
    ripple.setAttribute('cx', x);
    ripple.setAttribute('cy', y);
    await tween(
      420,
      (k) => {
        ripple.setAttribute('r', (4 + k * 14).toFixed(1));
        ripple.setAttribute('opacity', (1 - k).toFixed(2));
      },
      { ease: easeOut, signal },
    );
  }

  async function typeQuery(signal) {
    placeholder.setAttribute('opacity', '0');
    caret.setAttribute('opacity', '1');
    for (let i = 1; i <= T.QUERY.length; i++) {
      query.textContent = T.QUERY.slice(0, i);
      caret.setAttribute('x', (T.SEARCH.x + 26 + query.getComputedTextLength() + 1.5).toFixed(1));
      await sleep(i % 5 === 0 ? 95 : 48, signal);
    }
  }

  async function run(signal) {
    reset();
    await sleep(450, signal);

    for (let i = 0; i < T.STEPS.length; i++) {
      const step = T.STEPS[i];
      logItems[i]?.classList.add('is-current');

      const seg = segs.get(i);
      if (seg) {
        await along(
          seg,
          720,
          (pt, k) => {
            moveCursor(pt.x, pt.y);
            seg.style.strokeDashoffset = String(1 - k);
          },
          { signal },
        );
      }

      if (step.kind === 'click') {
        const effect = click(step.x, step.y, signal);
        if (i === 0) field.classList.add('is-focus');
        if (i === 4) picked.classList.add('is-picked');
        if (i === 5) {
          save.classList.add('is-on');
          saveLabel.textContent = 'Saved';
          picked.classList.add('is-saved');
        }
        markers[i].classList.remove('is-off');
        await effect;
      } else if (step.kind === 'type') {
        markers[i].classList.remove('is-off');
        await typeQuery(signal);
      } else if (step.kind === 'key') {
        markers[i].classList.remove('is-off');
        caret.setAttribute('opacity', '0');
        field.classList.remove('is-focus');
        for (const r of rows) {
          r.classList.remove('is-off');
          await sleep(55, signal);
        }
      } else if (step.kind === 'scroll') {
        markers[i].classList.remove('is-off');
        wheel.setAttribute('transform', `translate(${step.x + 22} ${step.y + 8})`);
        wheel.setAttribute('opacity', '1');
        setScroll(T.SCROLL_PX, true);
        await sleep(700, signal);
        wheel.setAttribute('opacity', '0');
      }

      logItems[i]?.classList.replace('is-current', 'is-done');
      await sleep(260, signal);
    }

    const last = T.STEPS[T.STEPS.length - 1];
    await tween(500, (k) => moveCursor(last.x + (T.REST.x - last.x) * k, last.y + (T.REST.y - last.y) * k), { signal });
  }

  playOnView(fig, run);
}
