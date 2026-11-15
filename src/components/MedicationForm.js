import { icons } from './icons.js';
import { FOCUS_RING, spokenTime } from '../scripts/utils/a11y.js';
import { escapeHTML } from '../scripts/utils/dom.js';
import { on, EVENTS } from '../scripts/utils/eventBus.js';
import { CATEGORIES, getCategory } from '../scripts/config/categories.js';
import { StorageError } from '../scripts/services/StorageService.js';

const FIELD_CLASSES = `mt-2 block h-12 w-full rounded-lg border-2 border-field-border bg-card px-4 text-lg text-ink placeholder:text-ink-muted ${FOCUS_RING}`;

const INPUT_FIELDS = [
  {
    id: 'med-name',
    name: 'name',
    label: 'Nome do medicamento',
    type: 'text',
    hint: 'Exemplo: Losartana, Metformina, Dipirona.',
    attrs: 'maxlength="60" autocomplete="off" spellcheck="false"',
  },
  {
    id: 'med-dosage',
    name: 'dosage',
    label: 'Dosagem',
    type: 'text',
    hint: 'Exemplo: 50 mg, 1 comprimido, 15 gotas.',
    attrs: 'maxlength="40" autocomplete="off"',
  },
  {
    id: 'med-time',
    name: 'time',
    label: 'Horário',
    type: 'time',
    hint: 'Hora em que o lembrete deve aparecer e falar em voz alta (formato 24 horas).',
    attrs: '',
  },
];

function renderInputField({ id, name, label, type, hint, attrs }) {
  return `
    <div>
      <label for="${id}" class="block text-lg font-bold text-ink">
        ${label}
        <span class="text-ink-muted" aria-hidden="true">*</span>
        <span class="sr-only">(obrigatório)</span>
      </label>
      <p id="${id}-hint" class="mt-1 text-base text-ink-muted">${hint}</p>
      <input
        id="${id}"
        name="${name}"
        type="${type}"
        required
        aria-required="true"
        aria-invalid="false"
        aria-describedby="${id}-hint ${id}-error"
        class="${FIELD_CLASSES}"
        ${attrs}
      />
      <p id="${id}-error" class="mt-2 hidden items-start gap-2 text-base font-bold text-ink" data-error-for="${name}"></p>
    </div>
  `;
}

function renderCategoryField() {
  return `
    <div>
      <label for="med-category" class="block text-lg font-bold text-ink">
        Categoria
        <span class="text-ink-muted" aria-hidden="true">*</span>
        <span class="sr-only">(obrigatório)</span>
      </label>
      <p id="med-category-hint" class="mt-1 text-base text-ink-muted">
        Agrupa este medicamento na tela de listagem (ex.: Pressão, Dor, Diabetes).
      </p>
      <select
        id="med-category"
        name="category"
        required
        aria-required="true"
        aria-invalid="false"
        aria-describedby="med-category-hint med-category-error"
        class="${FIELD_CLASSES} cursor-pointer font-bold"
      >
        <option value="" disabled selected>Selecione uma categoria…</option>
        ${CATEGORIES.map(
          (cat) => `<option value="${cat.id}">${escapeHTML(cat.label)}</option>`,
        ).join('')}
      </select>
      <p id="med-category-error" class="mt-2 hidden items-start gap-2 text-base font-bold text-ink" data-error-for="category"></p>
    </div>
  `;
}

const ALL_FIELD_NAMES = [
  { id: 'med-name', name: 'name' },
  { id: 'med-dosage', name: 'dosage' },
  { id: 'med-time', name: 'time' },
  { id: 'med-category', name: 'category' },
];

export function MedicationForm({ root, storage, router, notify }) {
  let editingId = null;

  root.innerHTML = `
    <div class="mx-auto max-w-2xl">
      <div class="card rounded-2xl border-2 border-border bg-card p-6 shadow-xl shadow-primary/10 sm:p-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <span
              data-form-icon
              class="grid h-12 w-12 shrink-0 place-content-center rounded-xl bg-accent-soft/50 text-primary"
            >
              ${icons.plus('h-7 w-7')}
            </span>
            <div>
              <h1
                id="form-title"
                data-view-heading
                tabindex="-1"
                class="rounded-md text-2xl font-bold text-ink sm:text-3xl ${FOCUS_RING}"
              >
                Cadastrar Lembrete
              </h1>
              <p id="form-desc" class="text-base text-ink-muted">
                Campos com <span aria-hidden="true">*</span><span class="sr-only">asterisco</span> são obrigatórios.
              </p>
            </div>
          </div>

          <a
            href="#list"
            data-go-list
            class="btn inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-field-border bg-card px-4 py-2 text-base font-bold text-ink transition hover:bg-accent-soft/30 ${FOCUS_RING}"
          >
            ${icons.list('h-5 w-5')}
            <span>Ver listagem</span>
          </a>
        </div>

        <div
          id="edit-mode-banner"
          hidden
          class="mt-6 hidden flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-primary bg-accent-soft/40 p-4 text-base font-bold text-ink"
        >
          <span data-edit-banner-text>Editando medicamento selecionado.</span>
          <button
            type="button"
            data-cancel-edit
            class="btn inline-flex min-h-11 items-center rounded-lg border-2 border-field-border bg-card px-4 py-1.5 text-base font-bold text-ink ${FOCUS_RING}"
          >
            Cancelar edição
          </button>
        </div>

        <form id="medication-form" class="mt-6 space-y-6" novalidate aria-labelledby="form-title" aria-describedby="form-desc">
          ${INPUT_FIELDS.map(renderInputField).join('')}
          ${renderCategoryField()}

          <div class="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              class="btn inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary px-6 py-3 text-lg font-bold text-on-primary shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 ${FOCUS_RING}"
            >
              ${icons.check('h-6 w-6')}
              <span data-submit-label>Salvar medicamento</span>
            </button>
            <button
              type="reset"
              data-reset-btn
              class="btn inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-field-border bg-card px-6 py-3 text-lg font-bold text-ink transition hover:bg-accent-soft/30 ${FOCUS_RING}"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = root.querySelector('#medication-form');
  const titleEl = root.querySelector('#form-title');
  const iconEl = root.querySelector('[data-form-icon]');
  const submitLabelEl = root.querySelector('[data-submit-label]');
  const editBanner = root.querySelector('#edit-mode-banner');
  const editBannerText = root.querySelector('[data-edit-banner-text]');
  const cancelEditBtn = root.querySelector('[data-cancel-edit]');
  const goListLink = root.querySelector('[data-go-list]');

  goListLink.addEventListener('click', (event) => {
    event.preventDefault();
    router.navigate('list');
  });

  function setFieldError(name, message) {
    const field = form.elements.namedItem(name);
    const error = form.querySelector(`[data-error-for="${name}"]`);
    if (!(field instanceof HTMLElement) || !error) return;

    if (message) {
      field.setAttribute('aria-invalid', 'true');
      error.innerHTML = `${icons.warning('h-6 w-6 shrink-0')}<span>Erro: ${escapeHTML(message)}</span>`;
      error.classList.remove('hidden');
      error.classList.add('flex');
    } else {
      field.setAttribute('aria-invalid', 'false');
      error.innerHTML = '';
      error.classList.add('hidden');
      error.classList.remove('flex');
    }
  }

  function clearAllErrors() {
    ALL_FIELD_NAMES.forEach(({ name }) => setFieldError(name, ''));
  }

  function setEditMode(medication) {
    clearAllErrors();

    if (medication) {
      editingId = medication.id;
      titleEl.textContent = `Editar: ${medication.name}`;
      iconEl.innerHTML = icons.pencil('h-7 w-7');
      submitLabelEl.textContent = 'Salvar alterações';
      editBannerText.textContent = `Editando "${medication.name}" (${medication.dosage} às ${medication.time}).`;
      editBanner.hidden = false;
      editBanner.classList.remove('hidden');
      editBanner.classList.add('flex');

      form.elements.namedItem('name').value = medication.name;
      form.elements.namedItem('dosage').value = medication.dosage;
      form.elements.namedItem('time').value = medication.time;
      form.elements.namedItem('category').value = getCategory(medication.category).id;
    } else {
      editingId = null;
      titleEl.textContent = 'Cadastrar Lembrete';
      iconEl.innerHTML = icons.plus('h-7 w-7');
      submitLabelEl.textContent = 'Salvar medicamento';
      editBanner.hidden = true;
      editBanner.classList.add('hidden');
      editBanner.classList.remove('flex');
      form.reset();
    }
  }

  cancelEditBtn.addEventListener('click', () => {
    setEditMode(null);
    router.navigate('list');
  });

  function validate({ name, dosage, time, category }) {
    const errors = {};
    if (name.trim().length < 2) {
      errors.name = 'Informe o nome do medicamento (mínimo de 2 letras).';
    }
    if (!dosage.trim()) {
      errors.dosage = 'Informe a dosagem, por exemplo "50 mg".';
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      errors.time = 'Informe um horário válido, por exemplo 08:00.';
    } else if (!errors.name && storage.exists(name, time, editingId ?? undefined)) {
      errors.time = `Já existe "${name.trim()}" cadastrado às ${time}.`;
    }
    if (!category) {
      errors.category = 'Selecione uma categoria para o medicamento.';
    }
    return errors;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = {
      name: String(form.elements.namedItem('name').value),
      dosage: String(form.elements.namedItem('dosage').value),
      time: String(form.elements.namedItem('time').value),
      category: String(form.elements.namedItem('category').value),
    };

    const errors = validate(data);
    ALL_FIELD_NAMES.forEach(({ name }) => setFieldError(name, errors[name]));

    const firstInvalid = ALL_FIELD_NAMES.find(({ name }) => errors[name]);
    if (firstInvalid) {
      document.getElementById(firstInvalid.id)?.focus();
      return;
    }

    try {
      const categoryLabel = getCategory(data.category).label;

      if (editingId) {
        const updated = storage.update(editingId, data);
        setEditMode(null);
        notify({
          variant: 'success',
          title: 'Medicamento salvo com sucesso',
          message: `${updated.name} (${updated.dosage}, ${categoryLabel}) atualizado para ${spokenTime(updated.time)}.`,
        });
        router.navigate('list');
      } else {
        const med = storage.add(data);
        notify({
          variant: 'success',
          title: 'Medicamento salvo com sucesso',
          message: `${med.name} (${med.dosage} — ${categoryLabel}) às ${spokenTime(med.time)}.`,
        });
        form.reset();
        document.getElementById('med-name')?.focus();
      }
    } catch (error) {
      notify({
        variant: 'error',
        title: 'Não foi possível salvar',
        message: error instanceof StorageError ? error.message : 'Ocorreu um erro inesperado. Tente novamente.',
        assertive: true,
        duration: 0,
      });
    }
  });

  form.addEventListener('reset', () => {
    clearAllErrors();
    if (editingId) {
      editingId = null;
      titleEl.textContent = 'Cadastrar Lembrete';
      iconEl.innerHTML = icons.plus('h-7 w-7');
      submitLabelEl.textContent = 'Salvar medicamento';
      editBanner.hidden = true;
      editBanner.classList.add('hidden');
      editBanner.classList.remove('flex');
    }
  });

  const clearErrorOnChange = (event) => {
    const target = event.target;
    if (
      (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) &&
      target.getAttribute('aria-invalid') === 'true'
    ) {
      setFieldError(target.name, '');
    }
  };
  form.addEventListener('input', clearErrorOnChange);
  form.addEventListener('change', clearErrorOnChange);

  on(EVENTS.MEDICATION_EDIT_REQUESTED, (medication) => {
    if (!medication) return;
    setEditMode(medication);
    router.navigate('form', { focusHeading: false });
    document.getElementById('med-name')?.focus();
  });
}
