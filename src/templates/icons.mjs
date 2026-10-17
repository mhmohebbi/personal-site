// Inline SVG icons (24×24 grid). Decorative: always paired with visible text or an aria-label.

const svg = (body, { fill = 'none', stroke = 'currentColor', w = 1.6 } = {}) =>
  `<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  email: svg('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>'),
  scholar: svg(
    '<path d="M12 3 2 9l10 6 10-6-10-6Z" fill="currentColor" stroke="none"/><path d="M6 11.4V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.6l-6 3.6-6-3.6Z" fill="currentColor" stroke="none" opacity=".55"/>',
    { stroke: 'none' },
  ),
  github: svg(
    '<path fill="currentColor" stroke="none" d="M12 1.8a10.2 10.2 0 0 0-3.2 19.9c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.3-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .9-.3 2.8 1a9.6 9.6 0 0 1 5.1 0c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.2 10.2 0 0 0 12 1.8Z"/>',
    { stroke: 'none' },
  ),
  linkedin: svg(
    '<path fill="currentColor" stroke="none" d="M19.6 2.5H4.4c-1 0-1.9.8-1.9 1.8v15.4c0 1 .9 1.8 1.9 1.8h15.2c1 0 1.9-.8 1.9-1.8V4.3c0-1-.9-1.8-1.9-1.8ZM8.1 18.7H5.3V9.8h2.8v8.9ZM6.7 8.6a1.6 1.6 0 1 1 0-3.3 1.6 1.6 0 0 1 0 3.3Zm12 10.1h-2.8v-4.3c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3v4.4H10V9.8h2.6V11c.4-.7 1.3-1.4 2.7-1.4 2.9 0 3.4 1.9 3.4 4.3v4.8Z"/>',
    { stroke: 'none' },
  ),
  arrow: svg('<path d="M7 17 17 7M8.5 7H17v8.5"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'),
  moon: svg('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>'),
  copy: svg('<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
};
