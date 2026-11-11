// Generates every SVG art source into assets_src/ (and runtime icons into
// assets/icons/), the board palettes into assets/themes/, and a spec list that
// tool/export_assets.py turns into PNGs and assets/manifest.json.
//
//   cd tool/assets && npm install && node build_art.mjs
import fs from 'node:fs';
import path from 'node:path';
import { THEMES } from './lib/palette.mjs';
import { HEAD, PATTERN, TAIL, headParts, patternParts, tailParts } from './lib/snake.mjs';
import { ROOT, SRC, asset, doc, MODES, registry } from './lib/svg.mjs';
import { THEME_IDS, buildBoardArt } from './art/board.mjs';
import { buildPieces } from './art/pieces.mjs';
import { buildUi } from './art/ui.mjs';
import { buildExtras } from './art/extras.mjs';

fs.rmSync(SRC, { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'assets/icons'), { recursive: true, force: true });

buildBoardArt();

for (const theme of THEME_IDS) {
  for (const mode of MODES) {
    for (const design of ['a', 'b', 'c', 'd']) {
      const c = THEMES[theme][mode].snakes[design];
      for (const frame of ['idle', 'gulp1', 'gulp2']) {
        const h = headParts(design, frame, c, 'h');
        asset(`sprites/${theme}/snake_head_${design}_${frame}_${mode}`, doc(HEAD.w, HEAD.h, h.body, { defs: h.defs, title: `${theme} snake head ${design} ${frame} ${mode}` }),
          { size: [HEAD.w, HEAD.h], anchor: HEAD.anchor, modes: [mode], screens: ['game'], group: 'snake', theme, note: 'faces right; anchor is the neck joint' });
      }
      const t = tailParts(design, c);
      asset(`sprites/${theme}/snake_tail_${design}_${mode}`, doc(TAIL.w, TAIL.h, t.body, { title: `${theme} snake tail ${design} ${mode}` }),
        { size: [TAIL.w, TAIL.h], anchor: TAIL.anchor, modes: [mode], screens: ['game'], group: 'snake', theme });
      const p = patternParts(design, c);
      asset(`sprites/${theme}/snake_pattern_${design}_${mode}`, doc(PATTERN.w, PATTERN.h, p.body, { defs: p.defs, title: `${theme} snake pattern ${design} ${mode}` }),
        { size: [PATTERN.w, PATTERN.h], tile: 'horizontal', modes: [mode], screens: ['game'], group: 'snake', theme });
    }
  }
}

buildPieces();
buildUi();
buildExtras();

fs.writeFileSync(path.join(SRC, 'specs.json'), `${JSON.stringify(registry, null, 1)}\n`);
console.log(`${registry.length} assets (${registry.filter((r) => r.src).length} SVG sources, ${registry.filter((r) => !r.src).length} runtime SVG icons)`);
