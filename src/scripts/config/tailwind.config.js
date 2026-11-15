(function () {
  function token(name) {
    return 'rgb(var(' + name + ') / <alpha-value>)';
  }

  tailwind.config = {
    theme: {
      extend: {
        colors: {
          palette: {
            50: '#E3F2FD',
            200: '#90CAF9',
            500: '#2196F3',
            900: '#0D47A1',
          },
          surface: token('--c-surface'),
          card: token('--c-card'),
          ink: token('--c-ink'),
          'ink-muted': token('--c-ink-muted'),
          primary: token('--c-primary'),
          'on-primary': token('--c-on-primary'),
          accent: token('--c-accent'),
          'accent-soft': token('--c-accent-soft'),
          border: token('--c-border'),
          'field-border': token('--c-field-border'),
          ring: token('--c-ring'),
          header: token('--c-header'),
          'header-ink': token('--c-header-ink'),
        },
        fontFamily: {
          sans: [
            '"Atkinson Hyperlegible"',
            'system-ui',
            '-apple-system',
            '"Segoe UI"',
            'Roboto',
            'Arial',
            'sans-serif',
          ],
          heading: [
            '"Plus Jakarta Sans"',
            'system-ui',
            '-apple-system',
            '"Segoe UI"',
            'Roboto',
            'Arial',
            'sans-serif',
          ],
        },
      },
    },
  };
})();
