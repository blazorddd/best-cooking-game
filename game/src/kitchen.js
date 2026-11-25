// Dapur Kilat — game state and rules. Orders arrive on the board, the cook
// builds a dish on the plate from the counter's ingredients, and serving a
// plate that matches an open order scores. A wrong serve or an expired order
// costs a heart; three hearts lost, or the shift timer running out, ends the
// shift.

import { DISHES, plateMatches } from './menu.js';

export const SHIFT_SECONDS = 120;
export const ORDER_SECONDS = 45;
export const MAX_ORDERS = 3;
export const MAX_HEARTS = 3;

export function newState() {
  return {
    phase: 'title', // 'title' | 'play' | 'over'
    score: 0,
    served: 0,
    streak: 0,
    best: 0,
    hearts: MAX_HEARTS,
    shiftLeft: SHIFT_SECONDS,
    orders: [], // { dish, left } — left is seconds left on the order
    plate: [], // ingredient ids, in the order added
    message: '',
    messageAt: 0,
    spawnIn: 1.5,
    elapsed: 0,
  };
}

export function startGame(s) {
  const fresh = newState();
  Object.assign(s, fresh, { phase: 'play' });
  spawnOrder(s);
}

function pickDish(rng) {
  return DISHES[Math.floor(rng() * DISHES.length)];
}

export function spawnOrder(s, rng = Math.random) {
  if (s.orders.length >= MAX_ORDERS) return;
  const dish = pickDish(rng);
  // Avoid two identical dishes on the board at once when there is a choice.
  if (s.orders.some((o) => o.dish.id === dish.id) && s.orders.length < DISHES.length) {
    return spawnOrder(s, rng);
  }
  s.orders.push({ dish, left: ORDER_SECONDS });
}

export function addIngredient(s, id) {
  if (s.phase !== 'play') return;
  if (s.plate.length >= 5) return;
  s.plate.push(id);
}

export function clearPlate(s) {
  if (s.phase !== 'play') return;
  s.plate = [];
}

export function matchingOrder(s) {
  return s.orders.find((o) => plateMatches(s.plate, o.dish)) ?? null;
}

export function serve(s) {
  if (s.phase !== 'play') return;
  const order = matchingOrder(s);
  if (!order) {
    s.hearts -= 1;
    s.streak = 0;
    s.plate = [];
    setMessage(s, 'Wrong dish! -1 heart');
    if (s.hearts <= 0) endGame(s);
    return;
  }
  const timeBonus = Math.round((order.left / ORDER_SECONDS) * 50);
  const streakBonus = s.streak * 10;
  const gained = 100 + timeBonus + streakBonus;
  s.score += gained;
  s.served += 1;
  s.streak += 1;
  s.best = Math.max(s.best, s.streak);
  s.orders = s.orders.filter((o) => o !== order);
  s.plate = [];
  setMessage(s, `Served ${order.dish.name}! +${gained}`);
}

function setMessage(s, text) {
  s.message = text;
  s.messageAt = s.elapsed;
}

function endGame(s) {
  s.phase = 'over';
  s.message = '';
}

export function update(s, dt, rng = Math.random) {
  if (s.phase !== 'play') return;
  s.elapsed += dt;
  s.shiftLeft -= dt;
  if (s.shiftLeft <= 0) {
    s.shiftLeft = 0;
    endGame(s);
    return;
  }
  for (const o of s.orders) o.left -= dt;
  const expired = s.orders.filter((o) => o.left <= 0);
  if (expired.length > 0) {
    s.orders = s.orders.filter((o) => o.left > 0);
    s.hearts -= expired.length;
    s.streak = 0;
    setMessage(s, expired.length === 1 ? 'Order expired! -1 heart' : `${expired.length} orders expired!`);
    if (s.hearts <= 0) {
      s.hearts = 0;
      endGame(s);
      return;
    }
  }
  s.spawnIn -= dt;
  if (s.spawnIn <= 0) {
    spawnOrder(s, rng);
    s.spawnIn = 8 + rng() * 4;
  }
}
