import { icons } from './icons.js';
import { FOCUS_RING } from '../scripts/utils/a11y.js';

export function ThemeSwitcher({ root, themeService, themes, notify }) {
  const current = themeService.current().id;

  root.innerHTML = `
    <div class="flex items-center gap-1.5">
      <label for="theme-select" class="flex items-center gap-1 text-sm font-bold text-header-ink">
        ${icons.palette('h-4 w-4')}
        <span class="hidden sm:inline">Tema</span>
        <span class="sr-only sm:hidden">Tema de cores</span>
      </label>
      <select
        id="theme-select"
        aria-describedby="theme-select-hint"
        class="btn h-9 max-w-[10.5rem] cursor-pointer rounded-lg border-2 border-field-border bg-card px-2.5 text-sm font-bold text-ink ${FOCUS_RING}"
      >
        ${themes
          .map(
            (theme) =>
              `<option value="${theme.id}" ${theme.id === current ? 'selected' : ''}>${theme.label}</option>`,
          )
          .join('')}
      </select>
      <span id="theme-select-hint" class="sr-only">
        Altera as cores da página. As opções de alto contraste seguem o nível AAA da WCAG.
      </span>
    </div>
  `;

  const select = root.querySelector('#theme-select');

  select.addEventListener('change', () => {
    const theme = themeService.apply(select.value);
    notify({
      variant: 'info',
      title: 'Tema alterado',
      message: `Tema ${theme.label} ativado.`,
      duration: 3500,
    });
  });
}
