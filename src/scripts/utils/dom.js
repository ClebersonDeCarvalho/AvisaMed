const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function createFromHTML(markup) {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  return template.content.firstElementChild;
}
