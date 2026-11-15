import { emit, EVENTS } from '../utils/eventBus.js';

export const ROUTES = Object.freeze({
  home: {
    id: 'home',
    label: 'O que é o AvisaMed',
    title: 'AvisaMed — O que é o AvisaMed',
    sectionId: 'view-home',
  },
  form: {
    id: 'form',
    label: 'Cadastrar Lembretes',
    title: 'AvisaMed — Cadastrar Lembretes',
    sectionId: 'view-form',
  },
  list: {
    id: 'list',
    label: 'Listagem de Lembretes',
    title: 'AvisaMed — Listagem de Lembretes',
    sectionId: 'view-list',
  },
});

let currentRoute = 'home';

function normalizeRoute(value) {
  const clean = String(value ?? '').replace(/^#/, '').trim();
  return ROUTES[clean] ? clean : 'home';
}

export const Router = {
  current() {
    return currentRoute;
  },

  navigate(routeId, { focusHeading = true, updateHash = true } = {}) {
    const target = normalizeRoute(routeId);
    currentRoute = target;

    Object.values(ROUTES).forEach((route) => {
      const section = document.getElementById(route.sectionId);
      if (!section) return;
      const isActive = route.id === target;
      section.hidden = !isActive;
      section.classList.toggle('hidden', !isActive);
      section.setAttribute('aria-hidden', String(!isActive));
    });

    document.title = ROUTES[target].title;

    if (updateHash && window.location.hash !== `#${target}`) {
      history.pushState(null, '', `#${target}`);
    }

    emit(EVENTS.ROUTE_CHANGED, target);

    if (focusHeading) {
      const activeSection = document.getElementById(ROUTES[target].sectionId);
      const heading = activeSection?.querySelector('[data-view-heading]');
      if (heading instanceof HTMLElement) {
        heading.focus();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  init() {
    const initial = normalizeRoute(window.location.hash);
    this.navigate(initial, { focusHeading: false, updateHash: false });

    window.addEventListener('hashchange', () => {
      const target = normalizeRoute(window.location.hash);
      if (target !== currentRoute) {
        this.navigate(target, { focusHeading: true, updateHash: false });
      }
    });
  },
};
