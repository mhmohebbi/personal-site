// Figure 2: a policy routing subtasks to generative experts, with critic feedback.

import { along, playOnView, sleep, tween } from './anim.js';

const ROUTE = [1, 2, 4]; // expert chosen for each subtask (matches the build-time render)

export function mountPoser(fig, { reduced }) {
  if (reduced) return;

  const svg = fig.querySelector('svg');
  const $ = (sel) => svg.querySelector(sel);
  const $$ = (sel) => [...svg.querySelectorAll(sel)];

  const chips = $$('[data-subtask]');
  const experts = $$('[data-expert]');
  const edgesIn = $$('[data-edge-in]');
  const edgesOut = $$('[data-edge-out]');
  const edgesImg = $$('[data-edge-img]');
  const edgeCritic = $('[data-edge-critic]');
  const edgeReward = $('[data-edge-reward]');
  const layers = $$('[data-layer]');
  const wash = $('[data-wash]');
  const critic = $('[data-critic]');
  const policy = $('[data-policy]');
  const reward = $('[data-reward]');
  const rewardSub = reward.querySelector('.ps-sub');
  const token = $('[data-token]');

  const all = [...chips, ...experts, ...edgesIn, ...edgesOut, ...edgesImg, edgeCritic, edgeReward, critic];

  const travel = (path, ms, signal) =>
    along(
      path,
      ms,
      (pt) => {
        token.setAttribute('cx', pt.x.toFixed(1));
        token.setAttribute('cy', pt.y.toFixed(1));
      },
      { signal },
    );

  // Layers are cloned by <use> for the watercolour pass, so animate the
  // presentation attribute (which the clone mirrors), not a CSS class.
  const fadeLayer = (layer, signal) => tween(520, (k) => layer.setAttribute('opacity', k.toFixed(3)), { signal });

  function reset() {
    all.forEach((el) => el.classList.remove('is-active', 'is-done'));
    layers.forEach((l) => l.setAttribute('opacity', '0'));
    wash.classList.remove('is-on');
    policy.classList.remove('is-pulse');
    reward.setAttribute('opacity', '0');
    token.setAttribute('opacity', '0');
  }

  async function run(signal) {
    reset();
    await sleep(500, signal);

    for (let k = 0; k < chips.length; k++) {
      const j = ROUTE[k];
      if (k > 0) {
        chips[k - 1].classList.replace('is-active', 'is-done');
        [edgesIn[k - 1], edgesOut[ROUTE[k - 1]], edgesImg[ROUTE[k - 1]], experts[ROUTE[k - 1]]].forEach((el) =>
          el.classList.remove('is-active'),
        );
        edgeCritic.classList.remove('is-active');
        edgeReward.classList.remove('is-active');
        critic.classList.remove('is-active');
      }

      chips[k].classList.add('is-active');
      edgesIn[k].classList.add('is-active');
      token.setAttribute('opacity', '1');
      await travel(edgesIn[k], 520, signal);

      policy.classList.add('is-pulse');
      await sleep(200, signal);
      policy.classList.remove('is-pulse');

      experts[j].classList.add('is-active');
      edgesOut[j].classList.add('is-active');
      await travel(edgesOut[j], 420, signal);
      edgesImg[j].classList.add('is-active');
      await travel(edgesImg[j], 380, signal);
      token.setAttribute('opacity', '0');

      if (k < layers.length) await fadeLayer(layers[k], signal);
      else {
        wash.classList.add('is-on');
        await sleep(850, signal);
      }

      edgeCritic.classList.add('is-active');
      token.setAttribute('opacity', '1');
      await travel(edgeCritic, 300, signal);
      critic.classList.add('is-active');
      await sleep(260, signal);

      edgeReward.classList.add('is-active');
      rewardSub.textContent = String(k + 1);
      reward.setAttribute('opacity', '1');
      await travel(edgeReward, 640, signal);
      token.setAttribute('opacity', '0');
      policy.classList.add('is-pulse');
      await sleep(260, signal);
      policy.classList.remove('is-pulse');
      await sleep(320, signal);
    }

    rewardSub.textContent = 't';
  }

  playOnView(fig, run, { threshold: 0.45 });
}
