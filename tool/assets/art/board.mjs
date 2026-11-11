// Board art per theme and mode: tiles, frame, background, ladder parts, cards,
// plus a full-board renderer used by thumbnails, how-to art and mockups.
import fs from 'node:fs';
import path from 'node:path';
import { GEOMETRY, THEMES } from '../lib/palette.mjs';
import { ribbon } from '../lib/snake.mjs';
import { ROOT, asset, doc, g, light, mix, MODES, n, outline, shade, shadowDefs, textPath } from '../lib/svg.mjs';

export const THEME_IDS = ['sunshine', 'sweets', 'jungle'];
export const BOARD_IDS = { sunshine: 'classic_sunshine', sweets: 'sugar_rush', jungle: 'jungle_temple' };
export const loadBoard = (theme) => JSON.parse(fs.readFileSync(path.join(ROOT, `assets/boards/${BOARD_IDS[theme]}.json`), 'utf8'));

// ---------- icons drawn on special tiles ----------
const partyPopper = (x, y, s) => g('party-popper', [
  `<path d="M${n(x + 6 * s)} ${n(y + 58 * s)}L${n(x + 22 * s)} ${n(y + 20 * s)}L${n(x + 44 * s)} ${n(y + 42 * s)}Z" fill="#FF6B5A" stroke="#7A1F16" stroke-width="${n(2.4 * s)}" stroke-linejoin="round"/>`,
  `<path d="M${n(x + 12 * s)} ${n(y + 44 * s)}L${n(x + 24 * s)} ${n(y + 50 * s)}M${n(x + 16 * s)} ${n(y + 34 * s)}L${n(x + 33 * s)} ${n(y + 46 * s)}" stroke="#FFC93C" stroke-width="${n(3 * s)}" stroke-linecap="round"/>`,
  `<ellipse cx="${n(x + 33 * s)}" cy="${n(y + 31 * s)}" rx="${n(13 * s)}" ry="${n(5 * s)}" transform="rotate(45 ${n(x + 33 * s)} ${n(y + 31 * s)})" fill="#FFD9D3" stroke="#7A1F16" stroke-width="${n(2.2 * s)}"/>`,
  ...[[44, 10, '#4BA3F5'], [54, 22, '#3FA34D'], [36, 6, '#FFC93C'], [56, 8, '#E8453C'], [48, 30, '#F4C21B']].map(([cx, cy, c], i) => (i % 2
    ? `<circle cx="${n(x + cx * s)}" cy="${n(y + cy * s)}" r="${n(2.6 * s)}" fill="${c}"/>`
    : `<rect x="${n(x + cx * s - 2 * s)}" y="${n(y + cy * s - 4 * s)}" width="${n(4 * s)}" height="${n(8 * s)}" rx="${n(1 * s)}" transform="rotate(${30 + i * 25} ${n(x + cx * s)} ${n(y + cy * s)})" fill="${c}"/>`)),
  `<path d="M${n(x + 40 * s)} ${n(y + 18 * s)}q6 -8 12 -4" fill="none" stroke="#2F7DE1" stroke-width="${n(2.2 * s)}" stroke-linecap="round"/>`,
].join(''));

const candyGoal = (x, y, s) => g('candy-crown', [
  `<path d="M${n(x + 14 * s)} ${n(y + 46 * s)}L${n(x + 10 * s)} ${n(y + 20 * s)}L${n(x + 22 * s)} ${n(y + 32 * s)}L${n(x + 32 * s)} ${n(y + 14 * s)}L${n(x + 42 * s)} ${n(y + 32 * s)}L${n(x + 54 * s)} ${n(y + 20 * s)}L${n(x + 50 * s)} ${n(y + 46 * s)}Z" fill="#FFC93C" stroke="#8A5A00" stroke-width="${n(2.4 * s)}" stroke-linejoin="round"/>`,
  `<rect x="${n(x + 13 * s)}" y="${n(y + 44 * s)}" width="${n(38 * s)}" height="${n(8 * s)}" rx="${n(3 * s)}" fill="#FF6FA5" stroke="#8A1F4A" stroke-width="${n(2.2 * s)}"/>`,
  ...[[10, 18, '#4FD1B0'], [32, 12, '#FF6FA5'], [54, 18, '#A77BFF']].map(([cx, cy, c]) => `<circle cx="${n(x + cx * s)}" cy="${n(y + cy * s)}" r="${n(4 * s)}" fill="${c}" stroke="#5A3A00" stroke-width="${n(1.6 * s)}"/>`),
].join(''));

const templeGoal = (x, y, s) => g('golden-idol', [
  `<rect x="${n(x + 14 * s)}" y="${n(y + 44 * s)}" width="${n(36 * s)}" height="${n(10 * s)}" rx="${n(2 * s)}" fill="#9E8E6E" stroke="#3F3524" stroke-width="${n(2.2 * s)}"/>`,
  `<path d="M${n(x + 32 * s)} ${n(y + 10 * s)}L${n(x + 46 * s)} ${n(y + 26 * s)}L${n(x + 32 * s)} ${n(y + 44 * s)}L${n(x + 18 * s)} ${n(y + 26 * s)}Z" fill="#FFC93C" stroke="#7A5600" stroke-width="${n(2.4 * s)}" stroke-linejoin="round"/>`,
  `<path d="M${n(x + 32 * s)} ${n(y + 10 * s)}L${n(x + 32 * s)} ${n(y + 44 * s)}M${n(x + 18 * s)} ${n(y + 26 * s)}H${n(x + 46 * s)}" stroke="#E0A500" stroke-width="${n(1.4 * s)}"/>`,
  `<path d="M${n(x + 26 * s)} ${n(y + 20 * s)}l4 -4" stroke="#FFFFFF" stroke-width="${n(2 * s)}" stroke-linecap="round"/>`,
].join(''));

const startFlag = (x, y, s, c) => g('start-flag', [
  `<path d="M${n(x + 20 * s)} ${n(y + 52 * s)}V${n(y + 12 * s)}" stroke="#5A4630" stroke-width="${n(3.2 * s)}" stroke-linecap="round"/>`,
  `<path d="M${n(x + 21 * s)} ${n(y + 13 * s)}C${n(x + 32 * s)} ${n(y + 8 * s)} ${n(x + 38 * s)} ${n(y + 20 * s)} ${n(x + 48 * s)} ${n(y + 14 * s)}V${n(y + 32 * s)}C${n(x + 38 * s)} ${n(y + 38 * s)} ${n(x + 32 * s)} ${n(y + 26 * s)} ${n(x + 21 * s)} ${n(y + 31 * s)}Z" fill="${c}" stroke="${outline(c)}" stroke-width="${n(2.2 * s)}" stroke-linejoin="round"/>`,
  `<ellipse cx="${n(x + 20 * s)}" cy="${n(y + 53 * s)}" rx="${n(9 * s)}" ry="${n(3 * s)}" fill="#000000" fill-opacity="0.2"/>`,
].join(''));

// ---------- tiles (64 x 64 logical) ----------
export const tileBody = (theme, mode, kind, x = 0, y = 0, s = 1) => {
  const p = THEMES[theme][mode];
  const fill = kind === 'b' ? p.tileB : p.tileA;
  const W = 64 * s;
  const parts = [`<rect x="${n(x)}" y="${n(y)}" width="${n(W)}" height="${n(W)}" fill="${fill}"/>`];
  // Soft bevel: light top-left, darker bottom-right.
  parts.push(`<path d="M${n(x + 2 * s)} ${n(y + W - 2 * s)}V${n(y + 2 * s)}H${n(x + W - 2 * s)}" fill="none" stroke="#FFFFFF" stroke-opacity="${mode === 'light' ? 0.45 : 0.08}" stroke-width="${n(2 * s)}"/>`);
  parts.push(`<path d="M${n(x + 2 * s)} ${n(y + W - 1 * s)}H${n(x + W - 1 * s)}V${n(y + 2 * s)}" fill="none" stroke="#000000" stroke-opacity="${mode === 'light' ? 0.07 : 0.18}" stroke-width="${n(2 * s)}"/>`);
  if (theme === 'sweets') {
    const dots = [[12, 14, '#FF6FA5'], [50, 20, '#4FD1B0'], [20, 50, '#FFB938'], [46, 46, '#A77BFF']];
    for (const [dx, dy, c] of dots) parts.push(`<rect x="${n(x + dx * s - 3 * s)}" y="${n(y + dy * s - 1 * s)}" width="${n(6 * s)}" height="${n(2 * s)}" rx="${n(1 * s)}" transform="rotate(${(dx * 7) % 90} ${n(x + dx * s)} ${n(y + dy * s)})" fill="${c}" fill-opacity="${mode === 'light' ? 0.35 : 0.3}"/>`);
  }
  if (theme === 'jungle') {
    parts.push(`<path d="M${n(x + 8 * s)} ${n(y + 40 * s)}l7 -5l4 6l8 -3" fill="none" stroke="${shade(fill, 0.16)}" stroke-width="${n(1.4 * s)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    if (kind === 'b') parts.push(`<path d="M${n(x)} ${n(y + W)}q${n(10 * s)} ${n(-14 * s)} ${n(22 * s)} ${n(-6 * s)}q${n(-8 * s)} ${n(8 * s)} ${n(-22 * s)} ${n(6 * s)}z" fill="${mode === 'light' ? '#5E8C3A' : '#3F6B2A'}" fill-opacity="0.45"/>`);
  }
  if (kind === 'start') parts.push(startFlag(x, y, s, theme === 'sweets' ? '#4FD1B0' : theme === 'jungle' ? '#E0703A' : '#3FA34D'));
  if (kind === 'goal') parts.push(theme === 'sunshine' ? partyPopper(x, y, s) : theme === 'sweets' ? candyGoal(x, y, s) : templeGoal(x, y, s));
  return parts.join('');
};

// ---------- frame (9-slice, 192 x 192, insets 32) ----------
const frameBody = (theme, mode) => {
  const p = THEMES[theme][mode];
  const f = p.frame;
  const o = p.frameOutline;
  const parts = [
    `<path fill-rule="evenodd" d="M24 2H168Q190 2 190 24V168Q190 190 168 190H24Q2 190 2 168V24Q2 2 24 2ZM26 24H166V166H26Z" fill="${f}" stroke="${o}" stroke-width="3"/>`,
    `<path d="M10 24Q10 10 24 10H168Q182 10 182 24" fill="none" stroke="${light(f, 0.18)}" stroke-width="3" stroke-linecap="round"/>`,
    `<path d="M182 168Q182 182 168 182H24Q10 182 10 168" fill="none" stroke="${shade(f, 0.14)}" stroke-width="3" stroke-linecap="round"/>`,
    `<rect x="24" y="24" width="144" height="144" fill="none" stroke="${o}" stroke-width="3"/>`,
  ];
  const corners = [[14, 14], [178, 14], [14, 178], [178, 178]];
  if (theme === 'sunshine') for (const [cx, cy] of corners) parts.push(`<circle cx="${cx}" cy="${cy}" r="4" fill="${light(f, 0.25)}" stroke="${o}" stroke-width="1.6"/>`);
  if (theme === 'sweets') {
    parts.push(`<rect x="14" y="14" width="164" height="164" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="2.4" stroke-dasharray="0.1 0" />`);
    for (const [cx, cy] of corners) parts.push(`<circle cx="${cx}" cy="${cy}" r="5" fill="#FFFFFF" stroke="${o}" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="2" fill="#4FD1B0"/>`);
  }
  if (theme === 'jungle') {
    parts.push(`<rect x="13" y="13" width="166" height="166" rx="12" fill="none" stroke="${mode === 'light' ? '#3FA34D' : '#4C8A3A'}" stroke-width="3"/>`);
    for (const [cx, cy] of corners) parts.push(`<path d="M${cx - 8} ${cy}q8 -12 16 0q-8 12 -16 0z" fill="${mode === 'light' ? '#3FA34D' : '#4C8A3A'}" stroke="${o}" stroke-width="1.4"/>`);
  }
  return g('frame', parts.join(''));
};

// ---------- background 360 x 780 ----------
const bgBody = (theme, mode) => {
  const p = THEMES[theme][mode];
  const [a, b] = p.background;
  const defs = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const parts = [`<rect width="360" height="780" fill="url(#bg)"/>`];
  const rnd = (() => { let s = theme.length * 97 + (mode === 'dark' ? 13 : 0); return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  if (theme === 'sunshine' && mode === 'light') {
    for (let i = 0; i < 12; i++) parts.push(`<path d="M180 -60L${n(180 + Math.cos(i * 0.52 - 0.2) * 900)} ${n(-60 + Math.sin(i * 0.52 - 0.2) * 900)}L${n(180 + Math.cos(i * 0.52 + 0.06) * 900)} ${n(-60 + Math.sin(i * 0.52 + 0.06) * 900)}Z" fill="#FFFFFF" fill-opacity="0.18"/>`);
    for (const [x, y, s] of [[60, 690, 1], [290, 740, 0.8], [300, 70, 0.7]]) parts.push(`<g fill="#FFFFFF" fill-opacity="0.7" transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="0" r="22"/><circle cx="24" cy="-8" r="26"/><circle cx="50" cy="2" r="18"/><rect x="-6" y="0" width="62" height="18" rx="9"/></g>`);
  }
  if (theme === 'sunshine' && mode === 'dark') {
    for (let i = 0; i < 70; i++) parts.push(`<circle cx="${n(rnd() * 360)}" cy="${n(rnd() * 780)}" r="${n(0.6 + rnd() * 1.4)}" fill="#FFF8E1" fill-opacity="${n(0.3 + rnd() * 0.6)}"/>`);
    parts.push(`<circle cx="300" cy="70" r="26" fill="#FFF3C4"/><circle cx="312" cy="62" r="24" fill="${a}"/>`);
  }
  if (theme === 'sweets') {
    for (let i = 0; i < 26; i++) {
      const x = rnd() * 360;
      const y = rnd() * 780;
      const c = ['#FF6FA5', '#4FD1B0', '#FFB938', '#A77BFF'][i % 4];
      parts.push(i % 3 === 0
        ? `<circle cx="${n(x)}" cy="${n(y)}" r="${n(6 + rnd() * 8)}" fill="${c}" fill-opacity="${mode === 'light' ? 0.18 : 0.14}"/>`
        : `<rect x="${n(x)}" y="${n(y)}" width="14" height="5" rx="2.5" transform="rotate(${n(rnd() * 180)} ${n(x)} ${n(y)})" fill="${c}" fill-opacity="${mode === 'light' ? 0.3 : 0.22}"/>`);
    }
  }
  if (theme === 'jungle') {
    const leaf = mode === 'light' ? '#3E7B32' : '#1F3B22';
    for (let i = 0; i < 14; i++) {
      const left = i % 2 === 0;
      const x = left ? -10 + rnd() * 40 : 330 + rnd() * 40;
      const y = rnd() * 780;
      const r = left ? 20 + rnd() * 40 : 140 + rnd() * 40;
      parts.push(`<path d="M0 0q30 -26 70 0q-40 26 -70 0z" transform="translate(${n(x)} ${n(y)}) rotate(${n(r)}) scale(${n(0.8 + rnd() * 0.8)})" fill="${leaf}" fill-opacity="0.55"/>`);
    }
  }
  return { defs, body: g('background', parts.join('')) };
};

// ---------- ladder parts ----------
const railBody = (theme, mode) => {
  const p = THEMES[theme][mode];
  const o = p.ladderOutline;
  if (theme === 'sweets') {
    const stripes = [0, 16, 32, 48, 64].map((y) => `<path d="M0 ${y + 2}L12 ${y - 6}V${y + 2}L0 ${y + 10}Z" fill="#FFFFFF"/>`).join('');
    return `<rect x="1" y="0" width="10" height="64" fill="${p.ladderRail}"/><g clip-path="url(#rail)">${stripes}</g><path d="M1 0V64M11 0V64" stroke="${o}" stroke-width="2"/><path d="M3.5 0V64" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.4"/>`;
  }
  if (theme === 'jungle') {
    const w1 = 'M6 0C11 8 11 8 6 16C1 24 1 24 6 32C11 40 11 40 6 48C1 56 1 56 6 64';
    const w2 = 'M6 0C1 8 1 8 6 16C11 24 11 24 6 32C1 40 1 40 6 48C11 56 11 56 6 64';
    return `<path d="${w1}" fill="none" stroke="${o}" stroke-width="6"/><path d="${w1}" fill="none" stroke="${p.ladderRail}" stroke-width="3.4"/><path d="${w2}" fill="none" stroke="${o}" stroke-width="6"/><path d="${w2}" fill="none" stroke="${light(p.ladderRail, 0.1)}" stroke-width="3.4"/><path d="M9 24q6 -3 5 4q-5 1 -5 -4z" fill="#3FA34D" stroke="${o}" stroke-width="1"/>`;
  }
  return `<rect x="1" y="0" width="10" height="64" fill="${p.ladderRail}"/><rect x="7" y="0" width="4" height="64" fill="${shade(p.ladderRail, 0.1)}"/><path d="M3.5 0V64" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="1.6"/><path d="M1 0V64M11 0V64" stroke="${o}" stroke-width="2"/>`;
};
const rungBody = (theme, mode) => {
  const p = THEMES[theme][mode];
  const o = p.ladderOutline;
  if (theme === 'sweets') return `<rect x="1" y="1" width="46" height="8" rx="4" fill="#FFFFFF" stroke="${o}" stroke-width="1.8"/>${[8, 18, 28, 38].map((x) => `<path d="M${x} 1.8L${x + 4} 8.2" stroke="${p.ladderRail}" stroke-width="3"/>`).join('')}<rect x="1" y="1" width="46" height="8" rx="4" fill="none" stroke="${o}" stroke-width="1.8"/>`;
  if (theme === 'jungle') return `<rect x="1" y="1" width="46" height="8" rx="3" fill="${p.ladderRung}" stroke="${o}" stroke-width="1.8"/><path d="M16 1.5V8.5M32 1.5V8.5" stroke="${o}" stroke-width="1.6"/><path d="M3 3.5H45" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1.2"/>`;
  return `<rect x="1" y="1" width="46" height="8" rx="4" fill="${p.ladderRung}" stroke="${o}" stroke-width="1.8"/><path d="M5 3.6H43" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="1.4" stroke-linecap="round"/>`;
};

// One ladder from foot a to top b (absolute px), as LadderPainter draws it:
// two rails at +/-0.18 tile, rungs every ~0.45 tile, shadow offset (0.05, 0.07) tile.
// Needs ladderDefs(id) in the same SVG.
let ladderSeq = 0;
export const drawLadder = (theme, mode, a, b, t, id) => {
  const [ax, ay] = a;
  const [bx, by] = b;
  const len = Math.hypot(bx - ax, by - ay);
  const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI - 90;
  const railW = t * 0.12;
  const off = t * GEOMETRY.ladderRailOffset;
  const rungs = [];
  const count = Math.max(2, Math.round(len / (t * GEOMETRY.ladderRungSpacing)));
  for (let k = 1; k < count; k++) rungs.push(`<g transform="translate(${n(-off)} ${n((k / count) * len - t * 0.05)}) scale(${n((2 * off) / 48)} ${n((t * 0.1) / 10)})">${rungBody(theme, mode)}</g>`);
  // Rails repeat the 12 x 64 strip along the ladder (tiled, never stretched).
  const k = railW / 12;
  const segs = Math.ceil(len / (64 * k));
  const clip = `${id}-rc${(ladderSeq += 1)}`;
  const strip = Array.from({ length: segs }, (_, i) => `<g transform="translate(0 ${n(i * 64 * k)}) scale(${n(k)})">${railBody(theme, mode)}</g>`).join('');
  const rail = (dx) => `<g transform="translate(${n(dx - railW / 2)} 0)" clip-path="url(#${clip})">${strip}</g>`;
  const ladder = `<clipPath id="${clip}"><rect width="${n(railW)}" height="${n(len)}"/></clipPath>${rungs.join('')}${rail(-off)}${rail(off)}`;
  return `<g transform="translate(${n(ax)} ${n(ay)}) rotate(${n(ang)})"><g transform="translate(${n(t * 0.05)} ${n(t * 0.07)})" filter="url(#${id}-ladder-shadow)">${ladder}</g>${ladder}</g>`;
};
export const ladderDefs = (id) => `<clipPath id="rail"><rect width="12" height="64"/></clipPath><filter id="${id}-ladder-shadow" x="-20%" y="-5%" width="140%" height="110%"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"/></filter>`;

// ---------- full board renderer ----------
const centre = (sq) => {
  const row = Math.floor((sq - 1) / 10);
  const cir = (sq - 1) % 10;
  const col = row % 2 === 0 ? cir : 9 - cir;
  return [(col + 0.5) / 10, 1 - (row + 0.5) / 10];
};

// Draws the whole board at (x, y) with side `size`. o.numbers, o.snakeCount, o.id.
export const renderBoard = (theme, mode, x, y, size, o = {}) => {
  const p = THEMES[theme][mode];
  const board = loadBoard(theme);
  const t = size / 10;
  const s = t / 64;
  const id = o.id ?? `${theme}${mode}`;
  const defs = [];
  const parts = [];
  const fw = t * 0.38;
  parts.push(`<rect x="${n(x - fw)}" y="${n(y - fw)}" width="${n(size + 2 * fw)}" height="${n(size + 2 * fw)}" rx="${n(fw * 1.1)}" fill="${p.frame}" stroke="${p.frameOutline}" stroke-width="${n(Math.max(1.5, t * 0.05))}"/>`);
  parts.push(`<rect x="${n(x - fw * 0.55)}" y="${n(y - fw * 0.55)}" width="${n(size + fw * 1.1)}" height="${n(size + fw * 1.1)}" rx="${n(fw * 0.6)}" fill="none" stroke="${light(p.frame, 0.18)}" stroke-width="${n(Math.max(1, t * 0.04))}"/>`);
  for (let sq = 1; sq <= 100; sq++) {
    const [cx, cy] = centre(sq);
    const row = Math.floor((sq - 1) / 10);
    const col = Math.round(cx * 10 - 0.5);
    const kind = sq === 1 ? 'start' : sq === 100 ? 'goal' : (row + col) % 2 === 0 ? 'a' : 'b';
    parts.push(tileBody(theme, mode, kind === 'start' || kind === 'goal' ? ((row + col) % 2 === 0 ? 'a' : 'b') : kind, x + col * t, y + (9 - row) * t, s));
    if (kind === 'start' || kind === 'goal') parts.push(tileBody(theme, mode, kind, x + col * t, y + (9 - row) * t, s).replace(/^<rect[^>]*>/, ''));
  }
  parts.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(size)}" height="${n(size)}" fill="none" stroke="${p.frameOutline}" stroke-width="${n(Math.max(1.5, t * 0.05))}"/>`);
  if (o.numbers !== false) {
    const fs2 = t * GEOMETRY.numberFontSize;
    let d = '';
    for (let sq = 1; sq <= 100; sq++) {
      const [cx, cy] = centre(sq);
      const ox = sq === 1 || sq === 100 ? -0.3 * t : 0;
      const oy = sq === 1 || sq === 100 ? -0.28 * t : 0;
      d += textPath(String(sq), x + cx * size + ox, y + cy * size + fs2 * 0.36 + oy, fs2, { anchor: 'middle', font: 'semibold' });
    }
    parts.push(`<path d="${d}" fill="${p.numberHalo}" stroke="${p.numberHalo}" stroke-width="${n(t * 0.07)}" stroke-linejoin="round" opacity="0.85"/><path d="${d}" fill="${p.number}"/>`);
  }
  const n8 = o.snakeCount ?? 7;
  const jumps = board.jumps.filter((j) => j.type === 'ladder' || j.rank <= n8);
  for (const l of jumps.filter((j) => j.type === 'ladder')) {
    const a = centre(l.from).map((v, i) => (i ? y : x) + v * size);
    const b = centre(l.to).map((v, i) => (i ? y : x) + v * size);
    parts.push(drawLadder(theme, mode, a, b, t, id));
  }
  defs.push(ladderDefs(id));
  for (const sn of jumps.filter((j) => j.type === 'snake').sort((a2, b2) => b2.rank - a2.rank)) {
    const design = 'abcd'[(sn.rank - 1) % 4];
    const pts = [centre(sn.from), ...sn.path, centre(sn.to)].map(([px, py]) => [x + px * size, y + py * size]);
    const rb = ribbon(pts, t, p.snakes[design], design, { id: `${id}-s${sn.rank}`, glow: p.glow });
    defs.push(rb.defs, rb.glowDefs);
    parts.push(rb.body);
  }
  return { defs: defs.join(''), body: parts.join('') };
};

// ---------- registration ----------
export const buildBoardArt = () => {
  const themesOut = {};
  for (const theme of THEME_IDS) {
    for (const mode of MODES) {
      for (const kind of ['a', 'b', 'start', 'goal']) {
        const base = kind === 'start' ? tileBody(theme, mode, 'a') : kind === 'goal' ? tileBody(theme, mode, 'b') : '';
        const body = base + (kind === 'start' || kind === 'goal' ? tileBody(theme, mode, kind).replace(/^<rect[^>]*>/, '') : tileBody(theme, mode, kind));
        asset(`sprites/${theme}/tile_${kind}_${mode}`, doc(64, 64, g('tile', body), { title: `${theme} tile ${kind} ${mode}` }),
          { size: [64, 64], anchor: [0.5, 0.5], modes: [mode], screens: ['game', 'player_setup'], group: 'board', theme });
      }
      asset(`sprites/${theme}/board_frame_${mode}`, doc(192, 192, frameBody(theme, mode), { title: `${theme} frame ${mode}` }),
        { size: [192, 192], nineSlice: [32, 32, 32, 32], modes: [mode], screens: ['game'], group: 'board', theme });
      const bg = bgBody(theme, mode);
      asset(`sprites/${theme}/board_bg_${mode}`, doc(360, 780, bg.body, { defs: bg.defs, title: `${theme} background ${mode}` }),
        { size: [360, 780], anchor: [0.5, 0.5], modes: [mode], screens: ['game'], group: 'board', theme, note: 'cover-fit, safe to crop' });
      asset(`sprites/${theme}/ladder_rail_${mode}`, doc(12, 64, g('rail', railBody(theme, mode)), { defs: '<clipPath id="rail"><rect width="12" height="64"/></clipPath>', title: `${theme} ladder rail ${mode}` }),
        { size: [12, 64], tile: 'vertical', modes: [mode], screens: ['game'], group: 'ladder', theme });
      asset(`sprites/${theme}/ladder_rung_${mode}`, doc(48, 10, g('rung', rungBody(theme, mode)), { title: `${theme} ladder rung ${mode}` }),
        { size: [48, 10], anchor: [0.5, 0.5], modes: [mode], screens: ['game'], group: 'ladder', theme });
      // Board Select thumbnail.
      const b = renderBoard(theme, mode, 24, 24, 192, { numbers: false, id: `card${theme}${mode}` });
      asset(`images/board/board_card_${theme}_${mode}`, doc(240, 240, g('thumbnail', `<rect width="240" height="240" rx="28" fill="${THEMES[theme][mode].background[0]}"/>${b.body}`), { defs: b.defs, title: `${theme} card ${mode}` }),
        { size: [240, 240], modes: [mode], screens: ['board_select', 'home_tablet'], group: 'board_card', theme });
    }
    // Board palette for BoardPalette.fromJson.
    themesOut[theme] = {
      id: theme, name: THEMES[theme].name, geometry: GEOMETRY,
      light: THEMES[theme].light, dark: THEMES[theme].dark,
      shadow: { offset: [0.05, 0.07], opacity: 0.18, blur: 0.04 },
    };
  }
  for (const mode of MODES) {
    const veil = mode === 'light' ? '#FFFFFF' : '#14161F';
    const lock = `<g transform="translate(120 112)"><circle r="42" fill="${mode === 'light' ? '#FFF6E3' : '#272B3D'}" stroke="${mode === 'light' ? '#2A2A35' : '#F2F3F7'}" stroke-width="4"/><rect x="-18" y="-6" width="36" height="28" rx="6" fill="${mode === 'light' ? '#2A2A35' : '#F2F3F7'}"/><path d="M-11 -6V-15A11 11 0 0 1 11 -15V-6" fill="none" stroke="${mode === 'light' ? '#2A2A35' : '#F2F3F7'}" stroke-width="5"/><circle cy="7" r="4" fill="${mode === 'light' ? '#FFC93C' : '#E6B84A'}"/></g>`;
    asset(`images/board/board_card_locked_${mode}`, doc(240, 240, g('locked', `<rect width="240" height="240" rx="28" fill="${veil}" fill-opacity="0.62"/>${lock}`), { title: `locked overlay ${mode}` }),
      { size: [240, 240], modes: [mode], screens: ['board_select'], group: 'board_card' });
  }
  fs.mkdirSync(path.join(ROOT, 'assets/themes'), { recursive: true });
  for (const [id, data] of Object.entries(themesOut)) fs.writeFileSync(path.join(ROOT, `assets/themes/${id}.json`), `${JSON.stringify(data, null, 2)}\n`);
  return themesOut;
};

export { shadowDefs, mix };
