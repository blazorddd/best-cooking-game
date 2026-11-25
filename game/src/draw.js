// Dapur Kilat — all canvas drawing. One flat-colour 2D kitchen: a top bar
// (score, shift timer, hearts), the order board on the left, the plate in the
// middle, the recipe list on the right, and the ingredient counter along the
// bottom. Nothing is loaded from outside the game.

import { DISHES, INGREDIENTS, ingredientById, dishById } from './menu.js';
import { matchingOrder } from './kitchen.js';

export const W = 1280;
export const H = 720;

const INK = '#2B2118';
const PAPER = '#FFF8EC';
const BOARD = '#5C3A21';
const BOARD_DARK = '#4A2E18';
const PANEL = '#F3E3C2';
const GOLD = '#E8A33D';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 700, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function mmss(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawTopBar(ctx, s) {
  ctx.fillStyle = '#3B2A1A';
  ctx.fillRect(0, 0, W, 64);
  text(ctx, 'DAPUR KILAT', 24, 42, 28, '#FFD98A');
  text(ctx, `Score ${s.score}`, 280, 42, 24, PAPER);
  text(ctx, `Served ${s.served}`, 450, 42, 24, PAPER);
  text(ctx, `TIME ${mmss(s.shiftLeft)}`, 680, 42, 26, s.shiftLeft <= 20 ? '#FF6B5E' : PAPER, 700, 'center');
  const hearts = '♥'.repeat(Math.max(0, s.hearts)) + '♡'.repeat(Math.max(0, 3 - s.hearts));
  text(ctx, hearts, W - 24, 42, 26, '#FF6B5E', 700, 'right');
}

function drawOrderTicket(ctx, order, x, y, w, h, active) {
  ctx.fillStyle = active ? '#FFF3D6' : '#EFE0BC';
  rr(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = active ? GOLD : '#C9A86A';
  ctx.lineWidth = active ? 4 : 2;
  ctx.stroke();
  text(ctx, order.dish.name.toUpperCase(), x + 16, y + 34, 22, INK);
  // Required ingredients as coloured dots with a short label.
  let dx = x + 16;
  for (const id of order.dish.needs) {
    const g = ingredientById(id);
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.arc(dx + 10, y + 62, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = g.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    dx += 30;
  }
  text(ctx, order.dish.needs.map((id) => ingredientById(id).name).join(' + '), x + 16, y + 96, 15, '#6B543A', 400);
  // Time left on this order.
  const frac = Math.max(0, order.left / 45);
  ctx.fillStyle = '#D8C49A';
  rr(ctx, x + 16, y + h - 18, w - 32, 8, 4);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#5CB85C' : frac > 0.25 ? '#E8A33D' : '#E74C3C';
  rr(ctx, x + 16, y + h - 18, (w - 32) * frac, 8, 4);
  ctx.fill();
  text(ctx, `${Math.ceil(order.left)}s`, x + w - 16, y + 34, 16, '#6B543A', 700, 'right');
}

function drawOrderBoard(ctx, s) {
  ctx.fillStyle = BOARD;
  rr(ctx, 16, 80, 280, 480, 14);
  ctx.fill();
  text(ctx, 'ORDER BOARD', 156, 116, 20, '#FFD98A', 700, 'center');
  if (s.orders.length === 0) {
    text(ctx, 'No orders yet…', 156, 300, 17, '#D8C49A', 400, 'center');
    return;
  }
  let y = 132;
  s.orders.forEach((o, i) => {
    drawOrderTicket(ctx, o, 32, y, 248, 128, i === 0);
    y += 140;
  });
}

function drawPlate(ctx, s) {
  const cx = 628;
  const cy = 300;
  // Table
  ctx.fillStyle = '#8A5A33';
  rr(ctx, 312, 80, 632, 480, 14);
  ctx.fill();
  ctx.fillStyle = '#A06B3F';
  ctx.fillRect(312, 80, 632, 10);
  // Plate
  ctx.fillStyle = '#F5F0E6';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 150, 104, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#C9A86A';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#E8DCC0';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 112, 74, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ingredients stacked on the plate (bottom first).
  const n = s.plate.length;
  s.plate.forEach((id, i) => {
    const g = ingredientById(id);
    const y = cy + 44 - (i + 1) * 22;
    ctx.fillStyle = g.color;
    rr(ctx, cx - 92, y, 184, 20, 10);
    ctx.fill();
    ctx.strokeStyle = g.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  if (n === 0) {
    text(ctx, 'Plate is empty', cx, cy + 8, 18, '#8A7A5E', 400, 'center');
  }
  // Serve + clear buttons.
  const ready = matchingOrder(s) !== null;
  ctx.fillStyle = ready ? '#3E9B4F' : '#8A7A5E';
  rr(ctx, cx - 130, 452, 160, 56, 12);
  ctx.fill();
  text(ctx, 'SERVE  [Space]', cx - 50, 488, 20, '#FFFFFF', 700, 'center');
  ctx.fillStyle = '#6B543A';
  rr(ctx, cx + 50, 452, 80, 56, 12);
  ctx.fill();
  text(ctx, 'Clear [C]', cx + 90, 488, 18, PAPER, 700, 'center');
  if (ready) text(ctx, '✓ matches an order!', cx, 540, 18, '#BFE8C5', 700, 'center');
  else if (n > 0) text(ctx, 'Keep building…', cx, 540, 18, '#D8C49A', 400, 'center');
}

function drawMenu(ctx, s) {
  ctx.fillStyle = PANEL;
  rr(ctx, 960, 80, 304, 480, 14);
  ctx.fill();
  text(ctx, 'MENU — RECIPES', 1112, 116, 20, INK, 700, 'center');
  let y = 148;
  for (const d of DISHES) {
    text(ctx, d.name, 984, y, 19, INK);
    const dots = d.needs.map((id) => ingredientById(id).name).join(' + ');
    text(ctx, dots, 984, y + 22, 14, '#6B543A', 400);
    y += 52;
  }
  ctx.strokeStyle = '#C9A86A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(984, y + 6);
  ctx.lineTo(1240, y + 6);
  ctx.stroke();
  text(ctx, 'How to play', 984, y + 36, 17, INK);
  text(ctx, 'Click an ingredient (or press 1–7)', 984, y + 60, 14, '#6B543A', 400);
  text(ctx, 'to add it to the plate.', 984, y + 80, 14, '#6B543A', 400);
  text(ctx, 'Serve when the plate matches', 984, y + 104, 14, '#6B543A', 400);
  text(ctx, 'an order. Wrong dish or an', 984, y + 124, 14, '#6B543A', 400);
  text(ctx, 'expired order costs a heart.', 984, y + 144, 14, '#6B543A', 400);
}

function drawMessage(ctx, s) {
  if (s.phase !== 'play' || !s.message) return;
  const good = s.message.startsWith('Served') || s.message.startsWith('Ready');
  ctx.font = '700 20px Verdana, sans-serif';
  const w = ctx.measureText(s.message).width + 36;
  ctx.fillStyle = good ? 'rgba(46, 125, 50, 0.92)' : 'rgba(192, 57, 43, 0.92)';
  rr(ctx, 628 - w / 2, 96, w, 40, 20);
  ctx.fill();
  text(ctx, s.message, 628, 124, 20, '#FFFFFF', 700, 'center');
}

function drawCounter(ctx, s) {
  ctx.fillStyle = '#3B2A1A';
  rr(ctx, 16, 580, 1248, 124, 14);
  ctx.fill();
  text(ctx, 'INGREDIENTS  —  click or press 1–7', 32, 612, 16, '#FFD98A', 700);
  const tw = (1248 - 32) / INGREDIENTS.length;
  INGREDIENTS.forEach((g, i) => {
    const x = 32 + i * tw;
    const onPlate = s.plate.includes(g.id);
    ctx.fillStyle = onPlate ? '#5C4A33' : '#4A3826';
    rr(ctx, x, 624, tw - 12, 64, 10);
    ctx.fill();
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.arc(x + 28, 656, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = g.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, g.name, x + 54, 650, 17, PAPER);
    text(ctx, `[${g.key}]`, x + tw - 28, 650, 15, '#C9A86A', 700, 'right');
    text(ctx, `×${s.plate.filter((p) => p === g.id).length}`, x + 54, 674, 14, '#C9A86A', 400);
  });
}

function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(20, 12, 6, 0.72)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'DAPUR KILAT', W / 2, 240, 64, '#FFD98A', 700, 'center');
  text(ctx, 'Rush Hour Kitchen — cook to order, beat the clock', W / 2, 290, 24, PAPER, 400, 'center');
  text(ctx, 'Press Enter or click to start', W / 2, 380, 26, '#FFFFFF', 700, 'center');
  text(ctx, 'Mouse: click ingredients, then Serve  ·  Keys: 1–7 add, Space serve, C clear, R restart', W / 2, 430, 18, '#D8C49A', 400, 'center');
}

function drawGameOver(ctx, s) {
  ctx.fillStyle = 'rgba(20, 12, 6, 0.78)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'SHIFT OVER!', W / 2, 260, 56, '#FFD98A', 700, 'center');
  text(ctx, `Final score: ${s.score}`, W / 2, 330, 32, PAPER, 700, 'center');
  text(ctx, `Dishes served: ${s.served}   ·   Best streak: ${s.best}`, W / 2, 380, 22, PAPER, 400, 'center');
  text(ctx, 'Press R to play again', W / 2, 450, 24, '#FFFFFF', 700, 'center');
}

export function draw(ctx, s) {
  // Kitchen walls and floor.
  ctx.fillStyle = '#F7E8C8';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#EAD9AE';
  ctx.fillRect(0, 560, W, 20);
  drawTopBar(ctx, s);
  drawOrderBoard(ctx, s);
  drawPlate(ctx, s);
  drawMessage(ctx, s);
  drawMenu(ctx, s);
  drawCounter(ctx, s);
  if (s.phase === 'title') drawTitle(ctx);
  if (s.phase === 'over') drawGameOver(ctx, s);
}
