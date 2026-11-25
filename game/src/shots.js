// Dapur Kilat — screenshot scenes. A `?shot=` query sets the game up in one
// fixed state, so the screenshots are deterministic renders of the game's own
// code: start (title), play (mid-shift, dish half built), serve (a complete
// dish on the plate, ready to serve) and end (shift over, final score).

import { dishById } from './menu.js';
import { ORDER_SECONDS, SHIFT_SECONDS } from './kitchen.js';

export function setShot(s, name) {
  if (name === 'start') {
    s.phase = 'title';
    return;
  }
  if (name === 'play') {
    s.phase = 'play';
    s.score = 250;
    s.served = 2;
    s.streak = 2;
    s.hearts = 3;
    s.shiftLeft = 92;
    s.orders = [
      { dish: dishById('burger'), left: 30 },
      { dish: dishById('pizza'), left: 38 },
      { dish: dishById('salad'), left: 42 },
    ];
    s.plate = ['bun', 'patty'];
    s.message = '';
    return;
  }
  if (name === 'serve') {
    s.phase = 'play';
    s.score = 380;
    s.served = 3;
    s.streak = 3;
    s.hearts = 3;
    s.shiftLeft = 74;
    s.orders = [{ dish: dishById('burger'), left: 25 }];
    s.plate = ['bun', 'patty', 'lettuce', 'tomato'];
    s.message = 'Ready to serve!';
    return;
  }
  if (name === 'end') {
    s.phase = 'over';
    s.score = 1240;
    s.served = 11;
    s.streak = 5;
    s.best = 5;
    s.hearts = 1;
    s.shiftLeft = 0;
    s.orders = [];
    s.plate = [];
    s.message = '';
    return;
  }
  // Unknown shot: leave the title screen up.
  s.phase = 'title';
}

export const SHOT_NAMES = ['start', 'play', 'serve', 'end'];
export { ORDER_SECONDS, SHIFT_SECONDS };
