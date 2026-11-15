import { icons } from './icons.js';
import { FOCUS_RING, spokenTime, pluralizeMedications } from '../scripts/utils/a11y.js';
import { escapeHTML } from '../scripts/utils/dom.js';
import { emit, on, EVENTS } from '../scripts/utils/eventBus.js';
import { CATEGORIES, getCategory } from '../scripts/config/categories.js';

function findNextId(list, now = new Date()) {
  if (list.length === 0) return null;
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return (list.find((med) => med.time >= current) ?? list[0]).id;
}

function groupByCategory(list) {
  const map = new Map();
  CATEGORIES.forEach((cat) => map.set(cat.id, { category: cat, items: [] }));

  list.forEach((med) => {
    const cat = getCategory(med.category);
    const group = map.get(cat.id) ?? map.get('outros');
    group.items.push(med);
  });

  return [...map.values()].filter((group) => group.items.length > 0);
}

function renderEmptyState() {
  return `
    <div class="flex flex-col items-center rounded-xl border-2 border-dashed border-field-border px-6 py-12 text-center">
      <span class="grid h-16 w-16 place-content-center rounded-full bg-accent-soft/50 text-primary">
        ${icons.inbox('h-8 w-8')}
      </span>
      <p class="mt-4 text-xl font-bold text-ink">Nenhum medicamento cadastrado ainda.</p>
      <p class="mt-1 max-w-md text-base text-ink-muted">
        Cadastre seu primeiro lembrete para vê-lo organizado aqui por categoria e receber avisos por voz no horário.
      </p>
      <button
        type="button"
        data-action="go-form"
        class="btn mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-primary bg-primary px-6 py-3 text-lg font-bold text-on-primary shadow-md transition hover:-translate-y-0.5 ${FOCUS_RING}"
      >
        ${icons.plus('h-6 w-6')}
        <span>Cadastrar primeiro lembrete</span>
      </button>
    </div>
  `;
}

function renderItem(med, isNext) {
  const name = escapeHTML(med.name);
  const dosage = escapeHTML(med.dosage);
  const categoryLabel = escapeHTML(getCategory(med.category).label);
  const spoken = spokenTime(med.time);

  return `
    <li>
      <article
        aria-labelledby="med-${med.id}-name"
        class="card flex flex-col gap-4 rounded-xl border-2 ${isNext ? 'border-accent' : 'border-border'} bg-card p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-start gap-4">
          <span class="grid h-12 w-12 shrink-0 place-content-center rounded-xl bg-accent-soft/50 text-primary">
            ${icons.pill('h-7 w-7')}
          </span>
          <div>
            <h3 id="med-${med.id}-name" class="text-xl font-bold text-ink">${name}</h3>
            <p class="text-lg text-ink-muted"><span class="sr-only">Dosagem: </span>${dosage}</p>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-0.5 text-sm font-bold text-ink">
                ${icons.tag('h-4 w-4')}
                <span><span class="sr-only">Categoria: </span>${categoryLabel}</span>
              </span>
              ${
                isNext
                  ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-0.5 text-sm font-bold text-on-primary">
                       ${icons.bell('h-4 w-4')}<span>Próxima dose</span>
                     </span>`
                  : ''
              }
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 sm:flex-col sm:items-end">
          <p class="inline-flex items-center gap-2 rounded-lg bg-accent-soft/40 px-3 py-1.5 text-xl font-bold text-ink">
            ${icons.clock('h-6 w-6')}
            <span class="sr-only">Horário:</span>
            <time datetime="${med.time}">
              <span aria-hidden="true">${med.time}</span>
              <span class="sr-only">${spoken}</span>
            </time>
          </p>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-action="edit"
              data-id="${med.id}"
              aria-label="Editar ${name}, ${dosage}, às ${spoken}"
              class="btn inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-field-border bg-card px-4 py-2 text-base font-bold text-ink transition hover:bg-accent-soft/40 ${FOCUS_RING}"
            >
              ${icons.pencil('h-5 w-5')}
              <span>Editar</span>
            </button>

            <button
              type="button"
              data-action="delete"
              data-id="${med.id}"
              aria-label="Excluir ${name}, ${dosage}, às ${spoken}"
              class="btn inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-field-border bg-card px-4 py-2 text-base font-bold text-ink transition hover:bg-primary hover:text-on-primary ${FOCUS_RING}"
            >
              ${icons.trash('h-5 w-5')}
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </article>
    </li>
  `;
}

function renderCategoryGroup({ category, items }, nextId) {
  const headingId = `cat-heading-${category.id}`;
  return `
    <section aria-labelledby="${headingId}" class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border pb-2">
        <h2 id="${headingId}" class="flex items-center gap-2 text-xl font-bold text-ink sm:text-2xl">
          ${icons.tag('h-6 w-6 text-primary')}
          <span>Remédios para ${escapeHTML(category.label)}</span>
        </h2>
        <span class="rounded-full bg-accent-soft/50 px-3 py-0.5 text-sm font-bold text-ink">
          ${pluralizeMedications(items.length)}
        </span>
      </div>

      <ul role="list" aria-labelledby="${headingId}" class="space-y-4">
        ${items.map((med) => renderItem(med, med.id === nextId)).join('')}
      </ul>
    </section>
  `;
}

export function MedicationList({ root, storage, router, confirmModal, notify }) {
  root.innerHTML = `
    <div class="card rounded-2xl border-2 border-border bg-card p-6 shadow-xl shadow-primary/10 sm:p-8">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            id="list-title"
            data-view-heading
            tabindex="-1"
            class="rounded-md text-2xl font-bold text-ink sm:text-3xl ${FOCUS_RING}"
          >
            Listagem de Lembretes
          </h1>
          <p class="mt-1 text-base text-ink-muted">
            Seus medicamentos agrupados por categoria e ordenados por horário.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <p
            data-count
            class="rounded-full border-2 border-border bg-accent-soft/40 px-4 py-1.5 text-base font-bold text-ink"
          ></p>
          <button
            type="button"
            data-action="go-form"
            class="btn inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-primary bg-primary px-4 py-2 text-base font-bold text-on-primary shadow-sm transition hover:-translate-y-0.5 ${FOCUS_RING}"
          >
            ${icons.plus('h-5 w-5')}
            <span>Novo lembrete</span>
          </button>
        </div>
      </div>

      <div data-list-body class="mt-8 space-y-8"></div>
    </div>
  `;

  const body = root.querySelector('[data-list-body]');
  const count = root.querySelector('[data-count]');
  let lastNextId = null;

  function render(list = storage.getAll()) {
    const activeEl = document.activeElement;
    const focusedAction = activeEl?.closest?.('[data-list-body]')
      ? {
          id: activeEl.getAttribute('data-id'),
          action: activeEl.getAttribute('data-action'),
        }
      : null;

    lastNextId = findNextId(list);
    count.textContent = pluralizeMedications(list.length);

    if (list.length === 0) {
      body.innerHTML = renderEmptyState();
    } else {
      const groups = groupByCategory(list);
      body.innerHTML = groups.map((group) => renderCategoryGroup(group, lastNextId)).join('');
    }

    if (focusedAction?.id && focusedAction?.action) {
      body
        .querySelector(
          `[data-action="${CSS.escape(focusedAction.action)}"][data-id="${CSS.escape(focusedAction.id)}"]`,
        )
        ?.focus();
    }
  }

  function focusAfterDelete(index) {
    const buttons = body.querySelectorAll('[data-action="delete"]');
    const target = buttons[index] ?? buttons[index - 1];
    (target ?? root.querySelector('#list-title'))?.focus();
  }

  root.addEventListener('click', (event) => {
    const goFormBtn = event.target.closest('[data-action="go-form"]');
    if (goFormBtn) {
      router.navigate('form');
      return;
    }

    const editBtn = event.target.closest('[data-action="edit"]');
    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const med = storage.getById(id);
      if (med) {
        emit(EVENTS.MEDICATION_EDIT_REQUESTED, med);
      }
      return;
    }

    const deleteBtn = event.target.closest('[data-action="delete"]');
    if (!deleteBtn) return;

    const id = deleteBtn.getAttribute('data-id');
    const med = storage.getById(id);
    if (!med) return;

    const allDeleteButtons = [...body.querySelectorAll('[data-action="delete"]')];
    const index = allDeleteButtons.indexOf(deleteBtn);

    confirmModal.open({
      title: 'Confirmar exclusão',
      description: `Tem certeza de que deseja excluir o medicamento "${med.name}" (${med.dosage}) programado para as ${med.time}? Esta ação não pode ser desfeita.`,
      confirmLabel: `Sim, excluir ${med.name}`,
      returnFocusTo: deleteBtn,
      onConfirm: () => {
        try {
          storage.remove(id);
          focusAfterDelete(index);
          notify({
            variant: 'info',
            title: 'Medicamento removido',
            message: `${med.name} foi excluído da sua lista.`,
          });
        } catch (error) {
          notify({
            variant: 'error',
            title: 'Não foi possível excluir',
            message: error.message,
            assertive: true,
            duration: 0,
          });
        }
      },
    });
  });

  on(EVENTS.MEDICATIONS_CHANGED, (list) => render(list));

  on(EVENTS.CLOCK_TICK, () => {
    const list = storage.getAll();
    if (findNextId(list) !== lastNextId) render(list);
  });

  render();
}
