import { emit, EVENTS } from '../utils/eventBus.js';
import { DEFAULT_CATEGORY, getCategory } from '../config/categories.js';

const STORAGE_KEY = 'avisamed:medications:v1';
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class StorageError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'StorageError';
    this.cause = cause;
  }
}

function isValidMedication(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.dosage === 'string' &&
    typeof item.time === 'string' &&
    TIME_PATTERN.test(item.time)
  );
}

function normalizeMedication(item) {
  return {
    ...item,
    category: getCategory(item.category ?? DEFAULT_CATEGORY).id,
  };
}

function generateId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sortByTime(list) {
  return [...list].sort(
    (a, b) => a.time.localeCompare(b.time) || a.name.localeCompare(b.name, 'pt-BR'),
  );
}

export const StorageService = {
  isAvailable() {
    try {
      const probe = '__avisamed_probe__';
      localStorage.setItem(probe, probe);
      localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  },

  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return sortByTime(data.filter(isValidMedication).map(normalizeMedication));
    } catch (error) {
      console.warn('[AvisaMed] Não foi possível ler os dados salvos.', error);
      return [];
    }
  },

  getById(id) {
    return this.getAll().find((med) => med.id === id);
  },

  _saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
      throw new StorageError(
        'Não foi possível salvar. O armazenamento do navegador pode estar cheio ou bloqueado.',
        error,
      );
    }
    emit(EVENTS.MEDICATIONS_CHANGED, sortByTime(list));
  },

  exists(name, time, excludeId) {
    const normalized = name.trim().toLocaleLowerCase('pt-BR');
    return this.getAll().some(
      (med) =>
        med.id !== excludeId &&
        med.time === time &&
        med.name.trim().toLocaleLowerCase('pt-BR') === normalized,
    );
  },

  add({ name, dosage, time, category }) {
    const medication = {
      id: generateId(),
      name: name.trim(),
      dosage: dosage.trim(),
      time,
      category: getCategory(category).id,
      createdAt: new Date().toISOString(),
    };
    this._saveAll([...this.getAll(), medication]);
    return medication;
  },

  update(id, { name, dosage, time, category }) {
    const list = this.getAll();
    const index = list.findIndex((med) => med.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...list[index],
      name: name.trim(),
      dosage: dosage.trim(),
      time,
      category: getCategory(category ?? list[index].category).id,
      updatedAt: new Date().toISOString(),
    };

    const nextList = [...list];
    nextList[index] = updated;
    this._saveAll(nextList);
    return updated;
  },

  remove(id) {
    const list = this.getAll();
    const removed = list.find((med) => med.id === id);
    if (!removed) return undefined;
    this._saveAll(list.filter((med) => med.id !== id));
    return removed;
  },
};

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    emit(EVENTS.MEDICATIONS_CHANGED, StorageService.getAll());
  }
});
