// Tokens, avatars and dice.
import { TOKENS } from '../lib/palette.mjs';
import { asset, doc, dropShadow, g, light, MODES, n, outline, shade, shadowDefs } from '../lib/svg.mjs';

// ---------- token symbols ----------
export const symbolPath = (kind, cx, cy, r) => {
  if (kind === 'dot') return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 0.62)}"/>`;
  if (kind === 'square') return `<rect x="${n(cx - r * 0.56)}" y="${n(cy - r * 0.56)}" width="${n(r * 1.12)}" height="${n(r * 1.12)}" rx="${n(r * 0.14)}"/>`;
  if (kind === 'tri') return `<path d="M${n(cx)} ${n(cy - r * 0.74)}L${n(cx + r * 0.72)} ${n(cy + r * 0.52)}L${n(cx - r * 0.72)} ${n(cy + r * 0.52)}Z" stroke-linejoin="round"/>`;
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.38 : r * 0.86;
    d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * rr)} ${n(cy + Math.sin(a) * rr)}`;
  }
  return `<path d="${d}Z" stroke-linejoin="round"/>`;
};

// ---------- tokens (48 x 48, anchor bottom centre) ----------
// A rounded pawn: base disc, bell body, round head, symbol embossed on the body.
export const tokenParts = (color, state, mode, id = 't') => {
  const c = TOKENS[color];
  const o = c.outline;
  const sx = state === 'hop' ? 1.12 : 1;
  const sy = state === 'hop' ? 0.84 : 1;
  const defs = shadowDefs(`${id}-glow`, 2.4);
  const pawn = [
    `<ellipse cx="24" cy="40" rx="15" ry="5.5" fill="${c.dark}" stroke="${o}" stroke-width="2"/>`,
    `<path d="M11 39C11 30 16 26 18 22H30C32 26 37 30 37 39Z" fill="${c.base}" stroke="${o}" stroke-width="2" stroke-linejoin="round"/>`,
    `<path d="M24 22H30C32 26 37 30 37 39H27C28 32 26 26 24 22Z" fill="${c.dark}" fill-opacity="0.55"/>`,
    `<circle cx="24" cy="15" r="10" fill="${c.base}" stroke="${o}" stroke-width="2"/>`,
    `<path d="M24 5A10 10 0 0 1 33.5 18A10 10 0 0 0 24 12Z" fill="${c.dark}" fill-opacity="0.45"/>`,
    `<ellipse cx="20.5" cy="11" rx="3.6" ry="2.4" fill="#FFFFFF" fill-opacity="0.65" transform="rotate(-30 20.5 11)"/>`,
    `<g fill="${light(c.base, 0.32)}" stroke="${o}" stroke-width="1.4">${symbolPath(c.symbol, 24, 32, 5.6)}</g>`,
  ];
  if (mode === 'dark') pawn.push(`<path d="M11 39C11 30 16 26 18 22M14.5 15A10 10 0 0 1 24 5" fill="none" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="24" cy="40" rx="16.6" ry="7" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.2"/>`);
  const ring = state === 'active'
    ? g('active-ring', `<ellipse cx="24" cy="40" rx="21" ry="7.5" fill="none" stroke="#FFC93C" stroke-width="3" filter="url(#${id}-glow)"/><ellipse cx="24" cy="40" rx="20" ry="7" fill="none" stroke="#FFF3C4" stroke-width="1.6"/>`)
    : '';
  const body = ring + g('pawn', pawn.join(''), `transform="translate(24 45) scale(${sx} ${sy}) translate(-24 -45)"`);
  return { defs, body };
};

// ---------- avatars (128 x 128) ----------
const AVATARS = [
  { id: '01', animal: 'fox', bg: '#FFE0C7', fur: '#F28C38', face: '#FFF3E6' },
  { id: '02', animal: 'panda', bg: '#DDEFE0', fur: '#FFFFFF', face: '#FFFFFF' },
  { id: '03', animal: 'frog', bg: '#E2F4D2', fur: '#6CC04A', face: '#B8E89A' },
  { id: '04', animal: 'cat', bg: '#E6E0FF', fur: '#9E9EB0', face: '#F2F2F7' },
  { id: '05', animal: 'owl', bg: '#FFF0C9', fur: '#A1764F', face: '#F4E1C8' },
  { id: '06', animal: 'bunny', bg: '#FFE3EC', fur: '#F7F1EC', face: '#FFFFFF' },
  { id: '07', animal: 'bear', bg: '#E9DCCB', fur: '#9C6B45', face: '#D9B48F' },
  { id: '08', animal: 'penguin', bg: '#D7ECFF', fur: '#2F3446', face: '#FFFFFF' },
  { id: '09', animal: 'lion', bg: '#FFF1BF', fur: '#F0B23E', face: '#FFD98A' },
  { id: '10', animal: 'koala', bg: '#E1E8F0', fur: '#A9B3BE', face: '#D9E0E7' },
  { id: '11', animal: 'duck', bg: '#FFF7C2', fur: '#FFD84A', face: '#FFE680' },
  { id: '12', animal: 'pig', bg: '#FFE4E1', fur: '#FFB3BA', face: '#FFC9CE' },
];

const eyes = (y, gap = 16, r = 5.5, ink = '#2A2A35') => [64 - gap, 64 + gap].map((x) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${ink}"/><circle cx="${x + 1.8}" cy="${y - 2}" r="${n(r * 0.36)}" fill="#FFFFFF"/>`).join('');
const cheeks = (y, gap = 26) => [64 - gap, 64 + gap].map((x) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.6" fill="#FF8A80" fill-opacity="0.55"/>`).join('');
const smile = (y, w = 8) => `<path d="M${64 - w} ${y}q${w / 2} 5 ${w} 0q${w / 2} 5 ${w} 0" fill="none" stroke="#2A2A35" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;

const animalFace = (a) => {
  const fo = outline(a.fur === '#FFFFFF' || a.fur === '#F7F1EC' ? '#9AA0AE' : a.fur, 0.22);
  const head = (rx = 38, ry = 34, cy = 70) => `<ellipse cx="64" cy="${cy}" rx="${rx}" ry="${ry}" fill="${a.fur}" stroke="${fo}" stroke-width="3"/><ellipse cx="${64 - rx * 0.35}" cy="${cy - ry * 0.55}" rx="${rx * 0.3}" ry="${ry * 0.16}" fill="#FFFFFF" fill-opacity="0.4"/>`;
  const roundEars = (r = 12, y = 40, gap = 30, inner = a.face) => [64 - gap, 64 + gap].map((x) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${a.fur}" stroke="${fo}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="${inner}"/>`).join('');
  const pointEars = (inner) => `<path d="M30 52L36 18L56 40Z M98 52L92 18L72 40Z" fill="${a.fur}" stroke="${fo}" stroke-width="3" stroke-linejoin="round"/><path d="M36 44L39 27L49 39Z M92 44L89 27L79 39Z" fill="${inner}"/>`;
  switch (a.animal) {
    case 'fox': return pointEars('#FFF3E6') + head() + `<path d="M28 74Q46 70 64 92Q82 70 100 74Q96 102 64 104Q32 102 28 74Z" fill="${a.face}"/>` + eyes(66, 15) + `<ellipse cx="64" cy="84" rx="5" ry="3.6" fill="#2A2A35"/>` + smile(91, 5) + cheeks(80, 27);
    case 'panda': return roundEars(13, 40, 30, '#2F3446').replace(/fill="#FFFFFF" stroke/g, 'fill="#2F3446" stroke') + head() + `<ellipse cx="48" cy="68" rx="9" ry="11" fill="#2F3446" transform="rotate(-20 48 68)"/><ellipse cx="80" cy="68" rx="9" ry="11" fill="#2F3446" transform="rotate(20 80 68)"/>` + [48, 80].map((x) => `<circle cx="${x}" cy="67" r="3.6" fill="#FFFFFF"/><circle cx="${x + 0.8}" cy="67.4" r="2" fill="#2A2A35"/>`).join('') + `<ellipse cx="64" cy="84" rx="5" ry="3.4" fill="#2A2A35"/>` + smile(90, 5) + cheeks(84, 28);
    case 'frog': return head(42, 30, 76) + [44, 84].map((x) => `<circle cx="${x}" cy="46" r="14" fill="${a.fur}" stroke="${outline(a.fur)}" stroke-width="3"/><circle cx="${x}" cy="46" r="8" fill="#FFFFFF"/><circle cx="${x + 1}" cy="47" r="4.6" fill="#2A2A35"/>`).join('') + `<path d="M40 86q24 16 48 0" fill="none" stroke="#2A2A35" stroke-width="3" stroke-linecap="round"/>` + cheeks(82, 30);
    case 'cat': return pointEars('#FFC2D1') + head() + eyes(68, 15) + `<path d="M60 80h8l-4 4z" fill="#FF8A9A" stroke="#2A2A35" stroke-width="1.5" stroke-linejoin="round"/>` + smile(88, 5) + `<path d="M24 78h18M24 86l18 -3M104 78h-18M104 86l-18 -3" stroke="#2A2A35" stroke-width="1.8" stroke-linecap="round"/>` + cheeks(82, 25);
    case 'owl': return `<path d="M34 44L40 22L56 38Z M94 44L88 22L72 38Z" fill="${a.fur}" stroke="${outline(a.fur)}" stroke-width="3" stroke-linejoin="round"/>` + head(40, 36) + [48, 80].map((x) => `<circle cx="${x}" cy="66" r="14" fill="${a.face}" stroke="${outline(a.fur)}" stroke-width="2.4"/><circle cx="${x}" cy="66" r="6" fill="#2A2A35"/><circle cx="${x + 2}" cy="64" r="2" fill="#FFFFFF"/>`).join('') + `<path d="M58 80L70 80L64 92Z" fill="#FFB938" stroke="#8A5A00" stroke-width="2" stroke-linejoin="round"/>`;
    case 'bunny': return [48, 80].map((x, i) => `<ellipse cx="${x}" cy="28" rx="10" ry="24" transform="rotate(${i ? 10 : -10} ${x} 46)" fill="${a.fur}" stroke="#9AA0AE" stroke-width="3"/><ellipse cx="${x}" cy="30" rx="4.6" ry="16" transform="rotate(${i ? 10 : -10} ${x} 46)" fill="#FFC2D1"/>`).join('') + head(38, 32, 74) + eyes(70, 14) + `<ellipse cx="64" cy="82" rx="4" ry="3" fill="#FF8A9A"/>` + smile(88, 4) + cheeks(84, 25);
    case 'bear': return roundEars(13, 42, 30, '#D9B48F') + head() + `<ellipse cx="64" cy="84" rx="18" ry="13" fill="${a.face}"/>` + eyes(66, 16) + `<ellipse cx="64" cy="79" rx="6" ry="4.2" fill="#2A2A35"/>` + smile(87, 5) + cheeks(80, 28);
    case 'penguin': return head(38, 36) + `<path d="M34 76C34 56 46 52 64 62C82 52 94 56 94 76C94 96 80 104 64 104C48 104 34 96 34 76Z" fill="${a.face}"/>` + eyes(72, 13) + `<path d="M56 82h16l-8 8z" fill="#FFB938" stroke="#8A5A00" stroke-width="2" stroke-linejoin="round"/>` + cheeks(86, 22);
    case 'lion': return `<circle cx="64" cy="68" r="48" fill="#C9772A" stroke="${outline('#C9772A')}" stroke-width="3"/>` + [...Array(12)].map((_, i) => { const t2 = (i / 12) * Math.PI * 2; return `<circle cx="${n(64 + Math.cos(t2) * 44)}" cy="${n(68 + Math.sin(t2) * 44)}" r="9" fill="#C9772A"/>`; }).join('') + roundEars(9, 36, 26, '#FFD98A') + head(34, 32) + eyes(64, 13) + `<path d="M58 78h12l-6 6z" fill="#8A4B1A"/>` + smile(88, 5) + cheeks(80, 24);
    case 'koala': return [28, 100].map((x) => `<circle cx="${x}" cy="48" r="18" fill="${a.fur}" stroke="${outline(a.fur)}" stroke-width="3"/><circle cx="${x}" cy="48" r="10" fill="#F2D7DC"/>`).join('') + head() + eyes(66, 17) + `<ellipse cx="64" cy="80" rx="9" ry="12" fill="#4A4F5C"/><ellipse cx="61" cy="75" rx="2.4" ry="3.4" fill="#FFFFFF" fill-opacity="0.5"/>` + smile(96, 4) + cheeks(86, 28);
    case 'duck': return head(38, 34) + `<path d="M64 38q-6 -14 4 -16q-2 8 4 12" fill="${a.fur}" stroke="${outline(a.fur)}" stroke-width="2.4" stroke-linejoin="round"/>` + eyes(64, 15) + `<ellipse cx="64" cy="84" rx="18" ry="9" fill="#FF9F43" stroke="#8A4A00" stroke-width="2.4"/><path d="M48 84h32" stroke="#8A4A00" stroke-width="2"/>` + cheeks(78, 27);
    default: return [40, 88].map((x, i) => `<path d="M${x - 10} 48L${x + (i ? 6 : -6)} 26L${x + 12} 44Z" fill="${a.fur}" stroke="${outline(a.fur)}" stroke-width="3" stroke-linejoin="round"/>`).join('') + head() + eyes(64, 16) + `<ellipse cx="64" cy="82" rx="14" ry="10" fill="${a.face}" stroke="${outline(a.fur)}" stroke-width="2.4"/><ellipse cx="59" cy="82" rx="2.6" ry="3.6" fill="#C2667A"/><ellipse cx="69" cy="82" rx="2.6" ry="3.6" fill="#C2667A"/>` + smile(95, 4) + cheeks(80, 28);
  }
};

const avatarParts = (a, mode) => {
  const rim = mode === 'light' ? '#FFFFFF' : '#F2F3F7';
  const rimOut = mode === 'light' ? '#C9C2B2' : '#5A6078';
  return {
    defs: '<clipPath id="disc"><circle cx="64" cy="64" r="58"/></clipPath>',
    body: [
      g('disc', `<circle cx="64" cy="64" r="58" fill="${a.bg}"/>`),
      g('face', `<g clip-path="url(#disc)">${animalFace(a)}</g>`),
      g('rim', `<circle cx="64" cy="64" r="59" fill="none" stroke="${rim}" stroke-width="6"/><circle cx="64" cy="64" r="62" fill="none" stroke="${rimOut}" stroke-width="2"/>`),
    ].join('\n'),
  };
};

// ---------- dice (128 x 128) ----------
const PIPS = {
  1: [[0.5, 0.5]], 2: [[0.3, 0.3], [0.7, 0.7]], 3: [[0.3, 0.3], [0.5, 0.5], [0.7, 0.7]],
  4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]], 5: [[0.3, 0.3], [0.7, 0.3], [0.5, 0.5], [0.3, 0.7], [0.7, 0.7]],
  6: [[0.3, 0.27], [0.7, 0.27], [0.3, 0.5], [0.7, 0.5], [0.3, 0.73], [0.7, 0.73]],
};
const DIE = { face: '#FFFFFF', side: '#E4DED2', ink: '#2A2A35', line: '#4A4458' };

export const dieFace = (value, mode, x = 14, y = 10, s = 100) => {
  const pip = (px, py) => `<circle cx="${n(x + px * s)}" cy="${n(y + py * s)}" r="${n(s * 0.085)}" fill="${value === 1 ? '#E8453C' : DIE.ink}"/><circle cx="${n(x + px * s - s * 0.025)}" cy="${n(y + py * s - s * 0.03)}" r="${n(s * 0.025)}" fill="#FFFFFF" fill-opacity="0.6"/>`;
  return [
    `<rect x="${n(x)}" y="${n(y + s * 0.08)}" width="${s}" height="${s}" rx="${n(s * 0.22)}" fill="${DIE.side}" stroke="${DIE.line}" stroke-width="${n(s * 0.04)}"/>`,
    `<rect x="${n(x)}" y="${n(y)}" width="${s}" height="${s}" rx="${n(s * 0.22)}" fill="${DIE.face}" stroke="${DIE.line}" stroke-width="${n(s * 0.04)}"/>`,
    `<path d="M${n(x + s * 0.12)} ${n(y + s * 0.3)}Q${n(x + s * 0.12)} ${n(y + s * 0.12)} ${n(x + s * 0.3)} ${n(y + s * 0.12)}" fill="none" stroke="#FFFFFF" stroke-width="${n(s * 0.06)}" stroke-linecap="round"/>`,
    `<rect x="${n(x + s * 0.06)}" y="${n(y + s * 0.62)}" width="${n(s * 0.88)}" height="${n(s * 0.32)}" rx="${n(s * 0.16)}" fill="${DIE.side}" fill-opacity="0.35"/>`,
    ...(PIPS[value] ?? []).map(([px, py]) => pip(px, py)),
    mode === 'dark' ? `<rect x="${n(x - s * 0.04)}" y="${n(y - s * 0.04)}" width="${n(s * 1.08)}" height="${n(s * 1.16)}" rx="${n(s * 0.25)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.75" stroke-width="${n(s * 0.025)}"/>` : '',
  ].join('');
};

// Tumble frames: rotation, squash/stretch, and a glimpse of a second face.
const ROLL = [
  { rot: 0, sx: 1.12, sy: 0.88, face: 3 }, { rot: 18, sx: 0.94, sy: 1.08, face: 5 }, { rot: 40, sx: 1, sy: 1, face: 2 },
  { rot: 62, sx: 0.92, sy: 1.1, face: 6 }, { rot: 90, sx: 1.08, sy: 0.92, face: 1 }, { rot: 118, sx: 0.96, sy: 1.04, face: 4 },
  { rot: 145, sx: 1.1, sy: 0.9, face: 5 }, { rot: 172, sx: 1.02, sy: 0.98, face: 3 },
];

export const buildPieces = () => {
  for (const color of Object.keys(TOKENS)) {
    for (const state of ['idle', 'active', 'hop']) {
      for (const mode of MODES) {
        const t = tokenParts(color, state, mode);
        asset(`images/tokens/token_${color}_${state}_${mode}`, doc(48, 48, t.body, { defs: t.defs, title: `${color} token ${state} ${mode}` }),
          { size: [48, 48], anchor: [0.5, 0.92], modes: [mode], screens: ['game', 'player_setup', 'win', 'how_to_play'], group: 'token' });
      }
    }
  }
  asset('images/tokens/token_shadow', doc(48, 16, dropShadow(24, 8, 16, 4.5), { defs: shadowDefs('soft', 1.6), title: 'token shadow' }),
    { size: [48, 16], anchor: [0.5, 0.5], modes: ['light', 'dark'], screens: ['game'], group: 'token', note: 'shared: a shadow reads on both modes' });
  for (const a of AVATARS) {
    for (const mode of MODES) {
      const p = avatarParts(a, mode);
      asset(`images/tokens/avatar_${a.id}_${mode}`, doc(128, 128, p.body, { defs: p.defs, title: `${a.animal} avatar ${mode}` }),
        { size: [128, 128], anchor: [0.5, 0.5], modes: [mode], screens: ['game', 'player_setup', 'win'], group: 'avatar', animal: a.animal });
    }
  }
  for (const mode of MODES) {
    for (let v = 1; v <= 6; v++) {
      asset(`images/dice/dice_face_${v}_${mode}`, doc(128, 128, g('die', dieFace(v, mode)), { title: `dice face ${v} ${mode}` }),
        { size: [128, 128], anchor: [0.5, 0.5], modes: [mode], screens: ['game', 'how_to_play'], group: 'dice' });
    }
    ROLL.forEach((f, i) => {
      const blur = i % 2 === 0 ? `<path d="M6 40q-6 24 4 48M118 88q6 -24 -4 -48" fill="none" stroke="${mode === 'light' ? '#2A2A35' : '#F2F3F7'}" stroke-opacity="0.35" stroke-width="4" stroke-linecap="round"/>` : '';
      const body = `${blur}<g transform="translate(64 64) rotate(${f.rot}) scale(${f.sx} ${f.sy}) translate(-64 -64)">${dieFace(f.face, mode)}</g>`;
      asset(`images/dice/dice_roll_${String(i + 1).padStart(2, '0')}_${mode}`, doc(128, 128, g('die', body), { title: `dice tumble frame ${i + 1} ${mode}` }),
        { size: [128, 128], anchor: [0.5, 0.5], modes: [mode], screens: ['game'], group: 'dice', frameMs: 88 });
    });
    for (const pressed of [false, true]) {
      const base = mode === 'light' ? '#FFC93C' : '#E6B84A';
      const o = outline(base, 0.25);
      const lip = pressed ? 4 : 10;
      const body = `<rect x="8" y="${8 + lip}" width="144" height="144" rx="36" fill="${shade(base, 0.16)}" stroke="${o}" stroke-width="4"/><rect x="8" y="${pressed ? 14 : 8}" width="144" height="144" rx="36" fill="${base}" stroke="${o}" stroke-width="4"/><ellipse cx="50" cy="${pressed ? 34 : 28}" rx="26" ry="9" fill="#FFFFFF" fill-opacity="0.45"/>`;
      asset(`images/dice/dice_button_bg_${pressed ? 'pressed' : 'normal'}_${mode}`, doc(160, 166, g('button', body), { title: `dice button ${pressed ? 'pressed' : 'normal'} ${mode}` }),
        { size: [160, 166], anchor: [0.5, 0.5], modes: [mode], screens: ['game'], group: 'dice' });
    }
  }
  asset('images/dice/dice_shadow', doc(128, 32, dropShadow(64, 16, 46, 9), { defs: shadowDefs('soft', 3), title: 'dice shadow' }),
    { size: [128, 32], anchor: [0.5, 0.5], modes: ['light', 'dark'], screens: ['game'], group: 'dice', note: 'shared: a shadow reads on both modes' });
};

export { AVATARS };
