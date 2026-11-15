export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-surface';

export function spokenTime(time) {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;

  const hours = `${h} ${h === 1 ? 'hora' : 'horas'}`;
  if (m === 0) return hours;
  return `${hours} e ${m} ${m === 1 ? 'minuto' : 'minutos'}`;
}

export function pluralizeMedications(count) {
  if (count === 0) return 'Nenhum medicamento';
  return `${count} ${count === 1 ? 'medicamento' : 'medicamentos'}`;
}
