// Tiny animation helpers shared by the figures.

export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const linear = (t) => t;

const aborted = () => new DOMException('Aborted', 'AbortError');

export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(aborted());
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => (clearTimeout(id), reject(aborted())), { once: true });
  });
}

/** Calls fn(progress) every frame for `ms` milliseconds. */
export function tween(ms, fn, { ease = easeInOut, signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(aborted());
    const t0 = performance.now();
    const frame = (now) => {
      if (signal?.aborted) return reject(aborted());
      const k = Math.min(1, (now - t0) / ms);
      fn(ease(k));
      if (k < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

/** Moves along an SVG path element, calling fn(point, progress). */
export function along(path, ms, fn, opts) {
  const length = path.getTotalLength();
  return tween(ms, (k) => fn(path.getPointAtLength(k * length), k), opts);
}

/**
 * Plays `run(signal)` once when `el` first becomes visible. Leaving the viewport
 * mid-run aborts it (it restarts on the next visit); a finished run reveals the
 * figure's Replay button.
 */
export function playOnView(el, run, { threshold = 0.4, onSettle } = {}) {
  const replay = el.querySelector('[data-replay]');
  let controller = null;
  let finished = false;
  let visible = false;

  const start = () => {
    if (controller) return;
    controller = new AbortController();
    const { signal } = controller;
    if (replay) replay.hidden = true;
    run(signal).then(
      () => {
        controller = null;
        finished = true;
        if (replay) replay.hidden = false;
        onSettle?.();
      },
      (err) => {
        controller = null;
        if (err?.name !== 'AbortError') throw err;
      },
    );
  };
  const stop = () => {
    controller?.abort();
    controller = null;
  };

  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !finished && !document.hidden) start();
      else if (!visible) stop();
    },
    { threshold },
  ).observe(el);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible && !finished) start();
  });

  replay?.addEventListener('click', () => {
    stop();
    finished = false;
    start();
  });

  return { stop };
}
