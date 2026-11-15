import { icons } from './icons.js';
import { FOCUS_RING } from '../scripts/utils/a11y.js';
import { on, EVENTS } from '../scripts/utils/eventBus.js';

function formatSavedCount(count) {
  if (count === 0) return 'Nenhum medicamento salvo';
  if (count === 1) return '1 medicamento salvo';
  return `${count} medicamentos salvos`;
}

export function HomeView({ root, router, storage }) {
  root.innerHTML = `
    <div class="space-y-8">
      <div class="card rounded-2xl border-2 border-border bg-card p-6 shadow-xl shadow-primary/10 sm:p-10">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="inline-flex items-center gap-2 rounded-full bg-accent-soft/50 px-4 py-1.5 text-base font-bold text-ink">
            ${icons.pill('h-5 w-5')}
            <span>Tecnologia Assistiva em Saúde</span>
          </p>
          <p
            data-home-count
            class="rounded-full border-2 border-border bg-surface px-4 py-1 text-base font-bold text-ink"
          ></p>
        </div>

        <div class="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-3xl">
            <h1
              id="home-title"
              data-view-heading
              tabindex="-1"
              class="font-heading rounded-md text-3xl font-extrabold leading-tight text-ink sm:text-5xl ${FOCUS_RING}"
            >
              O que é o <span class="hero-highlight">AvisaMed</span>?
            </h1>

            <div class="mt-5 space-y-4 text-lg leading-relaxed text-ink sm:text-xl">
              <p>
              O <strong>AvisaMed</strong> é um sistema web acessível de lembretes de medicamentos, voltado para dar autonomia a idosos e pessoas 
              com deficiências (visuais ou motoras). No horário programado, ele emite alertas visuais, sonoros e fala o nome e a 
              dosagem do remédio em voz alta, mantendo todos os dados salvos com segurança no próprio navegador do usuário.
              </p>
              
            </div>
          </div>

          <div class="flex shrink-0 justify-center">
            <img
              src="./src/assets/logo.png"
              alt="Logotipo do AvisaMed: cápsula de medicamento, relógio e sino de alerta em tons de azul"
              width="176"
              height="176"
              decoding="async"
              class="h-36 w-36 rounded-2xl bg-white object-contain p-2 sm:h-44 sm:w-44"
            />
          </div>
        </div>

        <div class="mt-8">
          <button
            type="button"
            id="home-start-btn"
            aria-expanded="false"
            aria-controls="home-start-options"
            class="btn inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border-2 border-primary bg-primary px-8 py-4 text-xl font-bold text-on-primary shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 sm:w-auto ${FOCUS_RING}"
          >
            <span>Começar</span>
            ${icons.arrowRight('h-6 w-6')}
          </button>

          <div
            id="home-start-options"
            hidden
            aria-label="Escolha por onde começar"
            class="card mt-6 hidden rounded-2xl border-2 border-field-border bg-surface p-6"
          >
            <p class="text-lg font-bold text-ink">O que você deseja fazer agora?</p>
            <p class="mt-1 text-base text-ink-muted">
              Escolha uma das opções abaixo para cadastrar um novo medicamento ou consultar sua lista organizada por categorias.
            </p>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                data-go-route="form"
                class="btn flex min-h-16 items-center justify-between gap-4 rounded-xl border-2 border-primary bg-primary px-6 py-4 text-left text-lg font-bold text-on-primary shadow-md transition hover:-translate-y-0.5 ${FOCUS_RING}"
              >
                <span class="flex items-center gap-3">
                  ${icons.plus('h-7 w-7 shrink-0')}
                  <span>
                    <span class="block text-xl">Ir para o Cadastro</span>
                    <span class="block text-sm font-normal opacity-95">Adicionar um novo lembrete de remédio</span>
                  </span>
                </span>
                ${icons.arrowRight('h-6 w-6 shrink-0')}
              </button>

              <button
                type="button"
                data-go-route="list"
                class="btn flex min-h-16 items-center justify-between gap-4 rounded-xl border-2 border-field-border bg-card px-6 py-4 text-left text-lg font-bold text-ink shadow-md transition hover:bg-accent-soft/30 ${FOCUS_RING}"
              >
                <span class="flex items-center gap-3">
                  ${icons.list('h-7 w-7 shrink-0')}
                  <span>
                    <span class="block text-xl">Ir para a Lista</span>
                    <span class="block text-sm font-normal text-ink-muted">Ver remédios salvos por categoria</span>
                  </span>
                </span>
                ${icons.arrowRight('h-6 w-6 shrink-0')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <article class="card rounded-2xl border-2 border-border bg-card p-6 shadow-md">
          <span class="grid h-12 w-12 place-content-center rounded-xl bg-accent-soft/50 text-primary">
            ${icons.volume('h-7 w-7')}
          </span>
          <h2 class="mt-4 text-xl font-bold text-ink">Aviso por Voz (Web Speech)</h2>
          <p class="mt-2 text-base text-ink-muted">
            No horário agendado, o navegador toca um som de alerta e anuncia em voz alta em português o nome do medicamento e a dosagem exata.
          </p>
        </article>

        <article class="card rounded-2xl border-2 border-border bg-card p-6 shadow-md">
          <span class="grid h-12 w-12 place-content-center rounded-xl bg-accent-soft/50 text-primary">
            ${icons.palette('h-7 w-7')}
          </span>
          <h2 class="mt-4 text-xl font-bold text-ink">4 Temas de Contraste</h2>
          <p class="mt-2 text-base text-ink-muted">
            Alterne entre os modos Claro e Escuro na paleta azul ou ative os modos de Alto Contraste puro (WCAG AAA, até 21:1).
          </p>
        </article>

        <article class="card rounded-2xl border-2 border-border bg-card p-6 shadow-md">
          <span class="grid h-12 w-12 place-content-center rounded-xl bg-accent-soft/50 text-primary">
            ${icons.tag('h-7 w-7')}
          </span>
          <h2 class="mt-4 text-xl font-bold text-ink">Organização por Categorias</h2>
          <p class="mt-2 text-base text-ink-muted">
            Agrupe seus medicamentos por finalidade (Pressão, Diabetes, Dor e outras), edite dados a qualquer momento e confirme exclusões com segurança.
          </p>
        </article>
      </div>
    </div>
  `;

  const startBtn = root.querySelector('#home-start-btn');
  const optionsPanel = root.querySelector('#home-start-options');
  const countBadge = root.querySelector('[data-home-count]');

  function updateCount(list = storage.getAll()) {
    countBadge.textContent = formatSavedCount(list.length);
  }

  startBtn.addEventListener('click', () => {
    const isExpanded = startBtn.getAttribute('aria-expanded') === 'true';
    const nextState = !isExpanded;
    startBtn.setAttribute('aria-expanded', String(nextState));
    optionsPanel.hidden = !nextState;
    optionsPanel.classList.toggle('hidden', !nextState);

    if (nextState) {
      const firstAction = optionsPanel.querySelector('[data-go-route="form"]');
      firstAction?.focus();
    }
  });

  optionsPanel.addEventListener('click', (event) => {
    const targetBtn = event.target.closest('[data-go-route]');
    if (!targetBtn) return;
    const route = targetBtn.getAttribute('data-go-route');
    router.navigate(route);
  });

  on(EVENTS.MEDICATIONS_CHANGED, (list) => updateCount(list));
  updateCount();
}
