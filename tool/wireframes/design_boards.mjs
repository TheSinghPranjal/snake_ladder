// Designs board layouts and snake paths, then writes assets/boards/*.json.
// Run from the project root: node tool/wireframes/design_boards.mjs
// Seeded, so the output is reproducible.
import fs from 'node:fs';
import {
  centre, dist, distToSegment, polyCrossings, selfCrosses, simulate, snakeSamples,
  snakeSlack, TILE, validate, PROTECT, PROTECT_END, HEAD_HALF, TAIL_HALF, ladderHugging, ladderSteep,
} from './geometry.mjs';

const mulberry = (a) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const CLASSIC = {
  ladders: [[1, 38], [4, 14], [9, 31], [21, 42], [28, 84], [36, 44], [51, 67], [71, 91], [80, 100]],
  snakes: [[98, 78, 1], [87, 24, 2], [62, 19, 3], [49, 11, 4], [95, 75, 5], [16, 6, 6], [47, 26, 7], [64, 60, 8]],
};

const asJumps = ({ ladders, snakes }) => [
  ...ladders.map(([from, to], i) => ({ id: `L${i + 1}`, type: 'ladder', from, to })),
  ...snakes.map(([from, to, rank]) => ({ id: `S${rank}`, type: 'snake', rank, from, to, path: [] })),
];

const activeOf = (jumps, n) => jumps.filter((j) => j.type === 'ladder' || j.rank <= n);

// Ladders are straight, so a candidate layout must keep them off other end points.
const laddersClear = (jumps) => {
  for (const l of jumps.filter((j) => j.type === 'ladder')) {
    const a = centre(l.from);
    const b = centre(l.to);
    for (const o of jumps) {
      if (o.id === l.id) continue;
      for (const sq of [o.from, o.to]) {
        if (distToSegment(centre(sq), a, b) / TILE < 0.5) return false;
      }
    }
  }
  const ls = jumps.filter((j) => j.type === 'ladder');
  for (let i = 0; i < ls.length; i++) {
    for (let k = i + 1; k < ls.length; k++) {
      if (polyCrossings([centre(ls[i].from), centre(ls[i].to)], [centre(ls[k].from), centre(ls[k].to)])) return false;
    }
  }
  return true;
};

// Builds a layout one jump at a time, so every straight ladder stays clear of
// every other end point and no two ladders cross.
const LADDER_CLEAR = 0.45; // tiles from a ladder's centre line to any other end point
const randomLayout = (rand, nLadders, shape) => {
  const used = new Set([1, 100]);
  const lines = [];
  const nearLine = (sq) => lines.some(([a, b]) => distToSegment(centre(sq), a, b) / TILE < LADDER_CLEAR);
  const span = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  const ladders = [];
  for (let i = 0; i < nLadders; i++) {
    const [fLo, fHi, rLo, rHi] = shape.ladders[i];
    let ok = false;
    for (let t = 0; t < 300 && !ok; t++) {
      const foot = span(fLo, fHi);
      const top = Math.min(99, foot + span(rLo, rHi));
      if (used.has(foot) || used.has(top) || nearLine(foot) || nearLine(top)) continue;
      if (!ladderSteep(foot, top)) continue;
      const seg = [centre(foot), centre(top)];
      if ([...used].some((sq) => sq !== 1 && sq !== 100 && distToSegment(centre(sq), ...seg) / TILE < LADDER_CLEAR)) continue;
      if (lines.some((l) => polyCrossings(seg, l))) continue;
      used.add(foot); used.add(top); lines.push(seg); ladders.push([foot, top]); ok = true;
    }
    if (!ok) return null;
  }
  const snakes = [];
  for (const [rank, hLo, hHi, dLo, dHi] of shape.snakes) {
    let ok = false;
    for (let t = 0; t < 300 && !ok; t++) {
      const head = span(hLo, hHi);
      const tail = Math.max(2, head - span(dLo, dHi));
      if (used.has(head) || used.has(tail) || nearLine(head) || nearLine(tail)) continue;
      used.add(head); used.add(tail); snakes.push([head, tail, rank]); ok = true;
    }
    if (!ok) return null;
  }
  return { ladders, snakes };
};


// Finds a smooth winding path for one snake that clears every placed end point
// and does not cross any placed snake body. Returns null when none is found.
const solveOne = (s, placed, bodies, ladderPolys, rand, tries) => {
  const a = centre(s.from);
  const b = centre(s.to);
  const len = dist(a, b) / TILE;
  const nx = -(b[1] - a[1]) / (len * TILE);
  const ny = (b[0] - a[0]) / (len * TILE);
  let best = null;
  for (let t = 0; t < tries; t++) {
    const n = len < 2.6 ? 2 : len < 5 ? 2 + Math.floor(rand() * 2) : 3 + Math.floor(rand() * 2);
    const sign = rand() < 0.5 ? -1 : 1;
    const path = [];
    for (let i = 1; i <= n; i++) {
      const f = i / (n + 1) + (rand() - 0.5) * 0.12;
      const amp = (Math.min(0.35, 0.18 * len) + rand() * Math.min(1.25, 0.25 + len * 0.16)) * TILE * (i % 2 ? sign : -sign);
      path.push([r3(a[0] + (b[0] - a[0]) * f + nx * amp), r3(a[1] + (b[1] - a[1]) * f + ny * amp)]);
    }
    const cand = { ...s, path };
    const samples = snakeSamples(cand);
    if (samples.some(([x, y]) => x < 0.03 || x > 0.97 || y < 0.03 || y > 0.97)) continue;
    if (selfCrosses(samples)) continue;
    const slack = snakeSlack(samples, cand, placed);
    if (slack < 0) continue;
    if (bodies.some((bd) => polyCrossings(samples, bd) > 0)) continue;
    let arc = 0;
    for (let i = 1; i < samples.length; i++) arc += dist(samples[i - 1], samples[i]);
    const wind = arc / (len * TILE);
    if (wind > 1.3 + 0.5 / len) continue;
    let ladderX = 0;
    for (const l of ladderPolys) ladderX += polyCrossings(samples, l);
    const hug = ladderHugging(samples, ladderPolys);
    const score = -1.2 * ladderX - 0.12 * hug + Math.min(slack, 0.25) * 4 + Math.min(wind - 1, 0.18) * 12;
    if (!best || score > best.score) best = { score, path, samples, slack, ladderX };
  }
  return best;
};

// Distance check: is square sq clear of every placed snake body?
const clearOfBodies = (sq, bodies, radius) => bodies.every((bd) => bd.every((p, i) => {
  const half = HEAD_HALF + (TAIL_HALF - HEAD_HALF) * (i / (bd.length - 1));
  return dist(p, centre(sq)) / TILE - half - radius >= 0;
}));

// Builds a whole board incrementally: ladders, then each snake with its path.
const buildBoard = (rand, shape) => {
  const base = randomLayout(rand, shape.nLadders, { ...shape, snakes: [] });
  if (!base) return null;
  const jumps = asJumps(base);
  const used = new Set([1, 100, ...jumps.flatMap((j) => [j.from, j.to])]);
  const ladderPolys = jumps.map((l) => [centre(l.from), centre(l.to)]);
  const nearLine = (sq) => ladderPolys.some(([a, b]) => distToSegment(centre(sq), a, b) / TILE < LADDER_CLEAR);
  const bodies = [];
  const done = [];
  const span = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  for (const [rank, hLo, hHi, dLo, dHi] of shape.snakes) {
    let ok = false;
    for (let t = 0; t < 60 && !ok; t++) {
      const head = span(hLo, hHi);
      const tail = Math.max(2, head - span(dLo, dHi));
      if (used.has(head) || used.has(tail) || nearLine(head) || nearLine(tail)) continue;
      if (!clearOfBodies(head, bodies, PROTECT) || !clearOfBodies(tail, bodies, PROTECT_END)) continue;
      const s = { id: `S${rank}`, type: 'snake', rank, from: head, to: tail, path: [] };
      const best = solveOne(s, [...jumps, s], bodies, ladderPolys, rand, 700);
      if (!best) continue;
      s.path = best.path;
      jumps.push(s); used.add(head); used.add(tail); bodies.push(best.samples);
      done.push({ id: s.id, samples: best.samples, slack: best.slack, snakeX: 0, ladderX: best.ladderX });
      ok = true;
    }
    if (!ok) return null;
  }
  return { jumps, solved: { done } };
};

const SHAPES = {
  sugar_rush: {
    nLadders: 9, band: [26, 35],
    ladders: [[2, 9, 10, 22], [10, 18, 12, 22], [19, 27, 10, 24], [29, 37, 10, 20], [39, 47, 12, 26], [50, 57, 10, 20], [58, 66, 12, 22], [68, 75, 10, 18], [77, 86, 8, 14]],
    snakes: [[1, 92, 99, 18, 32], [2, 66, 89, 28, 50], [3, 22, 39, 12, 26], [4, 48, 65, 20, 36], [5, 90, 97, 12, 24], [6, 70, 86, 14, 28], [7, 40, 58, 10, 20], [8, 24, 38, 9, 16]],
  },
  jungle_temple: {
    nLadders: 8, band: [30, 38.5],
    ladders: [[2, 10, 9, 18], [12, 22, 10, 18], [24, 33, 10, 20], [35, 44, 10, 18], [46, 55, 10, 18], [57, 66, 10, 18], [67, 75, 9, 16], [77, 87, 8, 12]],
    snakes: [[1, 93, 99, 22, 40], [2, 70, 89, 34, 56], [3, 26, 39, 14, 26], [4, 50, 68, 22, 40], [5, 90, 97, 14, 30], [6, 72, 88, 18, 32], [7, 42, 60, 12, 24], [8, 18, 36, 9, 15]],
  },
};

const r3 = (v) => Math.round(v * 1000) / 1000;

// Random search for smooth, winding interior points with full clearance.
const solvePaths = (jumps, rand, tries = 5000) => {
  const snakes = jumps.filter((j) => j.type === 'snake').sort(
    (a, b) => dist(centre(b.from), centre(b.to)) - dist(centre(a.from), centre(a.to)),
  );
  const ladderPolys = jumps.filter((j) => j.type === 'ladder').map((l) => [centre(l.from), centre(l.to)]);
  const done = [];
  for (const s of snakes) {
    const a = centre(s.from);
    const b = centre(s.to);
    const len = dist(a, b) / TILE;
    const nx = -(b[1] - a[1]) / (len * TILE);
    const ny = (b[0] - a[0]) / (len * TILE);
    let best = null;
    for (let t = 0; t < tries; t++) {
      const n = len < 2.6 ? 2 : len < 5 ? 3 : 4;
      const sign = rand() < 0.5 ? -1 : 1;
      const path = [];
      for (let i = 1; i <= n; i++) {
        const f = i / (n + 1) + (rand() - 0.5) * 0.12;
        const amp = (Math.min(0.35, 0.18 * len) + rand() * Math.min(1.25, 0.25 + len * 0.16)) * TILE * (i % 2 ? sign : -sign);
        path.push([r3(a[0] + (b[0] - a[0]) * f + nx * amp), r3(a[1] + (b[1] - a[1]) * f + ny * amp)]);
      }
      const cand = { ...s, path };
      const samples = snakeSamples(cand);
      if (samples.some(([x, y]) => x < 0.03 || x > 0.97 || y < 0.03 || y > 0.97)) continue;
      if (selfCrosses(samples)) continue;
      const slack = snakeSlack(samples, cand, jumps);
      if (slack < 0) continue;
      let snakeX = 0;
      for (const d of done) snakeX += polyCrossings(samples, d.samples);
      let ladderX = 0;
      for (const l of ladderPolys) ladderX += polyCrossings(samples, l);
      let arc = 0;
      for (let i = 1; i < samples.length; i++) arc += dist(samples[i - 1], samples[i]);
      const wind = arc / (len * TILE);
      if (wind > 1.3 + 0.5 / len) continue;
      const hug = ladderHugging(samples, ladderPolys);
      const score = -8 * snakeX - 1.2 * ladderX - 0.12 * hug + Math.min(slack, 0.25) * 4 + Math.min(wind - 1, 0.18) * 12;
      if (!best || score > best.score) best = { score, cand, samples, slack, snakeX, ladderX };
    }
    if (!best) return { failed: s.id };
    s.path = best.cand.path;
    done.push({ id: s.id, samples: best.samples, slack: best.slack, snakeX: best.snakeX, ladderX: best.ladderX });
  }
  return { done };
};

const report = (id, jumps, solved) => {
  const rows = [6, 7, 8].map((n) => {
    const r = simulate(activeOf(jumps, n), 20000, mulberry(1000 + n));
    return `N=${n} mean=${r.mean.toFixed(2)} median=${r.median} max=${r.max}`;
  });
  const minSlack = Math.min(...solved.done.map((d) => d.slack));
  const snakeX = solved.done.reduce((a, d) => a + d.snakeX, 0);
  const ladderX = solved.done.reduce((a, d) => a + d.ladderX, 0);
  console.log(`\n${id}\n  ${rows.join('\n  ')}\n  min body slack ${minSlack.toFixed(3)} tiles, snake crossings ${snakeX}, snake-ladder crossings ${ladderX}`);
  console.log('  ladders', jumps.filter((j) => j.type === 'ladder').map((j) => `${j.from}>${j.to}`).join(' '));
  console.log('  snakes', jumps.filter((j) => j.type === 'snake').sort((a, b) => a.rank - b.rank).map((j) => `${j.from}>${j.to}(${j.rank})`).join(' '));
};

const write = (meta, jumps) => {
  const ordered = [
    ...jumps.filter((j) => j.type === 'ladder').map(({ id, type, from, to }) => ({ id, type, from, to })),
    ...jumps.filter((j) => j.type === 'snake').sort((a, b) => a.rank - b.rank).map(({ id, type, rank, from, to, path }) => ({ id, type, rank, from, to, path })),
  ];
  const lines = ordered.map((j) => `    ${JSON.stringify(j)}`).join(',\n');
  const body = `{\n  "id": ${JSON.stringify(meta.id)},\n  "name": ${JSON.stringify(meta.name)},\n  "theme": ${JSON.stringify(meta.theme)},\n  "size": 10,\n  "unlock": ${JSON.stringify(meta.unlock)},\n  "jumps": [\n${lines}\n  ]\n}\n`;
  fs.mkdirSync('assets/boards', { recursive: true });
  fs.writeFileSync(`assets/boards/${meta.id}.json`, body);
  const errs = validate(JSON.parse(body));
  if (errs.length) throw new Error(`${meta.id}: ${errs.join('; ')}`);
};

// Classic Sunshine: the layout is fixed, only paths are solved.
{
  const rand = mulberry(7);
  const jumps = asJumps(CLASSIC);
  let solved = { failed: 'none' };
  for (let i = 0; i < 4 && solved.failed; i++) solved = solvePaths(jumps, rand, 6000);
  if (solved.failed) throw new Error(`classic path failed: ${solved.failed}`);
  report('classic_sunshine', jumps, solved);
  write({ id: 'classic_sunshine', name: 'Classic Sunshine', theme: 'sunshine', unlock: { type: 'none' } }, jumps);
  const covered = [];
  for (const l of jumps.filter((j) => j.type === 'ladder')) {
    for (const o of jumps) {
      if (o.id === l.id) continue;
      for (const sq of [o.from, o.to]) {
        const d = distToSegment(centre(sq), centre(l.from), centre(l.to)) / TILE;
        if (d < 0.45) covered.push(`${l.from}>${l.to} passes ${d.toFixed(2)} tiles from square ${sq}`);
      }
    }
  }
  console.log('  fixed ladders near other end points:', covered.length ? covered.join('; ') : 'none');
}

const META = {
  sugar_rush: { id: 'sugar_rush', name: 'Sugar Rush', theme: 'sweets', unlock: { type: 'wins', count: 1 }, seed: 11 },
  jungle_temple: { id: 'jungle_temple', name: 'Jungle Temple', theme: 'jungle', unlock: { type: 'wins', count: 3 }, seed: 23 },
};

for (const [id, shape] of Object.entries(SHAPES)) {
  const rand = mulberry(META[id].seed);
  let found = false;
  let tried = 0;
  const stats = { layout: 0, balance: 0, paths: 0, crossing: 0 };
  while (!found && tried < 20000) {
    tried++;
    const built = buildBoard(rand, shape);
    if (!built) { stats.layout++; continue; }
    const { jumps, solved } = built;
    // Final full-board clearance check, since earlier snakes were solved before later end points existed.
    if (solved.done.some((d) => snakeSlack(d.samples, jumps.find((j) => j.id === d.id), jumps) < 0)) { stats.paths++; continue; }
    const s6 = simulate(activeOf(jumps, 6), 1500, rand).mean;
    const s8 = simulate(activeOf(jumps, 8), 1500, rand).mean;
    if (s6 < shape.band[0] || s8 > shape.band[1]) { stats.balance++; continue; }
    report(id, jumps, solved);
    write(META[id], jumps);
    found = true;
  }
  console.log(`  ${id}: ${found ? 'found' : 'NOT FOUND'} after ${tried} layouts`, JSON.stringify(stats));
}
console.log(`\nProtected radii: head/foot ${PROTECT} tile, tail/top ${PROTECT_END} tile`);
