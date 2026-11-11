// Builds design/wireframes.html from the board JSON and the sketch primitives.
// Run from the project root: node tool/wireframes/build_wireframes.mjs
import fs from 'node:fs';
import { C, Sheet, drawBoard, drawTokens, boardPoint } from './sketch.mjs';
import {
  BOARD, PLAYERS2, PLAYERS4, boardSelect, dialog, gameScreen, home, houseRules, howTo, hopTrail,
  jumpPath, modeSelect, pauseSheet, pointOnJump, playerSetup, ribbon, scrim, settings, splash, statsScreen,
  tabletGame, tabletHome, toast, winScreen,
} from './screens.mjs';

const ids = ['classic_sunshine', 'sugar_rush', 'jungle_temple'];
const boards = Object.fromEntries(ids.map((id) => [id, JSON.parse(fs.readFileSync(`assets/boards/${id}.json`, 'utf8'))]));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const figure = (svg, title, items = [], o = {}) => `
<figure${o.id ? ` id="${o.id}"` : ''}>
  <div class="scroll">${svg}</div>
  <figcaption><strong>${esc(title)}</strong>${items.length ? `<ol>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>` : ''}${o.note ? `<p>${esc(o.note)}</p>` : ''}</figcaption>
</figure>`;

// A phone sheet with a right-hand margin for notes. notes: [y, lines, [tx, ty] phone-local].
const phoneSheet = (label, draw, notes = [], o = {}) => {
  const s = new Sheet(650, 880, label);
  if (o.dark) s.dark(true);
  s.phone(10, 18, () => draw(s));
  s.dark(false);
  for (const [y, lines, target] of notes) s.note(414, y, lines, target ? [10 + target[0], 18 + target[1]] : null, { size: 21 });
  return s.render(label);
};

const p = (n) => n; // readability marker for phone-local coordinates
const sections = [];
const add = (id, title, note, grid, figs) => sections.push({ id, title, note, grid, figs });

// ---------- 1. Flow ----------
{
  const s = new Sheet(1420, 790, 'App map');
  const box = (x, y, label, o = {}) => {
    s.rect(x, y, o.w ?? 150, o.h ?? 74, { r: 14, sw: o.main ? 3 : 2, fill: o.main ? C.fill2 : C.paper, dash: o.dlg ? '6 5' : null });
    s.text(x + (o.w ?? 150) / 2, y + (o.h ?? 74) / 2 + 8, label, { size: 23, anchor: 'middle' });
  };
  const arrow = (d, o = {}) => s.path(d, { sw: 2, marker: 'arrInk', markerStart: o.both ? 'arrInkStart' : null });
  const lab = (x, y, t, o = {}) => s.text(x, y, t, { size: 18, fill: C.muted, anchor: o.anchor ?? 'start' });
  box(30, 340, 'Splash');
  box(270, 340, 'Home', { main: true });
  box(500, 340, 'Mode Select');
  box(730, 340, 'Player Setup');
  box(960, 340, 'Game', { main: true });
  box(1240, 340, 'Win');
  box(20, 130, 'How to Play');
  box(205, 130, 'Stats', { w: 120 });
  box(730, 130, 'Board Select');
  box(960, 130, 'Pause sheet', { dlg: true });
  box(1240, 130, 'Quit confirm', { dlg: true });
  box(225, 600, 'Settings');
  box(470, 560, 'House Rules');
  box(470, 670, 'Reset confirm', { dlg: true });
  arrow('M180 377H266');
  lab(186, 368, 'auto');
  arrow('M420 377H496', { both: true });
  lab(428, 368, 'Play');
  arrow('M650 377H726', { both: true });
  arrow('M880 377H956');
  lab(886, 368, 'Start');
  arrow('M1110 362H1236');
  lab(1124, 354, 'game over');
  arrow('M1240 396H1114');
  lab(1146, 422, 'Play again');
  arrow('M95 204V290H285V336', { both: true });
  arrow('M265 204V336', { both: true });
  lab(150, 284, 'How to Play');
  lab(272, 240, 'stats chip');
  arrow('M405 340V167H726', { both: true });
  lab(430, 158, 'Boards');
  arrow('M805 336V208', { both: true });
  lab(798, 262, 'Change board', { anchor: 'end' });
  arrow('M985 336V208');
  lab(979, 280, 'pause / back', { anchor: 'end' });
  arrow('M1040 208V336');
  s.text(1045, 300, 'Resume', { size: 16, fill: C.muted });
  arrow('M1098 208V336');
  lab(1104, 316, 'Restart');
  arrow('M1110 160H1236');
  lab(1122, 150, 'Quit');
  arrow('M1240 186H1114');
  lab(1124, 208, 'Cancel');
  arrow('M1290 130V60H385V336');
  lab(700, 52, 'Quit (confirm) · save deleted', { anchor: 'middle' });
  arrow('M1390 360H1405V30H345V336');
  lab(700, 24, 'Home', { anchor: 'middle' });
  arrow('M405 414V470H1000V418');
  lab(700, 462, 'Quick Play · Classic, 1 Normal bot', { anchor: 'middle' });
  arrow('M365 414V505H1040V418');
  lab(700, 497, 'Continue · resumes saved game', { anchor: 'middle' });
  arrow('M300 414V596', { both: true });
  lab(306, 560, 'Settings');
  arrow('M375 625H420V597H466', { both: true });
  arrow('M375 650H420V707H466', { both: true });
  s.callout(560, 505, 1);
  s.callout(560, 470, 2);
  s.callout(1290, 100, 3);
  s.callout(1128, 416, 4);
  s.rect(760, 590, 620, 160, { r: 14, sw: 1.4, dash: '4 6' });
  s.text(780, 626, 'Legend', { size: 22 });
  s.path('M780 660H850', { sw: 2, marker: 'arrInk' });
  s.text(866, 666, 'one-way navigation', { size: 19 });
  s.path('M780 694H850', { sw: 2, marker: 'arrInk', markerStart: 'arrInkStart' });
  s.text(866, 700, 'opens, and Back returns', { size: 19 });
  s.rect(780, 716, 60, 26, { r: 8, sw: 2, dash: '6 5' });
  s.text(866, 736, 'sheet or dialog over the screen below', { size: 19 });
  s.note(1130, 520, ['Android Back on Game opens', 'Pause; it never leaves the game'], [1100, 422], { size: 19, from: [1124, 508] });
  add('flow', 'Flow', 'Every screen and every way between them.', 'wide', [
    figure(s.render('App map of all eleven screens and their navigation paths'), 'App map', [
      'Continue on Home resumes the autosaved game at its last roll.',
      'Quick Play skips setup: Classic Sunshine, you vs 1 Normal bot, default rules.',
      'Pause → Quit asks first, then deletes the save and returns Home.',
      'Win → Play again restarts with the same players, board and snake count.',
    ]),
  ]);
}

// ---------- 2. Start ----------
add('start', 'Start', 'First launch, Home in both states, and How to Play.', 'four', [
  figure(phoneSheet('Splash', (s) => splash(s), [
    [250, ['logo animates in,', 'snake curls through', 'a letter'], [p(200), p(260)]],
    [560, ['preloads board', 'sprites and sounds,', 'then goes to Home'], [p(300), p(566)]],
  ]), 'Splash', ['Logo lockup with a short curl animation.', 'Progress while assets preload (about 1–2 s).']),
  figure(phoneSheet('Home, no saved game', (s) => home(s), [
    [380, ['Play → Mode Select'], [p(358), p(406)]],
    [490, ['one tap: you vs', '1 Normal bot'], [p(358), p(503)]],
    [90, ['wins chip opens', 'Stats'], [p(148), p(83)]],
  ]), 'Home (no saved game)', ['Play is the largest target.', 'Quick Play starts a game in one tap.', 'Stats chip shows games won.']),
  figure(phoneSheet('Home with Continue', (s) => home(s, { continue: true }), [
    [320, ['only shown when a', 'valid save exists'], [p(358), p(344)]],
    [430, ['New game asks first:', '"Start over? Your saved', 'game will be lost."'], [p(358), p(440)]],
  ]), 'Home (with Continue)', ['Continue shows board and turn.', 'New game replaces the save after a confirm.', 'Stats chip.']),
  figure(phoneSheet('How to Play card 1', (s) => howTo(s, 0, '1. Roll and move', () => s.xbox(48, 150, 294, 280, { r: 20 })), [
    [200, ['swipe left/right', 'between 5 cards'], [p(340), p(300)]],
    [96, ['Skip closes from', 'any card'], [p(356), p(88)]],
  ]), 'How to Play, card 1', [], { note: 'Cards: 1 Roll and move · 2 Ladders · 3 Snakes · 4 Sixes and extra rolls · 5 Land exactly on 100.' }),
  figure(phoneSheet('How to Play card 3', (s) => howTo(s, 2, '3. Snakes slide you down', () => {
    const mini = { name: 'mini', jumps: [] };
    drawBoard(s, 70, 150, 250, mini, 0, { numbers: false, thin: true });
    s.path('M120 180C210 190 140 290 250 300S230 380 290 380', { sw: 10 });
    s.path('M120 180C210 190 140 290 250 300S230 380 290 380', { sw: 6, stroke: s.c.bg });
    s.circle(120, 180, 13, { sw: 2, fill: s.c.bg });
    s.token(160, 214, 12, 0, {});
    s.path('M186 236q20 30 10 60', { sw: 1.6, dash: '4 4', marker: 'arrInk' });
  }), [
    [240, ['illustrations are', 'animated loops,', 'still under reduce', 'motion'], [p(300), p(260)]],
  ]), 'How to Play, card 3', []),
]);

// ---------- 3. Setup ----------
add('setup', 'Setup', 'Choosing a mode, players, snake count and board.', 'four', [
  figure(phoneSheet('Mode Select', (s) => modeSelect(s), [
    [250, ['needs 1+ human', 'and 1+ bot'], [p(366), p(256)]],
    [520, ['all humans, no', 'Human/Bot toggle'], [p(366), p(520)]],
  ]), 'Mode Select', ['vs Computer → Player Setup with Human/Bot toggles.', 'Pass & Play → Player Setup, all human.']),
  figure(phoneSheet('Player Setup, 2 players', (s) => playerSetup(s, boards, { count: 2, bots: [1], mode: 'vs' }), [
    [140, ['2 / 3 / 4 players'], [p(366), p(148)]],
    [250, ['tap name to edit,', 'max 12 chars,', 'unique'], [p(200), p(214)]],
    [390, ['colours already', 'taken are dashed'], [p(150), p(236)]],
    [520, ['live preview adds', 'and removes snakes'], [p(366), p(450)]],
  ]), 'Player Setup (2 players, vs Computer)', ['Player count.', 'Player row: avatar, name, colour + symbol, Human/Bot.', 'Mini board preview for the selected board.', 'Snakes stepper 6–8, default from Settings.']),
  figure(phoneSheet('Player Setup, 4 players with 2 bots', (s) => playerSetup(s, boards, { count: 4, bots: [2, 3], mode: 'vs' }), [
    [330, ['bots get Easy /', 'Normal and names', 'Bot Kiwi, Mango,', 'Pepper'], [p(364), p(398)]],
    [640, ['"Change ›" opens', 'Board Select'], [p(200), p(673)]],
    [760, ['disabled until', 'names are valid'], [p(366), p(796)]],
  ]), 'Player Setup (4 players, 2 bots)', ['Player count.', 'Each row repeats; bots show difficulty.', 'Mini board preview.', 'Snakes stepper.']),
  figure(phoneSheet('Board Select with a locked board', (s) => boardSelect(s, boards), [
    [180, ['swipe; neighbours', 'peek at the edges'], [p(374), p(240)]],
    [300, ['locked: preview', 'dimmed, lock, and', 'the unlock hint'], [p(240), p(290)]],
    [760, ['becomes "Use this', 'board" when', 'unlocked'], [p(366), p(790)]],
  ]), 'Board Select (with a locked board)', ['Board card with thumbnail.', 'Locked state and progress.', 'Selected board (✓) and next board peek.', 'Select button.']),
]);

// ---------- 4. Game ----------
{
  const s = new Sheet(1420, 900, 'Game screen, annotated');
  const X = 515;
  const Y = 28;
  s.phone(X, Y, () => {
    gameScreen(s, boards, {
      players: PLAYERS4,
      tokens: PLAYERS4.map((pl, i) => ({ sq: pl.sq, color: pl.color, active: i === 0 })),
      status: 'Ladder! 28 → 84',
    });
    s.callout(8, 60, 1);
    s.callout(110, 54, 2);
    s.callout(250, 52, 3);
    s.callout(378, 54, 4);
    s.callout(18, 112, 5);
    s.callout(16, 186, 6);
    s.callout(110, 584, 10);
    s.callout(140, 642, 11);
    s.callout(22, 548, 9);
  });
  const P = (x, y) => [X + x, Y + y];
  const b = boards.classic_sunshine;
  const at = (sq) => { const [x, y] = boardPoint(BOARD.x, BOARD.y, BOARD.size, sq); return P(x, y); };
  s.callout(at(87)[0] + 16, at(87)[1] - 16, 7);
  s.callout(at(28)[0] + 4, at(28)[1] + 20, 8);
  s.callout(at(42)[0] + 20, at(42)[1] + 18, 12);
  const L = (y, lines, t) => s.note(470, y, lines, t, { anchor: 'end', size: 21 });
  const R = (y, lines, t) => s.note(950, y, lines, t, { size: 21 });
  L(70, ['Pause, also Android Back.', 'Opens the Pause sheet.'], P(14, 82));
  L(160, ['Active player is filled and', 'pulsing. Tap a chip for that', "player's stats so far."], P(16, 140));
  L(300, ['Board: min(width − 32,', 'height × 0.62, 640). Numbers', 'have a soft halo so snakes', 'never hide them.'], P(16, 260));
  L(440, ['Long-press a snake or', 'ladder: "87 → 24".'], at(87));
  L(560, ['Start pad holds tokens', 'at position 0.'], P(16, 560));
  L(700, ['Status line, announced to', 'screen readers.'], P(110, 600));
  R(80, ['Snake count chip and', 'turn counter.'], P(300, 82));
  R(250, ['Ladders drawn as two rails', 'with rungs; climb follows', 'the rails.'], at(56));
  R(400, ['Shared square: 2 tokens sit', 'side by side, 3–4 form a', '2×2 cluster.'], at(42));
  R(620, ['Tap or swipe up to roll.', 'Disabled while animating', 'and during bot turns.'], P(255, 700));
  R(780, ['48 dp minimum targets.', 'Dice placement: centre', '(see decisions box).'], P(255, 760));
  const wide = figure(s.render('Game screen, fully annotated'), 'Game screen, annotated', [
    'Pause.', 'Board name.', 'Snake count chip.', 'Turn counter.', 'Player strip, active player highlighted.',
    'Board with numbers, ladders, snakes.', 'Snake (head, body, tail).', 'Ladder foot.', 'Start pad.',
    'Status line.', 'Dice button.', 'Two tokens sharing square 42.',
  ]);

  const st = (label, opts, notes, title, items) => figure(phoneSheet(label, (sh) => gameScreen(sh, boards, opts(sh)), notes), title, items);
  const states = [
    st('Awaiting roll', () => ({ status: 'Your turn, Asha', extra: undefined }), [
      [600, ['dice enabled,', 'gentle bob hint'], [p(255), p(660)]],
      [140, ['active chip pulses'], [p(180), p(140)]],
    ], 'Awaiting roll', ['Dice is the only call to action.']),
    st('Dice rolling', () => ({ status: 'Rolling…', dice: { face: 3, rolling: true, hint: '' } }), [
      [600, ['~700 ms tumble,', 'squash and stretch,', 'lands with a bounce', 'and a haptic tick'], [p(262), p(700)]],
    ], 'Dice rolling', ['Faces cycle; button is disabled.']),
    st('Token hopping', (sh) => ({
      status: 'Rolled a 5', dice: { face: 5, disabled: true },
      tokens: [{ sq: 35, color: 0, active: true }, { sq: 17, color: 1 }],
      beforeTokens: () => hopTrail(sh, 30, 35),
    }), [
      [330, ['one hop per square,', '180 ms each (90 ms', 'Fast), tick sound', 'on each landing'], [p(150), p(370)]],
    ], 'Token hopping (motion trail)', ['30 → 35, five hops; shadow shrinks at each peak.']),
    st('Ladder climb', () => ({
      status: 'Ladder! 28 → 84', dice: { face: 1, disabled: true }, highlight: 'L5',
      tokens: [{ pt: pointOnJump(boards.classic_sunshine, 'L5', 0.55), color: 0, active: true }, { sq: 17, color: 1 }],
    }), [
      [300, ['climbs along the', 'rails, 120 ms per', 'rung, max 1.2 s,', 'rising chime'], [p(220), p(330)]],
    ], 'Ladder climb', ['Highlighted ladder; token mid-climb.']),
    st('Snake slide', (sh) => ({
      status: 'Oops, snake! 98 → 78', dice: { face: 4, disabled: true }, highlight: 'S1',
      tokens: [{ pt: pointOnJump(boards.classic_sunshine, 'S1', 0.5), color: 0, active: true }, { sq: 64, color: 1 }],
      extra: () => sh.path(jumpPath(boards.classic_sunshine, 'S1'), { sw: 1.4, dash: '3 5', stroke: C.ink }),
    }), [
      [210, ['head "gulps", then', 'the token follows', 'the drawn body,', '1.0–1.6 s'], [p(60), p(206)]],
    ], 'Snake slide', ['Same curve for drawing and sliding.']),
    st('Extra-roll toast', (sh) => ({
      status: 'Rolled a 6', dice: { face: 6 },
      extra: () => toast(sh, 470, 'Extra roll!'),
    }), [
      [470, ['toast 1.2 s, then', 'dice re-enables', 'for the same player'], [p(320), p(496)]],
    ], 'Extra-roll toast', []),
    st('Three sixes penalty', (sh) => ({
      status: 'Three 6s! Back to 44', dice: { face: 6, disabled: true },
      tokens: [{ sq: 44, color: 0, active: true }, { sq: 17, color: 1 }],
      extra: () => { toast(sh, 470, 'Three 6s!', { w: 230 }); sh.path(`M${boardPoint(16, 180, 358, 62)[0]} ${boardPoint(16, 180, 358, 62)[1]}Q120 300 ${boardPoint(16, 180, 358, 44)[0]} ${boardPoint(16, 180, 358, 44)[1] - 10}`, { sw: 1.8, dash: '4 4', marker: 'arrInk' }); },
    }), [
      [300, ['token returns to', 'where the turn', 'started, then the', 'turn passes'], [p(210), p(300)]],
    ], 'Three-6s penalty', []),
    st('Need exactly 3', (sh) => ({
      status: 'Need exactly 3 to win', dice: { face: 5, disabled: true },
      tokens: [{ sq: 97, color: 0, active: true }, { sq: 64, color: 1 }],
      extra: () => { const [x, y] = boardPoint(16, 180, 358, 97); sh.path(`M${x - 22} ${y - 8}l-6 8l6 8M${x + 22} ${y - 8}l6 8l-6 8`, { sw: 2 }); },
    }), [
      [200, ['"can\'t move" shake,', 'blocked sound,', 'turn passes'], [p(90), p(200)]],
    ], '"Need exactly 3" blocked', ['With Bounce back on, the token bounces instead.']),
    st('Pass and Play turn banner', (sh) => ({
      players: PLAYERS4.map((pl) => ({ ...pl, name: pl.name.replace('Bot ', '') })), active: 1, status: 'Your turn, Ravi',
      tokens: PLAYERS4.map((pl, i) => ({ sq: pl.sq, color: pl.color, active: i === 1 })),
      extra: () => { scrim(sh); ribbon(sh, 330, 'Your turn, Ravi'); },
    }), [
      [340, ['shown on every', 'turn change; tap', 'or 1.5 s to dismiss'], [p(370), p(370)]],
    ], 'Pass & Play turn banner', []),
    st('Bot thinking', () => ({
      active: 1, thinking: 1, status: 'Bot Kiwi is thinking…', dice: { face: 2, disabled: true, hint: 'bot turn' },
    }), [
      [120, ['three-dot bubble', 'on the bot chip'], [p(340), p(108)]],
      [600, ['600 ms (Normal) or', '900 ms (Easy),', 'halved in Fast'], [p(255), p(700)]],
    ], 'Bot thinking', []),
  ];
  add('game', 'Game', 'The most important screen, then each state of a turn.', 'wide', [wide]);
  sections.push({ id: 'game-states', title: null, grid: 'four', figs: states });
}

// ---------- 5. Overlays ----------
add('overlays', 'Overlays', 'Pause, quitting, and both kinds of win.', 'four', [
  figure(phoneSheet('Pause sheet', (s) => pauseSheet(s, boards), [
    [430, ['bottom sheet;', 'tap outside or', 'drag down resumes'], [p(330), p(380)]],
    [690, ['quick theme toggle,', 'same as Settings', '› Appearance'], [p(366), p(694)]],
  ]), 'Pause sheet', ['Resume.', 'Restart (asks to confirm) and Rules summary.', 'Sound, Music, Haptics.', 'Theme.', 'Quit to Home.']),
  figure(phoneSheet('Quit confirm', (s) => { pauseSheet(s, boards, { callouts: false }); s.layer(); scrim(s); dialog(s, 'Quit to Home?', ['This game ends and', "won't be saved."], 'Keep playing', 'Quit'); }, [
    [500, ['Quit deletes the', 'save; Keep playing', 'returns to Pause'], [p(338), p(500)]],
  ]), 'Quit confirm', []),
  figure(phoneSheet('Win screen, first winner', (s) => winScreen(s), [
    [120, ['confetti ≤ 3 s,', 'tap to skip;', 'static badge under', 'reduce motion'], [p(330), p(110)]],
    [520, ['stats for this', 'game'], [p(366), p(540)]],
  ]), 'Win screen (first winner)', [], { note: 'Others show the square they reached. Play again keeps players, board and snake count.' }),
  figure(phoneSheet('Win screen, full ranking', (s) => winScreen(s, { full: true }), [
    [380, ['full ranking mode:', 'game ends when one', 'player is left'], [p(366), p(400)]],
  ]), 'Win screen (full ranking)', []),
]);

// ---------- 6. Settings & Stats ----------
add('settings', 'Settings & Stats', 'Preferences, house rules, lifetime stats.', 'four', [
  figure(phoneSheet('Settings', (s) => settings(s), [
    [150, ['System follows the', 'phone live'], [p(120), p(172)]],
    [400, ['default for new', 'games, 6–8'], [p(300), p(410)]],
  ]), 'Settings', [], { note: 'Scrolls if needed. Every row is at least 48 dp tall.' }),
  figure(phoneSheet('House rules', (s) => houseRules(s), [
    [380, ['greyed out while', 'Extra roll on 6', 'is off'], [p(330), p(390)]],
  ]), 'House rules', [], { note: 'Saved per device. Quick Play ignores these and uses classic rules.' }),
  figure(phoneSheet('Stats', (s) => statsScreen(s), [
    [700, ['unlocks are kept', 'in stats'], [p(340), p(718)]],
  ]), 'Stats', []),
  figure(phoneSheet('Reset stats confirm', (s) => { settings(s); s.layer(); scrim(s); dialog(s, 'Reset all stats?', ['Games, wins and best', 'scores go to zero.', 'Boards stay unlocked.'], 'Cancel', 'Reset'); }, [
    [430, ['unlocked boards', 'are kept (see', 'decisions box)'], [p(338), p(440)]],
  ]), 'Reset-stats confirm', []),
]);

// ---------- 7. Tablet ----------
{
  const tab = (label, fn, notes) => {
    const s = new Sheet(1120, 1330, label);
    s.phone(20, 24, () => fn(s), { w: 800, h: 1280, tablet: true });
    for (const [y, lines, t] of notes) s.note(850, y, lines, t ? [20 + t[0], 24 + t[1]] : null, { size: 24 });
    return s.render(label);
  };
  add('tablet', 'Tablet', '10-inch portrait, 800 × 1280 dp.', 'two', [
    figure(tab('Tablet game screen', (s) => tabletGame(s, boards), [
      [200, ['Board capped at', '640 dp, centred.'], [400, 400]],
      [420, ['Side rails hold the', 'player chips: 1 and 3', 'left, 2 and 4 right.', 'Wider tablets show', 'names and stats.'], [760, 400]],
      [960, ['Bottom panel: last', 'rolls, dice, rules', 'in play.'], [480, 980]],
    ]), 'Game on a 10" tablet', [], { note: 'At 800 dp the rails are 80 dp each. Above 960 dp they widen to full chips.' }),
    figure(tab('Tablet home', (s) => tabletHome(s, boards), [
      [460, ['Two columns: actions', 'left, current board', 'right.'], [740, 500]],
    ]), 'Home on a tablet', []),
  ]);
}

// ---------- 8. Board layouts ----------
{
  const layoutSheet = (id) => {
    const b = boards[id];
    const s = new Sheet(760, 840, `${b.name} layout`);
    drawBoard(s, 40, 30, 680, b, 8, { corner: true, numSize: 15, labels: true, ranks: true, dashedRanks: true, labelSize: 17 });
    const ladders = b.jumps.filter((j) => j.type === 'ladder');
    const snakes = b.jumps.filter((j) => j.type === 'snake').sort((a, c) => a.rank - c.rank);
    s.text(40, 746, `Ladders (${ladders.length})`, { size: 20 });
    s.text(40, 772, ladders.map((j) => `${j.from}→${j.to}`).join('  '), { size: 18, fill: C.muted });
    s.text(40, 806, 'Snakes by rank', { size: 20 });
    s.text(40, 832, snakes.map((j) => `${j.rank}: ${j.from}→${j.to}`).join('  '), { size: 18, fill: C.muted });
    const unlock = b.unlock.type === 'none' ? 'unlocked from the start' : `unlocks after ${b.unlock.count} win${b.unlock.count > 1 ? 's' : ''}`;
    return figure(s.render(`${b.name} layout with every snake and ladder`), `${b.name} · ${unlock}`, [], {
      note: 'Red circles give snake rank. Dashed snakes (ranks 7 and 8) are removed at 7 and at 6 snakes.',
    });
  };
  add('layouts', 'Board layouts', 'Source of truth for assets/boards/*.json.', 'two', ids.map(layoutSheet));
}

// ---------- 9. Snake count ----------
{
  const countSheet = (n) => {
    const s = new Sheet(520, 600, `Classic Sunshine with ${n} snakes`);
    s.text(260, 36, `${n} snakes`, { size: 30, anchor: 'middle' });
    drawBoard(s, 20, 56, 480, boards.classic_sunshine, n, { numSize: 13 });
    const off = boards.classic_sunshine.jumps.filter((j) => j.type === 'snake' && j.rank > n);
    s.text(260, 572, off.length ? `off: ${off.map((j) => `${j.from}→${j.to} (rank ${j.rank})`).join(', ')}` : 'all 8 snakes on', { size: 18, anchor: 'middle', fill: C.muted });
    return figure(s.render(`Classic Sunshine board with ${n} snakes`), `${n} snakes${n === 7 ? ' (default)' : ''}`, []);
  };
  const stepperSheet = (() => {
    const s = new Sheet(520, 600, 'Snakes stepper close-up');
    [6, 7, 8].forEach((v, i) => {
      const y = 50 + i * 170;
      s.text(30, y + 10, v === 6 ? 'At minimum' : v === 8 ? 'At maximum' : 'Default', { size: 22 });
      s.stepper(30, y + 30, v, { b: 64 });
      s.text(260, y + 70, v === 6 ? '− disabled (dashed)' : v === 8 ? '+ disabled (dashed)' : 'both enabled', { size: 20, fill: C.muted });
    });
    s.note(260, 560, ['live mini-board updates on', 'every tap; 150 ms fade'], null, { size: 19 });
    return figure(s.render('Snakes stepper in its three states'), 'Player Setup stepper', ['Minus disabled at 6.', 'Default 7 from Settings.', 'Plus disabled at 8.']);
  })();
  add('snakes', 'Snake count', 'Classic Sunshine at 6, 7 and 8 snakes. Ladders never change.', 'four', [6, 7, 8].map(countSheet).concat([stepperSheet]));
}

// ---------- 10. Dark mode ----------
{
  const darkSheet = (label, draw, notes, dark) => {
    const s = new Sheet(880, 880, label);
    if (dark) s.dark(true);
    s.phone(10, 18, () => draw(s));
    s.dark(false);
    for (const [y, lines, t] of notes) s.note(426, y, lines, t ? [10 + t[0], 18 + t[1]] : null, { size: 20 });
    return s.render(label);
  };
  const gameDraw = (s) => gameScreen(s, boards, { players: PLAYERS4, tokens: PLAYERS4.map((pl, i) => ({ sq: pl.sq, color: pl.color, active: i === 0 })) });
  add('dark', 'Dark mode', 'Same layout, a designed night palette. Light first, then dark.', 'two', [
    figure(darkSheet('Game screen, light', gameDraw, [
      [70, ['Background and surfaces from AppColors (light)'], null],
      [240, ['Tiles #FFF59D / #F9C440, frame #F5C518'], [200, 260]],
      [290, ['Numbers ink with soft halo'], [230, 300]],
      [360, ['Snakes #8BC34A body, #2E7D32 spots'], boardPoint(16, 180, 358, 62)],
      [440, ['Ladders #3D8BE0'], boardPoint(16, 180, 358, 56)],
      [660, ['Dice and tokens: base colours, dark outline'], [255, 700]],
    ], false), 'Game · Light', []),
    figure(darkSheet('Game screen, dark', gameDraw, [
      [70, ['Background #14161F, surfaces', '#1E2130 / #272B3D'], [370, 140]],
      [180, ['Text #F2F3F7, secondary #A9AEC2'], [330, 90]],
      [250, ['Tiles #1E2A44 / #8A6A1C, frame #C9A227'], [200, 260]],
      [310, ['Numbers #FFF8E1 with dark halo'], [230, 300]],
      [380, ['Snakes #9CCC65 / #388E3C', 'plus soft outer glow'], boardPoint(16, 180, 358, 62)],
      [470, ['Ladders #7FB8FF'], boardPoint(16, 180, 358, 56)],
      [660, ['Tokens and dice keep their hue,', 'add a light rim'], [255, 700]],
      [800, ['Switch: 250 ms cross-fade, game', 'state untouched'], null],
    ], true), 'Game · Dark', []),
    figure(darkSheet('Home, dark', (s) => home(s, { continue: true }), [
      [330, ['Buttons: ink text on accents,', 'accents 10–15% less saturated'], [358, 344]],
      [150, ['Logo lockup has its own', 'dark variant'], [282, 170]],
    ], true), 'Home · Dark', []),
    figure(darkSheet('Settings with Appearance, dark', (s) => settings(s, { sel: 2 }), [
      [160, ['Appearance: System (default),', 'Light, Dark. Changes apply', 'live, no restart'], [300, 172]],
    ], true), 'Settings · Dark (Appearance picker)', []),
  ]);
}

// ---------- Page ----------
const nav = [
  ['flow', 'Flow'], ['start', 'Start'], ['setup', 'Setup'], ['game', 'Game'], ['overlays', 'Overlays'],
  ['settings', 'Settings & Stats'], ['tablet', 'Tablet'], ['layouts', 'Board layouts'], ['snakes', 'Snake count'], ['dark', 'Dark mode'],
];

const decisions = [
  'Dice placement: centred (current), or a left/right-handed setting that moves it to a corner?',
  'Square numbers: always visible (current) or only on tap? Always is better for learning; on-tap is cleaner.',
  'Bot thinking indicator: three-dot bubble on the bot chip (current) or a spinning dice?',
  'Snake stepper placement: in the board card under the players (current), or on Board Select?',
  'Dark-mode snakes: soft outer glow (current spec) or a lighter outline only?',
  'Tablet at 800 dp: the brief\'s 640 dp board leaves 80 dp rails, so chips are compact there. Fine, or shrink the board to fit full chips?',
  'Reset stats keeps unlocked boards unlocked (current). Should a reset relock them?',
  'Classic Sunshine is fixed by the brief, and ladder 28→84 passes 0.28 tiles from snake head 47 (rank 7), ladder 1→38 passes near tail 19. Snakes draw above ladders so heads stay visible. Accept?',
];

const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<filter id="rough" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="1.2" xChannelSelector="R" yChannelSelector="G"/></filter>
<marker id="arrBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="${C.blue}" stroke-width="1.6" stroke-linecap="round"/></marker>
<marker id="arrInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/></marker>
<marker id="arrInkStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M9 1L1 5L9 9" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/></marker>
</defs></svg>`;

const html = `<title>snake_ladder Wireframes</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&family=Patrick+Hand&display=swap">
<style>
/* Layout: a drafting desk of pinned paper sheets, one section per design page. */
:root{
  --desk:#E8ECEF; --sheet:#FFFFFF; --ink:#23272B; --muted:#5C666F;
  --pencil-blue:#1C6DD0; --mark:#D92D20; --rule:#C6CED5;
  --highlight:#FFEC99;
  --display:'Patrick Hand','Chalkboard SE','Comic Sans MS',cursive;
  --body:'Nunito',system-ui,sans-serif;
  color-scheme: light;
}
*{box-sizing:border-box}
html{background:var(--desk)}
body{margin:0;background:var(--desk);color:var(--ink);font:400 16px/1.5 var(--body)}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--desk)}
@media (prefers-reduced-motion: no-preference){html{scroll-behavior:smooth}}
.page{max-width:1500px;margin:0 auto;padding-block:32px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:flex;flex-direction:column;gap:40px}
header h1{font-family:var(--display);font-weight:400;font-size:clamp(44px,8vw,76px);line-height:1;margin:0 0 12px}
header p{color:var(--muted);max-width:65ch;margin:0}
nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--desk);border-bottom:1.5px dashed var(--rule);padding-block:12px;margin-block:-28px;}
nav ul{list-style:none;margin:0;padding:2px;display:flex;gap:10px;overflow-x:auto;scrollbar-width:thin}
nav a{display:block;white-space:nowrap;font-family:var(--display);font-size:21px;line-height:1.2;color:var(--ink);text-decoration:none;background:var(--sheet);border:1.5px solid var(--ink);border-radius:12px;padding:6px 14px}
nav a:hover,nav a:focus-visible{background:var(--highlight);outline:2px solid var(--pencil-blue);outline-offset:1px}
.decisions{background:var(--sheet);border:2px solid var(--mark);border-radius:14px;padding:20px 24px}
.decisions h2{font-family:var(--display);font-weight:400;font-size:28px;color:var(--mark);margin:0 0 8px}
.decisions ul{margin:0;padding-left:20px;display:grid;gap:6px;max-width:110ch}
section{display:flex;flex-direction:column;gap:16px;scroll-margin-top:96px}
section h2{font-family:var(--display);font-weight:400;font-size:36px;line-height:1.1;margin:0}
section > p{color:var(--muted);margin:-10px 0 0;max-width:65ch}
.board{display:grid;gap:28px}
.wide{grid-template-columns:1fr}
.two{grid-template-columns:repeat(auto-fill,minmax(min(100%,560px),1fr))}
.four{grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))}
figure{position:relative;margin:0;background:var(--sheet);box-shadow:0 1px 0 var(--rule),0 3px 10px rgba(35,39,43,.10);padding:18px 16px 14px;display:flex;flex-direction:column;gap:10px;min-width:0}
figure::before{content:"";position:absolute;top:7px;left:50%;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:var(--mark);box-shadow:0 1px 2px rgba(35,39,43,.35)}
figure svg{width:100%;height:auto;display:block}
.wide figure .scroll{overflow-x:auto}
@media (max-width:760px){.wide figure .scroll svg{min-width:880px}}
figcaption{font-size:14px;color:var(--ink);border-top:1.5px dashed var(--rule);padding-top:8px}
figcaption strong{display:block;font-family:var(--display);font-weight:400;font-size:21px;line-height:1.2}
figcaption ol{margin:4px 0 0;padding-left:22px}
figcaption ol li::marker{color:var(--mark);font-weight:700}
figcaption p{margin:4px 0 0;color:var(--muted)}
.key{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:14px;color:var(--muted)}
.key b{color:var(--pencil-blue);font-weight:700}
.key i{color:var(--mark);font-style:normal;font-weight:700}
</style>
${defs}
<div class="page">
<header>
  <h1>snake_ladder Wireframes</h1>
  <p>Grayscale wireframes for Snake Saga, a Snakes &amp; Ladders game for Android and iOS. Every screen, every state of a turn, the three board layouts that feed <code>assets/boards/*.json</code>, and the dark-mode plan. Pencil-blue notes explain behaviour; red numbers match the list under each sheet.</p>
</header>
<nav aria-label="Sections"><ul>${nav.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ul></nav>
<aside class="decisions" aria-labelledby="dec-h">
  <h2 id="dec-h">Decisions to make</h2>
  <ul>${decisions.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
</aside>
<div class="key"><span><b>Blue</b> behaviour notes</span><span><i>Red</i> numbered callouts</span><span>Token symbols: ★ Red · ● Blue · ▲ Green · ■ Yellow</span><span>Phone 390 × 844 · Tablet 800 × 1280</span></div>
${sections.map((sec) => `<section${sec.title ? ` id="${sec.id}"` : ''} aria-label="${esc(sec.title ?? 'Game states')}">
${sec.title ? `<h2>${esc(sec.title)}</h2><p>${esc(sec.note)}</p>` : ''}
<div class="board ${sec.grid}">${sec.figs.join('')}</div>
</section>`).join('\n')}
</div>
`;

fs.mkdirSync('design', { recursive: true });
const doc = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${html}\n</html>\n`;
fs.writeFileSync('design/wireframes.html', doc);
// The artifact host supplies its own document wrapper, so it gets the fragment.
if (process.env.ARTIFACT_OUT) fs.writeFileSync(process.env.ARTIFACT_OUT, html);
console.log(`design/wireframes.html ${(html.length / 1024).toFixed(0)} KB, ${sections.reduce((a, s) => a + s.figs.length, 0)} sheets`);
