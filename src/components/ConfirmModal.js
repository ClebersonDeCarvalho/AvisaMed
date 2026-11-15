import { icons } from './icons.js';
import { FOCUS_RING } from '../scripts/utils/a11y.js';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const BACKGROUND_SELECTORS = ['#header-root', '#conteudo-principal', 'footer'];

export function ConfirmModal({ root }) {
  root.innerHTML = `
    <div
      id="confirm-modal-backdrop"
      hidden
      aria-hidden="true"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
    >
      <div
        id="confirm-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        class="card w-full max-w-lg rounded-2xl border-2 border-border bg-card p-6 shadow-2xl sm:p-8"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="grid h-12 w-12 shrink-0 place-content-center rounded-xl bg-accent-soft/60 text-primary">
              ${icons.warning('h-7 w-7')}
            </span>
            <h2 id="confirm-modal-title" class="font-heading text-2xl font-bold text-ink">
              Confirmar exclusão
            </h2>
          </div>

          <button
            type="button"
            data-modal-close
            aria-label="Fechar janela de confirmação"
            class="btn grid h-11 w-11 shrink-0 place-content-center rounded-lg border-2 border-transparent text-ink transition hover:border-field-border ${FOCUS_RING}"
          >
            ${icons.close('h-6 w-6')}
          </button>
        </div>

        <p id="confirm-modal-desc" class="mt-4 text-lg leading-relaxed text-ink-muted"></p>

        <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            data-modal-cancel
            class="btn inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-field-border bg-card px-6 py-3 text-lg font-bold text-ink transition hover:bg-accent-soft/30 ${FOCUS_RING}"
          >
            Cancelar
          </button>
          <button
            type="button"
            data-modal-confirm
            class="btn inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary px-6 py-3 text-lg font-bold text-on-primary shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 ${FOCUS_RING}"
          >
            ${icons.trash('h-5 w-5')}
            <span data-modal-confirm-label>Sim, excluir medicamento</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const backdrop = root.querySelector('#confirm-modal-backdrop');
  const dialog = root.querySelector('#confirm-modal-dialog');
  const titleEl = root.querySelector('#confirm-modal-title');
  const descEl = root.querySelector('#confirm-modal-desc');
  const confirmBtn = root.querySelector('[data-modal-confirm]');
  const confirmLabelEl = root.querySelector('[data-modal-confirm-label]');
  const cancelBtn = root.querySelector('[data-modal-cancel]');
  const closeBtn = root.querySelector('[data-modal-close]');

  let triggerElement = null;
  let confirmCallback = null;
  let isOpen = false;

  function setBackgroundInert(inert) {
    BACKGROUND_SELECTORS.forEach((selector) => {
      const el = document.querySelector(selector);
      if (!el) return;
      if (inert) {
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      }
    });
    document.body.style.overflow = inert ? 'hidden' : '';
  }

  function getFocusableElements() {
    return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
      (el) => el instanceof HTMLElement && !el.hidden && el.offsetParent !== null,
    );
  }

  function handleKeyDown(event) {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close({ restoreFocus: true });
      return;
    }

    if (event.key !== 'Tab') return;

    const focusables = getFocusableElements();
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || !dialog.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !dialog.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }

  function close({ restoreFocus = true } = {}) {
    isOpen = false;
    backdrop.hidden = true;
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.classList.add('hidden');
    backdrop.classList.remove('flex');
    setBackgroundInert(false);
    document.removeEventListener('keydown', handleKeyDown, true);

    const elementToFocus = triggerElement;
    triggerElement = null;
    confirmCallback = null;

    if (restoreFocus && elementToFocus && document.contains(elementToFocus)) {
      elementToFocus.focus();
    }
  }

  function open({
    title = 'Confirmar exclusão',
    description,
    confirmLabel = 'Sim, excluir medicamento',
    returnFocusTo,
    onConfirm,
  }) {
    triggerElement =
      returnFocusTo instanceof HTMLElement
        ? returnFocusTo
        : document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    confirmCallback = onConfirm;

    titleEl.textContent = title;
    descEl.textContent = description;
    confirmLabelEl.textContent = confirmLabel;

    backdrop.hidden = false;
    backdrop.setAttribute('aria-hidden', 'false');
    backdrop.classList.remove('hidden');
    backdrop.classList.add('flex');
    isOpen = true;
    setBackgroundInert(true);
    document.addEventListener('keydown', handleKeyDown, true);

    cancelBtn.focus();
  }

  cancelBtn.addEventListener('click', () => close({ restoreFocus: true }));
  closeBtn.addEventListener('click', () => close({ restoreFocus: true }));

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      close({ restoreFocus: true });
    }
  });

  confirmBtn.addEventListener('click', () => {
    const callback = confirmCallback;
    const savedTrigger = triggerElement;
    close({ restoreFocus: false });
    if (typeof callback === 'function') {
      callback(savedTrigger);
    }
  });

  return { open, close };
}
