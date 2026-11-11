// UI kit: 9-slice buttons and panels, badges, and tinted runtime icons.
import { APP, UI } from '../lib/palette.mjs';
import { asset, contrast, desat, doc, g, light, MODES, n, outline, runtimeSvg, shade, shadowDefs, textPath, textWidth } from '../lib/svg.mjs';

// ---------- buttons (96 x 60, 9-slice insets 24/20/24/26) ----------
const BUTTONS = {
  primary: (m) => APP[m].primary,
  secondary: (m) => (m === 'light' ? UI.cream : '#3A3F57'),
  danger: (m) => APP[m].danger,
};

const buttonBody = (fill, state, mode, w = 96, h = 60, r = 20) => {
  const disabled = state === 'disabled';
  const base = disabled ? (mode === 'light' ? '#D9D6CF' : '#3A3D4C') : fill;
  const o = disabled ? (mode === 'light' ? '#A8A49A' : '#5A5E70') : outline(base, mode === 'light' ? 0.24 : 0.16);
  const lip = state === 'pressed' ? 2 : 6;
  const top = state === 'pressed' ? 5 : 1.5;
  const parts = [
    `<rect x="1.5" y="${1.5 + lip}" width="${w - 3}" height="${h - 3 - lip}" rx="${r}" fill="${shade(base, 0.14)}" stroke="${o}" stroke-width="3"/>`,
    `<rect x="1.5" y="${top}" width="${w - 3}" height="${h - 3 - 6}" rx="${r}" fill="${base}" stroke="${o}" stroke-width="3"/>`,
  ];
  if (!disabled) parts.push(`<rect x="10" y="${top + 5}" width="${w * 0.3}" height="6" rx="3" fill="#FFFFFF" fill-opacity="${mode === 'light' ? 0.5 : 0.3}"/>`);
  if (mode === 'dark' && !disabled) parts.push(`<rect x="0.5" y="${top - 1}" width="${w - 1}" height="${h - 7}" rx="${r + 1}" fill="none" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1"/>`);
  return parts.join('');
};

// ---------- panels ----------
const panelColors = (mode) => (mode === 'light'
  ? { fill: '#FFFFFF', line: '#E3D9C3', shadow: 0.14 }
  : { fill: '#1E2130', line: '#3A3F57', shadow: 0.4 });

const panels = (mode) => {
  const c = panelColors(mode);
  const card = `<rect x="4" y="6" width="88" height="88" rx="20" fill="#000000" fill-opacity="${c.shadow}" filter="url(#soft)"/><rect x="4" y="3" width="88" height="88" rx="20" fill="${c.fill}" stroke="${c.line}" stroke-width="2"/>`;
  const sheet = `<path d="M2 34Q2 4 32 4H96Q126 4 126 34V96H2Z" fill="${c.fill}" stroke="${c.line}" stroke-width="2"/><rect x="48" y="12" width="32" height="5" rx="2.5" fill="${mode === 'light' ? '#CFC6B4' : '#4A4F66'}"/>`;
  const dialog = `<rect x="6" y="9" width="116" height="116" rx="26" fill="#000000" fill-opacity="${c.shadow}" filter="url(#soft)"/><rect x="4" y="4" width="120" height="116" rx="26" fill="${c.fill}" stroke="${mode === 'light' ? UI.ink : '#5A6078'}" stroke-width="3"/>`;
  const toastFill = mode === 'light' ? UI.ink : '#F2F3F7';
  const toast = `<rect x="2" y="4" width="156" height="42" rx="21" fill="#000000" fill-opacity="0.2" filter="url(#soft)"/><rect x="2" y="2" width="156" height="42" rx="21" fill="${toastFill}"/>`;
  const sun = APP[mode].sun;
  const so = outline(sun, 0.26);
  const banner = [
    `<path d="M2 24H40V68H2L14 46Z" fill="${shade(sun, 0.18)}" stroke="${so}" stroke-width="3" stroke-linejoin="round"/>`,
    `<path d="M318 24H280V68H318L306 46Z" fill="${shade(sun, 0.18)}" stroke="${so}" stroke-width="3" stroke-linejoin="round"/>`,
    `<path d="M40 60L52 68V58Z M280 60L268 68V58Z" fill="${shade(sun, 0.32)}"/>`,
    `<rect x="26" y="6" width="268" height="54" rx="10" fill="${sun}" stroke="${so}" stroke-width="3"/>`,
    `<path d="M38 15H282" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 8"/>`,
  ].join('');
  return [
    ['card', 96, 96, card, [28, 28, 28, 28]],
    ['sheet', 128, 96, sheet, [40, 40, 40, 2]],
    ['dialog', 128, 128, dialog, [36, 36, 36, 36]],
    ['toast', 160, 48, toast, [24, 22, 24, 22]],
    ['turn_banner', 320, 72, banner, [64, 20, 64, 20]],
  ];
};

// ---------- badges ----------
const BADGES = [
  ['extra_roll', 'Extra roll!', UI.sun],
  ['ladder', 'Ladder!', UI.sky],
  ['oops', 'Oops!', UI.coral],
  ['winner', 'Winner', UI.leaf],
];
const badgeBody = (label, fill, mode) => {
  const f = mode === 'light' ? fill : desat(fill);
  const size = 30;
  const tw = textWidth(label, size);
  const w = Math.ceil(tw + 52);
  const h = 64;
  const o = outline(f, 0.24);
  const ink = contrast(UI.ink, f) >= 3 ? UI.ink : '#FFFFFF';
  const rim = mode === 'light' ? '#FFFFFF' : '#F2F3F7';
  const body = [
    `<rect x="4" y="8" width="${w - 8}" height="${h - 10}" rx="${(h - 10) / 2}" fill="#000000" fill-opacity="0.22" filter="url(#soft)"/>`,
    `<rect x="3" y="3" width="${w - 6}" height="${h - 10}" rx="${(h - 10) / 2}" fill="${rim}" stroke="${o}" stroke-width="2.5"/>`,
    `<rect x="9" y="9" width="${w - 18}" height="${h - 22}" rx="${(h - 22) / 2}" fill="${f}"/>`,
    `<rect x="20" y="13" width="${n(w * 0.28)}" height="5" rx="2.5" fill="#FFFFFF" fill-opacity="0.55"/>`,
    `<path d="${textPath(label, w / 2, 41, size, { anchor: 'middle' })}" fill="${ink}"/>`,
  ].join('');
  return { w, h, body };
};

// ---------- icons (24 grid, 2 px rounded stroke, tinted at runtime) ----------
const ICONS = {
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/><circle cx="12" cy="12" r="6.5"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  restart: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4v4.5h4.5"/>',
  sound_on: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  sound_off: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  music_on: '<path d="M9 17.5V5.5l10-2v12"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
  music_off: '<path d="M9 17.5V5.5l10-2v12"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/><path d="M3 3l18 18"/>',
  haptics: '<rect x="8" y="3.5" width="8" height="17" rx="2"/><path d="M4.5 8v8M19.5 8v8M2 10v4M22 10v4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  stats: '<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8.5 20h7M10 17h4v3h-4z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 8V4.5M12 4.5v.01"/><path d="M9.5 13v.01M14.5 13v.01"/><path d="M2.5 12.5v2M21.5 12.5v2"/>',
  human: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  crown: '<path d="M4 18h16M5 15L4 7l4.5 3.5L12 5l3.5 5.5L20 7l-1 8z"/>',
  snake: '<path d="M3 16c2.5 0 3-4 5.5-4s3 4 5.5 4 3-6 5-6"/><circle cx="20" cy="8" r="1.8"/>',
  chevron: '<path d="M9.5 6l6 6-6 6"/>',
};

export const buildUi = () => {
  for (const mode of MODES) {
    for (const [kind, colorOf] of Object.entries(BUTTONS)) {
      for (const state of ['normal', 'pressed', 'disabled']) {
        asset(`images/ui/button_${kind}_${state}_${mode}`, doc(96, 60, g('button', buttonBody(colorOf(mode), state, mode)), { title: `${kind} button ${state} ${mode}` }),
          { size: [96, 60], nineSlice: [24, 20, 24, 26], modes: [mode], screens: ['all'], group: 'button', labelColor: kind === 'secondary' && mode === 'dark' ? '#F2F3F7' : UI.ink });
      }
    }
    for (const state of ['normal', 'pressed', 'disabled']) {
      asset(`images/ui/button_icon_${state}_${mode}`, doc(56, 60, g('button', buttonBody(mode === 'light' ? '#FFFFFF' : '#272B3D', state, mode, 56, 60, 18)), { title: `icon button ${state} ${mode}` }),
        { size: [56, 60], anchor: [0.5, 0.5], modes: [mode], screens: ['all'], group: 'button' });
    }
    for (const [name, w, h, body, insets] of panels(mode)) {
      asset(`images/ui/panel_${name}_${mode}`, doc(w, h, g(name, body), { defs: shadowDefs('soft', 2.5), title: `${name} panel ${mode}` }),
        { size: [w, h], nineSlice: insets, modes: [mode], screens: ['all'], group: 'panel' });
    }
    for (const [id, label, fill] of BADGES) {
      const b = badgeBody(label, fill, mode);
      asset(`images/ui/badge_${id}_${mode}`, doc(b.w, b.h, g('badge', b.body), { defs: shadowDefs('soft', 2), title: `${label} badge ${mode}` }),
        { size: [b.w, b.h], anchor: [0.5, 0.5], modes: [mode], screens: ['game', 'win'], group: 'badge' });
    }
  }
  for (const [name, body] of Object.entries(ICONS)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><title>${name}</title>${body}</svg>\n`;
    runtimeSvg(`icons/ic_${name}`, svg, { size: [24, 24], modes: ['tinted'], screens: ['all'], group: 'icon' });
  }
};

export { BADGES, ICONS, buttonBody, light };
