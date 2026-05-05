export type Species = 'classic' | 'round' | 'stream' | 'angel' | 'forktail' | 'speckled';
export type Pattern = 'stripe' | 'spot' | 'band' | 'none';
export type FishMode = 'roam' | 'feed' | 'scatter';

export interface Profile {
  cruise: number;
  feed: number;
  scatter: number;
  turn: number;
  wander: number;
  burst: number;
  tailTempo: number;
}

export interface FishShape {
  length: number;
  height: number;
  nose: number;
  tailBase: number;
  tailTip: number;
  alpha: number;
}

export interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  turn: number;
  phase: number;
  angle: number;
  tailRate: number;
  wander: number;
  orbit: number;
  personality: number;
  burstUntil: number;
  nextBurstAt: number;
  body: string;
  fin: string;
  accent: string;
  species: Species;
  pattern: Pattern;
  profile: Profile;
  mode: FishMode;
  feedUntil: number;
  feedOffsetX: number;
  feedOffsetY: number;
  scatterUntil: number;
  scatterX: number;
  scatterY: number;
  roamX: number;
  roamY: number;
  nextRoamAt: number;
}

export interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  wobble: number;
  life: number;
  bornAt: number;
}

export interface FoodCrumb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  drift: number;
  life: number;
  size: number;
}

export interface FeedTarget {
  x: number;
  y: number;
  gatherUntil: number;
  scatterUntil: number;
  until: number;
}

export interface Viewport {
  width: number;
  height: number;
  ratio: number;
}

export interface Pointer {
  x: number;
  y: number;
}

export interface Intent {
  mode: FishMode;
  target: { x: number; y: number; strength?: number };
}

export interface Pebble {
  offset: number;
  lift: number;
  rx: number;
  ry: number;
  seed: number;
  color: number;
}

export interface Blade {
  offset: number;
  height: number;
  curve: number;
  seed: number;
  width: number;
}

export interface SeaweedBubble {
  offset: number;
  seed: number;
  size: number;
}

export interface SeaweedCluster {
  side: 'left' | 'right' | 'middle';
  xRatio: number;
  width: number;
  minWidth?: number;
  pebbles: Pebble[];
  bubbles: SeaweedBubble[];
  blades: Blade[];
}
