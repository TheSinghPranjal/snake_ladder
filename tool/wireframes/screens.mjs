// Phone screens, drawn in phone-local coordinates (390 x 844).
import { boardPoint, drawBoard, drawTokens, snakePathD, SYMBOLS } from './sketch.mjs';
import { snakeSamples } from './geometry.mjs';

export const BOARD = { x: 16, y: 180, size: 358 };
const PLAYERS2 = [
  { name: 'Asha', color: 0, sq: 23 },
  { name: 'Bot Kiwi', color: 1, sq: 17 },
];
const PLAYERS4 = [
  { name: 'Asha', color: 0, sq: 42 },
  { name: 'Ravi', color: 1, sq: 42 },
  { name: 'Bot Kiwi', color: 2, sq: 57 },
  { name: 'Bot Mango', color: 3, sq: 30 },
];
export { PLAYERS2, PLAYERS4 };

export const topBar = (s, title, o = {}) => {
  if (o.back !== false) {
    s.rect(14, 62, 44, 44, { r: 12, sw: 1.6 });
    s.icon('back', 36, 84, 22);
  }
  s.text(195, 94, title, { size: 28, anchor: 'middle' });
};

const avatar = (s, cx, cy, r, color, o = {}) => {
  s.circle(cx, cy, r + 4, { sw: o.active ? 3 : 1.6 });
  s.circle(cx, cy, r, { sw: 1.4, fill: s.c.fill });
  s.path(`M${cx - r * 0.5} ${cy - r * 0.5}L${cx + r * 0.5} ${cy + r * 0.5}M${cx + r * 0.5} ${cy - r * 0.5}L${cx - r * 0.5} ${cy + r * 0.5}`, { sw: 1, stroke: s.c.muted });
  s.symbol(SYMBOLS[color], cx + r * 0.85, cy + r * 0.85, r * 0.45);
};

export const playerStrip = (s, players, active, o = {}) => {
  const w = 358 / players.length;
  players.forEach((p, i) => {
    const x = 16 + i * w;
    const on = i === active;
    if (on) s.rect(x - 2, 108, w - 2, 64, { r: 18, sw: 1.4, dash: '3 5' });
    s.rect(x + 2, 112, w - 10, 56, { r: 16, sw: on ? 3 : 1.6, fill: on ? s.c.fill2 : s.c.bg });
    avatar(s, x + 24, 140, 13, p.color, { active: on });
    const short = players.length > 2;
    s.text(x + 44, 134, short ? p.name.replace('Bot ', '') : p.name, { size: short ? 15 : 18 });
    s.text(x + 44, 156, p.done ? `#${p.done}` : `sq ${p.sq}`, { size: 14, fill: s.c.muted });
    if (o.thinking === i) {
      s.rect(x + w - 44, 96, 40, 22, { r: 11, sw: 1.6, fill: s.c.bg });
      [0, 1, 2].forEach((k) => s.circle(x + w - 34 + k * 10, 107, 2.4, { sw: 0, stroke: 'none', fill: s.c.fg }));
    }
  });
};

// The game screen. o: board, n, players, active, tokens, dice, status, extra().
export const gameScreen = (s, boards, o = {}) => {
  const board = boards[o.board ?? 'classic_sunshine'];
  const n = o.n ?? 7;
  const players = o.players ?? PLAYERS2;
  s.rect(14, 60, 44, 44, { r: 12, sw: 1.8 });
  s.icon('pause', 36, 82, 22);
  s.text(68, 90, board.name, { size: 21 });
  s.rect(232, 64, 62, 36, { r: 18, sw: 1.6 });
  s.icon('snake', 254, 82, 20);
  s.text(281, 89, String(n), { size: 20, anchor: 'middle' });
  s.rect(300, 64, 76, 36, { r: 18, sw: 1.6 });
  s.text(338, 89, `Turn ${o.turn ?? 12}`, { size: 18, anchor: 'middle' });
  playerStrip(s, players, o.active ?? 0, { thinking: o.thinking });
  drawBoard(s, BOARD.x, BOARD.y, BOARD.size, board, n, { highlight: o.highlight });
  s.rect(16, 544, 76, 30, { r: 12, sw: 1.4, dash: '4 4' });
  s.text(54, 565, 'start', { size: 15, anchor: 'middle', fill: s.c.muted });
  s.layer();
  if (o.beforeTokens) o.beforeTokens();
  const tokens = o.tokens ?? players.map((p, i) => ({ sq: p.sq, color: p.color, active: i === (o.active ?? 0) }));
  drawTokens(s, BOARD.x, BOARD.y, BOARD.size, tokens);
  s.rect(110, 580, 264, 42, { r: 21, sw: 1.4, fill: s.c.fill });
  s.text(242, 608, o.status ?? 'Your turn, Asha', { size: 20, anchor: 'middle' });
  const dice = o.dice ?? { face: 5 };
  if (dice.rolling) {
    s.group('transform="rotate(-14 195 700)"', () => s.dice(135, 640, 120, dice.face, {}));
    s.path('M118 668q-16 18 -6 44M106 652q-26 30 -10 72M272 732q16 -18 6 -44M284 748q26 -30 10 -72', { sw: 1.8 });
  } else {
    s.dice(135, 640, 120, dice.face, { disabled: dice.disabled });
  }
  s.text(195, 790, dice.hint ?? (dice.disabled ? 'wait…' : 'tap or swipe up'), { size: 16, anchor: 'middle', fill: s.c.muted });
  s.layer();
  if (o.extra) o.extra();
};

export const toast = (s, y, label, o = {}) => {
  const w = o.w ?? 250;
  s.rect(195 - w / 2, y, w, 52, { r: 26, sw: 2.6, fill: s.c.bg });
  s.text(195, y + 34, label, { size: 24, anchor: 'middle' });
};

export const ribbon = (s, y, label) => {
  s.path(`M6 ${y}H384L370 ${y + 40}L384 ${y + 80}H6L20 ${y + 40}Z`, { sw: 2.6, fill: s.c.bg });
  s.path(`M28 ${y + 8}H362M28 ${y + 72}H362`, { sw: 1, dash: '4 5' });
  s.text(195, y + 52, label, { size: 32, anchor: 'middle' });
};

export const scrim = (s) => s.rect(0, 0, 390, 844, { r: 48, sw: 0, stroke: 'none', fill: s.c.fg, op: 0.32 });

export const hopTrail = (s, from, to) => {
  for (let q = from; q < to; q++) {
    const [ax, ay] = boardPoint(BOARD.x, BOARD.y, BOARD.size, q);
    const [bx, by] = boardPoint(BOARD.x, BOARD.y, BOARD.size, q + 1);
    s.path(`M${ax} ${ay - 6}Q${(ax + bx) / 2} ${Math.min(ay, by) - 30} ${bx} ${by - 6}`, { sw: 1.8, dash: '4 4' });
  }
};

// A point part-way along a jump, in phone-local coordinates (f from 0 to 1).
export const pointOnJump = (board, id, f) => {
  const j = board.jumps.find((jj) => jj.id === id);
  if (j.type === 'ladder') {
    const [ax, ay] = boardPoint(BOARD.x, BOARD.y, BOARD.size, j.from);
    const [bx, by] = boardPoint(BOARD.x, BOARD.y, BOARD.size, j.to);
    return [ax + (bx - ax) * f, ay + (by - ay) * f];
  }
  const pts = snakeSamples(j, 24);
  const [x, y] = pts[Math.round(f * (pts.length - 1))];
  return [BOARD.x + x * BOARD.size, BOARD.y + y * BOARD.size];
};

export const jumpPath = (board, id) => {
  const j = board.jumps.find((jj) => jj.id === id);
  return j.type === 'snake' ? snakePathD(j, BOARD.x, BOARD.y, BOARD.size) : null;
};

// ---------- Start ----------

export const splash = (s) => {
  s.xbox(110, 250, 170, 170, { r: 40 });
  s.path('M120 400q30 -50 70 -10t70 -14', { sw: 3 });
  s.text(195, 490, 'Snake Saga', { size: 50, anchor: 'middle' });
  s.rect(95, 560, 200, 12, { r: 6, sw: 1.6 });
  s.rect(97, 562, 120, 8, { r: 4, sw: 0, stroke: 'none', fill: s.c.fg });
  s.text(195, 604, 'loading boards…', { size: 18, anchor: 'middle', fill: s.c.muted });
  s.callout(298, 250, 1);
  s.callout(312, 566, 2);
};

export const home = (s, o = {}) => {
  s.rect(16, 62, 132, 42, { r: 21, sw: 1.8 });
  s.icon('trophy', 40, 83, 20);
  s.text(60, 90, '12 wins', { size: 20 });
  s.rect(330, 62, 44, 44, { r: 12, sw: 1.6 });
  s.icon('gear', 352, 84, 22);
  const cont = o.continue;
  s.xbox(cont ? 125 : 105, cont ? 124 : 132, cont ? 140 : 180, cont ? 100 : 140, { r: 28 });
  s.text(195, cont ? 268 : 318, 'Snake Saga', { size: cont ? 40 : 46, anchor: 'middle' });
  if (cont) {
    s.button(32, 296, 326, 96, 'Continue', { primary: true, sub: 'Classic Sunshine · Turn 14', size: 34 });
    s.button(32, 408, 326, 64, 'New game', {});
    s.button(32, 486, 326, 58, 'Quick Play', { sub: 'you vs 1 bot' });
    s.button(32, 558, 158, 56, 'Boards', {});
    s.button(200, 558, 158, 56, 'How to Play', {});
    s.button(32, 628, 326, 52, 'Settings', {});
    s.callout(30, 300, 1);
    s.callout(30, 412, 2);
  } else {
    s.button(32, 360, 326, 92, 'Play', { primary: true, size: 40 });
    s.button(32, 470, 326, 66, 'Quick Play', { sub: 'you vs 1 bot' });
    s.button(32, 552, 158, 58, 'Boards', {});
    s.button(200, 552, 158, 58, 'How to Play', {});
    s.button(32, 626, 326, 54, 'Settings', {});
    s.callout(30, 364, 1);
    s.callout(30, 474, 2);
  }
  s.callout(16, 64, 3);
};

export const howTo = (s, idx, title, fn) => {
  s.text(352, 94, 'Skip', { size: 20, anchor: 'end' });
  s.rect(24, 124, 342, 580, { r: 26, sw: 2 });
  fn();
  s.text(48, 478, title, { size: 30 });
  s.wavy(50, 512, 280, 3);
  for (let i = 0; i < 5; i++) s.circle(155 + i * 20, 670, i === idx ? 6 : 4, { sw: 1.6, fill: i === idx ? s.c.fg : 'none' });
  s.button(24, 728, 158, 58, 'Back', { disabled: idx === 0 });
  s.button(208, 728, 158, 58, 'Next', { primary: true });
};

// ---------- Setup ----------

export const modeSelect = (s) => {
  topBar(s, 'Choose a mode');
  const card = (y, title, line, n) => {
    s.rect(24, y, 342, 240, { r: 24, sw: 2.4 });
    s.xbox(48, y + 28, 130, 130, { r: 20 });
    s.text(196, y + 70, title, { size: 32 });
    s.wavy(198, y + 100, 140, 2);
    s.text(48, y + 200, line, { size: 20, fill: s.c.muted });
    s.icon('chevron', 336, y + 120, 28);
    s.callout(26, y + 4, n);
  };
  card(136, 'vs Computer', '1–3 humans vs 1–3 bots', 1);
  card(400, 'Pass & Play', '2–4 friends, one phone', 2);
};

export const playerSetup = (s, boards, o) => {
  const { count, bots, mode } = o;
  topBar(s, 'Players');
  s.text(24, 156, 'Players', { size: 22 });
  s.segmented(140, 126, 226, 44, ['2', '3', '4'], count - 2, { size: 22 });
  const names = ['Asha', 'Ravi', 'Bot Kiwi', 'Bot Mango'];
  const rowH = 76;
  for (let i = 0; i < count; i++) {
    const y = 184 + i * rowH;
    const bot = bots.includes(i);
    s.rect(16, y, 358, rowH - 8, { r: 16, sw: 1.6 });
    avatar(s, 46, y + 34, 16, i);
    s.text(80, y + 28, bot ? names[i] : count === 2 && i === 1 ? 'Player 2' : names[i], { size: 20 });
    s.line(80, y + 34, 196, y + 34, { sw: 1, stroke: s.c.muted });
    for (let k = 0; k < 4; k++) {
      const cx = 88 + k * 28;
      const taken = k !== i && k < count;
      s.circle(cx, y + 52, 10, { sw: k === i ? 3 : 1.4, dash: taken ? '2 3' : null });
      s.symbol(SYMBOLS[k], cx, y + 52, 6, { fill: taken ? s.c.muted : s.c.fg });
    }
    if (mode !== 'pass') {
      s.segmented(212, y + 8, 152, 28, ['Human', 'Bot'], bot ? 1 : 0, { size: 15 });
      if (bot) s.segmented(212, y + 40, 152, 22, ['Easy', 'Normal'], i === 2 ? 1 : 0, { size: 13 });
    }
  }
  const sy = 184 + count * rowH + 8;
  s.rect(16, sy, 358, 196, { r: 18, sw: 1.8 });
  s.text(32, sy + 36, 'Snakes', { size: 26 });
  s.stepper(30, sy + 54, 7, { b: 44 });
  s.text(32, sy + 132, '6 – 8 · default 7', { size: 16, fill: s.c.muted });
  s.text(32, sy + 172, 'Classic Sunshine', { size: 18 });
  s.text(158, sy + 172, 'Change ›', { size: 18, fill: s.c.muted });
  drawBoard(s, 214, sy + 18, 150, boards.classic_sunshine, 7, { numbers: false, thin: true, frame: 2 });
  s.button(24, 768, 342, 58, 'Start game', { primary: true });
  s.callout(140, 128, 1);
  s.callout(20, 186, 2);
  s.callout(362, sy + 22, 3);
  s.callout(30, sy + 58, 4);
};

export const boardSelect = (s, boards) => {
  topBar(s, 'Boards');
  s.rect(-1, 196, 50, 380, { r: 20, sw: 1.6 });
  s.text(18, 390, '✓', { size: 22, anchor: 'middle' });
  s.rect(341, 196, 50, 380, { r: 20, sw: 1.6, dash: '6 5' });
  s.icon('lock', 366, 386, 22);
  s.rect(62, 150, 266, 470, { r: 26, sw: 2.6 });
  drawBoard(s, 82, 172, 226, boards.sugar_rush, 7, { numbers: false, thin: true, frame: 2 });
  s.rect(82, 172, 226, 226, { sw: 0, stroke: 'none', fill: s.c.bg, op: 0.6 });
  s.circle(195, 285, 34, { sw: 2.4, fill: s.c.bg });
  s.icon('lock', 195, 287, 34);
  s.text(195, 446, 'Sugar Rush', { size: 32, anchor: 'middle' });
  s.text(195, 482, 'Win 1 game to unlock', { size: 20, anchor: 'middle', fill: s.c.muted });
  s.rect(102, 508, 186, 12, { r: 6, sw: 1.6 });
  s.text(195, 552, '0 / 1 wins', { size: 18, anchor: 'middle', fill: s.c.muted });
  for (let i = 0; i < 3; i++) s.circle(175 + i * 20, 660, i === 1 ? 6 : 4, { sw: 1.6, fill: i === 1 ? s.c.fg : 'none' });
  s.button(24, 760, 342, 58, 'Locked', { disabled: true });
  s.callout(66, 154, 1);
  s.callout(232, 260, 2);
  s.callout(22, 214, 3);
  s.callout(30, 764, 4);
};

// ---------- Overlays ----------

export const pauseSheet = (s, boards, o = {}) => {
  const callout = o.callouts === false ? () => {} : (x, y, n) => s.callout(x, y, n);
  gameScreen(s, boards, {});
  s.layer();
  scrim(s);
  s.path('M0 386Q0 358 28 358H362Q390 358 390 386V796Q390 844 342 844H48Q0 844 0 796Z', { sw: 2.6, fill: s.c.bg });
  s.line(170, 372, 220, 372, { sw: 4 });
  s.text(28, 412, 'Paused', { size: 30 });
  s.button(24, 428, 342, 56, 'Resume', { primary: true });
  s.button(24, 494, 166, 48, 'Restart', {});
  s.button(200, 494, 166, 48, 'Rules', {});
  const row = (y, label, on) => { s.text(32, y + 20, label, { size: 21 }); s.toggle(314, y, on); };
  row(556, 'Sound', true);
  row(596, 'Music', false);
  row(636, 'Haptics', true);
  s.text(32, 698, 'Theme', { size: 21 });
  s.segmented(148, 676, 218, 34, ['Auto', 'Light', 'Dark'], 0, { size: 16 });
  s.button(24, 738, 342, 52, 'Quit to Home', { danger: true });
  callout(22, 432, 1);
  callout(22, 498, 2);
  callout(300, 560, 3);
  callout(140, 680, 4);
  callout(22, 742, 5);
};

export const dialog = (s, title, lines, cancel, ok) => {
  s.rect(32, 296, 326, 250, { r: 26, sw: 2.6, fill: s.c.bg });
  s.text(195, 344, title, { size: 30, anchor: 'middle' });
  lines.forEach((l, i) => s.text(195, 384 + i * 26, l, { size: 19, anchor: 'middle', fill: s.c.muted }));
  s.button(52, 470, 136, 54, cancel, {});
  s.button(202, 470, 136, 54, ok, { danger: true });
};

const confetti = (s, seed = 3) => {
  let a = seed;
  const rnd = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
  for (let i = 0; i < 34; i++) {
    const x = 20 + rnd() * 350;
    const y = 60 + rnd() * 330;
    const k = i % 3;
    if (k === 0) s.rect(x, y, 9, 5, { sw: 1.4, r: 1 });
    else if (k === 1) s.path(`M${x} ${y}l6 10l-12 0z`, { sw: 1.4 });
    else s.path(`M${x} ${y}q5 -6 10 0t10 0`, { sw: 1.4 });
  }
};

export const winScreen = (s, o = {}) => {
  confetti(s);
  ribbon(s, 70, 'Winner!');
  s.circle(195, 236, 64, { sw: 3.5, fill: s.c.bg });
  s.symbol('star', 195, 236, 44);
  s.text(195, 340, 'Asha wins!', { size: 38, anchor: 'middle' });
  if (o.full) {
    const rows = [['1', 'Asha', 'star', '22 turns'], ['2', 'Bot Kiwi', 'dot', '27 turns'], ['3', 'Ravi', 'tri', '31 turns'], ['4', 'Bot Mango', 'square', '34 turns']];
    rows.forEach(([r, name, sym, t], i) => {
      const y = 362 + i * 50;
      s.rect(24, y, 342, 44, { r: 14, sw: i === 0 ? 2.6 : 1.4, fill: i === 0 ? s.c.fill2 : s.c.bg });
      s.text(48, y + 30, r, { size: 24, anchor: 'middle' });
      s.symbol(sym, 82, y + 22, 10);
      s.text(102, y + 30, name, { size: 21 });
      s.text(352, y + 30, t, { size: 18, anchor: 'end', fill: s.c.muted });
      if (i === 0) s.icon('crown', 330 - 96, y + 22, 20);
    });
    s.text(24, 586, 'This game', { size: 20 });
    const cols = ['Ladders', 'Snakes', 'Climb', 'Slide'];
    cols.forEach((c, i) => s.text(150 + i * 58, 612, c, { size: 14, anchor: 'middle', fill: s.c.muted }));
    [['Asha', '4', '2', '+56', '−63'], ['Kiwi', '3', '3', '+21', '−38']].forEach((r, ri) => {
      r.forEach((v, i) => s.text(i === 0 ? 24 : 150 + (i - 1) * 58, 640 + ri * 26, v, { size: 18, anchor: i === 0 ? 'start' : 'middle' }));
    });
  } else {
    [['1', 'Asha', 'star', 'square 100'], ['–', 'Bot Kiwi', 'dot', 'on 64']].forEach(([r, name, sym, t], i) => {
      const y = 362 + i * 50;
      s.rect(24, y, 342, 44, { r: 14, sw: i === 0 ? 2.6 : 1.4, fill: i === 0 ? s.c.fill2 : s.c.bg });
      s.text(48, y + 30, r, { size: 24, anchor: 'middle' });
      s.symbol(sym, 82, y + 22, 10);
      s.text(102, y + 30, name, { size: 21 });
      s.text(352, y + 30, t, { size: 18, anchor: 'end', fill: s.c.muted });
    });
    const stats = [['Turns', '22'], ['Ladders', '4'], ['Snakes', '2'], ['Longest climb', '28 → 84'], ['Worst slide', '87 → 24']];
    stats.forEach(([k, v], i) => {
      const col = i < 3 ? i : i - 3;
      const w = i < 3 ? 108 : 166;
      const x = 24 + col * (w + 9);
      const y = i < 3 ? 470 : 556;
      s.rect(x, y, w, 76, { r: 14, sw: 1.4 });
      s.text(x + w / 2, y + 30, k, { size: 16, anchor: 'middle', fill: s.c.muted });
      s.text(x + w / 2, y + 60, v, { size: 24, anchor: 'middle' });
    });
  }
  s.button(24, 696, 342, 58, 'Play again', { primary: true });
  s.button(24, 766, 342, 50, 'Home', {});
  s.text(195, 832 - 4, '', {});
};

// ---------- Settings & stats ----------

export const settings = (s, o = {}) => {
  topBar(s, 'Settings');
  s.text(24, 140, 'Appearance', { size: 21 });
  s.segmented(24, 150, 342, 44, ['System', 'Light', 'Dark'], o.sel ?? 0, { size: 19 });
  const row = (y, label, right) => {
    s.line(24, y + 40, 366, y + 40, { sw: 1, stroke: s.c.muted });
    s.text(24, y + 26, label, { size: 21 });
    right(y);
  };
  row(206, 'Sound', (y) => s.toggle(314, y + 4, true));
  row(250, 'Music', (y) => s.toggle(314, y + 4, true));
  row(294, 'Haptics', (y) => s.toggle(314, y + 4, true));
  row(338, 'Animation speed', (y) => s.segmented(212, y + 2, 154, 34, ['Normal', 'Fast'], 0, { size: 15 }));
  row(388, 'Default snakes', (y) => s.stepper(226, y - 4, 7, { b: 36 }));
  row(442, 'House rules', (y) => s.icon('chevron', 356, y + 20, 20));
  row(486, 'Stats', (y) => s.icon('chevron', 356, y + 20, 20));
  row(530, 'Reset stats', (y) => s.icon('chevron', 356, y + 20, 20));
  s.text(24, 616, 'Privacy', { size: 21 });
  s.text(24, 644, 'No accounts, no ads, no tracking.', { size: 17, fill: s.c.muted });
  s.text(24, 668, 'Everything stays on this phone.', { size: 17, fill: s.c.muted });
  s.text(195, 790, 'Version 1.0.0 (1)', { size: 16, anchor: 'middle', fill: s.c.muted });
};

export const houseRules = (s) => {
  topBar(s, 'House rules');
  const rows = [
    ['Need a 6 to start', 'toggle', false],
    ['Overshoot at 100', 'seg', ['Stay put', 'Bounce'], 0],
    ['Extra roll on 6', 'toggle', true],
    ['Three 6s penalty', 'toggle', true],
    ['Capture', 'toggle', false],
    ['Play to', 'seg', ['First winner', 'Ranking'], 0],
  ];
  let y = 128;
  rows.forEach(([label, kind, a, b]) => {
    const indent = label.startsWith('Three') ? 18 : 0;
    s.text(24 + indent, y + 26, label, { size: 21 });
    s.wavy(26 + indent, y + 48, 150, 1);
    if (kind === 'toggle') s.toggle(314, y + 8, a);
    else s.segmented(196, y + 6, 170, 34, a, b, { size: 14 });
    s.line(24, y + 70, 366, y + 70, { sw: 1, stroke: s.c.muted });
    y += 82;
  });
  s.text(24, y + 22, 'Snakes per game: Settings › Default snakes,', { size: 16, fill: s.c.muted });
  s.text(24, y + 44, 'or change it in Player Setup.', { size: 16, fill: s.c.muted });
  s.button(24, 760, 342, 54, 'Reset to classic rules', {});
};

export const statsScreen = (s) => {
  topBar(s, 'Stats');
  s.rect(24, 124, 342, 104, { r: 20, sw: 2 });
  s.text(48, 162, 'Games played', { size: 20, fill: s.c.muted });
  s.text(48, 210, '37', { size: 46 });
  s.text(24, 266, 'Wins by mode', { size: 22 });
  [['vs Computer', 12, 0.8], ['Pass & Play', 5, 0.34], ['Quick Play', 4, 0.27]].forEach(([k, v, f], i) => {
    const y = 284 + i * 44;
    s.text(24, y + 24, k, { size: 19 });
    s.rect(150, y + 8, 180 * f, 20, { r: 6, sw: 1.4, fill: s.c.fill2 });
    s.text(366, y + 24, String(v), { size: 19, anchor: 'end' });
  });
  [['Ladders climbed', '214', 24], ['Snakes hit', '167', 200]].forEach(([k, v, x]) => {
    s.rect(x, 430, 166, 96, { r: 18, sw: 1.6 });
    s.text(x + 16, 462, k, { size: 17, fill: s.c.muted });
    s.text(x + 16, 506, v, { size: 34 });
  });
  s.rect(24, 542, 342, 86, { r: 18, sw: 1.6 });
  s.text(40, 574, 'Best win', { size: 17, fill: s.c.muted });
  s.text(40, 610, '19 turns · Classic Sunshine', { size: 22 });
  s.text(24, 670, 'Boards unlocked  2 / 3', { size: 20 });
  [0, 1, 2].forEach((i) => {
    s.rect(24 + i * 116, 686, 106, 64, { r: 14, sw: 1.6, dash: i === 2 ? '5 5' : null });
    if (i === 2) s.icon('lock', 77 + i * 116, 718, 22);
    else s.text(77 + i * 116, 726, '✓', { size: 24, anchor: 'middle' });
  });
};

// ---------- Tablet (800 x 1280) ----------

export const tabletGame = (s, boards) => {
  const board = boards.classic_sunshine;
  s.rect(24, 44, 52, 52, { r: 14, sw: 1.8 });
  s.icon('pause', 50, 70, 24);
  s.text(96, 80, 'Classic Sunshine', { size: 28 });
  s.rect(560, 46, 88, 46, { r: 23, sw: 1.6 });
  s.icon('snake', 590, 69, 24);
  s.text(628, 78, '7', { size: 24, anchor: 'middle' });
  s.rect(658, 46, 118, 46, { r: 23, sw: 1.6 });
  s.text(717, 78, 'Turn 12', { size: 22, anchor: 'middle' });
  const bx = 80;
  const by = 130;
  drawBoard(s, bx, by, 640, board, 7, { numSize: 17 });
  s.layer();
  drawTokens(s, bx, by, 640, PLAYERS4.map((p, i) => ({ sq: p.sq, color: p.color, active: i === 0 })));
  const rail = (x, idx) => {
    s.rect(x, 130, 64, 640, { r: 20, sw: 1.4, dash: '4 6' });
    idx.forEach((pi, k) => {
      const p = PLAYERS4[pi];
      const cy = 200 + k * 180;
      const on = pi === 0;
      s.rect(x + 4, cy - 56, 56, 140, { r: 16, sw: on ? 3 : 1.6, fill: on ? s.c.fill2 : s.c.bg });
      avatar(s, x + 32, cy - 14, 16, p.color, { active: on });
      s.text(x + 32, cy + 34, p.name.replace('Bot ', ''), { size: 15, anchor: 'middle' });
      s.text(x + 32, cy + 60, String(p.sq), { size: 22, anchor: 'middle' });
    });
  };
  rail(8, [0, 2]);
  rail(728, [1, 3]);
  s.rect(24, 800, 752, 420, { r: 28, sw: 1.8 });
  s.rect(220, 830, 360, 50, { r: 25, sw: 1.4, fill: s.c.fill });
  s.text(400, 864, 'Your turn, Asha', { size: 24, anchor: 'middle' });
  s.dice(320, 910, 160, 5, {});
  s.text(400, 1110, 'tap or swipe up', { size: 18, anchor: 'middle', fill: s.c.muted });
  s.text(56, 862, 'Last rolls', { size: 20 });
  [5, 2, 6, 6, 3].forEach((v, i) => s.dice(56 + (i % 3) * 46, 880 + Math.floor(i / 3) * 46, 38, v, {}));
  s.text(600, 862, 'Rules', { size: 20 });
  ['Extra roll on 6', 'Exact 100', 'No capture'].forEach((r, i) => {
    s.rect(600, 878 + i * 46, 156, 36, { r: 18, sw: 1.2 });
    s.text(678, 902 + i * 46, r, { size: 15, anchor: 'middle' });
  });
};

export const tabletHome = (s, boards) => {
  s.rect(40, 50, 170, 50, { r: 25, sw: 1.8 });
  s.icon('trophy', 72, 75, 22);
  s.text(96, 84, '12 wins', { size: 24 });
  s.rect(716, 50, 52, 52, { r: 14, sw: 1.6 });
  s.icon('gear', 742, 76, 26);
  s.xbox(300, 140, 200, 150, { r: 36 });
  s.text(400, 350, 'Snake Saga', { size: 56, anchor: 'middle' });
  s.button(80, 400, 340, 110, 'Continue', { primary: true, sub: 'Classic Sunshine · Turn 14', size: 38 });
  s.button(80, 530, 340, 74, 'New game', {});
  s.button(80, 620, 340, 74, 'Quick Play', { sub: 'you vs 1 bot' });
  s.button(80, 710, 165, 66, 'Boards', {});
  s.button(255, 710, 165, 66, 'How to Play', {});
  s.button(80, 792, 340, 62, 'Settings', {});
  s.rect(450, 400, 290, 454, { r: 26, sw: 2 });
  s.text(474, 440, 'Current board', { size: 20, fill: s.c.muted });
  drawBoard(s, 474, 456, 242, boards.classic_sunshine, 7, { numbers: false, thin: true, frame: 2 });
  s.text(474, 740, 'Classic Sunshine', { size: 26 });
  s.text(474, 772, '7 snakes · 9 ladders', { size: 18, fill: s.c.muted });
  s.button(474, 790, 242, 46, 'Change board', {});
  s.rect(80, 890, 660, 300, { r: 26, sw: 1.6, dash: '6 6' });
  s.text(410, 1050, 'stats summary · recent games', { size: 22, anchor: 'middle', fill: s.c.muted });
};
