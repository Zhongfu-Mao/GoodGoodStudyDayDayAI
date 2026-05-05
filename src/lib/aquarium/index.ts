import {
  FEED_TIMING,
  FISH_COUNTS,
  FISH_PALETTES,
  FISH_SHAPES,
  MOVEMENT,
  PATTERN_LIST,
  SEAWEED_CLUSTERS,
  SPECIES_LIST,
  SPECIES_PROFILES,
  STORAGE_KEY,
} from './constants';
import type {
  Bubble,
  FeedTarget,
  Fish,
  FoodCrumb,
  Intent,
  Pattern,
  Pointer,
  SeaweedCluster,
  Species,
  Viewport,
} from './types';

export function initAquarium(root: HTMLElement): (() => void) | undefined {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-aquarium-canvas]');
  const button = root.querySelector<HTMLElement>('[data-aquarium-toggle]');
  const context = canvas ? canvas.getContext('2d', { alpha: true }) : null;
  if (!canvas || !button || !context) return;

  const motionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let reducedMotion = !!(motionQuery && motionQuery.matches);
  const viewport: Viewport = { width: 0, height: 0, ratio: 1 };
  const pointer: Pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.55 };
  let feedTarget: FeedTarget | null = null;
  let food: FoodCrumb[] = [];
  let bubbles: Bubble[] = [];
  const fish: Fish[] = [];
  let animationId = 0;
  let lastTime = performance.now();
  let enabled = readStoredState();

  function readStoredState(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'on') return true;
      if (stored === 'off') return false;
    } catch (_error) {}

    return !reducedMotion;
  }

  function writeStoredState(value: boolean) {
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off');
    } catch (_error) {}
  }

  function updateToggle() {
    if (!button) return;
    const enableLabel = button.getAttribute('data-label-enable') || 'Enable aquarium';
    const disableLabel = button.getAttribute('data-label-disable') || 'Pause aquarium';
    const tooltipOn = button.getAttribute('data-tooltip-on') || disableLabel;
    const tooltipOff = button.getAttribute('data-tooltip-off') || enableLabel;
    const label = enabled ? disableLabel : enableLabel;

    root.classList.toggle('is-active', enabled);
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    button.setAttribute('aria-label', label);
    button.setAttribute('data-tooltip', enabled ? tooltipOn : tooltipOff);
  }

  function resize() {
    if (!canvas || !context) return;
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    viewport.ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(viewport.width * viewport.ratio));
    canvas.height = Math.max(1, Math.floor(viewport.height * viewport.ratio));
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    context.setTransform(viewport.ratio, 0, 0, viewport.ratio, 0, 0);
    syncFishCount();
  }

  function syncFishCount() {
    const baseCount =
      viewport.width < 720
        ? FISH_COUNTS.mobile
        : viewport.width < 1180
          ? FISH_COUNTS.tablet
          : FISH_COUNTS.desktop;
    const targetCount = baseCount;

    while (fish.length < targetCount) fish.push(createFish(fish.length, targetCount));
    fish.length = targetCount;
  }

  function getSpeciesProfile(species: Species) {
    return SPECIES_PROFILES[species] || SPECIES_PROFILES.classic;
  }

  function getInitialFishPosition(index: number, total: number) {
    const safeTop = 58;
    const safeBottom = Math.max(safeTop + 120, viewport.height - 46);
    const columns = Math.max(2, Math.ceil(Math.sqrt(total * 1.45)));
    const rows = Math.max(1, Math.ceil(total / columns));
    const spreadStep = total % 2 === 0 ? total - 1 : Math.max(2, total - 2);
    const orderedIndex = (index * spreadStep) % total;
    const column = orderedIndex % columns;
    const row = Math.floor(orderedIndex / columns) % rows;
    const cellWidth = viewport.width / columns;
    const cellHeight = (safeBottom - safeTop) / rows;
    const jitterX = (Math.random() - 0.5) * cellWidth * 0.42;
    const jitterY = (Math.random() - 0.5) * cellHeight * 0.42;

    return {
      x: clamp((column + 0.5) * cellWidth + jitterX, 36, viewport.width - 36),
      y: clamp(safeTop + (row + 0.5) * cellHeight + jitterY, safeTop, safeBottom),
    };
  }

  function createFish(index: number, total: number): Fish {
    const side = Math.random() > 0.5 ? -1 : 1;
    const palette = FISH_PALETTES[index % 6];
    const species: Species = SPECIES_LIST[index % 6];
    const pattern: Pattern = PATTERN_LIST[index % 6];
    const profile = getSpeciesProfile(species);

    const position = getInitialFishPosition(index, total);
    const item: Fish = {
      x: position.x,
      y: position.y,
      vx: (0.006 + Math.random() * 0.012) * side,
      vy: (Math.random() - 0.5) * 0.01,
      size: (species === 'stream' ? 9 : 10) + Math.random() * (species === 'round' ? 7 : 9),
      turn: side,
      phase: Math.random() * Math.PI * 2,
      angle: side > 0 ? 0 : Math.PI,
      tailRate: (2.4 + Math.random() * 1.8) * profile.tailTempo,
      wander: Math.random() * Math.PI * 2,
      orbit: Math.random() > 0.5 ? 1 : -1,
      personality: 0.75 + Math.random() * 0.65,
      burstUntil: 0,
      nextBurstAt: performance.now() + 9000 + Math.random() * 18000,
      body: palette[0],
      fin: palette[1],
      accent: palette[2],
      species,
      pattern,
      profile,
      mode: 'roam',
      feedUntil: 0,
      feedOffsetX: 0,
      feedOffsetY: 0,
      scatterUntil: 0,
      scatterX: position.x,
      scatterY: position.y,
      roamX: position.x,
      roamY: position.y,
      nextRoamAt: 0,
    };

    pickRoamTarget(item, performance.now());
    return item;
  }

  function pickRoamTarget(item: Fish, now: number) {
    let x = 0;
    let y = 0;
    const profile = item.profile || getSpeciesProfile(item.species);
    const minDistance = Math.max(180, viewport.width * (0.34 + profile.cruise * 0.06));

    for (let attempt = 0; attempt < 24; attempt += 1) {
      x = Math.random() * viewport.width;
      y = 62 + Math.random() * Math.max(120, viewport.height - 126);
      const dx = x - item.x;
      const dy = y - item.y;
      if (Math.sqrt(dx * dx + dy * dy) >= minDistance) break;
    }

    item.roamX = x;
    item.roamY = y;
    item.nextRoamAt = now + 18000 + Math.random() * 18000;
  }

  function feed(x: number, y: number) {
    if (!enabled) return;

    const now = performance.now();
    feedTarget = {
      x,
      y,
      gatherUntil: now + FEED_TIMING.gather,
      scatterUntil: now + FEED_TIMING.gather + FEED_TIMING.scatter,
      until: now + FEED_TIMING.gather + FEED_TIMING.scatter + FEED_TIMING.cleanup,
    };
    pointer.x = x;
    pointer.y = y;

    for (let i = 0; i < 36; i += 1) {
      food.push({
        x: x + (Math.random() - 0.5) * 44,
        y: y + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 0.026,
        vy: 0.014 + Math.random() * 0.025,
        drift: Math.random() * Math.PI * 2,
        life: 1,
        size: 1.6 + Math.random() * 2.4,
      });
    }

    fish.forEach((item, index) => {
      item.feedUntil = feedTarget!.gatherUntil + 260 + Math.random() * FEED_TIMING.linger;
      item.scatterUntil = feedTarget!.scatterUntil + Math.random() * 650;
      item.feedOffsetX = (Math.random() - 0.5) * 92;
      item.feedOffsetY = (Math.random() - 0.5) * 68;
      item.burstUntil = Math.max(item.burstUntil, now + 700 + Math.random() * 760);
      pickScatterTarget(item, x, y, index, fish.length, now);
    });
  }

  function getFoodTarget(item: Fish, now: number) {
    if (!feedTarget || now > item.feedUntil) return null;

    let totalLife = 0;
    let weightedX = 0;
    let weightedY = 0;

    food.forEach((crumb) => {
      const weight = Math.max(0, crumb.life);
      totalLife += weight;
      weightedX += crumb.x * weight;
      weightedY += crumb.y * weight;
    });

    const x = totalLife > 0 ? weightedX / totalLife : feedTarget.x;
    const y = totalLife > 0 ? weightedY / totalLife : feedTarget.y;

    return {
      x: x + item.feedOffsetX,
      y: y + item.feedOffsetY,
      strength:
        now <= feedTarget.gatherUntil
          ? 1
          : clamp(
              (item.feedUntil - now) / Math.max(1, item.feedUntil - feedTarget.gatherUntil),
              0,
              1,
            ),
    };
  }

  function pickScatterTarget(
    item: Fish,
    sourceX: number,
    sourceY: number,
    index: number,
    total: number,
    now: number,
  ) {
    let awayAngle = Math.atan2(item.y - sourceY, item.x - sourceX);
    if (Math.abs(item.x - sourceX) + Math.abs(item.y - sourceY) < 60) {
      awayAngle = (Math.PI * 2 * index) / Math.max(1, total);
    }

    awayAngle += (Math.random() - 0.5) * 0.95;

    const radius =
      Math.max(260, Math.min(viewport.width, viewport.height) * 0.48) + Math.random() * 320;
    item.scatterX = clamp(sourceX + Math.cos(awayAngle) * radius, 42, viewport.width - 42);
    item.scatterY = clamp(sourceY + Math.sin(awayAngle) * radius, 56, viewport.height - 42);
    item.roamX = item.scatterX;
    item.roamY = item.scatterY;
    item.nextRoamAt = now + 9000 + Math.random() * 7000;
  }

  function getScatterTarget(item: Fish, now: number) {
    if (!feedTarget || now <= feedTarget.gatherUntil || now > item.scatterUntil) return null;
    return {
      x: item.scatterX,
      y: item.scatterY,
      strength: clamp(
        (item.scatterUntil - now) / Math.max(1, item.scatterUntil - feedTarget.gatherUntil),
        0.25,
        1,
      ),
    };
  }

  function normalizeAngle(angle: number) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  function pushBubble(x: number, y: number, size: number, now: number) {
    bubbles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.012,
      vy: -(0.012 + Math.random() * 0.022),
      size,
      wobble: Math.random() * Math.PI * 2,
      life: 1,
      bornAt: now,
    });

    if (bubbles.length > 48) bubbles.splice(0, bubbles.length - 48);
  }

  function steerToward(
    item: Fish,
    x: number,
    y: number,
    desiredSpeed: number,
    turnEase: number,
    delta: number,
  ) {
    const dx = x - item.x;
    const dy = y - item.y;
    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    item.vx += ((dx / distance) * desiredSpeed - item.vx) * turnEase * delta;
    item.vy += ((dy / distance) * desiredSpeed - item.vy) * turnEase * delta;
    return distance;
  }

  function getFishSpeed(item: Fish) {
    return Math.sqrt(item.vx * item.vx + item.vy * item.vy);
  }

  function getFishIntent(item: Fish, now: number): Intent {
    let target: Intent['target'] | null = getFoodTarget(item, now);
    if (target) return { mode: 'feed', target };

    target = getScatterTarget(item, now);
    if (target) return { mode: 'scatter', target };

    return {
      mode: 'roam',
      target: {
        x: item.roamX,
        y: item.roamY,
        strength: 1,
      },
    };
  }

  function applyWanderForce(item: Fish, intensity: number, delta: number) {
    const profile = item.profile || getSpeciesProfile(item.species);
    item.vx += Math.cos(item.wander * 1.7 + item.phase * 0.72) * intensity * profile.wander * delta;
    item.vy +=
      Math.sin(item.wander * 1.24 + item.phase * 0.9) * intensity * 0.88 * profile.wander * delta;
  }

  function applyIntentMotion(
    item: Fish,
    intent: Intent,
    isBursting: boolean,
    delta: number,
    now: number,
  ) {
    const profile = item.profile || getSpeciesProfile(item.species);
    const target = intent.target;

    if (intent.mode === 'feed') {
      const foodDx = target.x - item.x;
      const foodDy = target.y - item.y;
      const foodDistance = Math.max(1, Math.sqrt(foodDx * foodDx + foodDy * foodDy));
      const arriveSpeed = clamp(foodDistance / 260, 0.22, 1);
      const lingerEase = 0.72 + (target.strength || 1) * 0.28;
      const feedSpeed =
        (isBursting ? MOVEMENT.feedBurstSpeed : MOVEMENT.feedSpeed) *
        profile.feed *
        item.personality *
        lingerEase;

      steerToward(
        item,
        target.x,
        target.y,
        feedSpeed * arriveSpeed,
        MOVEMENT.feedTurn * profile.turn,
        delta,
      );

      if (foodDistance < 178) {
        const orbitForce =
          (1 - foodDistance / 178) * MOVEMENT.feedOrbit * delta * item.orbit * profile.turn;
        item.vx += (-foodDy / foodDistance) * orbitForce;
        item.vy += (foodDx / foodDistance) * orbitForce;
      }

      applyWanderForce(item, MOVEMENT.roamWander * 0.7, delta);
      return foodDistance;
    }

    if (intent.mode === 'scatter') {
      const scatterDistance = steerToward(
        item,
        target.x,
        target.y,
        MOVEMENT.scatterSpeed *
          profile.scatter *
          item.personality *
          (0.84 + (target.strength || 1) * 0.16),
        MOVEMENT.scatterTurn * profile.turn,
        delta,
      );

      applyWanderForce(item, MOVEMENT.scatterWander, delta);

      if (scatterDistance < 90) {
        item.scatterUntil = Math.min(item.scatterUntil, now + 360);
        pickRoamTarget(item, now);
      }

      return scatterDistance;
    }

    let roamDx = item.roamX - item.x;
    let roamDy = item.roamY - item.y;
    let roamDistance = Math.max(1, Math.sqrt(roamDx * roamDx + roamDy * roamDy));

    if (!item.nextRoamAt || now > item.nextRoamAt || roamDistance < 56) {
      pickRoamTarget(item, now);
      roamDx = item.roamX - item.x;
      roamDy = item.roamY - item.y;
      roamDistance = Math.max(1, Math.sqrt(roamDx * roamDx + roamDy * roamDy));
    }

    steerToward(
      item,
      item.roamX,
      item.roamY,
      (isBursting ? MOVEMENT.roamBurstSpeed : MOVEMENT.roamSpeed) *
        profile.cruise *
        item.personality,
      MOVEMENT.roamTurn * profile.turn,
      delta,
    );
    applyWanderForce(item, MOVEMENT.roamWander, delta);
    return roamDistance;
  }

  function applySocialForces(item: Fish, intent: Intent, delta: number) {
    const radius = intent.mode === 'feed' ? MOVEMENT.feedSocialRadius : MOVEMENT.socialRadius;
    const radius2 = radius * radius;
    let weightTotal = 0;
    let centerX = 0;
    let centerY = 0;
    let alignX = 0;
    let alignY = 0;
    let separateX = 0;
    let separateY = 0;

    fish.forEach((other) => {
      if (other === item) return;

      const dx = other.x - item.x;
      const dy = other.y - item.y;
      const d2 = dx * dx + dy * dy;
      if (d2 <= 0 || d2 > radius2) return;

      const d = Math.sqrt(d2);
      const weight = 1 - d / radius;
      weightTotal += weight;
      centerX += other.x * weight;
      centerY += other.y * weight;
      alignX += other.vx * weight;
      alignY += other.vy * weight;

      if (d < item.size * (intent.mode === 'feed' ? 6.2 : 5.4)) {
        separateX -= (dx / d) * (1 - d / radius);
        separateY -= (dy / d) * (1 - d / radius);
      }
    });

    if (weightTotal <= 0) return;

    centerX /= weightTotal;
    centerY /= weightTotal;
    alignX /= weightTotal;
    alignY /= weightTotal;

    const alignment = intent.mode === 'roam' ? 0.00072 : intent.mode === 'feed' ? 0.00018 : 0.0003;
    const separation =
      intent.mode === 'feed' ? 0.00042 : intent.mode === 'scatter' ? 0.00074 : 0.00024;

    item.vx += (alignX - item.vx) * alignment * delta;
    item.vy += (alignY - item.vy) * alignment * delta;

    if (intent.mode === 'roam') {
      item.vx += ((centerX - item.x) / 260) * 0.0002 * delta;
      item.vy += ((centerY - item.y) / 260) * 0.00015 * delta;
    }

    item.vx += separateX * separation * delta;
    item.vy += separateY * separation * delta;
  }

  function applyEdgeForces(item: Fish, intent: Intent, delta: number) {
    const edgeMargin = Math.max(
      intent.mode === 'scatter' ? 122 : 102,
      item.size * (intent.mode === 'scatter' ? 7.2 : 6.4),
    );
    const push = MOVEMENT.edgePush * (intent.mode === 'scatter' ? 1.25 : 1);
    const futureX = item.x + item.vx * 880;
    const futureY = item.y + item.vy * 880;

    if (item.x < edgeMargin) item.vx += ((edgeMargin - item.x) / edgeMargin) * push * delta;
    if (item.x > viewport.width - edgeMargin)
      item.vx -= ((item.x - (viewport.width - edgeMargin)) / edgeMargin) * push * delta;
    if (item.y < 58) item.vy += 0.00044 * delta;
    if (item.y > viewport.height - 48) item.vy -= 0.00044 * delta;

    if (futureX < edgeMargin)
      item.vx += ((edgeMargin - futureX) / edgeMargin) * push * 0.45 * delta;
    if (futureX > viewport.width - edgeMargin)
      item.vx -= ((futureX - (viewport.width - edgeMargin)) / edgeMargin) * push * 0.45 * delta;
    if (futureY < 58) item.vy += 0.00018 * delta;
    if (futureY > viewport.height - 48) item.vy -= 0.00018 * delta;
  }

  function limitFishSpeed(item: Fish, intent: Intent, isBursting: boolean) {
    const profile = item.profile || getSpeciesProfile(item.species);
    const maxSpeed =
      intent.mode === 'feed'
        ? (isBursting ? MOVEMENT.feedBurstSpeed * 1.12 : MOVEMENT.feedSpeed * 1.18) * profile.feed
        : intent.mode === 'scatter'
          ? MOVEMENT.scatterSpeed * 1.22 * profile.scatter
          : (isBursting ? MOVEMENT.roamBurstSpeed * 1.2 : MOVEMENT.roamSpeed * 1.72) *
            profile.cruise;
    const speed = Math.max(0.01, getFishSpeed(item));

    if (speed > maxSpeed) {
      item.vx = (item.vx / speed) * maxSpeed;
      item.vy = (item.vy / speed) * maxSpeed;
    }
  }

  function handleBounds(item: Fish, now: number) {
    const margin = item.size * 2.6;
    if (item.x < margin) {
      item.x = margin;
      item.vx = Math.abs(item.vx) * 0.62;
      pickRoamTarget(item, now);
    }
    if (item.x > viewport.width - margin) {
      item.x = viewport.width - margin;
      item.vx = -Math.abs(item.vx) * 0.62;
      pickRoamTarget(item, now);
    }
    if (item.y < 48) {
      item.y = 48;
      item.vy = Math.abs(item.vy) * 0.64;
    }
    if (item.y > viewport.height - 38) {
      item.y = viewport.height - 38;
      item.vy = -Math.abs(item.vy) * 0.64;
    }
  }

  function updateFish(item: Fish, delta: number, now: number) {
    const profile = item.profile || getSpeciesProfile(item.species);
    const currentSpeed = getFishSpeed(item);
    item.phase += delta * (0.00072 * profile.tailTempo + currentSpeed * 0.082);
    item.wander += delta * (0.000105 + item.personality * 0.000045) * profile.wander;

    if (now > item.nextBurstAt) {
      item.burstUntil = now + (520 + Math.random() * 920) * profile.burst;
      item.nextBurstAt = now + (17000 + Math.random() * 30000) / profile.burst;
    }

    const isBursting = now < item.burstUntil;
    const intent = getFishIntent(item, now);
    item.mode = intent.mode;

    applyIntentMotion(item, intent, isBursting, delta, now);
    applySocialForces(item, intent, delta);
    applyEdgeForces(item, intent, delta);

    item.vx *= intent.mode === 'roam' ? 0.996 : 0.992;
    item.vy *= intent.mode === 'roam' ? 0.996 : 0.992;
    limitFishSpeed(item, intent, isBursting);

    item.x += item.vx * delta;
    item.y += item.vy * delta;

    if (intent.mode === 'feed' && food.length > 0) {
      for (let i = 0; i < food.length; i += 1) {
        const crumb = food[i];
        const foodDx = crumb.x - item.x;
        const foodDy = crumb.y - item.y;
        if (foodDx * foodDx + foodDy * foodDy < item.size * item.size * 5) {
          crumb.life -= 0.0022 * delta;
          if (Math.random() < 0.16) {
            pushBubble(
              item.x - Math.cos(item.angle) * item.size,
              item.y - Math.sin(item.angle) * item.size,
              1.6 + Math.random() * 2.2,
              now,
            );
          }
          break;
        }
      }
    }

    handleBounds(item, now);

    if (isBursting && Math.random() < 0.035) {
      pushBubble(
        item.x - Math.cos(item.angle) * item.size * 1.2,
        item.y - Math.sin(item.angle) * item.size * 1.2,
        1.2 + Math.random() * 1.8,
        now,
      );
    }

    item.turn = item.vx >= 0 ? 1 : -1;

    const desiredAngle = Math.atan2(item.vy, item.vx || 0.001);
    item.angle +=
      normalizeAngle(desiredAngle - item.angle) *
      (intent.mode === 'roam' && !isBursting ? 0.036 * profile.turn : 0.074 * profile.turn);
  }

  function updateFood(delta: number, now: number) {
    food.forEach((crumb) => {
      crumb.drift += delta * 0.001;
      crumb.vy += 0.0000018 * delta;
      crumb.x += crumb.vx * delta;
      crumb.y += crumb.vy * delta;
      crumb.x += Math.sin(crumb.drift + crumb.y * 0.02) * 0.012 * delta;
      crumb.life -= (feedTarget && now > feedTarget.gatherUntil ? 0.00062 : 0.000045) * delta;
    });

    food = food.filter((crumb) => crumb.life > 0 && crumb.y < viewport.height + 24);
  }

  function updateBubbles(delta: number) {
    bubbles.forEach((bubble) => {
      bubble.wobble += delta * 0.002;
      bubble.x += bubble.vx * delta + Math.sin(bubble.wobble) * 0.01 * delta;
      bubble.y += bubble.vy * delta;
      bubble.life -= 0.00038 * delta;
    });

    bubbles = bubbles.filter((bubble) => bubble.life > 0 && bubble.y > -24);
  }

  function drawFish(item: Fish) {
    if (!context) return;
    const speed = Math.sqrt(item.vx * item.vx + item.vy * item.vy);
    const swimEnergy = Math.min(1, speed / 0.064);
    const shape = fishShape(item);
    const tailPhase = item.phase * item.tailRate;
    const tail = Math.sin(tailPhase) * (0.42 + swimEnergy * 0.62);
    const bodyLength = item.size * shape.length;
    const bodyHeight = item.size * shape.height;
    const bodyPulse = 1 + Math.sin(item.phase * 1.35) * (0.024 + swimEnergy * 0.024);
    const finPulse = Math.sin(tailPhase * 0.92 + 0.7) * (0.16 + swimEnergy * 0.22);
    const bodyFlex = item.size * (0.08 + swimEnergy * 0.24);
    const headBend = Math.sin(tailPhase - 2.15) * bodyFlex * 0.24;
    const shoulderBend = Math.sin(tailPhase - 1.42) * bodyFlex * 0.58;
    const waistBend = Math.sin(tailPhase - 0.76) * bodyFlex * 0.88;
    const bodyBend = Math.sin(tailPhase - 0.18) * bodyFlex;
    const bob = Math.sin(item.phase * 0.68) * item.size * (0.08 + swimEnergy * 0.08);
    const bodyRoll = Math.sin(tailPhase - 1.1) * (0.01 + swimEnergy * 0.025);
    const tailBaseX = bodyLength * shape.tailBase;
    const tailTipX = bodyLength * shape.tailTip;
    const tailTipY = bodyBend + tail * bodyHeight * (0.35 + swimEnergy * 0.24);
    const noseX = bodyLength * shape.nose;
    const shoulderX = bodyLength * 0.2;
    const waistX = -bodyLength * 0.16;
    const caudalX = tailBaseX + bodyLength * 0.08;

    context.save();
    context.translate(item.x, item.y + bob);
    context.rotate(item.angle + bodyRoll);
    context.scale(1, bodyPulse);
    context.globalAlpha = shape.alpha;

    const gradient = context.createLinearGradient(-bodyLength * 0.5, 0, bodyLength * 0.55, 0);
    gradient.addColorStop(0, item.fin);
    gradient.addColorStop(0.42, item.body);
    gradient.addColorStop(1, item.fin);

    context.fillStyle = 'rgba(2, 6, 23, 0.18)';
    context.beginPath();
    context.ellipse(
      -bodyLength * 0.02,
      bodyHeight * 0.34,
      bodyLength * 0.48,
      bodyHeight * 0.14,
      0,
      0,
      Math.PI * 2,
    );
    context.fill();

    context.fillStyle = item.fin;
    if (item.species === 'forktail') {
      context.beginPath();
      context.moveTo(caudalX, bodyBend * 0.45);
      context.lineTo(tailTipX, tailTipY - bodyHeight * 0.7);
      context.lineTo(tailTipX + bodyLength * 0.22, tailTipY - bodyHeight * 0.08);
      context.closePath();
      context.fill();

      context.beginPath();
      context.moveTo(caudalX, bodyBend * 0.45);
      context.lineTo(tailTipX, tailTipY + bodyHeight * 0.7);
      context.lineTo(tailTipX + bodyLength * 0.22, tailTipY + bodyHeight * 0.08);
      context.closePath();
      context.fill();
    } else if (item.species === 'angel') {
      context.beginPath();
      context.moveTo(caudalX, bodyBend * 0.38);
      context.quadraticCurveTo(
        tailTipX,
        tailTipY - bodyHeight * 0.46,
        tailTipX + bodyLength * 0.11,
        tailTipY,
      );
      context.quadraticCurveTo(tailTipX, tailTipY + bodyHeight * 0.46, caudalX, bodyBend * 0.38);
      context.closePath();
      context.fill();
    } else {
      context.beginPath();
      context.moveTo(caudalX, bodyBend * 0.48);
      context.quadraticCurveTo(
        tailTipX,
        tailTipY - bodyHeight * 0.66,
        tailTipX + item.size * 0.18,
        tailTipY,
      );
      context.quadraticCurveTo(tailTipX, tailTipY + bodyHeight * 0.66, caudalX, bodyBend * 0.48);
      context.closePath();
      context.fill();
    }

    context.fillStyle = item.fin;
    context.globalAlpha *= 0.82;
    context.beginPath();
    context.moveTo(tailBaseX + bodyLength * 0.14, bodyBend * 0.52 - bodyHeight * 0.22);
    context.quadraticCurveTo(
      tailBaseX + bodyLength * 0.02,
      bodyBend * 0.9,
      tailBaseX - bodyLength * 0.1,
      tailTipY * 0.64,
    );
    context.quadraticCurveTo(
      tailBaseX + bodyLength * 0.04,
      bodyBend * 0.42 + bodyHeight * 0.16,
      tailBaseX + bodyLength * 0.14,
      bodyBend * 0.52 + bodyHeight * 0.22,
    );
    context.closePath();
    context.fill();
    context.globalAlpha = shape.alpha;

    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(noseX, headBend);
    context.bezierCurveTo(
      bodyLength * 0.42,
      -bodyHeight * 0.5 + headBend * 0.2,
      shoulderX,
      -bodyHeight * 0.62 + shoulderBend * 0.28,
      waistX,
      -bodyHeight * (item.species === 'round' ? 0.68 : 0.55) + waistBend * 0.36,
    );
    context.bezierCurveTo(
      tailBaseX + bodyLength * 0.1,
      -bodyHeight * 0.26 + bodyBend * 0.66,
      tailBaseX - bodyLength * 0.03,
      -bodyHeight * 0.08 + bodyBend * 0.92,
      tailBaseX,
      bodyBend,
    );
    context.bezierCurveTo(
      tailBaseX - bodyLength * 0.02,
      bodyHeight * 0.1 + bodyBend * 0.88,
      tailBaseX + bodyLength * 0.12,
      bodyHeight * 0.28 + bodyBend * 0.62,
      waistX,
      bodyHeight * (item.species === 'round' ? 0.68 : 0.55) + waistBend * 0.28,
    );
    context.bezierCurveTo(
      bodyLength * 0.32,
      bodyHeight * 0.5 + shoulderBend * 0.12,
      bodyLength * 0.5,
      bodyHeight * 0.34 + headBend * 0.15,
      noseX,
      headBend,
    );
    context.closePath();
    context.fill();

    context.fillStyle = 'rgba(255,255,255,0.42)';
    context.beginPath();
    context.ellipse(
      bodyLength * 0.03,
      -bodyHeight * 0.2 + shoulderBend * 0.16,
      bodyLength * 0.34,
      bodyHeight * 0.1,
      -0.18 + bodyRoll * 2.2,
      0,
      Math.PI * 2,
    );
    context.fill();

    context.strokeStyle = 'rgba(255,255,255,0.34)';
    context.lineWidth = Math.max(0.45, item.size * 0.035);
    context.beginPath();
    context.moveTo(noseX * 0.7, headBend * 0.6);
    context.bezierCurveTo(
      shoulderX,
      shoulderBend * 0.35,
      waistX,
      waistBend * 0.38,
      tailBaseX + bodyLength * 0.1,
      bodyBend * 0.7,
    );
    context.stroke();

    drawFishPattern(item, bodyLength, bodyHeight, bodyBend);

    context.fillStyle = item.fin;
    if (item.species === 'angel') {
      context.beginPath();
      context.moveTo(-bodyLength * 0.12, -bodyHeight * 0.2 + shoulderBend * 0.2);
      context.quadraticCurveTo(
        -bodyLength * 0.32,
        -bodyHeight * (1.28 + finPulse),
        bodyLength * 0.16,
        -bodyHeight * 0.18 + headBend * 0.16,
      );
      context.closePath();
      context.fill();

      context.beginPath();
      context.moveTo(-bodyLength * 0.02, bodyHeight * 0.1 + shoulderBend * 0.18);
      context.quadraticCurveTo(
        -bodyLength * 0.3,
        bodyHeight * (1.34 + finPulse),
        bodyLength * 0.18,
        bodyHeight * 0.28 + headBend * 0.12,
      );
      context.closePath();
      context.fill();
    } else {
      context.beginPath();
      context.moveTo(-bodyLength * 0.08, -bodyHeight * 0.02 + shoulderBend * 0.18);
      context.quadraticCurveTo(
        -bodyLength * (0.2 + finPulse * 0.04),
        -bodyHeight * (item.species === 'stream' ? 0.36 : 0.52 + finPulse * 0.42),
        bodyLength * 0.18,
        -bodyHeight * 0.2 + headBend * 0.16,
      );
      context.closePath();
      context.fill();
    }

    context.beginPath();
    context.moveTo(-bodyLength * 0.04, bodyHeight * 0.05 + waistBend * 0.18);
    context.quadraticCurveTo(
      -bodyLength * (item.species === 'stream' ? 0.18 : 0.26 + finPulse * 0.06),
      bodyHeight * (item.species === 'stream' ? 0.44 : 0.72 + finPulse * 0.8),
      bodyLength * 0.16,
      bodyHeight * 0.32 + headBend * 0.12,
    );
    context.closePath();
    context.fill();

    context.fillStyle = '#020617';
    context.beginPath();
    context.arc(
      bodyLength * 0.42,
      -bodyHeight * 0.1 + headBend,
      Math.max(1.2, item.size * 0.085),
      0,
      Math.PI * 2,
    );
    context.fill();

    context.fillStyle = 'rgba(255,255,255,0.82)';
    context.beginPath();
    context.arc(
      bodyLength * 0.44,
      -bodyHeight * 0.13 + headBend,
      Math.max(0.45, item.size * 0.025),
      0,
      Math.PI * 2,
    );
    context.fill();

    context.restore();
  }

  function drawFood() {
    if (!context) return;
    context.save();
    food.forEach((crumb) => {
      context.globalAlpha = Math.max(0, Math.min(1, crumb.life)) * 0.72;
      context.fillStyle = '#fde68a';
      context.beginPath();
      context.arc(crumb.x, crumb.y, crumb.size, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();
  }

  function drawBubbles() {
    if (!context) return;
    context.save();
    bubbles.forEach((bubble) => {
      context.globalAlpha = Math.max(0, Math.min(1, bubble.life)) * 0.34;
      context.strokeStyle =
        document.documentElement.dataset.theme === 'light' ? '#0891b2' : '#a5f3fc';
      context.lineWidth = 1;
      context.beginPath();
      context.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      context.stroke();
    });
    context.restore();
  }

  function getSeaweedInfluence(baseX: number, baseY: number) {
    let influence = 0;

    fish.forEach((item) => {
      const dx = item.x - baseX;
      const dy = item.y - (baseY - 72);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 190) return;

      const direction = item.vx === 0 ? 0 : item.vx / Math.abs(item.vx);
      influence += (1 - distance / 190) * direction * Math.min(1, getFishSpeed(item) / 0.055);
    });

    return clamp(influence, -1.2, 1.2);
  }

  function isHabitatClusterVisible(cluster: SeaweedCluster) {
    return !cluster.minWidth || viewport.width >= cluster.minWidth;
  }

  function getHabitatBaseX(cluster: SeaweedCluster) {
    return clamp(viewport.width * cluster.xRatio, cluster.width, viewport.width - cluster.width);
  }

  function drawHabitatFloor(now: number) {
    if (!context || viewport.height < 430) return;

    const isLight = document.documentElement.dataset.theme === 'light';
    const floorColor = isLight ? 'rgba(15, 23, 42, 0.045)' : 'rgba(226, 232, 240, 0.075)';
    const pebbleColors = isLight
      ? ['rgba(100, 116, 139, 0.18)', 'rgba(20, 184, 166, 0.12)', 'rgba(202, 138, 4, 0.13)']
      : ['rgba(203, 213, 225, 0.16)', 'rgba(103, 232, 249, 0.12)', 'rgba(253, 230, 138, 0.12)'];
    const baseY = viewport.height + 10;

    context.save();
    SEAWEED_CLUSTERS.forEach((cluster) => {
      if (!isHabitatClusterVisible(cluster)) return;

      const scale = viewport.width < 720 ? 0.74 : viewport.width < 1180 ? 0.88 : 1;
      const baseX = getHabitatBaseX(cluster);

      context.fillStyle = floorColor;
      context.beginPath();
      context.ellipse(
        baseX,
        baseY - 4,
        cluster.width * 0.66 * scale,
        12 * scale,
        0,
        0,
        Math.PI * 2,
      );
      context.fill();

      (cluster.pebbles || []).forEach((pebble) => {
        context.fillStyle = pebbleColors[pebble.color % pebbleColors.length];
        context.beginPath();
        context.ellipse(
          baseX + pebble.offset * scale,
          baseY - pebble.lift * scale,
          pebble.rx * scale,
          pebble.ry * scale,
          Math.sin(now * 0.00018 + pebble.seed) * 0.08,
          0,
          Math.PI * 2,
        );
        context.fill();
      });
    });
    context.restore();
  }

  function drawHabitatBubbles(now: number) {
    if (!context || viewport.height < 430) return;

    const isLight = document.documentElement.dataset.theme === 'light';
    const stroke = isLight ? 'rgba(8, 145, 178, 0.18)' : 'rgba(165, 243, 252, 0.2)';
    const baseY = viewport.height + 4;

    context.save();
    context.strokeStyle = stroke;
    context.lineWidth = 1;

    SEAWEED_CLUSTERS.forEach((cluster) => {
      if (!isHabitatClusterVisible(cluster)) return;

      const scale = viewport.width < 720 ? 0.74 : viewport.width < 1180 ? 0.88 : 1;
      const baseX = getHabitatBaseX(cluster);

      (cluster.bubbles || []).forEach((bubble) => {
        const phase = (now * 0.000055 + bubble.seed) % 1;
        const drift = Math.sin(now * 0.0013 + bubble.seed * 8) * 8 * scale;
        const x = baseX + bubble.offset * scale + drift;
        const y = baseY - 24 * scale - phase * 142 * scale;
        const alpha = Math.sin(phase * Math.PI) * 0.68;

        context.globalAlpha = alpha;
        context.beginPath();
        context.arc(x, y, bubble.size * scale * (0.78 + phase * 0.45), 0, Math.PI * 2);
        context.stroke();
      });
    });
    context.restore();
  }

  function drawSeaweed(now: number) {
    if (!context || viewport.height < 430) return;

    const isLight = document.documentElement.dataset.theme === 'light';
    const bladeColor = isLight ? 'rgba(14, 116, 144, 0.2)' : 'rgba(103, 232, 249, 0.18)';
    const bladeHighlight = isLight ? 'rgba(22, 163, 74, 0.13)' : 'rgba(74, 222, 128, 0.12)';
    const shadowColor = isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(2, 6, 23, 0.14)';
    const baseY = viewport.height + 10;

    context.save();
    SEAWEED_CLUSTERS.forEach((cluster) => {
      if (!isHabitatClusterVisible(cluster)) return;

      const baseX = getHabitatBaseX(cluster);
      const fishInfluence = getSeaweedInfluence(baseX, baseY);

      context.fillStyle = shadowColor;
      context.beginPath();
      context.ellipse(baseX, baseY - 2, cluster.width * 0.58, 10, 0, 0, Math.PI * 2);
      context.fill();

      cluster.blades.forEach((blade, index) => {
        const scale = viewport.width < 720 ? 0.74 : viewport.width < 1180 ? 0.88 : 1;
        const baseOffset = blade.offset * scale;
        const height = blade.height * scale;
        const wave = Math.sin(now * 0.001 + blade.seed) * (5 + height * 0.03);
        const current = fishInfluence * (8 + index * 1.5);
        const bend = wave + current + blade.curve * height * 0.28;
        const x0 = baseX + baseOffset;
        const y0 = baseY;
        const x1 = x0 + bend * 0.42;
        const y1 = y0 - height * 0.45;
        const x2 = x0 + bend;
        const y2 = y0 - height;

        context.strokeStyle = index % 2 === 0 ? bladeColor : bladeHighlight;
        context.lineWidth = blade.width * scale;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(x0, y0);
        context.quadraticCurveTo(x1, y1, x2, y2);
        context.stroke();

        context.fillStyle = index % 2 === 0 ? bladeHighlight : bladeColor;
        context.globalAlpha = 0.8;
        context.beginPath();
        context.ellipse(
          x2,
          y2 + height * 0.08,
          Math.max(1.8, blade.width * scale),
          height * 0.12,
          bend * 0.004,
          0,
          Math.PI * 2,
        );
        context.fill();
        context.globalAlpha = 1;
      });
    });
    context.restore();
  }

  function fishShape(item: Fish) {
    return FISH_SHAPES[item.species] || FISH_SHAPES.classic;
  }

  function drawFishPattern(item: Fish, bodyLength: number, bodyHeight: number, bodyBend: number) {
    if (!context) return;
    context.save();

    if (item.pattern === 'stripe') {
      context.globalAlpha *= 0.72;
      context.strokeStyle = item.accent;
      context.lineWidth = Math.max(0.65, item.size * 0.055);
      for (let stripe = 0; stripe < 3; stripe += 1) {
        const stripeX = -bodyLength * 0.22 + stripe * bodyLength * 0.18;
        context.beginPath();
        context.moveTo(stripeX, -bodyHeight * 0.34);
        context.quadraticCurveTo(
          stripeX + bodyLength * 0.05,
          bodyBend * 0.06,
          stripeX - bodyLength * 0.02,
          bodyHeight * 0.34,
        );
        context.stroke();
      }
    }

    if (item.pattern === 'spot') {
      context.globalAlpha *= 0.62;
      context.fillStyle = item.accent;
      for (let spot = 0; spot < 4; spot += 1) {
        const spotX = -bodyLength * 0.2 + spot * bodyLength * 0.17;
        const spotY = (spot % 2 === 0 ? -1 : 1) * bodyHeight * 0.16;
        context.beginPath();
        context.ellipse(spotX, spotY, item.size * 0.11, item.size * 0.075, 0.2, 0, Math.PI * 2);
        context.fill();
      }
    }

    if (item.pattern === 'band') {
      context.globalAlpha *= 0.5;
      context.fillStyle = item.accent;
      context.beginPath();
      context.ellipse(
        -bodyLength * 0.1,
        bodyBend * 0.05,
        bodyLength * 0.08,
        bodyHeight * 0.42,
        -0.12,
        0,
        Math.PI * 2,
      );
      context.fill();
    }

    if (item.pattern === 'none') {
      context.globalAlpha *= 0.52;
      context.strokeStyle = item.accent;
      context.lineWidth = Math.max(0.55, item.size * 0.045);
      context.beginPath();
      context.moveTo(-bodyLength * 0.32, bodyBend * 0.08);
      context.quadraticCurveTo(
        -bodyLength * 0.02,
        -bodyHeight * 0.05,
        bodyLength * 0.34,
        -bodyHeight * 0.02,
      );
      context.stroke();
    }

    context.restore();
  }

  function drawWater(now: number) {
    if (!context) return;
    context.save();
    context.globalAlpha = 0.08;
    context.strokeStyle =
      document.documentElement.dataset.theme === 'light' ? '#0e7490' : '#67e8f9';
    context.lineWidth = 1;

    for (let i = 0; i < 3; i += 1) {
      const y = 96 + i * 84 + Math.sin(now * 0.00018 + i) * 10;
      context.beginPath();
      for (let x = -40; x <= viewport.width + 40; x += 32) {
        const waveY = y + Math.sin(x * 0.018 + now * 0.00035 + i) * 4;
        if (x === -40) context.moveTo(x, waveY);
        else context.lineTo(x, waveY);
      }
      context.stroke();
    }
    context.restore();
  }

  function drawFrame(now: number) {
    if (!context) return;
    context.clearRect(0, 0, viewport.width, viewport.height);
    if (!enabled) return;

    drawWater(now);
    drawHabitatFloor(now);
    drawSeaweed(now);
    drawHabitatBubbles(now);
    drawBubbles();
    drawFood();
    fish.forEach(drawFish);
  }

  function tick(now: number) {
    const delta = Math.min(32, now - lastTime);
    lastTime = now;

    if (enabled) {
      if (feedTarget && now > feedTarget.until) {
        feedTarget = null;
      }

      updateFood(delta, now);
      updateBubbles(delta);
      fish.forEach((item) => {
        updateFish(item, delta, now);
      });
    }

    drawFrame(now);
    animationId = window.requestAnimationFrame(tick);
  }

  function start() {
    if (animationId) return;
    lastTime = performance.now();
    animationId = window.requestAnimationFrame(tick);
  }

  function setEnabled(nextEnabled: boolean) {
    enabled = nextEnabled;
    writeStoredState(enabled);
    updateToggle();
    if (enabled) {
      syncFishCount();
      start();
    } else {
      if (!context) return;
      feedTarget = null;
      food = [];
      bubbles = [];
      context.clearRect(0, 0, viewport.width, viewport.height);
    }
  }

  function handleButtonClick(event: MouseEvent) {
    event.stopPropagation();
    setEnabled(!enabled);
  }

  function handlePointerDown(event: PointerEvent) {
    if (
      !enabled ||
      event.button !== 0 ||
      (event.target as HTMLElement | null)?.closest('[data-aquarium-toggle]')
    )
      return;
    feed(event.clientX, event.clientY);
  }

  function handleMotionChange(event: MediaQueryListEvent) {
    reducedMotion = event.matches;
    try {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setEnabled(!reducedMotion);
      }
    } catch (_error) {}
  }

  function cleanup() {
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      animationId = 0;
    }
    button?.removeEventListener('click', handleButtonClick);
    document.removeEventListener('pointerdown', handlePointerDown);
    window.removeEventListener('resize', resize);
    if (motionQuery && motionQuery.removeEventListener) {
      motionQuery.removeEventListener('change', handleMotionChange);
    }
  }

  button.addEventListener('click', handleButtonClick);
  document.addEventListener('pointerdown', handlePointerDown, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  if (motionQuery && motionQuery.addEventListener) {
    motionQuery.addEventListener('change', handleMotionChange);
  }
  document.addEventListener('astro:before-swap', cleanup, { once: true });

  resize();
  updateToggle();
  if (enabled) start();

  return cleanup;
}
