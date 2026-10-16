// Minimal HTML templating: interpolations are escaped unless wrapped in raw().

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

class Raw {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

/** Mark a trusted string (authored content, prebuilt markup) as HTML. */
export const raw = (value) => new Raw(String(value ?? ''));

function render(value) {
  if (value == null || value === false || value === true) return '';
  if (Array.isArray(value)) return value.map(render).join('');
  if (value instanceof Raw) return value.value;
  return escape(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new Raw(out);
}
