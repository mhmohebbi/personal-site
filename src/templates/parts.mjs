// Shared fragments used by more than one page.

import { html, raw } from '../lib/html.mjs';
import { profile } from '../content/site.mjs';

export function authorList(pub) {
  const equal = new Set(pub.equal || []);
  const parts = pub.authors.map((name) => {
    const mark = equal.has(name) ? html`<sup class="eq" title="Equal contribution">†</sup>` : '';
    return name === profile.name ? html`<span class="me">${name}</span>${mark}` : html`${name}${mark}`;
  });
  return parts.map((p, i) => html`${i ? ', ' : ''}${p}`);
}

export function section({ id, label, body, className = '' }) {
  return html`<section class="section ${className}" id="${id}" aria-labelledby="h-${id}">
  <div class="grid">
    <h2 class="section__label" id="h-${id}"><span>${label}</span></h2>
    <div class="section__body">
${body}
    </div>
  </div>
</section>`;
}

export const prose = (paragraphs) => paragraphs.map((p) => html`<p>${raw(p)}</p>`);
