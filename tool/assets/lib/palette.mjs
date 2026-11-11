// Every colour used by the art, and the board palettes written to assets/themes/.
import { desat, light, outline, shade } from './svg.mjs';

export const UI = {
  leaf: '#3FA34D', deep: '#1F5130', sun: '#FFC93C', coral: '#FF6B5A', sky: '#4BA3F5', cream: '#FFF6E3', ink: '#2A2A35',
};

// App chrome per mode (dark values from the brief, accents 10-15% less saturated).
export const APP = {
  light: {
    background: '#FFF6E3', surface: '#FFFFFF', surface2: '#FFF0CC', text: '#2A2A35', textSecondary: '#5A5A6B',
    primary: UI.leaf, secondary: UI.cream, danger: UI.coral, accent: UI.sky, sun: UI.sun, onAccent: UI.ink,
  },
  dark: {
    background: '#14161F', surface: '#1E2130', surface2: '#272B3D', text: '#F2F3F7', textSecondary: '#A9AEC2',
    primary: desat(UI.leaf), secondary: '#3A3F57', danger: desat(UI.coral), accent: desat(UI.sky), sun: desat(UI.sun), onAccent: UI.ink,
  },
};

export const TOKENS = {
  red: { base: '#E8453C', symbol: 'star' },
  blue: { base: '#2F7DE1', symbol: 'dot' },
  green: { base: '#2DB34A', symbol: 'tri' },
  yellow: { base: '#F4C21B', symbol: 'square' },
};
for (const t of Object.values(TOKENS)) {
  t.light = light(t.base, 0.16);
  t.dark = shade(t.base, 0.16);
  t.outline = outline(t.base, 0.2);
}

// Light mode outlines are a dark tint of the fill. Dark mode uses a pale rim
// instead, so snakes read against night tiles (3:1 or better on both tiles).
const snake = (base, patternColor, belly) => ({ base, pattern: patternColor, belly, outline: outline(base, 0.2) });
const nightSnake = (base, patternColor, belly) => ({ base, pattern: patternColor, belly, outline: light(base, 0.3) });

// Board palettes. Snake designs a-d map to snake ranks (rank - 1) % 4.
export const THEMES = {
  sunshine: {
    name: 'Classic Sunshine',
    light: {
      background: ['#FFF6D6', '#FFE18A'], tileA: '#FFF59D', tileB: '#F9C440', frame: '#F5C518', frameOutline: '#9C7A0C',
      number: '#2A2A35', numberHalo: '#FFFDF0', ladderRail: '#3D8BE0', ladderRung: '#6AA9EE', ladderOutline: '#1B4F8F',
      glow: null, startPad: '#FFFFFF',
      snakes: {
        a: snake('#8BC34A', '#2E7D32', '#DCEDC8'),
        b: snake('#7CB342', '#33691E', '#D7EBC0'),
        c: snake('#9CCC65', '#2E7D32', '#E6F3D6'),
        d: snake('#8BC34A', '#1B5E20', '#DCEDC8'),
      },
    },
    dark: {
      background: ['#1A2238', '#0F1424'], tileA: '#1E2A44', tileB: '#8A6A1C', frame: '#C9A227', frameOutline: '#5E4A0A',
      number: '#FFF8E1', numberHalo: '#0B1020', ladderRail: '#7FB8FF', ladderRung: '#A9D0FF', ladderOutline: '#DCEBFF',
      glow: '#B9F6CA', startPad: '#272B3D',
      snakes: {
        a: nightSnake('#9CCC65', '#388E3C', '#E6F3D6'),
        b: nightSnake('#8DC653', '#2E7D32', '#DCEDC8'),
        c: nightSnake('#AED581', '#388E3C', '#EEF6E4'),
        d: nightSnake('#9CCC65', '#1F6B24', '#E6F3D6'),
      },
    },
  },
  sweets: {
    name: 'Sugar Rush',
    light: {
      background: ['#FFF0F6', '#E3F4FF'], tileA: '#FFE4EF', tileB: '#D6EEFF', frame: '#FF8FB8', frameOutline: '#A83A66',
      number: '#2A2A35', numberHalo: '#FFFFFF', ladderRail: '#E8453C', ladderRung: '#F27A73', ladderOutline: '#8A1F19',
      glow: null, startPad: '#FFFFFF',
      snakes: {
        a: snake('#FF6FA5', '#FFFFFF', '#FFD3E4'),
        b: snake('#4FD1B0', '#FFFFFF', '#CFF5EA'),
        c: snake('#FFB938', '#FFF3D1', '#FFE6B0'),
        d: snake('#A77BFF', '#FFFFFF', '#E3D6FF'),
      },
    },
    dark: {
      background: ['#24142E', '#120B1A'], tileA: '#2B1E3A', tileB: '#1C2D3F', frame: '#C9578A', frameOutline: '#5A1834',
      number: '#FFF0F6', numberHalo: '#0E0814', ladderRail: '#FF7A72', ladderRung: '#FFA39D', ladderOutline: '#FFE0DD',
      glow: '#FFD3E4', startPad: '#272B3D',
      snakes: {
        a: nightSnake('#FF85B3', '#FFE6F0', '#FFD9E8'),
        b: nightSnake('#62DDBE', '#E8FFF8', '#D6F7EE'),
        c: nightSnake('#FFC24F', '#FFF6DE', '#FFE9BF'),
        d: nightSnake('#B592FF', '#F1EAFF', '#E7DCFF'),
      },
    },
  },
  jungle: {
    name: 'Jungle Temple',
    light: {
      background: ['#E4F0D2', '#9CC28A'], tileA: '#DCD3BC', tileB: '#B9C6A0', frame: '#8C7B5E', frameOutline: '#3F3524',
      number: '#2A2A35', numberHalo: '#F6F2E6', ladderRail: '#6E8B2E', ladderRung: '#C9B567', ladderOutline: '#2F3F10',
      glow: null, startPad: '#F6F2E6',
      snakes: {
        a: snake('#43A047', '#1B5E20', '#C8E6C9'),
        b: snake('#C49A5A', '#6D4C2A', '#EBD9B8'),
        c: snake('#2FA3B5', '#0F5560', '#BDE6EC'),
        d: snake('#E0703A', '#2A2A35', '#F8D2BC'),
      },
    },
    dark: {
      background: ['#18261A', '#0B140D'], tileA: '#2E3328', tileB: '#3B4A35', frame: '#5E5440', frameOutline: '#1C180F',
      number: '#F1F5E6', numberHalo: '#0A0F08', ladderRail: '#9BC46A', ladderRung: '#D9C98A', ladderOutline: '#E9F5D6',
      glow: '#C5E1A5', startPad: '#272B3D',
      snakes: {
        a: nightSnake('#5CBF60', '#1E6B23', '#D3EDD4'),
        b: nightSnake('#D4AC6C', '#6D4C2A', '#F1E2C6'),
        c: nightSnake('#43B8CA', '#0F5560', '#CBEEF3'),
        d: nightSnake('#EE8550', '#2A2A35', '#FADDCB'),
      },
    },
  },
};

// Body widths, rung spacing and halo used by the painters (tile units).
export const GEOMETRY = {
  snakeHeadWidth: 0.32, snakeTailWidth: 0.12, snakeOpacity: 0.88,
  ladderRailOffset: 0.18, ladderRungSpacing: 0.45, ladderRailWidth: 0.07, ladderRungWidth: 0.05,
  numberFontSize: 0.3, numberHaloBlur: 0.06,
};
