# hosseinmohebbi.com

Personal academic site of Hossein Mohebbi. It is a static site with a zero-dependency
Node build and is deployed to GitHub Pages by GitHub Actions.

## Editing content

Everything on the site comes from **`src/content/site.mjs`**: the profile, news, research
threads, publications (with BibTeX), experience, talks, teaching and honours. The homepage,
the web CV at `/cv/`, the PDF CV, structured data and the sitemap are all rendered from it.

After changing content, regenerate the committed PDF CV and social image:

```sh
npm run render   # needs Playwright: npm i -D playwright && npx playwright install chromium
```

## Commands

| Command          | What it does                                                         |
| ---------------- | -------------------------------------------------------------------- |
| `npm run dev`    | Build, serve on http://localhost:4000, and rebuild on every change   |
| `npm run build`  | Build to `_site/`                                                    |
| `npm run check`  | Build, then verify every internal link, asset and `#anchor` resolves |
| `npm run render` | Re-render `src/static/cv.pdf`, `og.png` and `apple-touch-icon.png`   |

No `npm install` is needed for anything except `render`.

## Layout

```
src/
  content/site.mjs        all site content (single source of truth)
  pages/                  index (homepage), cv, 404
  templates/              layout, shared fragments, icons, build-time figure SVG
  lib/html.mjs            escaping html`` template tag
  assets/
    css/site.css          the whole design system: tokens, light + dark, print
    js/site.js            theme toggle, nav state, BibTeX copy, figure boot
    js/figures/           the three interactive research figures; *-model.js files
                          are shared with the build so the static SVG matches
    fonts/                self-hosted Newsreader, Inter, JetBrains Mono (OFL)
    img/                  portrait, favicon, generated og.png / touch icon
  static/                 copied verbatim to the site root (cv.pdf, legacy files)
scripts/
  build.mjs  serve.mjs  check.mjs  render.mjs
```

Every page works without JavaScript. The figures are rendered at build time in their final
state, and the scripts only add animation and interaction. They respect `prefers-reduced-motion`.

## Deployment

`.github/workflows/pages.yml` builds and deploys on every push to `main`, and runs the build
and link check on pull requests.

One-time setup in the repository settings:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. For the custom domain, enter `hosseinmohebbi.com` under **Settings → Pages → Custom domain**.
   At the DNS provider, point the apex at GitHub Pages (`A` records to 185.199.108.153,
   185.199.109.153, 185.199.110.153 and 185.199.111.153) and `www` (`CNAME`) at
   `mhmohebbi.github.io`. Then enable **Enforce HTTPS**.

The build reads the real public URL from the Pages configuration, so links stay correct
whether the site is served from the custom domain or from `mhmohebbi.github.io/personal-site/`.

## Legacy URLs

These files stay at their old paths because other things may still link to them:
`/Hossein-Mohebbi-Resume.pdf` (now a copy of the current CV), `/gym/` (redirect),
and the token-metadata files `/pbst.json`, `/pbst.png`, `/sbt.json`, `/sbt.png` and
`/AccreditedInvsestor.png`.
