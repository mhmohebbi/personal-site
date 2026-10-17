import { html } from '../lib/html.mjs';
import { layout } from '../templates/layout.mjs';

export default function render(ctx) {
  return layout(ctx, {
    title: 'Page not found',
    description: 'This page does not exist.',
    bodyClass: 'page-404',
    body: html`<section class="notfound">
  <p class="kicker">Error 404</p>
  <h1 class="notfound__title">This state isn’t reachable.</h1>
  <p class="notfound__text">The page you asked for doesn’t exist, or it has moved. <a href="${ctx.base}">Return to the homepage</a>.</p>
</section>`,
  });
}
