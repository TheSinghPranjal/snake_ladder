// Builds design/asset_library.html from the generated sources, so the page
// always shows exactly what the app ships.
//   node tool/assets/build_library.mjs   (after build_art.mjs and export_assets.py)
import fs from 'node:fs';
import path from 'node:path';
import { APP, GEOMETRY, THEMES, TOKENS, UI } from './lib/palette.mjs';
import { ribbon } from './lib/snake.mjs';
import { ROOT, contrast } from './lib/svg.mjs';
import { THEME_IDS, drawLadder, ladderDefs, renderBoard, tileBody } from './art/board.mjs';
import { ICONS } from './art/ui.mjs';

const specs = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets_src/specs.json'), 'utf8'));
const bySrcPath = Object.fromEntries(specs.filter((s) => s.src).map((s) => [s.out.replace(/^assets\//, '').replace(/\.png$/, ''), s]));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const uri = (rel) => `data:image/svg+xml;base64,${fs.readFileSync(path.join(ROOT, 'assets_src', `${rel}.svg`)).toString('base64')}`;
const exists = (rel) => !!bySrcPath[rel];
const MODES = ['light', 'dark'];
const THEME_NAMES = { sunshine: 'Classic Sunshine', sweets: 'Sugar Rush', jungle: 'Jungle Temple' };

// One cell: checkerboard, the image (both modes, CSS shows one), the file name.
// rel is a path without the mode suffix; pass mode=null for single-mode assets.
const cell = (rel, o = {}) => {
  const variants = o.single ? [[null, rel]] : MODES.map((m) => [m, `${rel}_${m}`]);
  const first = bySrcPath[variants[0][1]];
  const [w, h] = first.size;
  const scale = o.scale ?? (Math.max(w, h) <= 24 ? 4 : Math.max(w, h) <= 64 ? 2 : Math.max(w, h) <= 160 ? 1 : Math.min(1, 220 / Math.max(w, h)));
  const imgs = variants.map(([m, r]) => `<img${m ? ` class="only-${m}"` : ''} src="${uri(r)}" width="${Math.round(w * scale)}" height="${Math.round(h * scale)}" alt="${esc(r.split('/').pop())}" loading="lazy">`).join('');
  const name = o.single ? `${rel.split('/').pop()}.png` : `${rel.split('/').pop()}_{light|dark}.png`;
  return `<div class="cell${o.wide ? ' wide' : ''}"><div class="chk${o.dark ? ' chk-dark' : ''}"${o.bg ? ` style="background:${o.bg}"` : ''}>${imgs}</div><code>${esc(name)}</code>${o.note ? `<span class="meta">${esc(o.note)}</span>` : ''}</div>`;
};
const sheet = (title, cells, o = {}) => `<figure class="sheet"><figcaption>${esc(title)}${o.note ? `<span>${esc(o.note)}</span>` : ''}</figcaption><div class="grid"${o.min ? ` style="--min:${o.min}px"` : ''}>${cells.join('')}</div></figure>`;
const pair = (light, dark) => `<div class="only-light">${light}</div><div class="only-dark">${dark}</div>`;
const section = (id, title, note, body) => ({ id, title, html: `<section id="${id}" aria-labelledby="${id}-h"><h2 id="${id}-h">${esc(title)}</h2><p class="note">${esc(note)}</p>${body}</section>` });

const sections = [];

// ---------- Brand ----------
sections.push(section('brand', 'Brand', 'Logo lockup and wordmark in both modes, the launcher icon set, and the native splash images. The snake curls through the S of “Saga”.', [
  sheet('Logo', [cell('images/brand/logo_lockup', { scale: 0.6, wide: true }), cell('images/brand/logo_wordmark', { scale: 0.6, wide: true })], { min: 360 }),
  sheet('Launcher and splash', [
    cell('launcher/app_icon_1024', { single: true, scale: 0.18, note: 'iOS and store icon, no alpha' }),
    cell('launcher/app_icon_foreground', { single: true, scale: 0.42, note: 'adaptive foreground, 66% safe zone' }),
    cell('launcher/app_icon_background', { single: true, scale: 0.42, note: 'adaptive background' }),
    cell('launcher/splash_image_light', { single: true, scale: 0.22, note: 'on #FFF6E3' }),
    cell('launcher/splash_image_dark', { single: true, scale: 0.22, dark: true, note: 'on #14161F' }),
  ], { note: 'Single-size sources for flutter_launcher_icons and flutter_native_splash. Not bundled.' }),
].join('')));

// ---------- Board tiles ----------
sections.push(section('tiles', 'Board tiles', 'Two checker tiles, a start tile and a goal tile per theme, plus the 9-slice frame and the full-screen background. Square numbers are drawn in code (see Colour & type).', THEME_IDS.map((t) => sheet(THEME_NAMES[t], [
  ...['a', 'b', 'start', 'goal'].map((k) => cell(`sprites/${t}/tile_${k}`)),
  cell(`sprites/${t}/board_frame`, { scale: 0.75, note: '9-slice 32/32/32/32' }),
  cell(`sprites/${t}/board_bg`, { scale: 0.3, note: '360 × 780, cover' }),
])).join('')));

// ---------- Snakes ----------
const sampleSnake = (theme, mode) => {
  const p = THEMES[theme][mode];
  const T = 56;
  let tiles = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) tiles += tileBody(theme, mode, (r + c) % 2 ? 'b' : 'a', c * T, r * T, T / 64);
  const parts = [];
  const defs = [];
  ['a', 'b', 'c', 'd'].forEach((d, i) => {
    const x0 = 20 + i * 122;
    const rb = ribbon([[x0 + 20, 26], [x0 + 90, 64], [x0 + 20, 110], [x0 + 92, 150]], T, p.snakes[d], d, { id: `lib-${theme}-${mode}-${d}`, glow: p.glow });
    defs.push(rb.defs, rb.glowDefs);
    parts.push(rb.body);
  });
  return `<svg viewBox="0 0 504 168" class="scene" role="img" aria-label="${THEME_NAMES[theme]} snakes a to d, ${mode}"><defs>${defs.join('')}</defs>${tiles}${parts.join('')}</svg>`;
};
sections.push(section('snakes', 'Snakes', 'Snakes are drawn in code so they can stretch between any two squares. Each theme supplies four head designs (idle and two gulp frames), four tails and four tileable body patterns. Snake rank picks the design: (rank − 1) mod 4.', THEME_IDS.map((t) => sheet(THEME_NAMES[t], [
  ...['a', 'b', 'c', 'd'].flatMap((d) => ['idle', 'gulp1', 'gulp2'].map((f) => cell(`sprites/${t}/snake_head_${d}_${f}`, { scale: 2.4 }))),
  ...['a', 'b', 'c', 'd'].map((d) => cell(`sprites/${t}/snake_tail_${d}`, { scale: 3 })),
  ...['a', 'b', 'c', 'd'].map((d) => cell(`sprites/${t}/snake_pattern_${d}`, { scale: 2.5, bg: THEMES[t].light.snakes[d].base, note: 'shown on its body colour' })),
  `<div class="cell wide full">${pair(sampleSnake(t, 'light'), sampleSnake(t, 'dark'))}<code>rendered sample: designs a–d, as SnakePainter draws them</code></div>`,
], { note: 'Head anchor: the neck joint at (0.125, 0.5), facing right. Tail anchor: (0, 0.5). Body tapers 0.32 → 0.12 tile.' })).join('')));

// ---------- Ladders ----------
const sampleLadders = (mode) => {
  const T = 56;
  const parts = [];
  const defs = [];
  THEME_IDS.forEach((t, i) => {
    let tiles = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) tiles += tileBody(t, mode, (r + c) % 2 ? 'b' : 'a', i * 180 + c * T, r * T, T / 64);
    parts.push(tiles, drawLadder(t, mode, [i * 180 + 0.5 * T, 3.5 * T], [i * 180 + 2.5 * T, 0.5 * T], T, `lad-${t}-${mode}`));
    defs.push(ladderDefs(`lad-${t}-${mode}`));
  });
  return `<svg viewBox="0 0 528 224" class="scene" role="img" aria-label="Sample ladders, ${mode}"><defs>${defs.join('')}</defs>${parts.join('')}</svg>`;
};
sections.push(section('ladders', 'Ladders', `Painted from a tileable rail and a rung per theme. Rails sit ±${GEOMETRY.ladderRailOffset} tile from the centre line and rungs repeat about every ${GEOMETRY.ladderRungSpacing} tile. The shadow is the ladder itself at 18% black, offset (0.05, 0.07) tile.`, sheet('Rails, rungs and a drawn sample', [
  ...THEME_IDS.flatMap((t) => [cell(`sprites/${t}/ladder_rail`, { scale: 2.5, note: THEME_NAMES[t] }), cell(`sprites/${t}/ladder_rung`, { scale: 2.5 })]),
  `<div class="cell wide full">${pair(sampleLadders('light'), sampleLadders('dark'))}<code>blue painted rails · candy cane · vine and bamboo</code></div>`,
])));

// ---------- Tokens & avatars ----------
sections.push(section('tokens', 'Tokens & avatars', 'Pawns keep their hue in both modes and gain a light rim in dark mode. Each carries its colour-blind symbol: Red ★, Blue ●, Green ▲, Yellow ■. Twelve original animal avatars for the player strip.', [
  sheet('Tokens: idle, active, hop', [
    ...Object.keys(TOKENS).flatMap((c) => ['idle', 'active', 'hop'].map((s) => cell(`images/tokens/token_${c}_${s}`))),
    cell('images/tokens/token_shadow', { single: true, scale: 2 }),
  ], { note: 'Anchor bottom-centre (0.5, 0.92). Hop is the squashed landing pose.' }),
  sheet('Avatars', Array.from({ length: 12 }, (_, i) => cell(`images/tokens/avatar_${String(i + 1).padStart(2, '0')}`, { scale: 0.75 }))),
].join('')));

// ---------- Dice ----------
sections.push(section('dice', 'Dice', 'Six faces, eight tumble frames at about 88 ms each (~700 ms roll), a shadow, and the dice button in normal and pressed states.', [
  sheet('Faces', Array.from({ length: 6 }, (_, i) => cell(`images/dice/dice_face_${i + 1}`, { scale: 0.8 }))),
  sheet('Tumble frames', Array.from({ length: 8 }, (_, i) => cell(`images/dice/dice_roll_${String(i + 1).padStart(2, '0')}`, { scale: 0.7 }))),
  sheet('Button and shadow', [cell('images/dice/dice_button_bg_normal', { scale: 0.7 }), cell('images/dice/dice_button_bg_pressed', { scale: 0.7 }), cell('images/dice/dice_shadow', { single: true, scale: 1 })]),
].join('')));

// ---------- Buttons & panels ----------
const nine = (rel, ins, w, h, label, mode, ink) => {
  const s = bySrcPath[`${rel}_${mode}`];
  const [t, r, b, l] = [ins[1], ins[2], ins[3], ins[0]];
  return `<div class="nine only-${mode}" style="width:${w}px;height:${h}px;border-style:solid;border-width:${t}px ${r}px ${b}px ${l}px;border-image:url('${uri(`${rel}_${mode}`)}') ${t} ${r} ${b} ${l} fill stretch;color:${ink}"><span>${esc(label)}</span></div>`.replace('undefined', '') + (s ? '' : '');
};
const stretched = (rel, ins, w, h, label, inkLight, inkDark) => `<div class="cell wide"><div class="chk stretch">${nine(rel, ins, w, h, label, 'light', inkLight)}${nine(rel, ins, w, h, label, 'dark', inkDark)}</div><code>${esc(rel.split('/').pop())} stretched to ${w}×${h}</code></div>`;
sections.push(section('buttons', 'Buttons & panels', 'Buttons and panels are 9-slice: corners stay fixed and the middle stretches. Labels are drawn in code: Ink on Leaf, Coral and Cream, because white fails contrast there.', [
  sheet('Buttons', [
    ...['primary', 'secondary', 'danger', 'icon'].flatMap((k) => ['normal', 'pressed', 'disabled'].map((s) => cell(`images/ui/button_${k}_${s}`, { scale: 1.2 }))),
    stretched('images/ui/button_primary_normal', [24, 20, 24, 26], 260, 60, 'Play', UI.ink, UI.ink),
    stretched('images/ui/button_danger_normal', [24, 20, 24, 26], 220, 56, 'Quit to Home', UI.ink, UI.ink),
  ], { note: 'Insets left 24, top 20, right 24, bottom 26.' }),
  sheet('Panels', [
    ...['card', 'sheet', 'dialog', 'toast', 'turn_banner'].map((k) => cell(`images/ui/panel_${k}`, { scale: k === 'turn_banner' ? 0.8 : 1 })),
    stretched('images/ui/panel_toast', [24, 22, 24, 22], 260, 48, 'Extra roll!', '#FFFFFF', UI.ink),
    stretched('images/ui/panel_turn_banner', [64, 20, 64, 20], 340, 72, 'Your turn, Asha', UI.ink, UI.ink),
    stretched('images/ui/panel_card', [28, 28, 28, 28], 240, 110, 'Card', UI.ink, '#F2F3F7'),
  ]),
].join('')));

// ---------- Icons ----------
const iconCell = (name) => {
  const svg = ICONS[name];
  const mk = (color) => `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg>`;
  return `<div class="cell"><div class="chk"><span class="only-light">${mk(UI.ink)}</span><span class="only-dark icon-dark">${mk('#F2F3F7')}</span></div><code>ic_${name}.svg</code></div>`;
};
sections.push(section('icons', 'Icons', 'Single-colour SVGs on a 24 grid with a 2 px rounded stroke, tinted at runtime: Ink in light mode, #F2F3F7 in dark.', sheet('Runtime icons (assets/icons/)', Object.keys(ICONS).map(iconCell), { min: 104 })));

// ---------- Badges & effects ----------
sections.push(section('fx', 'Badges & effects', 'Sticker badges for big moments, confetti in six shapes and four token colours, and small effects for landings and wins.', [
  sheet('Badges', ['extra_roll', 'ladder', 'oops', 'winner'].map((b) => cell(`images/ui/badge_${b}`, { scale: 1 }))),
  sheet('Confetti', ['rect', 'circle', 'triangle', 'star', 'squiggle', 'curl'].flatMap((s) => ['red', 'blue', 'green', 'yellow'].map((c) => cell(`images/fx/confetti_${s}_${c}`, { scale: 3.5 }))), { min: 104 }),
  sheet('Effects', [cell('images/fx/sparkle_burst', { scale: 2 }), cell('images/fx/dust_puff', { scale: 2 }), cell('images/fx/star', { scale: 2.5 })]),
].join('')));

// ---------- Board cards ----------
sections.push(section('cards', 'Board cards', 'Thumbnails for the Board Select carousel, and the locked overlay laid on top until the unlock rule is met.', sheet('Cards', [
  ...THEME_IDS.map((t) => cell(`images/board/board_card_${t}`, { scale: 0.8, note: THEME_NAMES[t] })),
  cell('images/board/board_card_locked', { scale: 0.8, note: 'overlay' }),
  `<div class="cell"><div class="chk"><div class="stack only-light"><img src="${uri('images/board/board_card_sweets_light')}" width="192" height="192" alt=""><img src="${uri('images/board/board_card_locked_light')}" width="192" height="192" alt=""></div><div class="stack only-dark"><img src="${uri('images/board/board_card_sweets_dark')}" width="192" height="192" alt=""><img src="${uri('images/board/board_card_locked_dark')}" width="192" height="192" alt=""></div></div><code>locked Sugar Rush</code></div>`,
])));

// ---------- How to Play ----------
sections.push(section('howto', 'How-to-Play art', 'One illustration per card: roll and move, ladders, snakes, sixes, and landing exactly on 100.', sheet('Cards 1–5', Array.from({ length: 5 }, (_, i) => cell(`images/ui/how_to_${i + 1}`, { scale: 0.9 })), { min: 290 })));

// ---------- Colour & type ----------
const ratioCell = (fg, bg, need) => {
  const r = contrast(fg, bg);
  return `<td class="${r >= need ? 'pass' : 'fail'}">${r.toFixed(2)}</td>`;
};
// Worst snake design's outline against a tile.
const minCell = (p, tile) => {
  const r = Math.min(...Object.values(p.snakes).map((c) => contrast(c.outline, p[tile])));
  return `<td class="${r >= 3 ? 'pass' : 'fail'}">${r.toFixed(2)}</td>`;
};
const sw = (hex) => `<span class="sw" style="background:${hex}"></span><code>${hex}</code>`;
const themeTable = (theme) => {
  const rows = MODES.map((m) => {
    const p = THEMES[theme][m];
    return `<tr><th scope="row">${m}</th><td>${sw(p.tileA)}</td><td>${sw(p.tileB)}</td><td>${sw(p.frame)}</td><td>${sw(p.number)}</td>${ratioCell(p.number, p.tileA, 4.5)}${ratioCell(p.number, p.tileB, 4.5)}<td>${sw(p.ladderRail)}</td>${ratioCell(p.ladderOutline, p.tileA, 3)}${ratioCell(p.ladderOutline, p.tileB, 3)}${minCell(p, 'tileA')}${minCell(p, 'tileB')}</tr>`;
  }).join('');
  return `<div class="table-wrap"><table><caption>${THEME_NAMES[theme]}</caption><thead><tr><th></th><th>Tile A</th><th>Tile B</th><th>Frame</th><th>Number</th><th>Num/A</th><th>Num/B</th><th>Ladder</th><th>Ladder edge/A</th><th>Ladder edge/B</th><th>Snake edge/A</th><th>Snake edge/B</th></tr></thead><tbody>${rows}</tbody></table></div>`;
};
const appTable = () => {
  const keys = ['background', 'surface', 'surface2', 'text', 'textSecondary', 'primary', 'secondary', 'danger', 'accent', 'sun'];
  const head = `<tr><th></th>${keys.map((k) => `<th>${k}</th>`).join('')}</tr>`;
  const rows = MODES.map((m) => `<tr><th scope="row">${m}</th>${keys.map((k) => `<td>${sw(APP[m][k])}</td>`).join('')}</tr>`).join('');
  const checks = MODES.map((m) => {
    const a = APP[m];
    const c = [['Text on background', a.text, a.background, 4.5], ['Text on surface', a.text, a.surface, 4.5], ['Secondary on surface 2', a.textSecondary, a.surface2, 4.5], ['Ink on primary (large)', UI.ink, a.primary, 3], ['Ink on danger', UI.ink, a.danger, 4.5], ['Ink on accent', UI.ink, a.accent, 4.5]];
    return `<tr><th scope="row">${m}</th>${c.map(([, f, b, need]) => ratioCell(f, b, need)).join('')}</tr>`;
  }).join('');
  return `<div class="table-wrap"><table><caption>App UI tokens (AppColors)</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div><div class="table-wrap"><table><caption>App UI contrast (AA: 4.5 text, 3 large text and icons)</caption><thead><tr><th></th><th>Text/bg</th><th>Text/surface</th><th>Secondary/surface 2</th><th>Ink/primary</th><th>Ink/danger</th><th>Ink/accent</th></tr></thead><tbody>${checks}</tbody></table></div>`;
};
sections.push(section('specs', 'Colour & type specs', 'Light and dark palettes side by side, with the contrast ratios the Phase 4 theme test enforces. Green passes, red fails.', `<figure class="sheet"><figcaption>Board palettes</figcaption>${THEME_IDS.map(themeTable).join('')}</figure><figure class="sheet"><figcaption>App palette</figcaption>${appTable()}</figure><figure class="sheet"><figcaption>Type</figcaption><div class="type">
<p><span class="t-display">Snake Saga</span><code>Fredoka 700 · display, titles, badges</code></p>
<p><span class="t-num">42 57 100</span><code>number_style: Fredoka 600 · ${GEOMETRY.numberFontSize} tile · centred · halo stroke 0.07 tile at 85% in numberHalo</code></p>
<p><span class="t-body">Roll the die and move your token. Land on a ladder to climb.</span><code>Nunito 400 / 700 · body</code></p>
</div></figure>`));

// ---------- Audio ----------
const audioUri = (f) => `data:${f.endsWith('.ogg') ? 'audio/ogg' : 'audio/mp4'};base64,${fs.readFileSync(path.join(ROOT, 'assets/audio', f)).toString('base64')}`;
const SOUNDS = [['dice_shake', 'Dice rattle while tumbling'], ['dice_land', 'Dice lands'], ['hop', 'Each square a token hops'], ['ladder_climb', 'Rising chime on a ladder'], ['snake_slide', 'Descending whoop down a snake'], ['snake_gulp', 'Snake head gulps'], ['extra_roll', 'Rolled a 6'], ['blocked', 'Cannot move'], ['capture', 'Token sent home'], ['win_fanfare', 'Winner'], ['ui_tap', 'Button tap'], ['music_loop', '60 s seamless loop, 128 bpm']];
sections.push(section('audio', 'Audio', 'Synthesised by tool/synth_audio.py and released as CC0. OGG for Android, M4A for iOS, mono, peaks at or below −1 dBFS, each under 150 KB.', `<figure class="sheet"><figcaption>Sounds</figcaption><ul class="audio">${SOUNDS.map(([f, d]) => {
  const kb = (x) => (fs.statSync(path.join(ROOT, 'assets/audio', `${f}.${x}`)).size / 1024).toFixed(1);
  return `<li><div><code>${f}</code><span>${esc(d)}</span><span class="meta">ogg ${kb('ogg')} KB · m4a ${kb('m4a')} KB</span></div><audio controls preload="none"><source src="${audioUri(`${f}.m4a`)}" type="audio/mp4"><source src="${audioUri(`${f}.ogg`)}" type="audio/ogg"></audio></li>`;
}).join('')}</ul></figure>`));

// ---------- In context ----------
const mockup = (mode) => {
  const img = (rel) => uri(`${rel}_${mode}`);
  const p = THEMES.sunshine[mode];
  const app = APP[mode];
  const b = renderBoard('sunshine', mode, 22, 186, 346, { id: `ctx-${mode}`, snakeCount: 7 });
  const centre = (sq) => { const row = Math.floor((sq - 1) / 10); const cir = (sq - 1) % 10; const col = row % 2 === 0 ? cir : 9 - cir; return [22 + (col + 0.5) * 34.6, 186 + 346 - (row + 0.5) * 34.6]; };
  const tok = [['red', 42, -7], ['blue', 42, 7], ['green', 57, 0], ['yellow', 30, 0]];
  const tokens = tok.map(([c, sq, dx], i) => { const [x, y] = centre(sq); const s = sq === 42 ? 0.55 : 0.68; return `<image href="${uri('images/tokens/token_shadow')}" x="${x + dx - 13 * s * 1.4}" y="${y + 4}" width="${26 * s * 1.4}" height="${8 * s * 1.4}"/><image href="${img(`images/tokens/token_${c}_${i === 0 ? 'active' : 'idle'}`)}" x="${x + dx - 24 * s}" y="${y - 44 * s + 6}" width="${48 * s}" height="${48 * s}"/>`; }).join('');
  const strip = [['01', 'Asha', 42, 'red'], ['05', 'Ravi', 42, 'blue'], ['03', 'Kiwi', 57, 'green'], ['07', 'Mango', 30, 'yellow']].map(([av, name, sq, c], i) => {
    const x = 16 + i * 90;
    const on = i === 0;
    return `<g><rect x="${x}" y="112" width="84" height="56" rx="16" fill="${on ? app.surface2 : app.surface}" stroke="${on ? UI.sun : (mode === 'light' ? '#E3D9C3' : '#3A3F57')}" stroke-width="${on ? 3 : 1.5}"/><circle cx="${x + 22}" cy="140" r="17" fill="none" stroke="${TOKENS[c].base}" stroke-width="3"/><image href="${img(`images/tokens/avatar_${av}`)}" x="${x + 8}" y="126" width="28" height="28"/><text x="${x + 44}" y="136" class="m-name" fill="${app.text}">${name}</text><text x="${x + 44}" y="156" class="m-sq" fill="${app.textSecondary}">sq ${sq}</text></g>`;
  }).join('');
  const icon = (name, x, y, color) => `<svg x="${x}" y="${y}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  return `<svg viewBox="0 0 390 844" class="mock" role="img" aria-label="Game screen composed from the real assets, ${mode} mode">
<defs>${b.defs}<clipPath id="ctx-clip-${mode}"><rect width="390" height="844" rx="44"/></clipPath></defs>
<g clip-path="url(#ctx-clip-${mode})">
<image href="${img('sprites/sunshine/board_bg')}" width="390" height="844" preserveAspectRatio="xMidYMid slice"/>
<image href="${img('images/ui/button_icon_normal')}" x="14" y="56" width="44" height="47"/>${icon('pause', 24, 66, mode === 'light' ? UI.ink : '#F2F3F7')}
<text x="68" y="88" class="m-title" fill="${app.text}">Classic Sunshine</text>
<rect x="236" y="62" width="58" height="34" rx="17" fill="${app.surface}" stroke="${mode === 'light' ? '#E3D9C3' : '#3A3F57'}"/>${icon('snake', 244, 67, app.text)}<text x="281" y="85" class="m-chip" fill="${app.text}">7</text>
<rect x="300" y="62" width="76" height="34" rx="17" fill="${app.surface}" stroke="${mode === 'light' ? '#E3D9C3' : '#3A3F57'}"/><text x="338" y="85" class="m-chip" text-anchor="middle" fill="${app.text}">Turn 12</text>
${strip}
${b.body}
${tokens}
<rect x="8" y="560" width="374" height="270" rx="28" fill="${app.surface}" fill-opacity="0.94" stroke="${mode === 'light' ? '#E3D9C3' : '#3A3F57'}" stroke-width="2"/>
<rect x="85" y="576" width="220" height="40" rx="20" fill="${mode === 'light' ? UI.ink : '#F2F3F7'}"/><text x="195" y="602" class="m-status" text-anchor="middle" fill="${mode === 'light' ? '#FFFFFF' : UI.ink}">Ladder! 28 → 84</text>
<image href="${img('images/dice/dice_button_bg_normal')}" x="125" y="636" width="140" height="145"/>
<image href="${img('images/dice/dice_face_5')}" x="147" y="652" width="96" height="96"/>
<text x="195" y="812" class="m-hint" text-anchor="middle" fill="${app.textSecondary}">tap or swipe up</text>
<text x="${22 + 34.6 * 0.15}" y="${186 + 346 + 22}" class="m-hint" fill="${app.textSecondary}"> </text>
</g>
<rect x="1" y="1" width="388" height="842" rx="43" fill="none" stroke="${mode === 'light' ? '#2B2F3A' : '#000000'}" stroke-width="2"/>
</svg>`;
};
const rules = [
  'Outlines: a dark tint of the fill, never pure black. 2–3 px at 1x on sprites, 0.035 tile on snakes.',
  'Shading: two tones, the lower third about 8% darker, plus one white highlight blob at 40–65% opacity.',
  'Shadows: a 25% black ellipse blurred about 2 px under objects. Ladders cast themselves at 18%, offset (0.05, 0.07) tile.',
  'Spacing scale: 4, 8, 12, 16, 24, 32 dp. Screen gutter 16 dp. Minimum touch target 48 dp.',
  'Corner radii: buttons 20, cards 20, dialogs 26, sheets 28, board frame 0.42 tile.',
  'Motion: dice tumble ~700 ms (8 frames), hop 180 ms per square (90 ms Fast), ladder 120 ms per rung up to 1.2 s, snake slide 1.0–1.6 s, theme cross-fade 250 ms.',
  'Dark mode: designed night palettes, accents 10–15% less saturated. Tokens, dice and avatars gain a light rim. Snakes get a soft outer glow.',
  'Text on Leaf, Coral, Sky and Sun is Ink. Board numbers are Fredoka 600 with a halo, so snakes never hide them.',
  'Snake art never covers another snake\'s head or a ladder\'s foot, at 6, 7 or 8 snakes.',
];
sections.push(section('context', 'In context', 'The Classic Sunshine game screen at the default 7 snakes, composed from the real assets. Light above, dark below.', `<div class="context"><div class="mocks"><div class="mock-wrap">${mockup('light')}</div><div class="mock-wrap">${mockup('dark')}</div></div><figure class="sheet rules"><figcaption>Design rules</figcaption><ul>${rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></figure></div>`));

// ---------- page ----------
const nav = [['brand', 'Brand'], ['tiles', 'Tiles'], ['snakes', 'Snakes'], ['ladders', 'Ladders'], ['tokens', 'Tokens'], ['dice', 'Dice'], ['buttons', 'Buttons & panels'], ['icons', 'Icons'], ['fx', 'Badges & effects'], ['cards', 'Board cards'], ['howto', 'How to Play'], ['specs', 'Colour & type'], ['audio', 'Audio'], ['context', 'In context']];
const counts = { svg: specs.filter((s) => s.src).length, icons: specs.filter((s) => !s.src).length };

const html = `<title>snake_ladder Asset Library</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;700&display=swap">
<style>
/* Layout: a single-column catalogue of sprite sheets under a painted title band. */
:root{
  --jungle:#1F3B2D; --paper:#F1F4F8; --sheet:#FFFFFF; --muted:#566070; --line:#CBD3DD;
  --sun:#FFC93C; --road:#1C5FBF;
  --display:'Fredoka','Trebuchet MS',sans-serif; --body:'Nunito',system-ui,sans-serif;
  --pass:#1E7B3A; --fail:#B42318; --ink:#2A2A35;
  color-scheme: light;
}
*{box-sizing:border-box}
html{background:var(--paper)}
body{margin:0;background:var(--paper);color:var(--ink);font:400 16px/1.5 var(--body)}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--paper)}
@media (prefers-reduced-motion: no-preference){html{scroll-behavior:smooth}}
.band{background:var(--jungle);color:#FFFFFF;border-bottom:6px dashed var(--sun)}
.band-inner,.nav-inner,main{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.band-inner{padding-block:40px 36px}
h1{font-family:var(--display);font-weight:700;font-size:clamp(44px,8vw,72px);line-height:1;color:var(--sun);margin:0 0 14px}
.band p{color:#DDE3EC;max-width:62ch;margin:0}
nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--paper);border-bottom:1px solid var(--line)}
.nav-inner{display:flex;align-items:center;gap:20px;padding-block:10px}
nav ul{list-style:none;margin:0;padding:2px;display:flex;gap:16px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:thin}
nav a{font-family:var(--display);font-weight:500;font-size:17px;color:var(--road);text-decoration:none;white-space:nowrap}
nav a:hover{text-decoration:underline}
nav a:focus-visible,.toggle button:focus-visible{outline:2px solid var(--road);outline-offset:2px;border-radius:4px}
.toggle{display:flex;border:1px solid var(--line);border-radius:999px;padding:3px;background:var(--sheet);flex:none}
.toggle button{font-family:var(--display);font-weight:500;font-size:15px;border:0;background:none;color:var(--muted);padding:5px 14px;border-radius:999px;cursor:pointer}
.toggle button[aria-pressed="true"]{background:var(--jungle);color:#FFFFFF}
main{display:flex;flex-direction:column;gap:52px;padding-block:40px 72px}
section{display:flex;flex-direction:column;gap:18px;scroll-margin-top:72px}
h2{font-family:var(--display);font-weight:600;font-size:32px;line-height:1.1;margin:0}
.note{color:var(--muted);max-width:65ch;margin:-8px 0 0}
.sheet{margin:0;background:var(--sheet);border:1px solid var(--line);border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:14px;min-width:0}
.sheet figcaption{font-family:var(--display);font-weight:600;font-size:19px;display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline}
.sheet figcaption span{font-family:var(--body);font-weight:400;font-size:14px;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--min,150px)),1fr));gap:14px}
.cell{display:flex;flex-direction:column;gap:6px;min-width:0}
.cell.wide{grid-column:span 2}
.cell.full{grid-column:1/-1}
@media (max-width:520px){.cell.wide{grid-column:1/-1}}
.chk{display:flex;align-items:center;justify-content:center;gap:10px;min-height:112px;padding:12px;border-radius:10px;overflow:hidden;
  background-color:#FFFFFF;background-image:linear-gradient(45deg,#E9EDF2 25%,transparent 25%),linear-gradient(-45deg,#E9EDF2 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#E9EDF2 75%),linear-gradient(-45deg,transparent 75%,#E9EDF2 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0}
.chk-dark,[data-sprites="dark"] .chk{background-color:#20232F;background-image:linear-gradient(45deg,#2A2E3C 25%,transparent 25%),linear-gradient(-45deg,#2A2E3C 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2A2E3C 75%),linear-gradient(-45deg,transparent 75%,#2A2E3C 75%)}
.chk img{max-width:100%;height:auto}
.cell code,.meta{font:12px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);overflow-wrap:anywhere}
.meta{font-family:var(--body);font-size:12px}
[data-sprites="light"] .only-dark,[data-sprites="dark"] .only-light{display:none!important}
.scene{width:100%;height:auto;display:block;border-radius:8px}
.stretch{flex-direction:column;align-items:center}
.nine{display:flex;align-items:center;justify-content:center;max-width:100%;font-family:var(--display);font-weight:600;font-size:20px;box-sizing:border-box}
.nine span{margin:-14px}
.stack{display:grid}.stack img{grid-area:1/1}
.table-wrap{overflow-x:auto}
table{border-collapse:collapse;font-size:13px;margin-bottom:12px;min-width:640px}
caption{text-align:left;font-family:var(--display);font-weight:600;font-size:16px;padding-bottom:6px}
th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;white-space:nowrap;font-variant-numeric:tabular-nums}
thead th{font-weight:700;color:var(--muted);font-size:12px}
.sw{display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid rgba(0,0,0,.2);vertical-align:-2px;margin-right:6px}
td code{font-size:12px}
td.pass{color:var(--pass);font-weight:700}td.fail{color:var(--fail);font-weight:700}
.type{display:grid;gap:14px}.type p{margin:0;display:flex;flex-direction:column;gap:2px}
.type code{font-size:12px;color:var(--muted)}
.t-display{font-family:var(--display);font-weight:700;font-size:44px;line-height:1.1}
.t-num{font-family:var(--display);font-weight:600;font-size:30px;color:#2A2A35;-webkit-text-stroke:0}
.t-body{font-family:var(--body);font-size:17px}
.audio{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:12px}
.audio li{display:flex;flex-direction:column;gap:8px;border:1px solid var(--line);border-radius:10px;padding:12px}
.audio li div{display:flex;flex-direction:column}
.audio code{font:600 14px ui-monospace,Menlo,monospace}
.audio span{font-size:14px;color:var(--muted)}
audio{width:100%}
.context{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:28px;align-items:start}
@media (max-width:760px){.context{grid-template-columns:1fr}}
.mocks{display:flex;flex-direction:column;gap:28px;align-items:center}
.mock-wrap{width:min(390px,100%)}
.mock{width:100%;height:auto;display:block;filter:drop-shadow(0 6px 18px rgba(31,59,45,.18))}
.mock text{font-family:var(--display)}
.m-title{font-weight:600;font-size:20px}.m-name{font-weight:600;font-size:14px}.m-sq{font-family:var(--body);font-size:12px}
.m-chip{font-weight:600;font-size:15px}.m-status{font-weight:600;font-size:18px}.m-hint{font-family:var(--body);font-size:13px}
.rules ul{margin:0;padding-left:20px;display:grid;gap:10px}
</style>
<div data-sprites="light" id="root">
<header class="band"><div class="band-inner">
<h1>snake_ladder Asset Library</h1>
<p>Every image, sprite, icon and sound in Snake Saga, generated from hand-authored SVG and exported at 1×, 2× and 3×. ${counts.svg} art sources and ${counts.icons} runtime icons, each with a light and a night variant or tinted at runtime. Use the toggle to switch every sprite sheet between modes.</p>
</div></header>
<nav aria-label="Sections"><div class="nav-inner"><ul>${nav.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ul>
<div class="toggle" role="group" aria-label="Sprite mode"><button type="button" id="mode-light" aria-pressed="true">Light</button><button type="button" id="mode-dark" aria-pressed="false">Dark</button></div></div></nav>
<main>
${sections.map((s) => s.html).join('\n')}
</main>
</div>
<script>
(() => {
  const root = document.getElementById('root');
  const set = (m) => {
    root.dataset.sprites = m;
    document.getElementById('mode-light').setAttribute('aria-pressed', String(m === 'light'));
    document.getElementById('mode-dark').setAttribute('aria-pressed', String(m === 'dark'));
    try { localStorage.setItem('sprite-mode', m); } catch (e) {}
  };
  document.getElementById('mode-light').addEventListener('click', () => set('light'));
  document.getElementById('mode-dark').addEventListener('click', () => set('dark'));
  let saved = null;
  try { saved = localStorage.getItem('sprite-mode'); } catch (e) {}
  if (saved === 'dark') set('dark');
})();
</script>
`;

fs.mkdirSync(path.join(ROOT, 'design'), { recursive: true });
const docHtml = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${html}\n</html>\n`;
fs.writeFileSync(path.join(ROOT, 'design/asset_library.html'), docHtml);
if (process.env.ARTIFACT_OUT) fs.writeFileSync(process.env.ARTIFACT_OUT, html);
console.log(`design/asset_library.html ${(docHtml.length / 1024 / 1024).toFixed(2)} MB`);
