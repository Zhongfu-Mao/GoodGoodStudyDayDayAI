import type { FishShape, Pattern, Profile, SeaweedCluster, Species } from './types';

export const STORAGE_KEY = 'ggsdda-aquarium';

export const FISH_COUNTS = { mobile: 4, tablet: 6, desktop: 8 } as const;

export const FEED_TIMING = {
  gather: 5400,
  linger: 1200,
  scatter: 5000,
  cleanup: 4200,
} as const;

export const MOVEMENT = {
  roamSpeed: 0.016,
  roamBurstSpeed: 0.038,
  roamTurn: 0.00105,
  roamWander: 0.000045,
  feedSpeed: 0.048,
  feedBurstSpeed: 0.078,
  feedTurn: 0.0028,
  feedOrbit: 0.00022,
  scatterSpeed: 0.082,
  scatterTurn: 0.004,
  scatterWander: 0.000105,
  edgePush: 0.00052,
  socialRadius: 220,
  feedSocialRadius: 160,
} as const;

export const SPECIES_PROFILES: Record<Species, Profile> = {
  classic: { cruise: 1, feed: 1, scatter: 1, turn: 1, wander: 1, burst: 1, tailTempo: 1 },
  round: {
    cruise: 0.78,
    feed: 0.86,
    scatter: 0.88,
    turn: 0.82,
    wander: 1.32,
    burst: 0.82,
    tailTempo: 0.85,
  },
  stream: {
    cruise: 1.22,
    feed: 1.08,
    scatter: 1.12,
    turn: 0.72,
    wander: 0.72,
    burst: 1.18,
    tailTempo: 1.18,
  },
  angel: {
    cruise: 0.7,
    feed: 0.78,
    scatter: 0.74,
    turn: 0.62,
    wander: 1.48,
    burst: 0.72,
    tailTempo: 0.72,
  },
  forktail: {
    cruise: 1.05,
    feed: 1.12,
    scatter: 1.22,
    turn: 1.18,
    wander: 0.92,
    burst: 1.28,
    tailTempo: 1.28,
  },
  speckled: {
    cruise: 0.94,
    feed: 0.98,
    scatter: 1.02,
    turn: 1.08,
    wander: 1.12,
    burst: 1.02,
    tailTempo: 1.05,
  },
};

export const SPECIES_LIST: Species[] = [
  'classic',
  'round',
  'stream',
  'angel',
  'forktail',
  'speckled',
];

export const PATTERN_LIST: Pattern[] = ['stripe', 'spot', 'band', 'none', 'stripe', 'spot'];

export const FISH_PALETTES: ReadonlyArray<readonly [string, string, string]> = [
  ['#fb923c', '#fef3c7', '#7c2d12'],
  ['#22d3ee', '#cffafe', '#155e75'],
  ['#f472b6', '#fce7f3', '#831843'],
  ['#a3e635', '#ecfccb', '#365314'],
  ['#60a5fa', '#dbeafe', '#1e3a8a'],
  ['#facc15', '#fef9c3', '#854d0e'],
];

export const FISH_SHAPES: Record<Species, FishShape> = {
  classic: { length: 2.25, height: 1.02, nose: 0.62, tailBase: -0.44, tailTip: -0.92, alpha: 0.52 },
  round: { length: 1.72, height: 1.34, nose: 0.54, tailBase: -0.36, tailTip: -0.76, alpha: 0.5 },
  stream: { length: 2.9, height: 0.72, nose: 0.66, tailBase: -0.52, tailTip: -1.05, alpha: 0.46 },
  angel: { length: 1.95, height: 1.28, nose: 0.5, tailBase: -0.34, tailTip: -0.78, alpha: 0.48 },
  forktail: { length: 2.35, height: 0.92, nose: 0.64, tailBase: -0.46, tailTip: -0.98, alpha: 0.5 },
  speckled: { length: 2.05, height: 1.08, nose: 0.58, tailBase: -0.42, tailTip: -0.86, alpha: 0.5 },
};

export const SEAWEED_CLUSTERS: SeaweedCluster[] = [
  {
    side: 'left',
    xRatio: 0.075,
    width: 72,
    pebbles: [
      { offset: -34, lift: 10, rx: 5.8, ry: 2.4, seed: 0.1, color: 0 },
      { offset: -18, lift: 15, rx: 4.4, ry: 2, seed: 1.1, color: 1 },
      { offset: 4, lift: 11, rx: 6.2, ry: 2.7, seed: 2.2, color: 2 },
      { offset: 25, lift: 17, rx: 4.8, ry: 2.2, seed: 3.1, color: 0 },
    ],
    bubbles: [
      { offset: -10, seed: 0.15, size: 2.4 },
      { offset: 18, seed: 0.58, size: 1.8 },
    ],
    blades: [
      { offset: -24, height: 74, curve: -0.28, seed: 0.2, width: 2.4 },
      { offset: -11, height: 92, curve: 0.22, seed: 1.7, width: 2.8 },
      { offset: 3, height: 65, curve: -0.18, seed: 2.9, width: 2.2 },
      { offset: 18, height: 82, curve: 0.34, seed: 4.4, width: 2.5 },
    ],
  },
  {
    side: 'right',
    xRatio: 0.91,
    width: 78,
    pebbles: [
      { offset: -38, lift: 13, rx: 5.2, ry: 2.2, seed: 0.6, color: 2 },
      { offset: -15, lift: 10, rx: 6.6, ry: 2.8, seed: 1.8, color: 0 },
      { offset: 10, lift: 16, rx: 4.6, ry: 2, seed: 2.7, color: 1 },
      { offset: 32, lift: 12, rx: 5.8, ry: 2.4, seed: 3.8, color: 0 },
    ],
    bubbles: [
      { offset: -18, seed: 0.35, size: 2.1 },
      { offset: 24, seed: 0.78, size: 2.6 },
    ],
    blades: [
      { offset: -28, height: 68, curve: 0.24, seed: 0.9, width: 2.2 },
      { offset: -12, height: 94, curve: -0.3, seed: 2.1, width: 2.7 },
      { offset: 6, height: 78, curve: 0.18, seed: 3.3, width: 2.4 },
      { offset: 24, height: 104, curve: -0.36, seed: 5.1, width: 2.9 },
    ],
  },
  {
    side: 'middle',
    xRatio: 0.32,
    width: 56,
    minWidth: 860,
    pebbles: [
      { offset: -21, lift: 11, rx: 4.8, ry: 2, seed: 4.2, color: 1 },
      { offset: -2, lift: 15, rx: 5.7, ry: 2.4, seed: 5.4, color: 0 },
      { offset: 20, lift: 10, rx: 4.2, ry: 1.9, seed: 6.1, color: 2 },
    ],
    bubbles: [{ offset: 5, seed: 0.92, size: 1.7 }],
    blades: [
      { offset: -17, height: 50, curve: 0.22, seed: 1.2, width: 2 },
      { offset: -2, height: 62, curve: -0.2, seed: 2.6, width: 2.2 },
      { offset: 15, height: 45, curve: 0.28, seed: 3.7, width: 1.9 },
    ],
  },
];
