const bus = new EventTarget();

export const EVENTS = Object.freeze({
  MEDICATIONS_CHANGED: 'medications:changed',
  MEDICATION_EDIT_REQUESTED: 'medication:edit-requested',
  THEME_CHANGED: 'theme:changed',
  ROUTE_CHANGED: 'route:changed',
  CLOCK_TICK: 'clock:tick',
});

export function emit(type, detail) {
  bus.dispatchEvent(new CustomEvent(type, { detail }));
}

export function on(type, handler) {
  const listener = (event) => handler(event.detail);
  bus.addEventListener(type, listener);
  return () => bus.removeEventListener(type, listener);
}
