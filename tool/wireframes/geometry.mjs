// Board geometry shared by the layout designer and the wireframe generator.
// Mirrors docs/ARCHITECTURE.md section 6 and lib/domain/board/coords.dart.

export const centre = (n) => {
  const row = Math.floor((n - 1) / 10);
  const colInRow = (n - 1) % 10;
  const col = row % 2 === 0 ? colInRow : 9 - colInRow;
  return [(col + 0.5) / 10, 1 - (row + 0.5) / 10];
};

// Uniform Catmull-Rom through pts, end points duplicated as phantoms.
// Returns cubic Bezier segments [[p0, c1, c2, p3], ...].
export const toBeziers = (pts) => {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    out.push([
      p1,
      [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
      p2,
    ]);
  }
  return out;
};

export const sampleBeziers = (segs, perSeg = 16) => {
  const pts = [];
  segs.forEach(([a, b, c, d], si) => {
    for (let k = si === 0 ? 0 : 1; k <= perSeg; k++) {
      const t = k / perSeg;
      const u = 1 - t;
      pts.push([
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
      ]);
    }
  });
  return pts;
};

export const snakePoints = (jump) => [centre(jump.from), ...jump.path, centre(jump.to)];
export const snakeSamples = (jump, perSeg = 16) => sampleBeziers(toBeziers(snakePoints(jump)), perSeg);

export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export const distToSegment = (p, a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return dist(p, [a[0] + t * dx, a[1] + t * dy]);
};

const ccw = (a, b, c) => (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
export const segmentsCross = (a, b, c, d) => ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);

export const polyCrossings = (p, q) => {
  let n = 0;
  for (let i = 0; i < p.length - 1; i++) {
    for (let j = 0; j < q.length - 1; j++) {
      if (segmentsCross(p[i], p[i + 1], q[j], q[j + 1])) n++;
    }
  }
  return n;
};

export const selfCrosses = (p) => {
  for (let i = 0; i < p.length - 1; i++) {
    for (let j = i + 2; j < p.length - 1; j++) {
      if (segmentsCross(p[i], p[i + 1], p[j], p[j + 1])) return true;
    }
  }
  return false;
};

// Tile-relative clearance rules (1 tile = 0.1 board units).
export const TILE = 0.1;
export const HEAD_HALF = 0.16; // body half-width at the head, tiles
export const TAIL_HALF = 0.06; // body half-width at the tail, tiles
export const PROTECT = 0.26; // protected radius around a head or ladder foot, tiles
export const PROTECT_END = 0.16; // protected radius around a tail or ladder top, tiles

// Smallest slack (tiles) between a snake body and other jumps' end points.
// Negative means the body covers one of them.
export const snakeSlack = (samples, self, jumps) => {
  let min = Infinity;
  for (const j of jumps) {
    if (j.id === self.id) continue;
    const marks = [
      [centre(j.from), PROTECT],
      [centre(j.to), PROTECT_END],
    ];
    for (const [c, r] of marks) {
      samples.forEach((s, i) => {
        const half = HEAD_HALF + (TAIL_HALF - HEAD_HALF) * (i / (samples.length - 1));
        min = Math.min(min, dist(s, c) / TILE - half - r);
      });
    }
  }
  return min;
};

// BoardValidator from the brief, section 5.3.
export const validate = (board) => {
  const errors = [];
  const snakes = board.jumps.filter((j) => j.type === 'snake');
  const ranks = snakes.map((s) => s.rank).sort((a, b) => a - b);
  if (snakes.length !== 8 || ranks.join() !== '1,2,3,4,5,6,7,8') errors.push('needs 8 snakes ranked 1-8');
  for (const n of [6, 7, 8]) {
    const active = board.jumps.filter((j) => j.type === 'ladder' || j.rank <= n);
    const starts = new Set();
    for (const j of active) {
      if (j.from < 1 || j.from > 100 || j.to < 1 || j.to > 100) errors.push(`${j.id} out of range`);
      if (j.type === 'ladder' && j.to <= j.from) errors.push(`${j.id} ladder not rising`);
      if (j.type === 'snake' && j.to >= j.from) errors.push(`${j.id} snake not falling`);
      if (j.from === 100) errors.push(`${j.id} starts on 100`);
      if (j.type === 'snake' && j.from === 1) errors.push(`${j.id} head on 1`);
      if (starts.has(j.from)) errors.push(`${j.id} duplicate start`);
      starts.add(j.from);
      if (j.type === 'snake' && (!j.path || j.path.length < 2)) errors.push(`${j.id} path too short`);
    }
    for (const j of active) if (starts.has(j.to)) errors.push(`N=${n} ${j.id} chains`);
    const six = snakes.filter((s) => s.rank <= 6).map((s) => s.from);
    if (!six.some((h) => h >= 90)) errors.push('no always-on snake in the 90s');
    if (!six.some((h) => h >= 40 && h <= 89)) errors.push('no always-on snake in 40-89');
    if (!six.some((h) => h < 40)) errors.push('no always-on snake below 40');
  }
  return [...new Set(errors)];
};

// Two-player first-winner simulation with the default ruleset.
export const simulate = (jumps, games, rand = Math.random) => {
  const map = new Int16Array(101);
  for (let i = 0; i <= 100; i++) map[i] = i;
  for (const j of jumps) map[j.from] = j.to;
  const per = new Float64Array(games);
  for (let g = 0; g < games; g++) {
    const pos = [0, 0];
    const turns = [0, 0];
    let p = 0;
    let done = false;
    while (!done) {
      turns[p]++;
      const start = pos[p];
      let sixes = 0;
      for (;;) {
        const r = 1 + Math.floor(rand() * 6);
        sixes = r === 6 ? sixes + 1 : 0;
        if (sixes === 3) {
          pos[p] = start;
          break;
        }
        const n = pos[p] + r;
        if (n <= 100) pos[p] = map[n];
        if (pos[p] === 100) {
          done = true;
          break;
        }
        if (r !== 6) break;
      }
      p = 1 - p;
    }
    per[g] = (turns[0] + turns[1]) / 2;
  }
  const sorted = Array.from(per).sort((a, b) => a - b);
  return {
    mean: sorted.reduce((a, b) => a + b, 0) / games,
    median: sorted[Math.floor(games / 2)],
    max: sorted[games - 1],
  };
};

// Number of body samples running within 0.4 tile of a ladder centre line.
export const ladderHugging = (samples, ladderPolys) => samples.filter((pt) => ladderPolys.some(([a, b]) => distToSegment(pt, a, b) / TILE < 0.4)).length;

// Ladders should read as climbing: horizontal run at most 1.5x the rise.
export const ladderSteep = (from, to) => {
  const [ax, ay] = centre(from);
  const [bx, by] = centre(to);
  return Math.abs(bx - ax) <= 1.5 * Math.abs(by - ay);
};
