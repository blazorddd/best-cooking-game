// Dapur Kilat — entrypoint. Owns the canvas, the frame loop, mouse and
// keyboard input, and the `?shot=` scene selector used for screenshots.
// The game itself lives in kitchen.js (rules) and draw.js (rendering).

import { INGREDIENTS } from './menu.js';
import { addIngredient, clearPlate, newState, serve, startGame, update } from './kitchen.js';
import { draw, W, H } from './draw.js';
import { setShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

const state = newState();
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  setShot(state, shot);
  draw(ctx, state);
} else {
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(state, dt);
    draw(ctx, state);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// --- Input: mouse ---
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (W / r.width),
    y: (e.clientY - r.top) * (H / r.height),
  };
}

canvas.addEventListener('click', (e) => {
  const p = canvasPoint(e);
  if (state.phase === 'title') {
    startGame(state);
    return;
  }
  if (state.phase === 'over') return;
  // Serve button.
  if (p.x >= 498 && p.x <= 658 && p.y >= 452 && p.y <= 508) {
    serve(state);
    return;
  }
  // Clear button.
  if (p.x >= 678 && p.x <= 758 && p.y >= 452 && p.y <= 508) {
    clearPlate(state);
    return;
  }
  // Ingredient tiles along the bottom.
  if (p.y >= 624 && p.y <= 688) {
    const tw = (1248 - 32) / INGREDIENTS.length;
    const i = Math.floor((p.x - 32) / tw);
    if (i >= 0 && i < INGREDIENTS.length) addIngredient(state, INGREDIENTS[i].id);
  }
});

// --- Input: keyboard ---
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && state.phase === 'title') {
    startGame(state);
    return;
  }
  if ((e.key === 'r' || e.key === 'R') && state.phase === 'over') {
    startGame(state);
    return;
  }
  if (state.phase !== 'play') return;
  if (e.key === ' ') {
    e.preventDefault();
    serve(state);
    return;
  }
  if (e.key === 'c' || e.key === 'C') {
    clearPlate(state);
    return;
  }
  const g = INGREDIENTS.find((ing) => ing.key === e.key);
  if (g) addIngredient(state, g.id);
});
