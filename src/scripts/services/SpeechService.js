const POPUP_SOUND_URL = './src/assets/popup.mp3';

let popupAudio = null;

function getPopupAudio() {
  if (typeof Audio === 'undefined') return null;
  if (!popupAudio) {
    popupAudio = new Audio(POPUP_SOUND_URL);
    popupAudio.preload = 'auto';
  }
  return popupAudio;
}

function pickPortugueseVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices?.() ?? [];
  return (
    voices.find((v) => v.lang?.toLowerCase() === 'pt-br') ??
    voices.find((v) => v.lang?.toLowerCase().startsWith('pt')) ??
    null
  );
}

export const SpeechService = {
  isSupported() {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    );
  },

  playPopupSound() {
    return new Promise((resolve) => {
      const audio = getPopupAudio();
      if (!audio) {
        resolve();
        return;
      }

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        audio.removeEventListener('ended', done);
        audio.removeEventListener('error', done);
        resolve();
      };

      const safetyTimer = setTimeout(done, 3000);
      const finish = () => {
        clearTimeout(safetyTimer);
        done();
      };

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
        audio.addEventListener('ended', finish, { once: true });
        audio.addEventListener('error', finish, { once: true });

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => finish());
        }
      } catch {
        finish();
      }
    });
  },

  speak(text) {
    if (!this.isSupported() || !text) return false;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voice = pickPortugueseVoice();
      if (voice) utterance.voice = voice;

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.warn('[AvisaMed] Não foi possível reproduzir o alerta por voz.', error);
      return false;
    }
  },

  announceMedication({ name, dosage }) {
    const phrase = `Hora de tomar o medicamento ${name} na dosagem ${dosage}`;
    this.playPopupSound().then(() => {
      this.speak(phrase);
    });
    return phrase;
  },
};

if (typeof window !== 'undefined') {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices?.();
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
      window.speechSynthesis.getVoices?.();
    });
  }

  const unlockAudio = () => {
    const audio = getPopupAudio();
    audio?.load?.();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener?.('pointerdown', unlockAudio, { once: true });
  window.addEventListener?.('keydown', unlockAudio, { once: true });
}
