import { Header } from '../components/Header.js';
import { ThemeSwitcher } from '../components/ThemeSwitcher.js';
import { HomeView } from '../components/HomeView.js';
import { MedicationForm } from '../components/MedicationForm.js';
import { MedicationList } from '../components/MedicationList.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { Toast } from '../components/Toast.js';

import { StorageService } from './services/StorageService.js';
import { ThemeService, THEMES } from './services/ThemeService.js';
import { Router } from './services/Router.js';
import { SpeechService } from './services/SpeechService.js';
import { createReminderService } from './services/ReminderService.js';
import { qs } from './utils/dom.js';

function bootstrap() {
  ThemeService.init();

  const toast = Toast({ root: qs('#toast-root') });
  const notify = (options) => toast.show(options);

  const confirmModal = ConfirmModal({ root: qs('#modal-root') });

  const { themeSlot } = Header({ root: qs('#header-root'), router: Router });
  ThemeSwitcher({ root: themeSlot, themeService: ThemeService, themes: THEMES, notify });

  HomeView({ root: qs('#view-home'), router: Router, storage: StorageService });
  MedicationForm({ root: qs('#view-form'), storage: StorageService, router: Router, notify });
  MedicationList({
    root: qs('#view-list'),
    storage: StorageService,
    router: Router,
    confirmModal,
    notify,
  });

  Router.init();

  createReminderService({
    storage: StorageService,
    onDue: (med) => {
      const spokenPhrase = SpeechService.announceMedication(med);
      notify({
        variant: 'reminder',
        title: `Hora do medicamento: ${med.name}`,
        message: `${spokenPhrase}. (Horário: ${med.time})`,
        assertive: true,
        duration: 0,
      });
    },
  }).start();

  if (!StorageService.isAvailable()) {
    notify({
      variant: 'error',
      title: 'Armazenamento indisponível',
      message:
        'Seu navegador está bloqueando o armazenamento local. Os medicamentos não serão salvos ao fechar a página.',
      assertive: true,
      duration: 0,
    });
  }
}

bootstrap();
