// SVG sketch primitives for the wireframes: grayscale ink, pencil-blue notes,
// red numbered callouts. Lines go through a rough filter, text stays crisp.
import { centre, toBeziers } from './geometry.mjs';

export const C = {
  ink: '#23272B', muted: '#5C666F', blue: '#1C6DD0', red: '#D92D20', rule: '#C6CED5',
  paper: '#FFFFFF', fill: '#F1F3F5', fill2: '#E2E6EA', grey: '#8D969E',
};
const LIGHT = { fg: C.ink, bg: C.paper, fill: C.fill, fill2: C.fill2, muted: C.muted, tile: '#EEF1F4', grid: '#B9C1C8', num: '#6B747C' };
const DARK = { fg: '#FFFFFF', bg: C.ink, fill: '#30363C', fill2: '#454C53', muted: '#C3CAD1', tile: '#353C43', grid: '#5E666E', num: '#D5DBE0' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r1 = (n) => Math.round(n * 10) / 10;
const HAND = "'Patrick Hand','Chalkboard SE','Comic Sans MS',cursive";
export const SYMBOLS = ['star', 'dot', 'tri', 'square'];
export const COLOR_NAMES = ['Red', 'Blue', 'Green', 'Yellow'];

export class Sheet {
  constructor(w, h, label) {
    this.w = w; this.h = h; this.label = label;
    this.items = [];
    this.c = LIGHT;
    this.dx = 0; this.dy = 0;
    this.layerIdx = 0;
  }

  dark(on = true) { this.c = on ? DARK : LIGHT; return this; }

  // Each layer renders its lines (one rough-filtered group) and then its text.
  // Start a new layer for anything that must cover earlier text.
  layer() { this.layerIdx++; }

  push(kind, svg) {
    const placed = this.dx || this.dy ? `<g transform="translate(${r1(this.dx)} ${r1(this.dy)})">${svg}</g>` : svg;
    this.items.push({ kind, layer: this.layerIdx, svg: placed });
  }
  ink(svg) { this.push('ink', svg); }
  txt(svg) { this.push('txt', svg); }

  // Shift a block of drawing calls (phone-local coordinates).
  at(x, y, fn) {
    const [ox, oy] = [this.dx, this.dy];
    this.dx += x; this.dy += y;
    fn();
    this.dx = ox; this.dy = oy;
  }

  // Wrap the lines drawn by fn in one group, e.g. to rotate them.
  group(attr, fn) {
    const [ox, oy] = [this.dx, this.dy];
    this.dx = 0; this.dy = 0;
    const start = this.items.length;
    fn();
    const inner = this.items.splice(start).map((i) => i.svg).join('');
    this.dx = ox; this.dy = oy;
    this.ink(`<g ${attr}>${inner}</g>`);
  }

  abs(x, y) { return [this.dx + x, this.dy + y]; }

  stroke(o = {}) {
    const col = o.stroke ?? this.c.fg;
    const fill = o.fill === undefined ? 'none' : o.fill === true ? this.c.fill : o.fill;
    return `fill="${fill}" stroke="${col}" stroke-width="${o.sw ?? 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op ? ` opacity="${o.op}"` : ''} stroke-linecap="round" stroke-linejoin="round"`;
  }

  rect(x, y, w, h, o = {}) { this.ink(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${o.r ?? 0}" ${this.stroke(o)}/>`); }
  line(x1, y1, x2, y2, o = {}) { this.ink(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" ${this.stroke(o)}${o.marker ? ` marker-end="url(#${o.marker})"` : ''}/>`); }
  path(d, o = {}) { this.ink(`<path d="${d}" ${this.stroke(o)}${o.marker ? ` marker-end="url(#${o.marker})"` : ''}${o.markerStart ? ` marker-start="url(#${o.markerStart})"` : ''}/>`); }
  circle(cx, cy, r, o = {}) { this.ink(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" ${this.stroke(o)}/>`); }

  text(x, y, s, o = {}) {
    const fill = o.fill ?? this.c.fg;
    const anchor = o.anchor ?? 'start';
    const fam = o.body ? "Nunito,system-ui,sans-serif" : HAND;
    this.txt(`<text x="${r1(x)}" y="${r1(y)}" font-family="${fam}" font-size="${o.size ?? 18}" fill="${fill}" text-anchor="${anchor}"${o.bold ? ' font-weight="700"' : ''}${o.op ? ` opacity="${o.op}"` : ''}>${esc(s)}</text>`);
  }

  // Image placeholder: box with an X.
  xbox(x, y, w, h, o = {}) {
    this.rect(x, y, w, h, { r: o.r ?? 8, sw: 1.6, ...o });
    this.path(`M${r1(x + 4)} ${r1(y + 4)}L${r1(x + w - 4)} ${r1(y + h - 4)}M${r1(x + w - 4)} ${r1(y + 4)}L${r1(x + 4)} ${r1(y + h - 4)}`, { sw: 1.2, stroke: this.c.muted });
  }

  // Squiggle standing in for body text.
  wavy(x, y, w, lines = 1, o = {}) {
    for (let l = 0; l < lines; l++) {
      const len = l === lines - 1 && lines > 1 ? w * 0.62 : w;
      let d = `M${r1(x)} ${r1(y + l * 16)}`;
      for (let i = 0; i < len / 10; i++) d += ` q2.5 ${i % 2 ? 4 : -4} 5 0 t5 0`;
      this.path(d, { sw: 1.5, stroke: o.stroke ?? this.c.muted });
    }
  }

  button(x, y, w, h, label, o = {}) {
    const primary = o.primary;
    const fill = o.disabled ? 'none' : primary ? this.c.fill2 : o.fill ?? this.c.bg;
    this.rect(x, y, w, h, { r: o.r ?? Math.min(18, h / 2), sw: primary ? 3 : 2, fill, dash: o.disabled ? '6 6' : null, stroke: o.danger ? this.c.fg : undefined });
    if (o.danger) this.rect(x + 4, y + 4, w - 8, h - 8, { r: Math.min(14, h / 2 - 4), sw: 1, dash: '2 4' });
    const size = o.size ?? (h > 70 ? 32 : h > 52 ? 24 : 20);
    const ty = o.sub ? y + h / 2 - 2 : y + h / 2 + size * 0.34;
    this.text(x + w / 2, ty, label, { size, anchor: 'middle', fill: o.disabled ? this.c.muted : undefined });
    if (o.sub) this.text(x + w / 2, y + h / 2 + 20, o.sub, { size: 16, anchor: 'middle', fill: this.c.muted });
  }

  toggle(x, y, on) {
    this.rect(x, y, 52, 30, { r: 15, sw: 2, fill: on ? this.c.fill2 : 'none' });
    this.circle(on ? x + 37 : x + 15, y + 15, 10, { sw: 2, fill: this.c.bg });
  }

  segmented(x, y, w, h, options, sel, o = {}) {
    this.rect(x, y, w, h, { r: h / 2, sw: 2 });
    const cw = w / options.length;
    options.forEach((label, i) => {
      if (i === sel) this.rect(x + i * cw + 3, y + 3, cw - 6, h - 6, { r: (h - 6) / 2, sw: 2, fill: this.c.fill2 });
      else if (i > 0 && i !== sel + 1) this.line(x + i * cw, y + 8, x + i * cw, y + h - 8, { sw: 1, stroke: this.c.muted });
      this.text(x + i * cw + cw / 2, y + h / 2 + (o.size ?? 18) * 0.34, label, { size: o.size ?? 18, anchor: 'middle' });
    });
  }

  stepper(x, y, value, o = {}) {
    const b = o.b ?? 48;
    const minDis = value <= 6;
    const maxDis = value >= 8;
    this.rect(x, y, b, b, { r: 12, sw: 2, dash: minDis ? '5 5' : null, fill: minDis ? 'none' : this.c.fill });
    this.line(x + b * 0.3, y + b / 2, x + b * 0.7, y + b / 2, { sw: 3, stroke: minDis ? this.c.muted : undefined });
    this.text(x + b + 34, y + b / 2 + 13, String(value), { size: 38, anchor: 'middle' });
    const px = x + b + 68;
    this.rect(px, y, b, b, { r: 12, sw: 2, dash: maxDis ? '5 5' : null, fill: maxDis ? 'none' : this.c.fill });
    this.path(`M${px + b * 0.3} ${y + b / 2}H${px + b * 0.7}M${px + b / 2} ${y + b * 0.3}V${y + b * 0.7}`, { sw: 3, stroke: maxDis ? this.c.muted : undefined });
  }

  symbol(kind, cx, cy, r, o = {}) {
    const fill = o.fill ?? this.c.fg;
    if (kind === 'dot') this.circle(cx, cy, r * 0.62, { sw: 0, fill, stroke: 'none' });
    if (kind === 'square') this.rect(cx - r * 0.55, cy - r * 0.55, r * 1.1, r * 1.1, { sw: 0, fill, stroke: 'none', r: 1 });
    if (kind === 'tri') this.path(`M${r1(cx)} ${r1(cy - r * 0.72)}L${r1(cx + r * 0.68)} ${r1(cy + r * 0.5)}L${r1(cx - r * 0.68)} ${r1(cy + r * 0.5)}Z`, { sw: 0, fill, stroke: 'none' });
    if (kind === 'star') {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.36 : r * 0.82;
        d += `${i ? 'L' : 'M'}${r1(cx + Math.cos(a) * rr)} ${r1(cy + Math.sin(a) * rr)}`;
      }
      this.path(`${d}Z`, { sw: 0, fill, stroke: 'none' });
    }
  }

  token(cx, cy, r, color, o = {}) {
    if (o.active) this.circle(cx, cy, r + 5, { sw: 1.5, dash: '3 4' });
    this.circle(cx, cy, r, { sw: o.active ? 3 : 2, fill: this.c.bg });
    this.symbol(SYMBOLS[color], cx, cy, r * 0.62);
  }

  dice(x, y, size, face, o = {}) {
    this.rect(x, y, size, size, { r: size * 0.2, sw: o.disabled ? 2 : 3, fill: o.disabled ? 'none' : this.c.bg, dash: o.disabled ? '7 6' : null });
    const p = {
      1: [[0.5, 0.5]], 2: [[0.28, 0.28], [0.72, 0.72]], 3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
      4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
      5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
      6: [[0.28, 0.25], [0.72, 0.25], [0.28, 0.5], [0.72, 0.5], [0.28, 0.75], [0.72, 0.75]],
    }[face] ?? [];
    for (const [px, py] of p) this.circle(x + px * size, y + py * size, size * 0.075, { sw: 0, stroke: 'none', fill: o.disabled ? this.c.muted : this.c.fg });
  }

  icon(name, cx, cy, s = 22) {
    const h = s / 2;
    const o = { sw: 2 };
    switch (name) {
      case 'pause': this.path(`M${cx - h * 0.4} ${cy - h * 0.6}V${cy + h * 0.6}M${cx + h * 0.4} ${cy - h * 0.6}V${cy + h * 0.6}`, { sw: 3 }); break;
      case 'back': this.path(`M${cx + h * 0.3} ${cy - h * 0.7}L${cx - h * 0.4} ${cy}L${cx + h * 0.3} ${cy + h * 0.7}`, { sw: 3 }); break;
      case 'chevron': this.path(`M${cx - h * 0.25} ${cy - h * 0.5}L${cx + h * 0.25} ${cy}L${cx - h * 0.25} ${cy + h * 0.5}`, o); break;
      case 'gear': this.circle(cx, cy, h * 0.42, o); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; this.line(cx + Math.cos(a) * h * 0.55, cy + Math.sin(a) * h * 0.55, cx + Math.cos(a) * h * 0.9, cy + Math.sin(a) * h * 0.9, { sw: 2.4 }); } break;
      case 'trophy': this.path(`M${cx - h * 0.55} ${cy - h * 0.7}H${cx + h * 0.55}V${cy - h * 0.1}A${h * 0.55} ${h * 0.55} 0 0 1 ${cx - h * 0.55} ${cy - h * 0.1}ZM${cx} ${cy + h * 0.45}V${cy + h * 0.75}M${cx - h * 0.4} ${cy + h * 0.8}H${cx + h * 0.4}`, o); break;
      case 'lock': this.rect(cx - h * 0.6, cy - h * 0.1, h * 1.2, h * 0.95, { r: 3, sw: 2.4 }); this.path(`M${cx - h * 0.38} ${cy - h * 0.1}V${cy - h * 0.45}A${h * 0.38} ${h * 0.38} 0 0 1 ${cx + h * 0.38} ${cy - h * 0.45}V${cy - h * 0.1}`, { sw: 2.4 }); break;
      case 'snake': this.path(`M${cx - h * 0.9} ${cy + h * 0.3}q${h * 0.3} ${-h * 0.8} ${h * 0.6} 0t${h * 0.6} 0t${h * 0.6} 0`, { sw: 2.6 }); this.circle(cx + h * 0.9, cy - h * 0.15, h * 0.22, { sw: 2 }); break;
      case 'close': this.path(`M${cx - h * 0.5} ${cy - h * 0.5}L${cx + h * 0.5} ${cy + h * 0.5}M${cx + h * 0.5} ${cy - h * 0.5}L${cx - h * 0.5} ${cy + h * 0.5}`, { sw: 2.6 }); break;
      case 'bot': this.rect(cx - h * 0.6, cy - h * 0.4, h * 1.2, h * 0.95, { r: 4, sw: 2 }); this.line(cx, cy - h * 0.4, cx, cy - h * 0.75, o); this.circle(cx - h * 0.25, cy + h * 0.05, 1.6, { sw: 2 }); this.circle(cx + h * 0.25, cy + h * 0.05, 1.6, { sw: 2 }); break;
      case 'crown': this.path(`M${cx - h * 0.7} ${cy + h * 0.45}L${cx - h * 0.7} ${cy - h * 0.4}L${cx - h * 0.3} ${cy}L${cx} ${cy - h * 0.6}L${cx + h * 0.3} ${cy}L${cx + h * 0.7} ${cy - h * 0.4}L${cx + h * 0.7} ${cy + h * 0.45}Z`, o); break;
      default: break;
    }
  }

  // Red numbered callout.
  callout(x, y, n) {
    const [ax, ay] = this.abs(x, y);
    this.items.push({ kind: 'top', svg: `<circle cx="${r1(ax)}" cy="${r1(ay)}" r="13" fill="#FFFFFF" stroke="${C.red}" stroke-width="2.2"/><text x="${r1(ax)}" y="${r1(ay + 6)}" font-family="${HAND}" font-size="18" fill="${C.red}" text-anchor="middle">${n}</text>` });
  }

  // Pencil-blue margin note with an arrow to a target (both absolute coordinates).
  note(x, y, lines, target, o = {}) {
    const size = o.size ?? 18;
    const anchor = o.anchor ?? 'start';
    lines.forEach((l, i) => {
      this.items.push({ kind: 'top', svg: `<text x="${r1(x)}" y="${r1(y + i * size * 1.12)}" font-family="${HAND}" font-size="${size}" fill="${C.blue}" text-anchor="${anchor}">${esc(l)}</text>` });
    });
    if (target) {
      const sx = o.from ? o.from[0] : anchor === 'end' ? x + 6 : x - 6;
      const sy = o.from ? o.from[1] : y - size * 0.35;
      const [tx, ty] = target;
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2 - (o.bend ?? 18);
      this.items.push({ kind: 'top', svg: `<path d="M${r1(sx)} ${r1(sy)}Q${r1(mx)} ${r1(my)} ${r1(tx)} ${r1(ty)}" fill="none" stroke="${C.blue}" stroke-width="1.6" stroke-linecap="round" marker-end="url(#arrBlue)"/>` });
    }
  }

  // Phone frame. Content is drawn by fn in phone-local coordinates.
  phone(x, y, fn, o = {}) {
    const w = o.w ?? 390;
    const h = o.h ?? 844;
    this.at(x, y, () => {
      this.rect(0, 0, w, h, { r: o.tablet ? 36 : 48, sw: 3, fill: this.c.bg });
      if (!o.tablet) this.rect(w / 2 - 62, 12, 124, 30, { r: 15, sw: 0, fill: this.c.fg, stroke: 'none' });
      else this.circle(w / 2, 16, 4, { sw: 0, fill: this.c.fg, stroke: 'none' });
      fn();
      this.line(w / 2 - 66, h - 12, w / 2 + 66, h - 12, { sw: 4 });
    });
  }

  render(aria) {
    const out = [];
    const layers = Math.max(0, ...this.items.map((i) => i.layer ?? 0));
    const frame = `<rect width="${this.w}" height="${this.h}" fill="none" stroke="none"/>`;
    for (let l = 0; l <= layers; l++) {
      const inks = this.items.filter((i) => i.kind === 'ink' && i.layer === l).map((i) => i.svg);
      const txts = this.items.filter((i) => i.kind === 'txt' && i.layer === l).map((i) => i.svg);
      if (inks.length) out.push(`<g filter="url(#rough)">${frame}${inks.join('')}</g>`);
      out.push(...txts);
    }
    out.push(...this.items.filter((i) => i.kind === 'top').map((i) => i.svg));
    return `<svg viewBox="0 0 ${this.w} ${this.h}" role="img" aria-label="${esc(aria ?? this.label)}">${out.join('')}</svg>`;
  }
}

// ---------- Board drawing ----------

export const tokenOffsets = (count) => {
  if (count <= 1) return { scale: 1, offs: [[0, 0]] };
  if (count === 2) return { scale: 0.8, offs: [[-0.2, 0], [0.2, 0]] };
  return { scale: 0.65, offs: [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]] };
};

export const boardPoint = (x, y, size, sq) => {
  if (sq === 0) return [x + size * 0.07, y + size + size * 0.06];
  const [cx, cy] = centre(sq);
  return [x + cx * size, y + cy * size];
};

export const snakePathD = (j, x, y, size) => {
  const pts = [centre(j.from), ...j.path, centre(j.to)].map(([px, py]) => [x + px * size, y + py * size]);
  const segs = toBeziers(pts);
  let d = `M${r1(segs[0][0][0])} ${r1(segs[0][0][1])}`;
  for (const [, b, c, e] of segs) d += `C${r1(b[0])} ${r1(b[1])} ${r1(c[0])} ${r1(c[1])} ${r1(e[0])} ${r1(e[1])}`;
  return d;
};

const pillW = (s, size) => s.length * size * 0.46 + 10;

export const drawBoard = (s, x, y, size, board, n, o = {}) => {
  const t = size / 10;
  let checker = '';
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) if ((r + c) % 2 === 0) checker += `M${r1(x + c * t)} ${r1(y + r * t)}h${r1(t)}v${r1(t)}h${r1(-t)}z`;
  s.ink(`<path d="${checker}" fill="${s.c.tile}" stroke="none"/>`);
  let grid = '';
  for (let i = 1; i < 10; i++) grid += `M${r1(x + i * t)} ${r1(y)}V${r1(y + size)}M${r1(x)} ${r1(y + i * t)}H${r1(x + size)}`;
  s.ink(`<path d="${grid}" fill="none" stroke="${s.c.grid}" stroke-width="1"/>`);
  s.rect(x, y, size, size, { sw: o.frame ?? 3.5 });
  if (o.numbers !== false) {
    const fs = o.numSize ?? t * 0.3;
    for (let sq = 1; sq <= 100; sq++) {
      const [cx, cy] = centre(sq);
      if (o.corner) s.text(x + (cx - 0.045) * size, y + (cy - 0.05) * size + fs * 0.95, String(sq), { size: fs, fill: s.c.num });
      else s.text(x + cx * size, y + cy * size + fs * 0.34, String(sq), { size: fs, anchor: 'middle', fill: s.c.num });
    }
  }
  const all = board.jumps.filter((j) => o.allSnakes || j.type === 'ladder' || j.rank <= n);
  const hl = o.highlight;
  for (const j of all.filter((jj) => jj.type === 'ladder')) {
    const [ax, ay] = boardPoint(x, y, size, j.from);
    const [bx, by] = boardPoint(x, y, size, j.to);
    const len = Math.hypot(bx - ax, by - ay);
    const nx = (-(by - ay) / len) * t * 0.18;
    const ny = ((bx - ax) / len) * t * 0.18;
    const sw = hl === j.id ? 3 : o.thin ? 1.4 : 1.8;
    s.path(`M${r1(ax + nx)} ${r1(ay + ny)}L${r1(bx + nx)} ${r1(by + ny)}M${r1(ax - nx)} ${r1(ay - ny)}L${r1(bx - nx)} ${r1(by - ny)}`, { sw });
    const rungs = Math.max(2, Math.floor(len / (t * 0.45)));
    let d = '';
    for (let k = 1; k < rungs; k++) {
      const f = k / rungs;
      d += `M${r1(ax + (bx - ax) * f + nx)} ${r1(ay + (by - ay) * f + ny)}L${r1(ax + (bx - ax) * f - nx)} ${r1(ay + (by - ay) * f - ny)}`;
    }
    s.path(d, { sw: sw * 0.7 });
  }
  for (const j of all.filter((jj) => jj.type === 'snake')) {
    const d = snakePathD(j, x, y, size);
    const off = j.rank > n;
    const dashed = (o.dashedRanks && j.rank >= 7) || off;
    const bw = t * (o.thin ? 0.16 : 0.2);
    const strong = hl === j.id;
    if (dashed) {
      s.path(d, { sw: bw, stroke: s.c.fill2, op: off ? 0.55 : null });
      s.path(d, { sw: 1.8, dash: '6 5' });
    } else {
      s.path(d, { sw: bw + (strong ? 3 : 2.2) });
      s.ink(`<path d="${d}" fill="none" stroke="${s.c.bg}" stroke-width="${r1(bw - 1)}" stroke-linecap="round"/>`);
    }
    const [hx, hy] = boardPoint(x, y, size, j.from);
    s.circle(hx, hy, t * 0.2, { sw: strong ? 2.6 : 1.8, fill: s.c.bg, dash: dashed ? '3 3' : null });
    s.circle(hx - t * 0.07, hy - t * 0.04, Math.max(1, t * 0.035), { sw: 0, fill: s.c.fg, stroke: 'none' });
    s.circle(hx + t * 0.07, hy - t * 0.04, Math.max(1, t * 0.035), { sw: 0, fill: s.c.fg, stroke: 'none' });
  }
  if (o.labels) drawLabels(s, x, y, size, all, o);
  if (o.ranks) {
    for (const j of all.filter((jj) => jj.type === 'snake')) {
      const [hx, hy] = boardPoint(x, y, size, j.from);
      const rx = hx + t * 0.3;
      const ry = hy - t * 0.3;
      s.items.push({ kind: 'top', svg: `<circle cx="${r1(rx)}" cy="${r1(ry)}" r="${r1(t * 0.19)}" fill="${C.red}" stroke="#FFFFFF" stroke-width="1.5"${j.rank >= 7 ? ' stroke-dasharray="3 2"' : ''}/><text x="${r1(rx)}" y="${r1(ry + t * 0.09)}" font-family="${HAND}" font-size="${r1(t * 0.27)}" fill="#FFFFFF" text-anchor="middle">${j.rank}</text>` });
    }
  }
};

// Greedy from→to label placement that avoids other labels and end points.
const drawLabels = (s, x, y, size, jumps, o) => {
  const t = size / 10;
  const fs = o.labelSize ?? t * 0.3;
  const placed = [];
  const ends = jumps.flatMap((j) => [boardPoint(x, y, size, j.from), boardPoint(x, y, size, j.to)]);
  for (const j of jumps) {
    const label = `${j.from}→${j.to}`;
    const w = pillW(label, fs);
    const h = fs * 1.35;
    const cands = [];
    if (j.type === 'ladder') {
      const [ax, ay] = boardPoint(x, y, size, j.from);
      const [bx, by] = boardPoint(x, y, size, j.to);
      for (const f of [0.5, 0.38, 0.62, 0.28, 0.72, 0.2, 0.8]) cands.push([ax + (bx - ax) * f, ay + (by - ay) * f]);
    } else {
      const pts = [centre(j.from), ...j.path, centre(j.to)].map(([px, py]) => [x + px * size, y + py * size]);
      const segs = toBeziers(pts);
      for (const f of [0.5, 0.35, 0.65, 0.25, 0.75, 0.42, 0.58]) {
        const si = Math.min(segs.length - 1, Math.floor(f * segs.length));
        const tt = f * segs.length - si;
        const [a, b, c, d] = segs[si];
        const u = 1 - tt;
        cands.push([0, 1].map((k) => u * u * u * a[k] + 3 * u * u * tt * b[k] + 3 * u * tt * tt * c[k] + tt * tt * tt * d[k]));
      }
    }
    let best = null;
    for (const [cx, cy] of cands) {
      const box = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
      let pen = 0;
      for (const p of placed) {
        const ox = Math.max(0, Math.min(box[2], p[2]) - Math.max(box[0], p[0]));
        const oy = Math.max(0, Math.min(box[3], p[3]) - Math.max(box[1], p[1]));
        pen += ox * oy * 10;
      }
      for (const [ex, ey] of ends) {
        const dx = Math.max(box[0] - ex, 0, ex - box[2]);
        const dy = Math.max(box[1] - ey, 0, ey - box[3]);
        const dd = Math.hypot(dx, dy);
        if (dd < t * 0.3) pen += (t * 0.3 - dd) * 40;
      }
      if (box[0] < x || box[2] > x + size || box[1] < y || box[3] > y + size) pen += 5000;
      if (!best || pen < best.pen) best = { pen, box, cx, cy };
    }
    placed.push(best.box);
    const dashed = j.type === 'snake' && j.rank >= 7;
    s.items.push({ kind: 'top', svg: `<rect x="${r1(best.box[0])}" y="${r1(best.box[1])}" width="${r1(w)}" height="${r1(h)}" rx="${r1(h / 2)}" fill="#FFFFFF" stroke="${j.type === 'ladder' ? C.ink : C.muted}" stroke-width="1.2"${dashed ? ' stroke-dasharray="3 3"' : ''}/><text x="${r1(best.cx)}" y="${r1(best.cy + fs * 0.34)}" font-family="${HAND}" font-size="${r1(fs)}" fill="${C.ink}" text-anchor="middle">${label}</text>` });
  }
};

export const drawTokens = (s, x, y, size, tokens) => {
  const t = size / 10;
  const bySq = new Map();
  for (const tk of tokens) {
    if (!bySq.has(tk.sq)) bySq.set(tk.sq, []);
    bySq.get(tk.sq).push(tk);
  }
  for (const tk of tokens.filter((k) => k.pt)) s.token(tk.pt[0], tk.pt[1], t * 0.3, tk.color, { active: tk.active });
  bySq.delete(undefined);
  for (const [sq, list] of bySq) {
    const { scale, offs } = tokenOffsets(list.length);
    const [cx, cy] = boardPoint(x, y, size, sq);
    list.forEach((tk, i) => {
      const [ox, oy] = sq === 0 ? [i * 0.42, 0] : offs[i];
      s.token(cx + ox * t, cy + oy * t, t * 0.3 * (sq === 0 ? 0.8 : scale), tk.color, { active: tk.active });
    });
  }
};
