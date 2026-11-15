import { FOCUS_RING } from '../scripts/utils/a11y.js';
import { on, EVENTS } from '../scripts/utils/eventBus.js';
import { ROUTES } from '../scripts/services/Router.js';

const NAV_ITEMS = [
  { id: ROUTES.home.id, label: 'O que é o AvisaMed' },
  { id: ROUTES.form.id, label: 'Cadastrar Lembretes' },
  { id: ROUTES.list.id, label: 'Listagem de Lembretes' },
];

export function Header({ root, router }) {
  root.innerHTML = `
    <header
      id="site-header"
      class="glass-header w-full rounded-2xl border-2 border-border/80 bg-header/75 px-4 py-2.5 shadow-lg shadow-primary/10 backdrop-blur-md sm:px-6"
    >
      <div class="flex flex-wrap items-center justify-between gap-3 md:flex-nowrap md:gap-4">
        <a
          href="#home"
          data-route="home"
          class="shrink-0 rounded-xl p-0.5 transition hover:scale-105 ${FOCUS_RING}"
          aria-label="AvisaMed — ir para O que é o AvisaMed"
          title="AvisaMed — Início"
        >
          <img
            src="./src/assets/logo.png"
            alt="Logo AvisaMed"
            width="44"
            height="44"
            decoding="async"
            class="h-11 w-11 rounded-xl bg-white object-contain p-0.5"
          />
        </a>

        <nav
          aria-label="Navegação principal"
          class="order-3 flex w-full justify-center md:order-2 md:w-auto md:flex-1"
        >
          <ul
            role="list"
            class="flex w-full flex-wrap items-center justify-center gap-1.5 rounded-xl bg-surface/55 p-1 md:w-auto md:flex-nowrap"
          >
            ${NAV_ITEMS.map(
    (item) => `
                <li>
                  <a
                    href="#${item.id}"
                    data-route="${item.id}"
                    class="nav-link inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border-2 border-transparent px-3.5 py-1.5 text-sm font-bold text-header-ink transition sm:text-base ${FOCUS_RING}"
                  >
                    ${item.label}
                  </a>
                </li>
              `,
  ).join('')}
          </ul>
        </nav>

        <div data-slot="theme-switcher" class="order-2 shrink-0 md:order-3"></div>
      </div>
    </header>
  `;

  const header = root.querySelector('#site-header');

  function syncActiveLinks(activeRoute = router.current()) {
    root.querySelectorAll('nav a[data-route]').forEach((link) => {
      const isCurrent = link.getAttribute('data-route') === activeRoute;
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('glass-nav-active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('glass-nav-active');
      }
    });
  }

  root.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-route]');
    if (!link) return;
    event.preventDefault();
    const targetRoute = link.getAttribute('data-route');
    router.navigate(targetRoute);
  });

  on(EVENTS.ROUTE_CHANGED, (routeId) => syncActiveLinks(routeId));

  function syncHeight() {
    if (!header) return;
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight + 24}px`);
  }

  syncHeight();
  syncActiveLinks();

  if ('ResizeObserver' in window) {
    new ResizeObserver(syncHeight).observe(header);
  } else {
    window.addEventListener('resize', syncHeight);
  }

  return { themeSlot: root.querySelector('[data-slot="theme-switcher"]') };
}
