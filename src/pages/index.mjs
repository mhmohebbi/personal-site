import { html, raw } from '../lib/html.mjs';
import {
  education,
  experience,
  honours,
  news,
  profile,
  publications,
  research,
  talks,
  teaching,
} from '../content/site.mjs';
import { figures } from '../templates/figures.mjs';
import { icons } from '../templates/icons.mjs';
import { layout } from '../templates/layout.mjs';
import { authorList, prose, section } from '../templates/parts.mjs';

const pubById = Object.fromEntries(publications.map((p) => [p.id, p]));

function hero(ctx) {
  const links = [
    { label: 'Email', href: `mailto:${profile.email}`, icon: icons.email },
    { label: 'Google Scholar', href: profile.links.scholar, icon: icons.scholar },
    { label: 'GitHub', href: profile.links.github, icon: icons.github },
    { label: 'LinkedIn', href: profile.links.linkedin, icon: icons.linkedin },
    { label: 'CV', href: `${ctx.base}cv/`, icon: icons.cv },
  ];
  return html`<section class="hero" aria-labelledby="h-name">
  <canvas class="hero__field" data-landscape aria-hidden="true"></canvas>
  <div class="grid">
    <div class="hero__aside">
      <img class="hero__portrait" src="${ctx.asset(profile.portrait)}" alt="Portrait of ${profile.name}" width="600" height="600" decoding="async" fetchpriority="high">
    </div>
    <div class="hero__body">
      <h1 class="hero__name" id="h-name" data-hero-name>${profile.name}</h1>
      <p class="hero__lede">${raw(profile.lede)}</p>
      <ul class="hero__affil">${profile.affiliation.map((a) => html`<li>${a}</li>`)}</ul>
      <ul class="hero__links">
        ${links.map((l) => html`<li><a href="${l.href}">${raw(l.icon)}<span>${l.label}</span></a></li>`)}
      </ul>
    </div>
  </div>
</section>`;
}

const about = () => section({ id: 'about', label: 'About', body: html`<div class="prose prose--lead">${prose(profile.about)}</div>` });

const newsSection = () =>
  section({
    id: 'news',
    label: 'News',
    body: html`<ol class="news">
      ${news.map((item) => html`<li><time>${item.date}</time><p>${raw(item.text)}</p></li>`)}
    </ol>`,
  });

function researchSection() {
  const threads = research.map((r) => {
    const pub = r.paper && pubById[r.paper];
    return html`<article class="thread" id="${r.id}" aria-labelledby="h-${r.id}">
      <header class="thread__head">
        <p class="kicker">${r.when}</p>
        <h3 class="thread__title" id="h-${r.id}">${r.title}</h3>
      </header>
      <div class="prose">${prose(r.text)}</div>
      ${pub
        ? html`<p class="thread__paper"><a href="#pub-${pub.id}"><span class="thread__paper-k">Paper</span> <span class="thread__paper-t">${pub.title}</span> <span class="thread__paper-v">${pub.venueShort}</span></a></p>`
        : ''}
      ${figures[r.figure](r.caption)}
    </article>`;
  });
  return section({ id: 'research', label: 'Research', className: 'section--research', body: html`${threads}` });
}

function publicationsSection() {
  const groups = [...new Set(publications.map((p) => p.group))];
  const body = groups.map(
    (g) => html`<h3 class="subhead">${g}</h3>
    <ol class="pubs">
      ${publications
        .filter((p) => p.group === g)
        .map(
          (p) => html`<li class="pub" id="pub-${p.id}">
        <p class="pub__venue"><span class="badge${p.venueShort.startsWith('ICML') ? ' badge--strong' : ''}">${p.venueShort}</span></p>
        <div class="pub__body">
          <h4 class="pub__title"><a href="${p.links[0].href}">${p.title}</a></h4>
          <p class="pub__authors">${authorList(p)}</p>
          <p class="pub__where">${p.venueLong}${p.equal ? html`<span class="pub__note"> · † equal contribution</span>` : ''}</p>
          ${p.summary ? html`<p class="pub__summary">${p.summary}</p>` : ''}
          <p class="pub__links">
            ${p.links.map((l) => html`<a href="${l.href}">${l.label}</a>`)}
            <button type="button" class="linklike" data-bib-toggle aria-expanded="false" aria-controls="bib-${p.id}">BibTeX</button>
          </p>
          <div class="bib" id="bib-${p.id}" hidden>
            <pre><code>${p.bibtex}</code></pre>
            <button type="button" class="bib__copy" data-copy="bib-${p.id}">${raw(icons.copy)}<span>Copy</span></button>
          </div>
        </div>
      </li>`,
        )}
    </ol>`,
  );
  return section({ id: 'publications', label: 'Publications', body: html`${body}` });
}

const entry = (dates, head, desc) =>
  html`<li class="entry"><span class="entry__date">${dates}</span><div class="entry__body"><p class="entry__head">${head}</p>${desc ? html`<p class="entry__desc">${raw(desc)}</p>` : ''}</div></li>`;

function experienceSection() {
  const coops = experience.coop;
  const body = html`<h3 class="subhead">Research</h3>
    <ol class="entries">
      ${experience.research.map((e) => entry(e.dates, html`<b>${e.role}</b> · ${e.org}`, e.desc))}
    </ol>
    <h3 class="subhead">Industry</h3>
    <ol class="entries">
      ${experience.industry.map((e) => entry(e.dates, html`<b>${e.role}</b> · ${e.org}`, e.desc))}
      <li class="entry">
        <span class="entry__date">2019 – 2023</span>
        <div class="entry__body">
          <p class="entry__head"><b>Software Engineer</b> · co-op terms</p>
          <dl class="coops">
            ${coops.map((c) => html`<div class="coops__row"><dt>${c.org}</dt><dd>${c.desc}</dd><dd class="coops__date">${c.dates}</dd></div>`)}
          </dl>
        </div>
      </li>
    </ol>
    <h3 class="subhead">Education</h3>
    <ol class="entries">
      ${education.map((e) => entry(e.dates, html`<b>${e.degree}</b> · ${e.org}`, e.details.join(' · ')))}
    </ol>`;
  return section({ id: 'experience', label: 'Experience', body });
}

function talksSection() {
  // One entry per piece of work, listing every venue it was presented at.
  const byTitle = [];
  for (const t of talks) {
    let group = byTitle.find((g) => g.title === t.title);
    if (!group) byTitle.push((group = { title: t.title, items: [] }));
    group.items.push(t);
  }
  const years = (items) => [...new Set(items.map((t) => t.date.slice(-4)))].sort().join(' – ');
  return section({
    id: 'talks',
    label: 'Talks',
    body: html`<ol class="entries">
      ${byTitle.map(
        (g) => html`<li class="entry"><span class="entry__date">${years(g.items)}</span><div class="entry__body">
          <p class="entry__head"><b>${g.title}</b></p>
          <ul class="venues">${g.items.map(
            (t) => html`<li><span class="venues__kind">${t.kind}</span><span>${t.venue}</span><span class="venues__date">${t.date}</span></li>`,
          )}</ul>
        </div></li>`,
      )}
    </ol>`,
  });
}

const teachingSection = () =>
  section({
    id: 'teaching',
    label: 'Teaching',
    body: html`<ol class="entries entries--compact">
      ${teaching.map((t) => entry(t.date, html`<b>${t.course}</b> · ${t.org}`, t.desc ? `${t.role}. ${t.desc}` : t.role))}
    </ol>`,
  });

const honoursSection = () =>
  section({
    id: 'honours',
    label: 'Honours',
    body: html`<ol class="entries entries--compact">
      ${honours.map((h) => entry(h.date, h.org ? html`<b>${h.title}</b> · ${h.org}` : html`<b>${h.title}</b>`))}
    </ol>`,
  });

const contactSection = () =>
  section({
    id: 'contact',
    label: 'Contact',
    className: 'section--contact',
    body: html`<p class="contact__lead">Email is the best way to reach me. I’m always happy to talk about computer-use agents, reinforcement learning, and possible collaborations.</p>
    <p class="contact__email"><a href="mailto:${profile.email}">${profile.email}</a></p>
    <p class="contact__links">
      <a href="${profile.links.scholar}">Google Scholar</a>
      <a href="${profile.links.github}">GitHub</a>
      <a href="${profile.links.linkedin}">LinkedIn</a>
    </p>`,
  });

export default function render(ctx) {
  return layout(ctx, {
    body: html`${hero(ctx)}
${about()}
${newsSection()}
${researchSection()}
${publicationsSection()}
${experienceSection()}
${talksSection()}
${teachingSection()}
${honoursSection()}
${contactSection()}`,
    bodyClass: 'page-home',
    scripts: ['assets/js/site.js'],
  });
}
