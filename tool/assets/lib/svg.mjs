// SVG authoring helpers shared by every art module.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '../../..');

// ---------- colour ----------
const toRgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const toHex = (rgb) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
export const mix = (a, b, t) => {
  const [x, y] = [toRgb(a), toRgb(b)];
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};
const toHsl = (hex) => {
  const [r, g, b] = toRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};
const fromHsl = ([h, s, l]) => {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return toHex([f(0), f(8), f(4)].map((v) => v * 255));
};
// Outline colour: a dark tint of the fill, never pure black.
export const outline = (hex, l = 0.22) => { const [h, s] = toHsl(hex); return fromHsl([h, Math.min(1, s * 0.9 + 0.1), l]); };
export const shade = (hex, amt = 0.18) => { const [h, s, l] = toHsl(hex); return fromHsl([h, Math.min(1, s * 1.05), Math.max(0, l - amt)]); };
export const light = (hex, amt = 0.18) => { const [h, s, l] = toHsl(hex); return fromHsl([h, s, Math.min(1, l + amt)]); };
export const desat = (hex, f = 0.87) => { const [h, s, l] = toHsl(hex); return fromHsl([h, s * f, l]); };

const lum = (hex) => {
  const c = toRgb(hex).map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// ---------- numbers ----------
export const n = (v) => Math.round(v * 100) / 100;

// ---------- text as paths (so sources render the same everywhere) ----------
const fonts = {
  display: opentype.loadSync(path.join(ROOT, 'assets/fonts/Fredoka-Bold.ttf')),
  semibold: opentype.loadSync(path.join(ROOT, 'assets/fonts/Fredoka-SemiBold.ttf')),
  body: opentype.loadSync(path.join(ROOT, 'assets/fonts/Nunito-Bold.ttf')),
};
export const textWidth = (str, size, font = 'display') => fonts[font].getAdvanceWidth(str, size);
// Returns path data for a string with its left baseline at (x, y).
export const textPath = (str, x, y, size, o = {}) => {
  const font = fonts[o.font ?? 'display'];
  const w = font.getAdvanceWidth(str, size);
  const x0 = o.anchor === 'middle' ? x - w / 2 : o.anchor === 'end' ? x - w : x;
  return font.getPath(str, x0, y, size).toPathData(2);
};

// ---------- document ----------
export const doc = (w, h, body, o = {}) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<title>${o.title ?? ''}</title>
${o.defs ? `<defs>\n${o.defs}\n</defs>\n` : ''}${body}
</svg>
`;
export const g = (id, body, attrs = '') => `<g id="${id}"${attrs ? ` ${attrs}` : ''}>\n${body}\n</g>`;

// Soft drop shadow: ellipse, 25% black, blurred.
export const shadowDefs = (id = 'soft', blur = 2) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>`;
export const dropShadow = (cx, cy, rx, ry, id = 'soft') => g('shadow', `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="#000000" fill-opacity="0.25" filter="url(#${id})"/>`);

// ---------- registry ----------
// Every generated asset is registered with its metadata, then written as SVG.
export const registry = [];
export const SRC = path.join(ROOT, 'assets_src');

export const asset = (rel, svg, meta) => {
  const file = path.join(SRC, `${rel}.svg`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, svg);
  registry.push({ src: `assets_src/${rel}.svg`, out: `assets/${rel}.png`, ...meta });
};

// Runtime SVG (icons): written straight into assets/.
export const runtimeSvg = (rel, svg, meta) => {
  const file = path.join(ROOT, 'assets', `${rel}.svg`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, svg);
  registry.push({ src: null, out: `assets/${rel}.svg`, ...meta });
};

export const MODES = ['light', 'dark'];
