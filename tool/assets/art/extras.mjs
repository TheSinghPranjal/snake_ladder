// Effects, How-to-Play illustrations and brand art.
import { APP, THEMES, TOKENS, UI } from '../lib/palette.mjs';
import { headParts, ribbon } from '../lib/snake.mjs';
import { asset, doc, g, light, MODES, n, outline, shade, shadowDefs, textPath, textWidth } from '../lib/svg.mjs';
import { tileBody } from './board.mjs';
import { dieFace, tokenParts } from './pieces.mjs';

// ---------- effects ----------
const CONFETTI_COLORS = { red: TOKENS.red.base, blue: TOKENS.blue.base, green: TOKENS.green.base, yellow: TOKENS.yellow.base };
const confettiShape = (shape, c, rim) => {
  const o = outline(c, 0.28);
  const st = `stroke="${rim ?? o}" stroke-width="1"`;
  switch (shape) {
    case 'rect': return `<rect x="2" y="4" width="8" height="4" rx="1" fill="${c}" ${st}/>`;
    case 'circle': return `<circle cx="6" cy="6" r="3.6" fill="${c}" ${st}/>`;
    case 'triangle': return `<path d="M6 1.5L10.5 10H1.5Z" fill="${c}" ${st} stroke-linejoin="round"/>`;
    case 'star': return `<path d="M6 1l1.5 3.3 3.5.4-2.6 2.4.7 3.5L6 8.8 2.9 10.6l.7-3.5L1 4.7l3.5-.4z" fill="${c}" ${st} stroke-linejoin="round"/>`;
    case 'squiggle': return `<path d="M1.5 7q1.5-4 3 0t3 0 3 0" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`;
    default: return `<path d="M2 9C2 3 10 3 10 7" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
};

const sparkle = (rim) => {
  const rays = [...Array(8)].map((_, i) => {
    const a = (i * Math.PI) / 4;
    const [r1, r2] = i % 2 ? [10, 18] : [9, 23];
    return `<path d="M${n(24 + Math.cos(a) * r1)} ${n(24 + Math.sin(a) * r1)}L${n(24 + Math.cos(a) * r2)} ${n(24 + Math.sin(a) * r2)}" stroke="${UI.sun}" stroke-width="3" stroke-linecap="round"/>`;
  }).join('');
  return rays + `<path d="M24 14l2.6 7.4 7.4 2.6-7.4 2.6-2.6 7.4-2.6-7.4-7.4-2.6 7.4-2.6z" fill="#FFFFFF" stroke="${rim ?? UI.sun}" stroke-width="1.6" stroke-linejoin="round"/>`;
};
const dust = (mode) => {
  const c = mode === 'light' ? '#EFE6D2' : '#8C93AB';
  const o = mode === 'light' ? '#C9BC9E' : '#B9BED0';
  return [[14, 32, 9], [25, 28, 11], [36, 33, 8], [22, 36, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${o}" stroke-width="1.6" fill-opacity="0.9"/>`).join('');
};
const star = (rim) => `<path d="M16 2.5l3.9 8.1 8.9 1.2-6.5 6.2 1.6 8.8L16 22.6l-7.9 4.2 1.6-8.8L3.2 11.8l8.9-1.2z" fill="${UI.sun}" stroke="${rim ?? outline(UI.sun, 0.3)}" stroke-width="2" stroke-linejoin="round"/><path d="M12.5 11.5l2-3" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>`;

// ---------- How to Play (300 x 220) ----------
const scene = (mode, inner, defs = '') => {
  const bg = mode === 'light' ? '#FFF6E3' : '#1E2130';
  const line = mode === 'light' ? '#E8DCC0' : '#3A3F57';
  return { defs: `${shadowDefs('soft', 2)}${defs}`, body: `<rect width="300" height="220" rx="24" fill="${bg}"/><rect x="1" y="1" width="298" height="218" rx="23" fill="none" stroke="${line}" stroke-width="2"/>${inner}` };
};
const tileRow = (mode, x, y, count, cols, size = 52) => {
  let s = '';
  for (let i = 0; i < count; i++) s += tileBody('sunshine', mode, (Math.floor(i / cols) + (i % cols)) % 2 ? 'b' : 'a', x + (i % cols) * size, y + Math.floor(i / cols) * size, size / 64);
  return s;
};
const token = (color, mode, x, y, s = 1, state = 'idle', id = 'tk') => {
  const t = tokenParts(color, state, mode, id);
  return { defs: t.defs, body: `<g transform="translate(${n(x - 24 * s)} ${n(y - 44 * s)}) scale(${s})">${t.body}</g>` };
};
const arrow = (d, mode) => `<path d="${d}" fill="none" stroke="${mode === 'light' ? UI.ink : '#F2F3F7'}" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 7"/>`;

const howTo = (i, mode) => {
  const p = THEMES.sunshine[mode];
  if (i === 1) {
    const t = token('red', mode, 182, 132, 1.1, 'hop', 'h1');
    return scene(mode, `${tileRow(mode, 46, 120, 4, 4)}<g transform="translate(40 18) scale(0.62)">${dieFace(4, mode)}</g>${arrow('M70 128q30-40 56 0M126 128q30-40 56 0', mode)}${t.body}`, t.defs);
  }
  if (i === 2) {
    const t = token('blue', mode, 190, 72, 1.1, 'idle', 'h2');
    const rail = `<rect x="0" y="0" width="10" height="150" rx="3" fill="${p.ladderRail}" stroke="${p.ladderOutline}" stroke-width="2"/>`;
    const rungs = [20, 50, 80, 110].map((y) => `<rect x="-8" y="${y}" width="66" height="9" rx="4.5" fill="${p.ladderRung}" stroke="${p.ladderOutline}" stroke-width="2"/>`).join('');
    return scene(mode, `${tileRow(mode, 46, 30, 12, 4)}<g transform="translate(146 186) rotate(-160)">${rungs}<g>${rail}</g><g transform="translate(50 0)">${rail}</g></g>${arrow('M120 170q-10-60 50-100', mode)}${t.body}`, t.defs);
  }
  if (i === 3) {
    const r = ribbon([[200, 52], [120, 80], [210, 130], [100, 176]], 60, p.snakes.a, 'a', { id: 'h3', glow: p.glow, frame: 'gulp1' });
    const t = token('green', mode, 150, 108, 1.05, 'idle', 'h3t');
    return scene(mode, `${tileRow(mode, 46, 30, 12, 4)}${r.body}${t.body}`, r.defs + r.glowDefs + t.defs);
  }
  if (i === 4) {
    const faces = [6, 6, 6].map((v, k) => `<g transform="translate(${30 + k * 84} 40) scale(0.62)">${dieFace(v, mode)}</g>`).join('');
    const plus = (x) => `<path d="M${x} 82h14M${x + 7} 75v14" stroke="${UI.leaf}" stroke-width="4" stroke-linecap="round"/>`;
    const ink = mode === 'light' ? UI.ink : '#F2F3F7';
    return scene(mode, `${faces}${plus(110)}${plus(194)}<path d="${textPath('roll again', 150, 160, 24, { anchor: 'middle' })}" fill="${ink}"/><path d="M262 32l14 14M276 32l-14 14" stroke="${UI.coral}" stroke-width="4" stroke-linecap="round"/><path d="${textPath('3 sixes: back you go', 150, 194, 16, { anchor: 'middle', font: 'semibold' })}" fill="${ink}"/>`);
  }
  const t = token('yellow', mode, 150, 140, 1.4, 'active', 'h5');
  const goal = tileBody('sunshine', mode, 'b', 100, 60, 100 / 64) + tileBody('sunshine', mode, 'goal', 100, 60, 100 / 64).replace(/^<rect[^>]*>/, '');
  const ink = mode === 'light' ? UI.ink : '#F2F3F7';
  return scene(mode, `${goal}<path d="${textPath('100', 150, 52, 26, { anchor: 'middle' })}" fill="${ink}"/>${t.body}<path d="${textPath('Land exactly on 100', 150, 196, 18, { anchor: 'middle', font: 'semibold' })}" fill="${ink}"/>`, t.defs);
};

// ---------- brand ----------
const wordmark = (mode, x, y, size) => {
  const ink = mode === 'light' ? UI.deep : '#F2F3F7';
  const p = THEMES.sunshine[mode];
  const text = 'Snake Saga';
  const w = textWidth(text, size);
  const x0 = x - w / 2;
  const sw = textWidth('Snake ', size);
  // Snake curls through the S of "Saga": body behind the letter, head in front.
  const sx = x0 + sw;
  const pts = [[sx - size * 0.2, y - size * 0.95], [sx + size * 0.55, y - size * 0.75], [sx + size * 0.05, y - size * 0.38], [sx + size * 0.6, y - size * 0.05], [sx - size * 0.15, y + size * 0.2]];
  const r = ribbon([...pts].reverse(), size * 0.55, p.snakes.a, 'a', { id: `wm${mode}` });
  const textD = textPath(text, x0, y, size);
  const sD = textPath('S', sx, y, size);
  const shadow = `<path d="${textD}" fill="${mode === 'light' ? '#000000' : '#000000'}" fill-opacity="0.18" transform="translate(${n(size * 0.03)} ${n(size * 0.06)})"/>`;
  return {
    defs: `${r.defs}<clipPath id="wm-front${mode}"><rect x="${n(sx - size)}" y="${n(y - size * 0.45)}" width="${n(size * 2)}" height="${n(size * 0.22)}"/></clipPath>`,
    body: `${shadow}<path d="${textD}" fill="${ink}" stroke="${mode === 'light' ? '#FFFFFF' : UI.ink}" stroke-width="${n(size * 0.06)}" stroke-linejoin="round" paint-order="stroke"/>${r.body}<g clip-path="url(#wm-front${mode})"><path d="${sD}" fill="${ink}"/></g>`,
    width: w,
  };
};

const iconMark = (s = 1, mode = 'light') => {
  const p = THEMES.sunshine[mode];
  const r = ribbon([[702, 330], [420, 330], [600, 560], [330, 700]].map(([x, y]) => [x * s, y * s]), 230 * s, p.snakes.a, 'a', { id: `ic${mode}${s}` });
  const die = `<g transform="translate(${n(560 * s)} ${n(600 * s)}) scale(${n(1.9 * s)}) rotate(14 64 64)">${dieFace(6, 'light')}</g>`;
  return { defs: r.defs, body: `${die}${r.body}` };
};

export const buildExtras = () => {
  for (const mode of MODES) {
    for (const [shape, i] of [['rect', 0], ['circle', 1], ['triangle', 2], ['star', 3], ['squiggle', 4], ['curl', 5]].map(([s2], k) => [s2, k])) {
      for (const [cname, c] of Object.entries(CONFETTI_COLORS)) {
        asset(`images/fx/confetti_${shape}_${cname}_${mode}`, doc(12, 12, g('confetti', confettiShape(shape, c, mode === 'dark' ? '#FFFFFF' : null)), { title: `confetti ${shape} ${cname} ${mode}` }),
          { size: [12, 12], anchor: [0.5, 0.5], modes: [mode], screens: ['win'], group: 'fx', index: i });
      }
    }
    asset(`images/fx/sparkle_burst_${mode}`, doc(48, 48, g('sparkle', sparkle(mode === 'dark' ? '#FFFFFF' : null)), { title: `sparkle ${mode}` }),
      { size: [48, 48], anchor: [0.5, 0.5], modes: [mode], screens: ['game', 'win'], group: 'fx' });
    asset(`images/fx/dust_puff_${mode}`, doc(48, 48, g('dust', dust(mode)), { title: `dust ${mode}` }),
      { size: [48, 48], anchor: [0.5, 0.85], modes: [mode], screens: ['game'], group: 'fx' });
    asset(`images/fx/star_${mode}`, doc(32, 32, g('star', star(mode === 'dark' ? '#FFFFFF' : null)), { title: `star ${mode}` }),
      { size: [32, 32], anchor: [0.5, 0.5], modes: [mode], screens: ['win', 'stats'], group: 'fx' });
    for (let i = 1; i <= 5; i++) {
      const s = howTo(i, mode);
      asset(`images/ui/how_to_${i}_${mode}`, doc(300, 220, g('scene', s.body), { defs: s.defs, title: `how to play ${i} ${mode}` }),
        { size: [300, 220], anchor: [0.5, 0.5], modes: [mode], screens: ['how_to_play'], group: 'how_to' });
    }
    // Logo lockup: icon mark + wordmark.
    const wm = wordmark(mode, 300, 214, 72);
    const mark = iconMark(0.145, mode);
    const lockBody = `<g transform="translate(240 4) scale(0.8)"><circle cx="75" cy="70" r="66" fill="${mode === 'light' ? UI.sun : '#E6B84A'}" stroke="${outline(UI.sun, 0.26)}" stroke-width="4"/>${mark.body}</g>${wm.body}`;
    asset(`images/brand/logo_lockup_${mode}`, doc(600, 240, g('logo', lockBody), { defs: `${wm.defs}${mark.defs}`, title: `Snake Saga logo ${mode}` }),
      { size: [600, 240], anchor: [0.5, 0.5], modes: [mode], screens: ['splash', 'home'], group: 'brand' });
    const wm2 = wordmark(mode, 300, 96, 76);
    asset(`images/brand/logo_wordmark_${mode}`, doc(600, 130, g('wordmark', wm2.body), { defs: wm2.defs, title: `Snake Saga wordmark ${mode}` }),
      { size: [600, 130], anchor: [0.5, 0.5], modes: [mode], screens: ['home'], group: 'brand' });
  }
  // App icon (1024, no transparency) and Android adaptive layers (432, 108 dp at 4x).
  const sunGrad = `<radialGradient id="sun" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="#FFE48A"/><stop offset="1" stop-color="#FFB627"/></radialGradient>`;
  const rays = [...Array(12)].map((_, i) => `<path d="M512 512L${n(512 + Math.cos(i * 0.5236) * 900)} ${n(512 + Math.sin(i * 0.5236) * 900)}L${n(512 + Math.cos(i * 0.5236 + 0.22) * 900)} ${n(512 + Math.sin(i * 0.5236 + 0.22) * 900)}Z" fill="#FFFFFF" fill-opacity="0.16"/>`).join('');
  const mark = iconMark(1);
  asset('launcher/app_icon_1024', doc(1024, 1024, g('icon', `<rect width="1024" height="1024" fill="url(#sun)"/>${rays}${mark.body}`), { defs: sunGrad + mark.defs, title: 'app icon' }),
    { size: [1024, 1024], modes: ['light'], screens: ['launcher'], group: 'brand', single: true, bundled: false });
  const fg = iconMark(432 / 1024 * 0.72);
  asset('launcher/app_icon_foreground', doc(432, 432, g('foreground', `<g transform="translate(60.5 60.5)">${fg.body}</g>`), { defs: fg.defs, title: 'adaptive icon foreground' }),
    { size: [432, 432], modes: ['light'], screens: ['launcher'], group: 'brand', single: true, bundled: false, note: 'content inside the 66% safe zone' });
  asset('launcher/app_icon_background', doc(432, 432, g('background', `<rect width="432" height="432" fill="url(#sun)"/>`), { defs: sunGrad, title: 'adaptive icon background' }),
    { size: [432, 432], modes: ['light'], screens: ['launcher'], group: 'brand', single: true, bundled: false });
  for (const mode of MODES) {
    const sm = iconMark(768 / 1024 * 0.62, mode);
    const bgc = mode === 'light' ? APP.light.background : APP.dark.background;
    asset(`launcher/splash_image_${mode}`, doc(768, 768, g('splash', `<circle cx="384" cy="384" r="250" fill="${mode === 'light' ? UI.sun : '#E6B84A'}"/><g transform="translate(146 146)">${sm.body}</g>`), { defs: sm.defs, title: `native splash ${mode}` }),
      { size: [768, 768], modes: [mode], screens: ['native_splash'], group: 'brand', single: true, bundled: false, background: bgc });
  }
};

export { light, shade };
