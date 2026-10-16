// Build-time SVG for the three research figures. Each renders its *final* state,
// so the figure reads correctly without JavaScript (and for reduced motion);
// the browser modules in assets/js/figures/ then take over and animate.

import { html, raw } from '../lib/html.mjs';
import * as T from '../assets/js/figures/trajectory-model.js';
import * as C from '../assets/js/figures/crda-model.js';

const n = (v) => (Math.round(v * 10) / 10).toString();

/* ------------------------------------------------------------------ */
/* Figure 1 · computer-use trajectory                                 */
/* ------------------------------------------------------------------ */

function trajectorySvg() {
  const { VIEW, SEARCH, SAVE, RESULTS, STEPS, START } = T;
  const titleW = [236, 188, 262, 214, 248, 176, 230];
  const metaW = [120, 96, 140, 110, 128, 90, 116];

  const rows = Array.from({ length: RESULTS.count }, (_, i) => {
    const y = T.rowY(i);
    return `<g class="tr-row${i === T.PICK_ROW ? ' is-picked is-saved' : ''}" data-row="${i}">
      <rect class="tr-row__bg" x="${RESULTS.x}" y="${y}" width="${RESULTS.w}" height="${RESULTS.rowH}" rx="6"/>
      <rect class="tr-fill" x="${RESULTS.x + 8}" y="${y + 6}" width="24" height="24" rx="4"/>
      <rect class="tr-ink" x="${RESULTS.x + 42}" y="${y + 9}" width="${titleW[i]}" height="7" rx="3.5"/>
      <rect class="tr-fill" x="${RESULTS.x + 42}" y="${y + 22}" width="${metaW[i]}" height="6" rx="3"/>
      <path class="tr-star" d="M${RESULTS.x + RESULTS.w - 22} ${y + 11}l2.35 4.76 5.25.77-3.8 3.7.9 5.23-4.7-2.47-4.7 2.47.9-5.23-3.8-3.7 5.25-.77z"/>
    </g>`;
  }).join('');

  const sidebar = [64, 52, 70, 46, 58, 40]
    .map((w, i) => `<rect class="${i === 1 ? 'tr-ink' : 'tr-fill'}" x="16" y="${54 + i * 22}" width="${w}" height="7" rx="3.5"/>`)
    .join('');

  let prev = START;
  const trail = STEPS.map((s, i) => {
    const d = T.segment(prev, s);
    prev = s;
    return d ? `<path class="tr-trail" data-seg="${i}" d="${d}" pathLength="1"/>` : '';
  }).join('');

  const markers = T.markers()
    .map(
      (m) => `<g class="tr-marker" data-marker="${m.i}" transform="translate(${m.x} ${m.y})"><g class="tr-marker__dot"><circle r="8.5"/><text y="0.5">${m.i}</text></g></g>`,
    )
    .join('');


  return `<svg class="traj__screen" viewBox="0 0 ${VIEW.w} ${VIEW.h}" role="img" aria-label="Illustration of an agent operating a paper-search app: it clicks the search field, types a query, presses Enter, scrolls the results, opens one result and saves it. Each action is numbered and the pointer's path is traced.">
  <defs>
    <clipPath id="tr-clip-results"><rect x="109" y="${RESULTS.clipTop}" width="${VIEW.w - 110}" height="${VIEW.h - RESULTS.clipTop - 1}"/></clipPath>
  </defs>
  <rect class="tr-window" x="0.75" y="0.75" width="${VIEW.w - 1.5}" height="${VIEW.h - 1.5}" rx="10"/>
  <path class="tr-rule" d="M1 34H${VIEW.w - 1}M108 34V${VIEW.h - 1}M108 80H${VIEW.w - 1}"/>
  <circle class="tr-fill" cx="18" cy="17" r="4.5"/><circle class="tr-fill" cx="33" cy="17" r="4.5"/><circle class="tr-fill" cx="48" cy="17" r="4.5"/>
  <text class="tr-title" x="${VIEW.w / 2}" y="21">Papers — Library</text>
  ${sidebar}
  <rect class="tr-field" data-field x="${SEARCH.x}" y="${SEARCH.y}" width="${SEARCH.w}" height="${SEARCH.h}" rx="6"/>
  <circle class="tr-glass" cx="${SEARCH.x + 13}" cy="${SEARCH.y + 11}" r="4.2"/><path class="tr-glass" d="M${SEARCH.x + 16} ${SEARCH.y + 14}l3.4 3.4"/>
  <text class="tr-placeholder" data-placeholder x="${SEARCH.x + 26}" y="${SEARCH.y + 16}" opacity="0">Search papers</text>
  <text class="tr-query" data-query x="${SEARCH.x + 26}" y="${SEARCH.y + 16}">${T.QUERY}</text>
  <rect class="tr-caret" data-caret x="0" y="${SEARCH.y + 6}" width="1.4" height="12" opacity="0"/>
  <g class="tr-save is-on" data-save>
    <rect x="${SAVE.x}" y="${SAVE.y}" width="${SAVE.w}" height="${SAVE.h}" rx="6"/>
    <text x="${SAVE.x + SAVE.w / 2}" y="${SAVE.y + 16}" data-save-label>Saved</text>
  </g>
  <g clip-path="url(#tr-clip-results)">
    <g class="tr-rows" data-rows style="transform: translateY(-${T.SCROLL_PX}px)">${rows}</g>
  </g>
  <g data-trail>${trail}</g>
  <g data-markers>${markers}</g>
  <circle class="tr-ripple" data-ripple r="6" cx="0" cy="0" opacity="0"/>
  <g class="tr-wheel" data-wheel opacity="0"><path d="M-5 -6l5 -5 5 5M-5 6l5 5 5 -5"/></g>
  <g class="tr-cursor" data-cursor transform="translate(${T.REST.x} ${T.REST.y})">
    <path d="M0 0V17.2l4.4-4.1 2.9 6.6 2.9-1.3-2.9-6.5h6z"/>
  </g>
</svg>`;
}

export function trajectoryFigure(captionHtml) {
  const steps = T.STEPS.map(
    (s, i) => html`<li data-step="${i}"><span class="traj__t"><i>a</i><sub>${i}</sub></span><code>${s.label}</code></li>`,
  );
  return html`<figure class="fig fig--wide" data-figure="trajectory" aria-labelledby="cap-trajectory">
  <div class="fig__panel">
    <div class="traj">
      ${raw(trajectorySvg())}
      <div class="traj__log">
        <p class="fig__label">Actions</p>
        <ol data-log>${steps}</ol>
        <p class="traj__tau"><i>τ</i> = (<i>s</i><sub>0</sub>, <i>a</i><sub>0</sub>, …, <i>a</i><sub>5</sub>, <i>s</i><sub>6</sub>)</p>
      </div>
    </div>
    <button class="fig__replay" type="button" data-replay hidden>Replay</button>
  </div>
  <figcaption id="cap-trajectory">${raw(captionHtml)}</figcaption>
</figure>`;
}

/* ------------------------------------------------------------------ */
/* Figure 2 · Image-POSER                                             */
/* ------------------------------------------------------------------ */

export const POSER = {
  subtasks: ['Lighthouse at dusk', 'Add a red sailboat', 'Watercolour style'],
  experts: [
    { group: 0, label: 'T2I · 1' },
    { group: 0, label: 'T2I · 2' },
    { group: 1, label: 'I2I · edit' },
    { group: 1, label: 'I2I · inpaint' },
    { group: 1, label: 'I2I · style' },
  ],
  route: [1, 2, 4], // expert chosen for each subtask
  chipY: [122, 156, 190],
  expertY: [48, 82, 138, 172, 206],
  policy: { x: 262, y: 170, r: 30 },
  canvas: { x: 476, y: 58, w: 120, h: 120 },
  critic: { x: 420, y: 236, w: 176, h: 36 },
};

function poserSvg() {
  const P = POSER;
  const { policy: pi, canvas: cv, critic: cr } = P;
  const last = P.subtasks.length - 1;

  const chips = P.subtasks
    .map(
      (t, k) => `<g class="ps-chip${k === last ? ' is-active' : ''}" data-subtask="${k}">
      <rect x="0.75" y="${P.chipY[k]}" width="189" height="28" rx="6"/>
      <circle cx="15" cy="${P.chipY[k] + 14}" r="7.5"/><text class="ps-chip__n" x="15" y="${P.chipY[k] + 14.5}">${k + 1}</text>
      <text class="ps-chip__t" x="30" y="${P.chipY[k] + 18}">${t}</text>
    </g>`,
    )
    .join('');

  const experts = P.experts
    .map(
      (e, j) => `<g class="ps-expert${j === P.route[last] ? ' is-active' : ''}" data-expert="${j}">
      <rect x="320.75" y="${P.expertY[j]}" width="119" height="26" rx="6"/>
      <text x="380" y="${P.expertY[j] + 17}">${e.label}</text>
    </g>`,
    )
    .join('');

  const inEdges = P.chipY
    .map((y, k) => {
      const y0 = y + 14;
      return `<path class="ps-edge${k === last ? ' is-active' : ''}" data-edge-in="${k}" d="M191 ${y0}C212 ${y0} 212 ${pi.y} ${pi.x - pi.r} ${pi.y}"/>`;
    })
    .join('');

  const outEdges = P.expertY
    .map((y, j) => {
      const y0 = y + 13;
      const active = j === P.route[last] ? ' is-active' : '';
      return `<path class="ps-edge${active}" data-edge-out="${j}" d="M${pi.x + pi.r} ${pi.y}C300 ${pi.y} 296 ${y0} 320 ${y0}"/>
      <path class="ps-edge${active}" data-edge-img="${j}" d="M440 ${y0}C458 ${y0} 456 ${cv.y + cv.h / 2} ${cv.x} ${cv.y + cv.h / 2}"/>`;
    })
    .join('');

  // The "image": a lighthouse at dusk, built in three layers so each subtask adds one.
  const X = cv.x;
  const Y = cv.y;
  const img = `
    <g data-layer="0">
      <rect x="${X}" y="${Y}" width="${cv.w}" height="${cv.h}" fill="url(#ps-sky)"/>
      <circle cx="${X + 34}" cy="${Y + 84}" r="11" fill="#ffd4a3"/>
      <rect x="${X}" y="${Y + 84}" width="${cv.w}" height="${cv.h - 84}" fill="url(#ps-sea)"/>
      <path d="M${X + 62} ${Y + 120}L${X + 76} ${Y + 82}L${X + 92} ${Y + 74}L${X + 120} ${Y + 72}V${Y + 120}Z" fill="#3a3640"/>
      <path d="M${X + 96} ${Y + 32}L${X + 75} ${Y + 44}L${X + 75} ${Y + 50}Z" fill="#ffe7a6" opacity=".55"/>
      <path d="M${X + 99} ${Y + 74}L${X + 100.5} ${Y + 44}H${X + 107.5}L${X + 109} ${Y + 74}Z" fill="#f4efe6"/>
      <path d="M${X + 99.6} ${Y + 62}H${X + 108.4}L${X + 108.7} ${Y + 68}H${X + 99.3}ZM${X + 100.3} ${Y + 50}H${X + 107.7}L${X + 108} ${Y + 56}H${X + 100}Z" fill="#c4473a"/>
      <rect x="${X + 100.5}" y="${Y + 37}" width="7" height="7" fill="#ffd27a"/>
      <path d="M${X + 99} ${Y + 37}L${X + 104} ${Y + 32}L${X + 109} ${Y + 37}Z" fill="#3a3640"/>
    </g>
    <g data-layer="1">
      <path d="M${X + 22} ${Y + 101}H${X + 50}L${X + 46} ${Y + 106}H${X + 26}Z" fill="#2f2a2e"/>
      <path d="M${X + 36} ${Y + 99}V${Y + 70}L${X + 52} ${Y + 99}Z" fill="#d2412b"/>
      <path d="M${X + 34} ${Y + 99}V${Y + 78}L${X + 24} ${Y + 99}Z" fill="#f1e6d6"/>
      <path d="M${X + 26} ${Y + 109}H${X + 46}" stroke="#d2412b" stroke-width="1.4" opacity=".35"/>
    </g>`;

  return `<svg class="poser__svg" viewBox="0 0 600 284" role="img" aria-label="Diagram of Image-POSER: a prompt is split into three subtasks; a policy routes each subtask to one of five pretrained experts; the expert updates the image; a vision–language critic scores the image and sends reward back to the policy.">
  <defs>
    <linearGradient id="ps-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4f5d93"/><stop offset=".55" stop-color="#d98e86"/><stop offset="1" stop-color="#f7cf9f"/>
    </linearGradient>
    <linearGradient id="ps-sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6f86ad"/><stop offset="1" stop-color="#34496e"/>
    </linearGradient>
    <clipPath id="ps-clip"><rect x="${cv.x}" y="${cv.y}" width="${cv.w}" height="${cv.h}" rx="8"/></clipPath>
    <filter id="ps-watercolour" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" result="wobble"/>
      <feGaussianBlur in="wobble" stdDeviation="0.75" result="soft"/>
      <feColorMatrix in="soft" type="saturate" values="0.82" result="washed"/>
      <feComponentTransfer in="washed" result="light">
        <feFuncR type="linear" slope="0.9" intercept="0.1"/><feFuncG type="linear" slope="0.9" intercept="0.1"/><feFuncB type="linear" slope="0.9" intercept="0.09"/>
      </feComponentTransfer>
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="9" result="grain"/>
      <feColorMatrix in="grain" type="saturate" values="0" result="grey"/>
      <feComposite in="light" in2="grey" operator="arithmetic" k1="0" k2="1" k3="0.09" k4="-0.045" result="textured"/>
      <feComposite in="textured" in2="SourceAlpha" operator="in"/>
    </filter>
  </defs>

  <text class="fig-label" x="0" y="12">Prompt</text>
  <rect class="ps-card" x="0.75" y="22" width="189" height="72" rx="8"/>
  <text class="ps-prompt" x="13" y="45">“Lighthouse on a cliff at dusk,</text>
  <text class="ps-prompt" x="13" y="62">a red sailboat in the bay,</text>
  <text class="ps-prompt" x="13" y="79">in watercolour.”</text>
  <text class="fig-label" x="0" y="113">Subtasks</text>
  ${chips}

  ${inEdges}
  ${outEdges}
  <path class="ps-edge ps-edge--down is-active" data-edge-critic d="M${cv.x + cv.w / 2} ${cv.y + cv.h + 4}V${cr.y}"/>
  <path class="ps-edge ps-edge--reward is-active" data-edge-reward d="M${cr.x} ${cr.y + cr.h / 2}C340 ${cr.y + cr.h / 2} ${pi.x} ${cr.y + 10} ${pi.x} ${pi.y + pi.r}"/>
  <text class="ps-reward" data-reward x="322" y="${cr.y + cr.h / 2 + 18}"><tspan class="ps-math">r</tspan><tspan class="ps-sub" dy="3">t</tspan></text>

  <g class="ps-policy" data-policy>
    <circle cx="${pi.x}" cy="${pi.y}" r="${pi.r}"/>
    <text class="ps-math ps-pi" x="${pi.x}" y="${pi.y + 8}">π</text>
  </g>
  <text class="fig-label fig-label--c" x="${pi.x}" y="${pi.y - pi.r - 10}">Policy</text>

  <text class="fig-label" x="320" y="38">Text-to-image</text>
  <text class="fig-label" x="320" y="128">Image-to-image</text>
  ${experts}

  <text class="fig-label" x="${cv.x}" y="${cv.y - 10}">Image <tspan class="ps-math ps-math--label">s</tspan><tspan class="ps-sub ps-sub--label" dy="2">t</tspan></text>
  <g clip-path="url(#ps-clip)">
    <rect class="ps-blank" x="${cv.x}" y="${cv.y}" width="${cv.w}" height="${cv.h}"/>
    <g id="ps-image" class="ps-image" data-image>${img}</g>
    <use href="#ps-image" class="ps-wash is-on" data-wash filter="url(#ps-watercolour)"/>
  </g>
  <rect class="ps-frame" x="${cv.x}" y="${cv.y}" width="${cv.w}" height="${cv.h}" rx="8"/>

  <g class="ps-critic" data-critic>
    <rect x="${cr.x + 0.75}" y="${cr.y}" width="${cr.w - 1.5}" height="${cr.h}" rx="8"/>
    <text x="${cr.x + cr.w / 2}" y="${cr.y + 22}">Vision–language critic</text>
  </g>
  <circle class="ps-token" data-token r="4.5" cx="0" cy="0" opacity="0"/>
</svg>`;
}

export function poserFigure(captionHtml) {
  return html`<figure class="fig fig--wide" data-figure="poser" aria-labelledby="cap-poser">
  <div class="fig__panel">
    <div class="fig__scroll">${raw(poserSvg())}</div>
    <p class="fig__hint" aria-hidden="true">Scroll sideways to see the whole figure</p>
    <button class="fig__replay" type="button" data-replay hidden>Replay</button>
  </div>
  <figcaption id="cap-poser">${raw(captionHtml)}</figcaption>
</figure>`;
}

/* ------------------------------------------------------------------ */
/* Figure 3 · CRDA                                                    */
/* ------------------------------------------------------------------ */

function crdaSvg() {
  const { VIEW, PLOT, sx, sy, f } = C;
  const pts = C.observations();
  const sel = C.showcase(pts)[4];
  const p = pts[sel];
  const eps = p.y - f(p.x);
  const cfs = C.counterfactuals(p);

  const obs = pts
    .map((q, i) => `<circle class="cr-obs" data-i="${i}" data-x="${q.x}" data-y="${q.y}" cx="${n(sx(q.x))}" cy="${n(sy(q.y))}" r="4.2"/>`)
    .join('');

  const cf = cfs
    .map(
      (q, k) => `<g class="cr-cf" data-cf="${k}"${q.inside ? '' : ' opacity="0"'}>
      <line class="cr-resid cr-resid--cf" x1="${n(sx(q.x))}" y1="${n(sy(f(q.x)))}" x2="${n(sx(q.x))}" y2="${n(sy(q.y))}"/>
      <circle class="cr-foot" cx="${n(sx(q.x))}" cy="${n(sy(f(q.x)))}" r="2.2"/>
      <circle class="cr-cfpt" cx="${n(sx(q.x))}" cy="${n(sy(q.y))}" r="4.4"/>
      <line class="cr-tick cr-tick--cf" x1="${n(sx(q.x))}" y1="${PLOT.y1 - 5}" x2="${n(sx(q.x))}" y2="${PLOT.y1 + 5}"/>
    </g>`,
    )
    .join('');

  const labels = C.labelYs(eps);
  const lx = PLOT.x1 + 8;

  return `<svg class="crda__svg" viewBox="0 0 ${VIEW.w} ${VIEW.h}" role="img" aria-label="Scatter plot of noisy observations around a fitted curve f. One observation is highlighted with its residual epsilon drawn as a vertical segment; four counterfactual points share the same residual at perturbed x values, lying on the curve shifted by epsilon.">
  <path class="cr-axis" d="M${PLOT.x0} ${PLOT.y0 - 4}V${PLOT.y1}H${PLOT.x1 + 14}"/>
  <text class="cr-axis-label" x="${PLOT.x1 + 20}" y="${PLOT.y1 + 4}">x</text>
  <text class="cr-axis-label" x="${PLOT.x0 - 4}" y="${PLOT.y0 - 8}" text-anchor="end">y</text>
  <path class="cr-shifted" data-shifted d="${C.curvePath(eps)}"/>
  <path class="cr-curve" d="${C.curvePath(0)}"/>
  <text class="cr-curve-label" data-curve-label x="${lx}" y="${n(labels.fy)}"><tspan font-style="italic">f</tspan>(<tspan font-style="italic">x</tspan>)</text>
  <text class="cr-shift-label" data-shift-label x="${lx}" y="${n(labels.gy)}"><tspan font-style="italic">f</tspan> + <tspan font-style="italic">ε</tspan></text>
  <g data-obs>${obs}</g>
  <g data-cfs>${cf}</g>
  <g class="cr-sel" data-sel>
    <line class="cr-resid" data-resid x1="${n(sx(p.x))}" y1="${n(sy(f(p.x)))}" x2="${n(sx(p.x))}" y2="${n(sy(p.y))}"/>
    <circle class="cr-foot" data-foot cx="${n(sx(p.x))}" cy="${n(sy(f(p.x)))}" r="2.2"/>
    <circle class="cr-ring" data-ring cx="${n(sx(p.x))}" cy="${n(sy(p.y))}" r="8.5"/>
    <text class="cr-eps" data-eps x="${n(sx(p.x) + 9)}" y="${n((sy(f(p.x)) + sy(p.y)) / 2 + 5)}">ε</text>
    <line class="cr-tick" data-tick x1="${n(sx(p.x))}" y1="${PLOT.y1 - 6}" x2="${n(sx(p.x))}" y2="${PLOT.y1 + 6}"/>
  </g>
  <rect class="cr-hit" data-hit x="${PLOT.x0}" y="0" width="${PLOT.x1 - PLOT.x0}" height="${VIEW.h}"/>
</svg>`;
}

export function crdaFigure(captionHtml) {
  return html`<figure class="fig fig--wide" data-figure="crda" aria-labelledby="cap-crda">
  <div class="fig__panel">
    ${raw(crdaSvg())}
    <ul class="legend" aria-hidden="true">
      <li><span class="legend__sw legend__sw--obs"></span>observation (<i>x</i>, <i>y</i>)</li>
      <li><span class="legend__sw legend__sw--cf"></span>counterfactual (<i>x</i>′, <i>f</i>(<i>x</i>′) + <i>ε</i>)</li>
      <li><span class="legend__sw legend__sw--curve"></span>base regressor <i>f</i></li>
      <li><span class="legend__sw legend__sw--shift"></span><i>f</i> + <i>ε</i></li>
    </ul>
  </div>
  <figcaption id="cap-crda">${raw(captionHtml)}</figcaption>
</figure>`;
}

export const figures = { trajectory: trajectoryFigure, poser: poserFigure, crda: crdaFigure };
