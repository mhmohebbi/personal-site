import { html, raw } from '../lib/html.mjs';
import {
  education,
  experience,
  honours,
  profile,
  publications,
  skills,
  talks,
  teaching,
} from '../content/site.mjs';
import { icons } from '../templates/icons.mjs';
import { layout } from '../templates/layout.mjs';
import { authorList } from '../templates/parts.mjs';

const PUB_HEADINGS = {
  'Conference papers': 'Peer-reviewed conference papers',
  Preprints: 'Preprints and manuscripts under review',
  Thesis: 'Thesis',
};

const strip = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

const sec = (title, body) => html`<section class="cv__sec"><h2>${title}</h2><div class="cv__body">${body}</div></section>`;

const item = ({ title, date, note, bullets }) => html`<div class="cv-item">
  <div class="cv-item__row"><p class="cv-item__title">${title}</p>${date ? html`<p class="cv-item__date">${date}</p>` : ''}</div>
  ${note ? html`<p class="cv-item__note">${note}</p>` : ''}
  ${bullets && bullets.length ? html`<ul>${bullets.map((b) => html`<li>${raw(b)}</li>`)}</ul>` : ''}
</div>`;

function publicationsList() {
  let n = 0;
  return Object.entries(PUB_HEADINGS).map(([group, heading]) => {
    const pubs = publications.filter((p) => p.group === group);
    if (!pubs.length) return '';
    return html`<h3 class="cv__sub">${heading}</h3>
    <ol class="cv-pubs">
      ${pubs.map((p) => {
        n += 1;
        const links = [
          ...(p.arxiv ? [{ label: `arXiv:${p.arxiv}`, href: `https://arxiv.org/abs/${p.arxiv}` }] : []),
          ...p.links.filter((l) => l.label !== 'Paper'),
        ];
        return html`<li value="${n}">
          <p class="cv-pubs__title">${p.title}.</p>
          <p>${authorList(p)}.</p>
          <p class="cv-pubs__venue"><i>${p.venueLong}.</i>${p.equal ? ' † Equal contribution.' : ''}</p>
          <p class="cv-pubs__links">${links.map((l, i) => html`${i ? ' · ' : ''}<a href="${l.href}">${l.label}</a>`)}</p>
        </li>`;
      })}
    </ol>`;
  });
}

export default function render(ctx) {
  const contact = [
    { label: profile.email, href: `mailto:${profile.email}` },
    { label: 'Google Scholar', href: profile.links.scholar },
    { label: strip(profile.links.github), href: profile.links.github },
    { label: strip(profile.links.linkedin), href: profile.links.linkedin },
    { label: strip(ctx.siteUrl), href: ctx.siteUrl + '/' },
  ];

  const body = html`<article class="cv">
  <header class="cv__head">
    <div>
      <h1 class="cv__name">${profile.name}</h1>
      <p class="cv__contact">${contact.map((c, i) => html`${i ? html`<span aria-hidden="true"> · </span>` : ''}<a href="${c.href}">${c.label}</a>`)}</p>
    </div>
    <a class="button cv__pdf" href="${ctx.base}cv.pdf">${raw(icons.download)}<span>PDF</span></a>
  </header>

  ${sec('Research interests', html`<p class="cv__interests">${profile.interests}</p>`)}

  ${sec(
    'Education',
    education.map((e) =>
      item({
        title: html`<b>${e.org}</b>, ${e.location}<br><span class="cv-item__sub">${e.degree}</span>`,
        date: e.dates,
        bullets: e.details,
      }),
    ),
  )}

  ${sec('Publications', publicationsList())}

  ${sec(
    'Research experience',
    experience.research.map((e) => item({ title: html`<b>${e.role}</b>, ${e.org}`, date: e.dates, note: e.note, bullets: e.bullets })),
  )}

  ${sec(
    'Presentations',
    html`<ul class="cv-list">${talks.map(
      (t) => html`<li><div class="cv-item__row"><p class="cv-item__title"><b>${t.title}</b> — ${t.kind}</p><p class="cv-item__date">${t.date}</p></div><p class="cv-item__note">${t.venue}</p></li>`,
    )}</ul>`,
  )}

  ${sec(
    'Honours and awards',
    html`<ul class="cv-list cv-list--tight">${honours.map(
      (h) => html`<li><div class="cv-item__row"><p class="cv-item__title">${h.title}${h.org ? `, ${h.org}` : ''}</p><p class="cv-item__date">${h.date}</p></div></li>`,
    )}</ul>`,
  )}

  ${sec(
    'Teaching',
    teaching.map((t) => item({ title: html`<b>${t.role}</b>, ${t.course}, ${t.org}`, date: t.date, bullets: t.bullets })),
  )}

  ${sec(
    'Industry experience',
    html`${experience.industry.map((e) => item({ title: html`<b>${e.role}</b>, ${e.org}`, date: e.dates, bullets: e.bullets }))}
    ${item({
      title: html`<b>Software Engineer</b>, co-operative terms`,
      bullets: [experience.coop.map((c) => `${c.org} (${c.dates})`).join(' · ')],
    })}`,
  )}

  ${sec(
    'Technical skills',
    html`<dl class="cv-skills">${skills.map((s) => html`<div><dt>${s.area}</dt><dd>${s.items}</dd></div>`)}</dl>`,
  )}
</article>`;

  return layout(ctx, {
    title: 'CV',
    description: `Curriculum vitae of ${profile.name}: education, publications, research and industry experience, teaching and awards.`,
    body,
    bodyClass: 'page-cv',
    scripts: ['assets/js/site.js'],
  });
}
