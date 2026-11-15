import { icons } from './icons.js';
import { FOCUS_RING } from '../scripts/utils/a11y.js';
import { createFromHTML, escapeHTML } from '../scripts/utils/dom.js';

const VARIANTS = {
  success: { icon: icons.check },
  info: { icon: icons.info },
  reminder: { icon: icons.bell },
  error: { icon: icons.warning },
};

export function Toast({ root }) {
  root.innerHTML = `
    <section aria-label="Notificações" class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 p-4 sm:items-end sm:p-6">
      <div data-region="assertive" role="alert" aria-live="assertive" aria-atomic="false" class="flex w-full max-w-md flex-col gap-3"></div>
      <div data-region="polite" role="status" aria-live="polite" aria-atomic="false" class="flex w-full max-w-md flex-col gap-3"></div>
    </section>
  `;

  const regions = {
    polite: root.querySelector('[data-region="polite"]'),
    assertive: root.querySelector('[data-region="assertive"]'),
  };

  function dismiss(toast) {
    toast.classList.remove('is-visible');
    const remove = () => toast.remove();
    toast.addEventListener('transitionend', remove, { once: true });
    setTimeout(remove, 400);
  }

  function show({ variant = 'success', title, message = '', assertive = false, duration = 6000 }) {
    const { icon } = VARIANTS[variant] ?? VARIANTS.info;
    const isUrgent = variant === 'reminder' || variant === 'error';

    const toast = createFromHTML(`
      <div class="toast pointer-events-auto rounded-xl border-2 ${isUrgent ? 'border-primary' : 'border-border'} bg-card p-4 shadow-2xl shadow-primary/20">
        <div class="flex items-start gap-4">
          <span class="grid h-10 w-10 shrink-0 place-content-center rounded-full ${isUrgent ? 'bg-primary text-on-primary' : 'bg-accent-soft/60 text-primary'}">
            ${icon('h-6 w-6')}
          </span>
          <div class="flex-1 pt-1">
            <p class="text-lg font-bold text-ink">${escapeHTML(title)}</p>
            ${message ? `<p class="mt-1 text-base text-ink-muted">${escapeHTML(message)}</p>` : ''}
          </div>
          <button
            type="button"
            data-action="close"
            class="btn grid h-11 w-11 shrink-0 place-content-center rounded-lg border-2 border-transparent text-ink transition hover:border-field-border ${FOCUS_RING}"
          >
            <span class="sr-only">Fechar notificação</span>
            ${icons.close('h-5 w-5')}
          </button>
        </div>
      </div>
    `);

    (assertive ? regions.assertive : regions.polite).appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));

    toast.querySelector('[data-action="close"]').addEventListener('click', () => dismiss(toast));

    if (duration > 0) {
      let timer = setTimeout(() => dismiss(toast), duration);
      const pause = () => clearTimeout(timer);
      const resume = () => {
        clearTimeout(timer);
        timer = setTimeout(() => dismiss(toast), duration / 2);
      };
      toast.addEventListener('mouseenter', pause);
      toast.addEventListener('focusin', pause);
      toast.addEventListener('mouseleave', resume);
      toast.addEventListener('focusout', resume);
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const toasts = root.querySelectorAll('.toast.is-visible');
    const last = toasts[toasts.length - 1];
    if (last) dismiss(last);
  });

  return { show };
}
