/** Heurísticas de objetivo cuando no hay productos vinculados en la intención. */
export const GOAL_RULES_LEGACY = [
  {
    id: 'muscle_mass',
    label: 'ganar masa muscular',
    keywords: [/masa\s+muscular/i, /ganar\s+m[uú]sculo/i, /volumen/i, /bulking/i],
    categoryHints: ['proteina', 'proteínas', 'amino'],
    nameHints: ['whey', 'protein', 'creatina', 'bcaa'],
  },
  {
    id: 'weight_loss',
    label: 'bajar de peso',
    keywords: [
      /bajar\s+de\s+peso/i,
      /perder\s+peso/i,
      /definir/i,
      /quemar\s+grasa/i,
      /adelgazar/i,
    ],
    categoryHints: ['control', 'peso'],
    nameHints: ['cla', 'quemador', 'termog'],
  },
  {
    id: 'energy',
    label: 'energía',
    keywords: [/energ[ií]a/i, /rendimiento/i, /pre\s*-?\s*entreno/i],
    categoryHints: ['pre-entreno', 'pre entreno'],
    nameHints: ['nitro', 'pre', 'cafeína', 'cafeina'],
  },
  {
    id: 'recovery',
    label: 'recuperación',
    keywords: [/recuperaci[oó]n/i, /post\s*-?\s*entreno/i, /despu[eé]s\s+del\s+entreno/i],
    categoryHints: ['amino', 'recuper'],
    nameHints: ['glutamina', 'bcaa', 'amino'],
  },
  {
    id: 'vitamins',
    label: 'vitaminas',
    keywords: [/vitaminas?/i, /multivitam/i, /salud\s+general/i],
    categoryHints: ['vitamina', 'salud'],
    nameHints: ['multi', 'omega', 'vitamin'],
  },
];
