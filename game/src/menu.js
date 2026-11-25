// Dapur Kilat — menu data: the ingredients on the counter and the dishes
// customers order. Each dish is a set of ingredients; the plate must hold
// exactly that set (in any order) before it can be served.

export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', color: '#E8B06A', dark: '#B9833F', key: '1' },
  { id: 'patty', name: 'Patty', color: '#8B5A2B', dark: '#5E3A17', key: '2' },
  { id: 'lettuce', name: 'Lettuce', color: '#5CB85C', dark: '#3A8A3A', key: '3' },
  { id: 'tomato', name: 'Tomato', color: '#E74C3C', dark: '#B02A1E', key: '4' },
  { id: 'cheese', name: 'Cheese', color: '#F5C542', dark: '#C99A1B', key: '5' },
  { id: 'dough', name: 'Dough', color: '#F0E0B6', dark: '#C9B184', key: '6' },
  { id: 'sauce', name: 'Sauce', color: '#C0392B', dark: '#8E2418', key: '7' },
];

export const DISHES = [
  { id: 'burger', name: 'Burger', needs: ['bun', 'patty', 'lettuce', 'tomato'] },
  { id: 'pizza', name: 'Pizza', needs: ['dough', 'sauce', 'cheese'] },
  { id: 'salad', name: 'Salad', needs: ['lettuce', 'tomato', 'cheese'] },
  { id: 'sandwich', name: 'Sandwich', needs: ['bun', 'lettuce', 'cheese'] },
  { id: 'taco', name: 'Taco', needs: ['dough', 'patty', 'sauce'] },
];

export function ingredientById(id) {
  return INGREDIENTS.find((g) => g.id === id);
}

export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

// True when the plate holds exactly the dish's ingredients (any order).
export function plateMatches(plate, dish) {
  if (plate.length !== dish.needs.length) return false;
  const have = [...plate].sort().join(',');
  return have === [...dish.needs].sort().join(',');
}
