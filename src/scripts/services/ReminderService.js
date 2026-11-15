import { emit, EVENTS } from '../utils/eventBus.js';

const NOTIFIED_KEY = 'avisamed:notified';

const pad = (n) => String(n).padStart(2, '0');

function localDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function loadNotified() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(NOTIFIED_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

export function createReminderService({ storage, onDue, intervalMs = 15000 }) {
  const notified = loadNotified();
  let timerId = null;

  function persist() {
    try {
      sessionStorage.setItem(NOTIFIED_KEY, JSON.stringify([...notified]));
    } catch {}
  }

  function check() {
    const now = new Date();
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const today = localDateKey(now);

    storage
      .getAll()
      .filter((med) => med.time === currentTime)
      .forEach((med) => {
        const key = `${today}|${med.id}|${med.time}`;
        if (notified.has(key)) return;
        notified.add(key);
        persist();
        onDue(med);
      });

    emit(EVENTS.CLOCK_TICK, now);
  }

  return {
    start() {
      if (timerId) return;
      check();
      timerId = setInterval(check, intervalMs);
    },
    stop() {
      clearInterval(timerId);
      timerId = null;
    },
    checkNow: check,
  };
}
