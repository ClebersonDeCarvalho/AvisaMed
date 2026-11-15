# AvisaMed

> Lembrete de medicamentos **acessível por padrão**: navegação completa por teclado, suporte a leitores de tela, quatro temas de contraste (até WCAG AAA) e um visual moderno com glassmorphism.

![HTML5](https://img.shields.io/badge/HTML5-semântico-0D47A1)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-HyperUI-2196F3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6_Modules-0D47A1)
![WCAG 2.1](https://img.shields.io/badge/WCAG_2.1-AA_%2B_AAA-0D47A1)
![Backend](https://img.shields.io/badge/backend-nenhum-90CAF9)

O **AvisaMed** é o projeto final da disciplina de **Tecnologias Assistivas** (Engenharia de Software). Com ele, a pessoa usuária cadastra seus medicamentos (nome, dosagem e horário), vê a lista ordenada com destaque para a próxima dose e recebe um aviso na tela no horário certo. Tudo roda no navegador: os dados ficam no `localStorage`, por isso o projeto pode ser hospedado no **GitHub Pages**.

---

## Funcionalidades

- **Navegação SPA acessível:** alternância entre **O que é o AvisaMed** (Home com botão "Começar"), **Cadastrar Lembretes** e **Listagem de Lembretes**, com gerenciamento de foco e `aria-current="page"`.
- **Header flutuante com Glassmorphism:** afastado das bordas (`mt-4`, `rounded-2xl`), com menu responsivo e contraste ≥ 5,59:1 garantido.
- **Cadastro e Edição** com validação acessível (mensagens junto ao campo, foco no primeiro erro) e seleção de **Categoria** (Pressão, Diabetes, Dor, Coração, Colesterol, Vitaminas, Outros).
- **Listagem agrupada por categorias** ("Remédios para [Categoria]") e ordenada por horário, com selo de **"Próxima dose"** e botão **"Editar"** em cada card.
- **Modal de Confirmação de Exclusão (HyperUI)** com **Focus Trap** (`Tab`/`Shift+Tab` restritos ao modal, fundo `inert`) e retorno de foco ao botão "Excluir" acionado.
- **Notificação ativa com Web Speech API (`window.speechSynthesis`):** quando o horário bate, exibe o alerta visual e fala em voz alta em português: *"Hora de tomar o medicamento [Nome] na dosagem [Dosagem]"*.
- **Persistência local** em JSON no `localStorage`, que sobrevive a recarregar ou fechar a página e sincroniza entre abas.
- **4 temas:** Claro, Claro (alto contraste), Escuro e Escuro (alto contraste).

---

## Estrutura do projeto

```text
AvisaMed/
├── index.html                      # Página única (SPA) com 3 seções, modal e toast
├── package.json                    # Script "npm run dev" (servidor local)
├── README.md                       # Este arquivo
├── documentacao.docx               # Requisitos, arquitetura e conformidade WCAG (Word)
└── src/
    ├── assets/
    │   ├── favicon.png             # Favicon gerado a partir da logo oficial
    │   ├── logo.png                # Logotipo oficial do AvisaMed
    │   └── popup.mp3               # Efeito sonoro tocado antes da voz do lembrete
    ├── components/                 # Camada de apresentação (UI)
    │   ├── Header.js               # Cabeçalho flutuante com glassmorphism e menu SPA
    │   ├── HomeView.js             # Tela inicial ("O que é o AvisaMed") + botão "Começar"
    │   ├── ThemeSwitcher.js        # Seletor dos 4 temas
    │   ├── MedicationForm.js       # Formulário de criação e edição (com Categoria)
    │   ├── MedicationList.js       # Listagem agrupada por categoria + Editar/Excluir
    │   ├── ConfirmModal.js         # Modal de confirmação com Focus Trap (WCAG)
    │   ├── Toast.js                # Notificações com aria-live
    │   └── icons.js                # Ícones SVG decorativos (aria-hidden)
    ├── scripts/
    │   ├── main.js                 # Composition root (injeção de dependências)
    │   ├── config/
    │   │   ├── categories.js       # Categorias de medicamentos (Pressão, Dor, Diabetes...)
    │   │   └── tailwind.config.js  # Tokens semânticos -> variáveis CSS
    │   ├── services/               # Regras de negócio e infraestrutura
    │   │   ├── Router.js           # Navegação SPA (#home, #form, #list) e gestão de foco
    │   │   ├── StorageService.js   # CRUD completo no localStorage (JSON)
    │   │   ├── SpeechService.js    # Síntese de voz em pt-BR (Web Speech API)
    │   │   ├── ThemeService.js     # Aplicação e persistência do tema
    │   │   └── ReminderService.js  # Verificação periódica de horários (setInterval)
    │   └── utils/
    │       ├── a11y.js             # FOCUS_RING, leitura natural de horários
    │       ├── dom.js              # escapeHTML (anti-XSS), helpers
    │       └── eventBus.js         # Pub/Sub entre componentes
    └── styles/
        ├── themes.css              # Variáveis de cor dos 4 temas + regras de alto contraste
        └── base.css                # Foco, glass fallbacks, movimento reduzido, forced-colors
```

---

## Como rodar localmente

> ⚠️ O projeto usa **ES6 Modules**, que **não funcionam abrindo o arquivo direto** (`file://`) por causa da política de CORS do navegador. Use um servidor local.

### Opção 1: `npm run dev` (recomendado)

Pré-requisito: [Node.js](https://nodejs.org/) 18 ou superior.

1. Clone o repositório:
   ```bash
   git clone https://github.com/<seu-usuario>/AvisaMed.git
   cd AvisaMed
   ```
2. Inicie o servidor de desenvolvimento (não é preciso rodar `npm install`):
   ```bash
   npm run dev
   ```
3. Acesse `http://localhost:5500`.
4. Para encerrar, pressione `Ctrl + C` no terminal.

> O script `dev` do `package.json` executa `npx --yes serve@14 . --listen 5500`. Na primeira execução, o pacote `serve` é baixado automaticamente.

### Opção 2: VS Code + Live Server

1. Instale a extensão **Live Server** (Ritwick Dey) no VS Code.
2. Clique com o botão direito em `index.html` e escolha **"Open with Live Server"**.
3. Acesse `http://127.0.0.1:5500`.

### Opção 3: Python

```bash
python -m http.server 5500
```

### Sobre o Tailwind CSS

**Padrão (CDN, sem instalação):** o `index.html` já carrega o **Tailwind Play CDN** e, em seguida, a configuração em `src/scripts/config/tailwind.config.js`:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="./src/scripts/config/tailwind.config.js"></script>
```

Não é preciso fazer build. O CDN gera as classes em tempo real, inclusive as que os componentes inserem via JavaScript.

**Produção (CLI, opcional):** o Play CDN exibe um aviso no console e não é recomendado para produção. Para gerar um CSS estático e otimizado:

1. Instale o Tailwind v3:
   ```bash
   npm install -D tailwindcss@3
   ```
2. Crie `tailwind.config.js` na raiz com o mesmo `theme.extend` de `src/scripts/config/tailwind.config.js` e acrescente:
   ```js
   module.exports = {
     content: ['./index.html', './src/**/*.js'],
     theme: { extend: { /* copie colors e fontFamily daqui: src/scripts/config/tailwind.config.js */ } },
   };
   ```
3. Crie `src/styles/input.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
4. Gere o CSS:
   ```bash
   npx tailwindcss -i ./src/styles/input.css -o ./src/styles/tailwind.css --minify
   ```
5. No `index.html`, troque os dois `<script>` do Tailwind por:
   ```html
   <link rel="stylesheet" href="./src/styles/tailwind.css" />
   ```

### Deploy no GitHub Pages

1. Envie o projeto para um repositório no GitHub.
2. Vá em **Settings → Pages → Build and deployment**.
3. Em *Source*, escolha **Deploy from a branch**, depois a branch `main` e a pasta `/ (root)`.
4. Pronto: `https://<seu-usuario>.github.io/AvisaMed/`. Todos os caminhos são relativos (`./src/...`), por isso funcionam em subdiretórios.

---

## Recursos de Acessibilidade e Design Moderno

### Arquitetura visual: HyperUI + paleta

| Cor | Hex | Papel |
| --- | --- | --- |
| Azul gelo | `#E3F2FD` | Fundo (claro) e texto (escuro) |
| Azul claro | `#90CAF9` | Superfícies decorativas e botão primário (escuro) |
| Azul | `#2196F3` | **Somente elementos não textuais** (bordas e destaques, 3.12:1) |
| Azul marinho | `#0D47A1` | Texto e botão primário (claro), 8.63:1 sobre branco |

Os blocos de **cabeçalho, formulário, cards e toast** partem do HyperUI e foram adaptados. Em vez de cores fixas, eles usam **tokens semânticos** (`bg-surface`, `text-ink`, `bg-primary`…) que apontam para variáveis CSS. Trocar de tema é apenas trocar uma classe no `<html>`, e nenhum componente precisa saber qual tema está ativo.

### Como acessibilidade e estética convivem

| Recurso moderno | Risco de acessibilidade | Solução no AvisaMed |
| --- | --- | --- |
| **Glassmorphism** no header | Fundo translúcido pode derrubar o contraste | Opacidade de 75% calculada para o **pior caso** (≥ 5.59:1); fundo sólido nos temas HC, com `prefers-reduced-transparency` ou sem suporte a `backdrop-filter` |
| Gradientes e sombras | Ruído visual para baixa visão | Removidos automaticamente nos temas de alto contraste |
| Azul vibrante `#2196F3` | Só 3.12:1 sobre branco | Usado apenas em bordas e decoração, nunca em texto |
| Animações nos toasts | Desconforto vestibular | Desligadas com `prefers-reduced-motion` |
| Toasts que somem sozinhos | Pouco tempo para ler | Pausam em hover/foco; lembretes e erros só fecham manualmente |

### Recursos assistivos

- ⌨**Teclado:** link "Pular para o conteúdo"; anel de foco **grosso** (`focus-visible:ring-4 ring-offset-4`); contorno + halo nos temas HC; `outline` real no Alto Contraste do Windows; foco nunca escondido pelo header fixo (`scroll-padding-top` dinâmico).
- **Leitores de tela:** `<label for>` em todos os campos; dicas e erros em `aria-describedby`; `aria-invalid`; toasts em `aria-live="polite"` ("Medicamento salvo com sucesso") e lembretes em `role="alert"`; horários lidos como "8 horas e 30 minutos"; ícones com `aria-hidden="true"`.
- **4 temas** que respeitam `prefers-color-scheme` e `prefers-contrast` no primeiro acesso:

| Tema | Fundo / Texto | Contraste |
| --- | --- | --- |
| Claro | `#E3F2FD` / `#0D47A1` | 7.56:1 (AAA) |
| Claro (alto contraste) | `#FFFFFF` / `#000000` | 21:1 (AAA) |
| Escuro | `#061A3A` / `#E3F2FD` | 15.11:1 (AAA) |
| Escuro (alto contraste) | `#000000` / `#FFFF00` | 19.56:1 (AAA) |

- **Tipografia:** fonte **Atkinson Hyperlegible**, criada para pessoas com baixa visão, com texto base de 18 px.
- **Alvos grandes:** botões e campos com no mínimo 48 px de altura.
- **Segurança:** todo dado digitado passa por escape antes de ser renderizado (anti-XSS).

Requisitos, arquitetura e a tabela de conformidade WCAG 2.1 completa estão em **[documentacao.docx](./documentacao.docx)**.

---

## Como testar a acessibilidade

1. **Teclado:** navegue só com `Tab`, `Shift+Tab`, `Enter`, `Espaço` e `Esc`.
2. **Leitor de tela:** NVDA (Windows), VoiceOver (`Cmd+F5` no macOS) ou TalkBack (Android).
3. **Auditorias:** Lighthouse → Acessibilidade, extensão **axe DevTools** e **WAVE**.
4. **Zoom:** `Ctrl` + `+` até 200%.

---

## Licença

Projeto acadêmico distribuído sob a licença MIT. O AvisaMed **não substitui orientação médica**.
