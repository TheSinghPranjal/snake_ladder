// Snake heads, tails, body patterns, and an SVG preview of SnakePainter's ribbon.
import { g, light, n, outline as outlineOf, shade } from './svg.mjs';

// Head canvas is 48 x 36 logical px, facing right. The neck joint (anchor) is
// at (6, 18), i.e. (0.125, 0.5). The body's head end (0.32 tile wide) meets it.
export const HEAD = { w: 48, h: 36, anchor: [6 / 48, 0.5] };
// Tail canvas is 32 x 24, anchor (0, 0.5): the body's tail end meets the left edge.
export const TAIL = { w: 32, h: 24, anchor: [0, 0.5] };
// Pattern strip 64 x 16, tiled along the body centre line.
export const PATTERN = { w: 64, h: 16 };

const eye = (cx, cy, r, o, frame, design, id) => {
  if (frame === 'gulp2' || design === 'd') {
    // Squint (gulp2) or sleepy half lid (design d).
    const lid = frame === 'gulp2'
      ? `<path d="M${n(cx - r)} ${n(cy)}q${n(r)} ${n(-r * 0.9)} ${n(2 * r)} 0" fill="none" stroke="${o}" stroke-width="1.6" stroke-linecap="round"/>`
      : `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="#FFFFFF" stroke="${o}" stroke-width="1.4"/><circle cx="${n(cx + r * 0.25)}" cy="${n(cy + r * 0.2)}" r="${n(r * 0.48)}" fill="#1D1D26"/><path d="M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 0 1 ${n(2 * r)} 0z" fill="${id}" stroke="${o}" stroke-width="1.4"/>`;
    return lid;
  }
  const big = frame === 'gulp1' ? 1.12 : 1;
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * big)}" fill="#FFFFFF" stroke="${o}" stroke-width="1.4"/>`
    + `<circle cx="${n(cx + r * 0.28)}" cy="${n(cy)}" r="${n(r * 0.55 * big)}" fill="#1D1D26"/>`
    + `<circle cx="${n(cx + r * 0.05)}" cy="${n(cy - r * 0.3)}" r="${n(r * 0.22)}" fill="#FFFFFF"/>`;
};

const headMarks = (design, c, cx, cy, rx, ry) => {
  const p = c.pattern;
  switch (design) {
    case 'a': return [[-6, -6, 2.2], [-9, 4, 1.8], [-2, 8, 1.6], [3, -9, 1.5]].map(([dx, dy, r]) => `<circle cx="${n(cx + dx)}" cy="${n(cy + dy)}" r="${r}" fill="${p}"/>`).join('');
    case 'b': return [-8, -3].map((dx) => `<path d="M${n(cx + dx)} ${n(cy - ry + 1.5)}q2.5 ${n(ry)} 0 ${n(2 * ry - 3)}" fill="none" stroke="${p}" stroke-width="2.6" stroke-linecap="round"/>`).join('');
    case 'c': return `<path d="M${n(cx - 10)} ${n(cy)}l4 -4l4 4l-4 4z M${n(cx - 2)} ${n(cy - 7)}l3 -3l3 3l-3 3z M${n(cx - 2)} ${n(cy + 7)}l3 -3l3 3l-3 3z" fill="${p}"/>`;
    default: return `<path d="M${n(cx - 11)} ${n(cy - ry + 2)}l3 ${n(ry - 2)}l-3 ${n(ry - 2)}M${n(cx - 6)} ${n(cy - ry + 1)}l3 ${n(ry - 1)}l-3 ${n(ry - 1)}" fill="none" stroke="${p}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
};

// Returns { defs, body } so heads can be embedded in composite scenes.
export const headParts = (design, frame, c, id = 'h') => {
  const o = c.outline;
  const squash = { idle: [16, 13], gulp1: [15, 15], gulp2: [18, 11.5] }[frame];
  const [rx, ry] = design === 'c' ? [squash[0] + 1, squash[1] - 1] : design === 'b' ? [squash[0] - 1, squash[1]] : squash;
  const cx = 28;
  const cy = 18;
  const headPath = design === 'c'
    ? `M${n(cx - rx)} ${cy}C${n(cx - rx)} ${n(cy - ry)} ${n(cx + rx * 0.4)} ${n(cy - ry * 1.05)} ${n(cx + rx)} ${cy}C${n(cx + rx * 0.4)} ${n(cy + ry * 1.05)} ${n(cx - rx)} ${n(cy + ry)} ${n(cx - rx)} ${cy}Z`
    : `M${n(cx - rx)} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
  const defs = `<clipPath id="${id}-clip"><path d="${headPath}"/></clipPath>`;
  const top = `M0 ${n(cy - 8)}C${n(cx - rx - 2)} ${n(cy - 8)} ${n(cx - rx + 2)} ${n(cy - ry * 0.7)} ${n(cx - rx + 8)} ${n(cy - ry * 0.75)}`;
  const bottom = `M${n(cx - rx + 8)} ${n(cy + ry * 0.75)}C${n(cx - rx + 2)} ${n(cy + ry * 0.7)} ${n(cx - rx - 2)} ${n(cy + 8)} 0 ${n(cy + 8)}`;
  const neck = `<path d="${top}L${n(cx - rx + 8)} ${n(cy + ry * 0.75)}${bottom.replace(/^M[^C]+/, '')}Z" fill="${c.base}"/>`
    + `<path d="M0 ${n(cy + 3)}H${n(cx - rx + 6)}V${n(cy + 8)}H0Z" fill="${shade(c.base, 0.08)}"/>`
    + `<path d="${top}" fill="none" stroke="${o}" stroke-width="2" stroke-linecap="round"/><path d="${bottom}" fill="none" stroke="${o}" stroke-width="2" stroke-linecap="round"/>`;
  const tongue = frame === 'idle' && (design === 'a' || design === 'c')
    ? `<path d="M${n(cx + rx - 1)} ${cy}h7l2.5 -2.2M${n(cx + rx + 6)} ${cy}l2.5 2.2" fill="none" stroke="#E53935" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
    : '';
  const mouth = frame === 'gulp1'
    ? `<ellipse cx="${n(cx + rx - 3.5)}" cy="${cy}" rx="4.5" ry="${n(ry * 0.55)}" fill="#5A1E2A" stroke="${o}" stroke-width="1.4"/><ellipse cx="${n(cx + rx - 3)}" cy="${n(cy + ry * 0.2)}" rx="2.4" ry="${n(ry * 0.22)}" fill="#E57373"/>`
    : frame === 'gulp2'
      ? `<path d="M${n(cx + rx - 4)} ${n(cy - 4)}q3 4 0 8" fill="none" stroke="${o}" stroke-width="1.6" stroke-linecap="round"/>`
      : '';
  const blush = design === 'b' ? `<ellipse cx="${n(cx + 7)}" cy="${n(cy - ry + 3)}" rx="2.6" ry="1.6" fill="#FF8A80" fill-opacity="0.75"/><ellipse cx="${n(cx + 7)}" cy="${n(cy + ry - 3)}" rx="2.6" ry="1.6" fill="#FF8A80" fill-opacity="0.75"/>` : '';
  const nostrils = frame !== 'gulp1' ? `<circle cx="${n(cx + rx - 3)}" cy="${n(cy - 2.4)}" r="0.9" fill="${o}"/><circle cx="${n(cx + rx - 3)}" cy="${n(cy + 2.4)}" r="0.9" fill="${o}"/>` : '';
  const er = design === 'b' ? 4.8 : design === 'c' ? 4 : 4.5;
  const ex = cx + (frame === 'gulp2' ? 3 : 2);
  const ey = ry * 0.42;
  const body = [
    g('neck', neck),
    g('head', [
      `<path d="${headPath}" fill="${c.base}"/>`,
      `<g clip-path="url(#${id}-clip)"><rect x="${n(cx - rx)}" y="${n(cy + ry * 0.15)}" width="${2 * rx}" height="${ry}" fill="${shade(c.base, 0.08)}"/>${headMarks(design, c, cx, cy, rx, ry)}</g>`,
      `<ellipse cx="${n(cx - 4)}" cy="${n(cy - ry * 0.5)}" rx="${n(rx * 0.38)}" ry="${n(ry * 0.22)}" fill="#FFFFFF" fill-opacity="0.45"/>`,
      `<path d="${headPath}" fill="none" stroke="${o}" stroke-width="2.2" stroke-linejoin="round"/>`,
    ].join('')),
    g('face', [blush, nostrils, mouth, tongue, eye(ex, cy - ey, er, o, frame, design, c.base), eye(ex, cy + ey, er, o, frame, design, c.base)].join('')),
  ].join('\n');
  return { defs, body };
};

export const tailParts = (design, c) => {
  const o = c.outline;
  let shape;
  if (design === 'b') shape = 'M0 7C10 7 22 3 26 8C30 13 24 19 19 16C16 14 19 10 22 12C17 15 8 17 0 17Z';
  else if (design === 'c') shape = 'M0 7C10 7 20 8 26 10C30 11.5 30 12.5 26 14C20 16 10 17 0 17Z';
  else if (design === 'd') shape = 'M0 7C8 7 14 8 18 9C20 9.5 20 14.5 18 15C14 16 8 17 0 17Z';
  else shape = 'M0 7C10 7 20 9 31 12C20 15 10 17 0 17Z';
  const extra = design === 'd'
    ? `<ellipse cx="22" cy="12" rx="3.2" ry="3.6" fill="${light(c.base, 0.12)}" stroke="${o}" stroke-width="1.6"/><ellipse cx="27.5" cy="12" rx="2.6" ry="3" fill="${light(c.base, 0.2)}" stroke="${o}" stroke-width="1.6"/>`
    : design === 'c'
      ? `<path d="M9 7.6v8.8M17 8.4v7.2" stroke="${c.pattern}" stroke-width="2.4"/>`
      : '';
  const body = [
    `<path d="${shape}" fill="${c.base}"/>`,
    `<path d="M0 13C10 13 18 13 26 12.5L26 14C18 16 10 17 0 17Z" fill="${shade(c.base, 0.08)}"/>`,
    extra,
    `<path d="M2 9.2C8 9 14 9.4 18 10" fill="none" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="1.6" stroke-linecap="round"/>`,
    `<path d="${shape}" fill="none" stroke="${o}" stroke-width="2" stroke-linejoin="round"/>`,
  ].join('');
  return { defs: '', body: g('tail', body) };
};

// One seamless repeat of the body pattern, 64 x 16, transparent background.
export const patternParts = (design, c) => {
  const p = c.pattern;
  let marks;
  if (design === 'a') marks = [[8, 6, 2.6], [24, 10.5, 2.1], [40, 5.5, 2.4], [56, 10, 2.2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${p}"/>`).join('');
  else if (design === 'b') marks = [0, 16, 32, 48, 64].map((x) => `<path d="M${x - 4} 16L${x + 4} 0" stroke="${p}" stroke-width="5" stroke-linecap="butt"/>`).join('');
  else if (design === 'c') marks = [0, 21.33, 42.67, 64].map((x) => `<path d="M${n(x)} 2.5L${n(x + 6)} 8L${n(x)} 13.5L${n(x - 6)} 8Z" fill="${p}"/>`).join('');
  else marks = [0, 16, 32, 48].map((x) => `<path d="M${x + 3} 2.5L${x + 9} 8L${x + 3} 13.5" fill="none" stroke="${p}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  return { defs: `<clipPath id="strip"><rect width="64" height="16"/></clipPath>`, body: g('pattern', `<g clip-path="url(#strip)">${marks}</g>`) };
};

// ---------- ribbon preview (mirrors SnakePainter) ----------
const catmull = (pts) => {
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    segs.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
  }
  return segs;
};
const sample = (segs, per = 24) => {
  const out = [];
  segs.forEach(([a, b, c, d], si) => {
    for (let k = si ? 1 : 0; k <= per; k++) {
      const t = k / per;
      const u = 1 - t;
      out.push([0, 1].map((i) => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i]));
    }
  });
  return out;
};

// pts: absolute points head -> tail. tile: tile size in px. Returns SVG markup.
export const ribbon = (pts, tile, c, design, o = {}) => {
  const s = sample(catmull(pts));
  const len = [0];
  for (let i = 1; i < s.length; i++) len.push(len[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]));
  const total = len[len.length - 1];
  const half = (i) => (tile * (0.32 + (0.12 - 0.32) * (len[i] / total))) / 2;
  const normal = (i) => {
    const a = s[Math.max(0, i - 1)];
    const b = s[Math.min(s.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
  };
  const edge = (side, scale = 1, shift = 0) => s.map((p, i) => {
    const [nx, ny] = normal(i);
    const h = half(i) * scale;
    return [p[0] + nx * (side * h + shift * half(i)), p[1] + ny * (side * h + shift * half(i))];
  });
  const poly = (l, r) => `M${l.map((p) => `${n(p[0])} ${n(p[1])}`).join('L')}L${r.reverse().map((p) => `${n(p[0])} ${n(p[1])}`).join('L')}Z`;
  const body = poly(edge(1), edge(-1));
  const belly = poly(edge(1, 0.42, -0.25), edge(-1, 0.42, -0.25));
  const marks = [];
  const step = tile * 0.36;
  for (let d = tile * 0.45; d < total - tile * 0.2; d += step) {
    const i = len.findIndex((v) => v >= d);
    const [x, y] = s[i];
    const [nx, ny] = normal(i);
    const ang = (Math.atan2(nx, -ny) * 180) / Math.PI;
    const h = half(i);
    const k = marks.length;
    let m;
    if (design === 'a') m = `<circle cx="${n(h * 0.3 * (k % 2 ? 1 : -1))}" cy="0" r="${n(h * 0.32)}"/>`;
    else if (design === 'b') m = `<rect x="${n(-h * 0.22)}" y="${n(-h)}" width="${n(h * 0.44)}" height="${n(2 * h)}" transform="skewX(-20)"/>`;
    else if (design === 'c') m = `<path d="M0 ${n(-h * 0.7)}L${n(h * 0.45)} 0L0 ${n(h * 0.7)}L${n(-h * 0.45)} 0Z"/>`;
    else m = `<path d="M${n(-h * 0.3)} ${n(-h * 0.75)}L${n(h * 0.25)} 0L${n(-h * 0.3)} ${n(h * 0.75)}" fill="none" stroke="${c.pattern}" stroke-width="${n(h * 0.28)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    marks.push(`<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)})">${m}</g>`);
  }
  const id = o.id ?? 'rb';
  const headAng = (() => { const [a, b] = [s[0], s[2]]; return (Math.atan2(a[1] - b[1], a[0] - b[0]) * 180) / Math.PI; })();
  const tailAng = (() => { const [a, b] = [s[s.length - 3], s[s.length - 1]]; return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI; })();
  const hs = (tile * 0.32) / 16; // the neck is 16 of the head canvas's 36 px, matched to the body's head width
  const head = headParts(design, o.frame ?? 'idle', c, `${id}-head`);
  const tail = tailParts(design, c);
  const ts = (tile * 0.12) / 10;
  return {
    defs: `<clipPath id="${id}-body"><path d="${body}"/></clipPath>${head.defs}`,
    body: [
      o.glow ? `<path d="${body}" fill="${o.glow}" fill-opacity="0.55" filter="url(#${id}-glow)"/>` : '',
      `<path d="${body}" fill="#000000" fill-opacity="0.18" transform="translate(${n(tile * 0.05)} ${n(tile * 0.07)})"/>`,
      `<g opacity="0.92">`,
      `<path d="${body}" fill="${c.base}"/>`,
      `<path d="${belly}" fill="${c.belly}" fill-opacity="0.7"/>`,
      `<g clip-path="url(#${id}-body)" fill="${c.pattern}">${marks.join('')}</g>`,
      `<path d="${body}" fill="none" stroke="${c.outline}" stroke-width="${n(Math.max(1.2, tile * 0.035))}" stroke-linejoin="round"/>`,
      `</g>`,
      `<g transform="translate(${n(s[s.length - 1][0])} ${n(s[s.length - 1][1])}) rotate(${n(tailAng)}) scale(${n(ts)}) translate(-1 -12)">${tail.body}</g>`,
      `<g transform="translate(${n(s[0][0])} ${n(s[0][1])}) rotate(${n(headAng)}) scale(${n(hs)}) translate(-6 -18)">${head.body}</g>`,
    ].join(''),
    glowDefs: `<filter id="${id}-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${n(tile * 0.06)}"/></filter>`,
    samples: s,
  };
};
