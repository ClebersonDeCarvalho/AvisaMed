import { emit, EVENTS } from '../utils/eventBus.js';

const STORAGE_KEY = 'avisamed:theme';

export const THEMES = Object.freeze([
  { id: 'light', label: 'Claro', classes: ['theme-light'], scheme: 'light', metaColor: '#E3F2FD' },
  { id: 'hc-light', label: 'Claro (AAA)', classes: ['theme-hc-light', 'hc'], scheme: 'light', metaColor: '#FFFFFF' },
  { id: 'dark', label: 'Escuro', classes: ['theme-dark', 'dark'], scheme: 'dark', metaColor: '#061A3A' },
  { id: 'hc-dark', label: 'Escuro (AAA)', classes: ['theme-hc-dark', 'hc', 'dark'], scheme: 'dark', metaColor: '#000000' },
]);

const ALL_THEME_CLASSES = [...new Set(THEMES.flatMap((theme) => theme.classes))];

function findTheme(id) {
  return THEMES.find((theme) => theme.id === id);
}

export const ThemeService = {
  getPreferred() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (findTheme(saved)) return saved;
    } catch {}
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const prefersMore = window.matchMedia?.('(prefers-contrast: more)').matches;
    if (prefersMore) return prefersDark ? 'hc-dark' : 'hc-light';
    return prefersDark ? 'dark' : 'light';
  },

  current() {
    return findTheme(document.documentElement.dataset.theme) ?? THEMES[0];
  },

  apply(id, { persist = true } = {}) {
    const theme = findTheme(id) ?? THEMES[0];
    const root = document.documentElement;

    root.classList.remove(...ALL_THEME_CLASSES);
    root.classList.add(...theme.classes);
    root.dataset.theme = theme.id;
    root.style.colorScheme = theme.scheme;

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.metaColor);

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme.id);
      } catch {}
    }

    emit(EVENTS.THEME_CHANGED, theme);
    return theme;
  },

  init() {
    return this.apply(this.getPreferred(), { persist: false });
  },
};
