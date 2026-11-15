export const CATEGORIES = Object.freeze([
  { id: 'pressao', label: 'Pressão' },
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'dor', label: 'Dor' },
  { id: 'coracao', label: 'Coração' },
  { id: 'colesterol', label: 'Colesterol' },
  { id: 'vitaminas', label: 'Vitaminas e Suplementos' },
  { id: 'outros', label: 'Outros' },
]);

export const DEFAULT_CATEGORY = 'outros';

export function getCategory(value) {
  if (!value) return CATEGORIES.find((c) => c.id === DEFAULT_CATEGORY);
  const normalized = String(value).trim().toLocaleLowerCase('pt-BR');
  return (
    CATEGORIES.find(
      (c) => c.id === normalized || c.label.toLocaleLowerCase('pt-BR') === normalized,
    ) ?? CATEGORIES.find((c) => c.id === DEFAULT_CATEGORY)
  );
}
