const fs = require('fs');

const BOARD_W = 8;
const BOARD_H = 7;

const GUARD_BEHAVIOR = {
  FIXED: "fixed",
  PATROL: "patrol",
  INVESTIGATE: "investigate",
  TRACE: "trace"
};

const CAMERA_DIRECTION = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right"
};

function cameraDirToVector(direction) {
  switch (direction) {
    case CAMERA_DIRECTION.UP: return { dx: 0, dy: -1 };
    case CAMERA_DIRECTION.DOWN: return { dx: 0, dy: 1 };
    case CAMERA_DIRECTION.LEFT: return { dx: -1, dy: 0 };
    case CAMERA_DIRECTION.RIGHT: return { dx: 1, dy: 0 };
    default: return { dx: 1, dy: 0 };
  }
}

function pointKey(p) { return `${p.x},${p.y}`; }
function samePoint(a, b) { return a.x === b.x && a.y === b.y; }
function isAdjacent(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1; }
function getGuardCycleLength(guards) {
  let lcm = 1;
  for (const g of guards) {
    const len = g.path.length;
    lcm = lcm * len / gcd(lcm, len);
  }
  return lcm;
}
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function initializeGuards(guards) {
  return guards.map((guard, index) => {
    const path = guard.path || [];
    const step = guard.step || 0;
    return {
      path: path.map(p => ({ ...p })),
      step: step,
      pos: path[step] ? { ...path[step] } : { x: 0, y: 0 },
      behavior: guard.behavior || GUARD_BEHAVIOR.FIXED,
      direction: guard.direction || 1,
      originalPath: path.map(p => ({ ...p })),
      originalStep: step,
      state: "patrol",
      investigateTarget: null,
      investigateTimer: 0,
      traceTarget: null,
      tracePath: [],
      alertLevel: 0,
      hearingRange: guard.hearingRange || 4,
      id: index
    };
  });
}

const levels = [
  {
    name: "一",
    walls: ["3,1", "3,2", "3,3", "3,4", "5,5"],
    doors: [],
    keys: [{ x: 1, y: 5 }],
    exhibits: [{ x: 6, y: 1, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [{ path: [{ x: 5, y: 2 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 5, y: 3 }], step: 0, behavior: "fixed", hearingRange: 4 }],
    exit: { x: 7, y: 0 }
  },
  {
    name: "二",
    walls: ["2,1", "2,2", "2,3", "5,0", "5,1", "5,2", "5,3", "4,5"],
    doors: [{ x: 5, y: 4, open: false }],
    keys: [{ x: 1, y: 1 }],
    exhibits: [{ x: 6, y: 5, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [
      { path: [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 3 }, { x: 3, y: 3 }], step: 0, behavior: "patrol", hearingRange: 5 }
    ],
    exit: { x: 7, y: 6 }
  },
  {
    name: "三",
    walls: ["1,2", "2,2", "3,2", "4,2", "6,2", "1,4", "3,4", "4,4", "5,4", "6,4"],
    doors: [{ x: 2, y: 4, open: false }],
    keys: [{ x: 7, y: 0 }],
    exhibits: [{ x: 0, y: 0, fixed: false }, { x: 7, y: 6, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [
      { path: [{ x: 5, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 3 }, { x: 5, y: 3 }], step: 0, behavior: "investigate", hearingRange: 5 },
      { path: [{ x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }], step: 0, behavior: "fixed", hearingRange: 3 }
    ],
    exit: { x: 4, y: 0 }
  },
  {
    name: "四",
    walls: ["3,0", "3,1", "3,2", "3,4", "3,5", "3,6"],
    doors: [{ x: 3, y: 3, open: false }],
    keys: [],
    exhibits: [{ x: 7, y: 2, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [
      { path: [{ x: 5, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 3 }, { x: 5, y: 3 }], step: 0, behavior: "trace", hearingRange: 4 }
    ],
    exit: { x: 7, y: 0 },
    mechanisms: {
      pressurePlates: [{ x: 2, y: 3, targetDoors: [{ x: 3, y: 3 }], triggered: false }],
      screens: [{ x: 5, y: 2 }],
      lights: [{ x: 2, y: 5, active: false }]
    }
  },
  {
    name: "五",
    walls: ["1,1", "1,2", "1,3", "4,1", "4,2", "5,4", "5,5", "5,6", "6,4"],
    doors: [{ x: 4, y: 3, open: false }, { x: 6, y: 5, open: false }],
    keys: [{ x: 0, y: 0 }],
    exhibits: [{ x: 7, y: 1, fixed: false }, { x: 7, y: 6, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [
      { path: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 4 }, { x: 2, y: 4 }], step: 0, behavior: "investigate", hearingRange: 6 },
      { path: [{ x: 6, y: 2 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 7, y: 2 }], step: 0, behavior: "trace", hearingRange: 4 }
    ],
    exit: { x: 7, y: 0 },
    mechanisms: {
      pressurePlates: [
        { x: 2, y: 5, targetDoors: [{ x: 4, y: 3 }], triggered: false }
      ],
      screens: [{ x: 3, y: 3 }],
      lights: [{ x: 5, y: 3, active: false }]
    }
  },
  {
    name: "六",
    walls: ["2,0", "2,1", "2,2", "2,3", "5,3", "5,4", "5,5", "5,6"],
    doors: [{ x: 2, y: 4, open: false }, { x: 5, y: 2, open: false }],
    keys: [{ x: 0, y: 3 }, { x: 7, y: 3 }],
    exhibits: [{ x: 3, y: 1, fixed: false }, { x: 4, y: 5, fixed: false }],
    player: { x: 0, y: 0 },
    guards: [
      { path: [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 3, y: 4 }], step: 0, behavior: "patrol", hearingRange: 5 },
      { path: [{ x: 1, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 2, y: 5 }], step: 0, behavior: "investigate", hearingRange: 5 },
      { path: [{ x: 6, y: 0 }, { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 7, y: 0 }], step: 0, behavior: "trace", hearingRange: 4 }
    ],
    exit: { x: 7, y: 6 }
  }
];

function unifiedSolveLevel(level, options = {}) {
  const { walls, doors, keys: keyItems, exhibits, guards, exit } = level;
  const mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  const pressurePlates = mechanisms.pressurePlates || [];
  const screens = mechanisms.screens || [];
  const lights = mechanisms.lights || [];
  const cameras = mechanisms.cameras || [];

  const numExhibits = exhibits.length;
  const numDoors = doors.length;
  const numPlates = pressurePlates.length;
  const numLights = lights.length;
  const numCameras = cameras.length;
  const numGuards = guards.length;
  const maxIterations = options.maxIterations || 300000;
  const mode = options.mode || 'full';

  let startPlayer, startKeys, startKeysTaken, startDoorsOpen, startFixed,
      startPlateTriggered, startScreens, startLightsActive, startVisionReduced,
      startPendingVisionReduction, startCamerasDisabled, startCameraShutdownTurns,
      startAlertLevel, startGuards, startOpenedDoors, startAp, startStep;

  if (options.startState) {
    const s = options.startState;
    startPlayer = { ...s.player };
    startKeys = s.keys || 0;
    startKeysTaken = keyItems.map((k, i) => s.keysTaken ? (s.keysTaken[i] || k.taken) : k.taken);
    startDoorsOpen = doors.map((d, i) => s.doorsOpen ? (s.doorsOpen[i] || d.open) : d.open);
    startFixed = exhibits.map((e, i) => s.fixed ? (s.fixed[i] || e.fixed) : e.fixed);
    startPlateTriggered = pressurePlates.map((p, i) => s.plateTriggered ? (s.plateTriggered[i] || p.triggered) : p.triggered);
    startScreens = (s.screens || screens).map(sc => ({ ...sc }));
    startLightsActive = lights.map((l, i) => s.lightsActive ? (s.lightsActive[i] || l.active) : l.active);
    startVisionReduced = s.visionReduced || false;
    startPendingVisionReduction = s.pendingVisionReduction || false;
    startCamerasDisabled = (s.cameraShutdownTurns || 0) > 0;
    startCameraShutdownTurns = s.cameraShutdownTurns || 0;
    startAlertLevel = s.alertLevel || 0;
    startAp = s.ap != null ? s.ap : 4;
    startStep = s.step != null ? s.step : 0;

    if (s.guards && s.guards.length === numGuards) {
      startGuards = s.guards.map(g => ({
        path: g.path ? g.path.map(p => ({ ...p })) : (g.originalPath || guards[g.id || 0].path).map(p => ({ ...p })),
        originalPath: g.originalPath ? g.originalPath.map(p => ({ ...p })) : guards[g.id || 0].path.map(p => ({ ...p })),
        step: g.step != null ? g.step : (guards[g.id || 0].step || 0),
        originalStep: g.originalStep != null ? g.originalStep : (guards[g.id || 0].step || 0),
        pos: g.pos ? { ...g.pos } : { ...(g.path ? g.path[g.step] : guards[g.id || 0].path[guards[g.id || 0].step || 0]) },
        behavior: g.behavior || guards[g.id || 0].behavior || GUARD_BEHAVIOR.FIXED,
        direction: g.direction != null ? g.direction : 1,
        state: g.state || 'patrol',
        investigateTarget: g.investigateTarget ? { ...g.investigateTarget } : null,
        investigateTimer: g.investigateTimer || 0,
        traceTarget: g.traceTarget ? { ...g.traceTarget } : null,
        tracePath: g.tracePath ? g.tracePath.map(p => ({ ...p })) : [],
        alertLevel: g.alertLevel || 0,
        hearingRange: g.hearingRange != null ? g.hearingRange : (guards[g.id || 0].hearingRange || 4),
        id: g.id != null ? g.id : (guards[g.id || 0].id != null ? guards[g.id || 0].id : 0)
      }));
    } else {
      startGuards = initializeGuards(guards);
    }
    startOpenedDoors = s.openedDoors ? s.openedDoors.map(d => ({ ...d })) : [];
  } else {
    startPlayer = { ...level.player };
    startKeys = 0;
    startKeysTaken = new Array(keyItems.length).fill(false);
    startDoorsOpen = new Array(numDoors).fill(false);
    startFixed = new Array(numExhibits).fill(false);
    startPlateTriggered = new Array(numPlates).fill(false);
    startScreens = screens.map(s => ({ ...s }));
    startLightsActive = new Array(numLights).fill(false);
    startVisionReduced = false;
    startPendingVisionReduction = false;
    startCamerasDisabled = false;
    startCameraShutdownTurns = 0;
    startAlertLevel = 0;
    startAp = 4;
    startStep = 0;
    startGuards = initializeGuards(guards);
    startOpenedDoors = [];
  }

  const allExhibitsFixedNow = startFixed.every(f => f);
  const atExitNow = samePoint(startPlayer, exit);
  if (mode === 'full' && allExhibitsFixedNow && atExitNow) {
    return {
      solvable: true,
      path: [{ ...startPlayer }],
      actions: ["已完成"],
      steps: 1,
      totalActions: 0
    };
  }

  const wallSet = new Set(walls);

  function cloneGuard(g) {
    return {
      path: g.path.map(p => ({ ...p })),
      originalPath: g.originalPath.map(p => ({ ...p })),
      step: g.step,
      originalStep: g.originalStep,
      pos: { ...g.pos },
      behavior: g.behavior,
      direction: g.direction,
      state: g.state,
      investigateTarget: g.investigateTarget ? { ...g.investigateTarget } : null,
      investigateTimer: g.investigateTimer,
      traceTarget: g.traceTarget ? { ...g.traceTarget } : null,
      tracePath: g.tracePath.map(p => ({ ...p })),
      alertLevel: g.alertLevel,
      hearingRange: g.hearingRange,
      id: g.id
    };
  }

  function cloneGuards(gs) {
    return gs.map(g => cloneGuard(g));
  }

  function solverGuardKey(guard) {
    let invTargetKey = guard.investigateTarget ? `${guard.investigateTarget.x},${guard.investigateTarget.y}` : '';
    let tracePathKey = guard.tracePath.map(p => `${p.x},${p.y}`).join('|');
    return `${guard.pos.x},${guard.pos.y}|${guard.step}|${guard.state}|${guard.alertLevel}|${invTargetKey}|${guard.investigateTimer}|${tracePathKey}`;
  }

  function solverStateKey(s) {
    const exhibitMask = s.fixed.reduce((acc, f, i) => f ? acc | (1 << i) : acc, 0);
    const plateMask = s.plateTriggered.reduce((acc, t, i) => t ? acc | (1 << i) : acc, 0);
    const lightMask = s.lightsActive.reduce((acc, a, i) => a ? acc | (1 << i) : acc, 0);
    const doorsMask = s.doorsOpen.reduce((acc, o, i) => o ? acc | (1 << i) : acc, 0);
    const screenKey = s.screens.map(sc => `${sc.x},${sc.y}`).sort().join("|");
    const guardsKey = s.guards.map(g => solverGuardKey(g)).join('||');
    const openedDoorsKey = s.openedDoors.map(d => `${d.x},${d.y},${d.turn}`).join('|');
    return `${s.pos.x},${s.pos.y}|${s.keys}|${exhibitMask}|${s.ap}|${s.alertLevel}|${plateMask}|${lightMask}|${doorsMask}|${screenKey}|${s.visionReduced ? 1 : 0}|${s.cameraShutdownTurns || 0}|${guardsKey}|${openedDoorsKey}`;
  }

  function getCameraVisionUnified(screenList, visionReduced, camerasDisabled, lightsActiveArr) {
    const vision = new Set();
    if (camerasDisabled) return vision;
    const screenSet = new Set(screenList.map(s => pointKey(s)));
    const camRange = visionReduced ? 3 : 6;
    cameras.forEach(cam => {
      if (cam.disabled) return;
      const vec = cameraDirToVector(cam.direction);
      for (let i = 1; i <= camRange; i++) {
        const p = { x: cam.x + vec.dx * i, y: cam.y + vec.dy * i };
        if (p.x < 0 || p.x >= BOARD_W || p.y < 0 || p.y >= BOARD_H) break;
        if (wallSet.has(pointKey(p))) break;
        if (screenSet.has(pointKey(p))) break;
        vision.add(pointKey(p));
      }
    });
    return vision;
  }

  function getGuardVisionUnified(guardsList, screenList, visionReduced) {
    const vision = new Set();
    const screenSet = new Set(screenList.map(s => pointKey(s)));
    const maxRange = visionReduced ? 1 : 2;
    guardsList.forEach((guard) => {
      const pos = guard.pos;
      vision.add(pointKey(pos));
      let dx = 0, dy = 0;
      if (guard.state === 'investigate' && guard.investigateTarget) {
        dx = Math.sign(guard.investigateTarget.x - pos.x);
        dy = Math.sign(guard.investigateTarget.y - pos.y);
        if (Math.abs(guard.investigateTarget.x - pos.x) >= Math.abs(guard.investigateTarget.y - pos.y)) {
          dy = 0;
        } else {
          dx = 0;
        }
      } else if (guard.state === 'trace' && guard.tracePath.length > 0) {
        const target = guard.tracePath[0];
        dx = Math.sign(target.x - pos.x);
        dy = Math.sign(target.y - pos.y);
      } else if (guard.behavior === GUARD_BEHAVIOR.PATROL) {
        const nextStep = guard.step + guard.direction;
        let dir = guard.direction;
        if (nextStep >= guard.path.length || nextStep < 0) {
          dir *= -1;
        }
        const nextIndex = guard.step + dir;
        const current = guard.path[guard.step];
        const next = guard.path[nextIndex];
        dx = Math.sign(next.x - current.x);
        dy = Math.sign(next.y - current.y);
      } else {
        const current = guard.path[guard.step];
        const next = guard.path[(guard.step + 1) % guard.path.length];
        dx = Math.sign(next.x - current.x);
        dy = Math.sign(next.y - current.y);
      }
      for (let i = 1; i <= maxRange; i++) {
        const p = { x: pos.x + dx * i, y: pos.y + dy * i };
        if (p.x < 0 || p.x >= BOARD_W || p.y < 0 || p.y >= BOARD_H) break;
        if (wallSet.has(pointKey(p))) break;
        if (screenSet.has(pointKey(p))) break;
        vision.add(pointKey(p));
      }
    });
    return vision;
  }

  function getFullVisionUnified(guardsList, screenList, visionReduced, camerasDisabled, lightsActiveArr) {
    const vision = getGuardVisionUnified(guardsList, screenList, visionReduced);
    const camVision = getCameraVisionUnified(screenList, visionReduced, camerasDisabled, lightsActiveArr);
    camVision.forEach(k => vision.add(k));
    return vision;
  }

  function findNearestPathStepUnified(guard, pos) {
    let bestStep = guard.originalStep;
    let bestDist = Infinity;
    for (let i = 0; i < guard.path.length; i++) {
      const p = guard.path[i];
      const dist = Math.abs(p.x - pos.x) + Math.abs(p.y - pos.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestStep = i;
      }
    }
    return bestStep;
  }

  function moveGuardUnified(guard, openedDoors) {
    if (guard.state === "investigate") {
      const target = guard.investigateTarget;
      const current = guard.pos;
      let dx = Math.sign(target.x - current.x);
      let dy = Math.sign(target.y - current.y);
      let newX = current.x;
      let newY = current.y;
      if (Math.abs(target.x - current.x) >= Math.abs(target.y - current.y) && dx !== 0) {
        newX = current.x + dx;
      } else if (dy !== 0) {
        newY = current.y + dy;
      } else if (dx !== 0) {
        newX = current.x + dx;
      }
      if (!wallSet.has(pointKey({ x: newX, y: newY }))) {
        guard.pos = { x: newX, y: newY };
      }
      guard.investigateTimer -= 1;
      if (guard.investigateTimer <= 0 || samePoint(guard.pos, guard.investigateTarget)) {
        guard.state = "patrol";
        guard.investigateTarget = null;
        guard.alertLevel = Math.max(0, guard.alertLevel - 1);
        guard.step = findNearestPathStepUnified(guard, guard.pos);
        guard.pos = { ...guard.path[guard.step] };
      }
      return;
    }

    if (guard.state === "trace") {
      if (guard.tracePath.length > 0) {
        const target = guard.tracePath[0];
        const current = guard.pos;
        const dx = Math.sign(target.x - current.x);
        const dy = Math.sign(target.y - current.y);
        let newX = current.x;
        let newY = current.y;
        if (Math.abs(target.x - current.x) >= Math.abs(target.y - current.y) && dx !== 0) {
          newX = current.x + dx;
        } else if (dy !== 0) {
          newY = current.y + dy;
        } else if (dx !== 0) {
          newX = current.x + dx;
        }
        if (!wallSet.has(pointKey({ x: newX, y: newY }))) {
          guard.pos = { x: newX, y: newY };
        }
        if (samePoint(guard.pos, target)) {
          guard.tracePath.shift();
        }
      }
      if (guard.tracePath.length === 0) {
        guard.state = "patrol";
        guard.traceTarget = null;
        guard.step = findNearestPathStepUnified(guard, guard.pos);
        guard.pos = { ...guard.path[guard.step] };
      }
      return;
    }

    if (guard.behavior === GUARD_BEHAVIOR.PATROL) {
      let nextStep = guard.step + guard.direction;
      if (nextStep >= guard.path.length || nextStep < 0) {
        guard.direction *= -1;
        nextStep = guard.step + guard.direction;
      }
      guard.step = nextStep;
    } else {
      guard.step = (guard.step + 1) % guard.path.length;
    }
    guard.pos = { ...guard.path[guard.step] };

    if (guard.behavior === GUARD_BEHAVIOR.TRACE) {
      const currentPos = guard.pos;
      for (const openedDoor of openedDoors) {
        const distance = Math.abs(currentPos.x - openedDoor.x) + Math.abs(currentPos.y - openedDoor.y);
        if (distance <= 2) {
          guard.state = "trace";
          guard.traceTarget = { x: openedDoor.x, y: openedDoor.y };
          guard.tracePath = [{ x: openedDoor.x, y: openedDoor.y }];
          guard.alertLevel = Math.min(3, guard.alertLevel + 2);
          break;
        }
      }
    }
  }

  function emitSoundUnified(s, soundLoudness, position, source) {
    if (soundLoudness <= 0) {
      updateGlobalAlertLevelUnified(s);
      return;
    }
    s.guards.forEach((guard) => {
      if (guard.state === "investigate" || guard.state === "trace") return;
      const distance = Math.abs(guard.pos.x - position.x) + Math.abs(guard.pos.y - position.y);
      if (distance <= guard.hearingRange + soundLoudness) {
        const alertIncrease = Math.max(1, Math.ceil((guard.hearingRange + soundLoudness - distance) / 2));
        guard.alertLevel = Math.min(3, guard.alertLevel + alertIncrease);
        if (guard.behavior === GUARD_BEHAVIOR.INVESTIGATE && guard.alertLevel >= 1) {
          guard.state = "investigate";
          guard.investigateTarget = { ...position };
          guard.investigateTimer = 3;
        }
      }
    });
    updateGlobalAlertLevelUnified(s);
  }

  function decayAlertLevelsUnified(s) {
    s.guards.forEach((guard) => {
      if (guard.alertLevel > 0 && guard.state === "patrol") {
        guard.alertLevel = Math.max(0, guard.alertLevel - 1);
      }
    });
    updateGlobalAlertLevelUnified(s);
  }

  function advanceLightAndCameraEffectsUnified(s) {
    s.visionReduced = s.pendingVisionReduction;
    s.pendingVisionReduction = false;
    if (s.cameraShutdownTurns > 0) {
      s.cameraShutdownTurns -= 1;
      s.camerasDisabled = s.cameraShutdownTurns > 0;
    }
  }

  function cloneSolverStateUnified(s) {
    return {
      pos: { ...s.pos },
      keys: s.keys,
      keysTaken: [...s.keysTaken],
      doorsOpen: [...s.doorsOpen],
      fixed: [...s.fixed],
      plateTriggered: [...s.plateTriggered],
      screens: s.screens.map(sc => ({ ...sc })),
      lightsActive: [...s.lightsActive],
      visionReduced: s.visionReduced,
      pendingVisionReduction: s.pendingVisionReduction,
      camerasDisabled: s.camerasDisabled,
      cameraShutdownTurns: s.cameraShutdownTurns,
      alertLevel: s.alertLevel,
      guards: cloneGuards(s.guards),
      openedDoors: s.openedDoors.map(d => ({ ...d })),
      step: s.step,
      turnCount: s.turnCount,
      ap: s.ap,
      path: s.path.map(p => ({ ...p })),
      actions: [...s.actions]
    };
  }

  const visited = new Set();
  const initial = {
    pos: { ...startPlayer },
    keys: startKeys,
    keysTaken: [...startKeysTaken],
    doorsOpen: [...startDoorsOpen],
    fixed: [...startFixed],
    plateTriggered: [...startPlateTriggered],
    screens: [...startScreens],
    lightsActive: [...startLightsActive],
    visionReduced: startVisionReduced,
    pendingVisionReduction: startPendingVisionReduction,
    camerasDisabled: startCamerasDisabled,
    cameraShutdownTurns: startCameraShutdownTurns,
    alertLevel: startAlertLevel,
    guards: cloneGuards(startGuards),
    openedDoors: [...startOpenedDoors],
    step: startStep,
    turnCount: 0,
    ap: startAp,
    path: [{ ...startPlayer }],
    actions: [options.startState ? "当前位置" : "开局"]
  };

  const initKey = solverStateKey(initial);
  visited.add(initKey);

  const queue = [initial];
  let iterations = 0;

  function checkAndEnqueue(newState) {
    const allFixed = newState.fixed.every(f => f);
    const atExit = samePoint(newState.pos, exit);
    if (allFixed && atExit) {
      return newState;
    }
    const sk = solverStateKey(newState);
    if (!visited.has(sk)) {
      visited.add(sk);
      queue.push(newState);
    }
    return null;
  }

  while (queue.length > 0 && iterations < maxIterations) {
    iterations++;
    const cur = queue.shift();

    const dirs = [
      [1, 0, "向右"],
      [-1, 0, "向左"],
      [0, 1, "向下"],
      [0, -1, "向上"]
    ];

    for (const [dx, dy, dirName] of dirs) {
      if (cur.ap <= 0) continue;
      const nx = cur.pos.x + dx;
      const ny = cur.pos.y + dy;
      if (nx < 0 || nx >= BOARD_W || ny < 0 || ny >= BOARD_H) continue;
      const newPos = { x: nx, y: ny };
      const pk = pointKey(newPos);
      if (wallSet.has(pk)) continue;

      const ns = cloneSolverStateUnified(cur);
      let actionLabel = `向${dirName}`;
      let soundLoudness = 1;

      const screenIdx = ns.screens.findIndex(sc => samePoint(sc, newPos));
      if (screenIdx >= 0) {
        const pushDest = { x: nx + dx, y: ny + dy };
        if (pushDest.x < 0 || pushDest.x >= BOARD_W || pushDest.y < 0 || pushDest.y >= BOARD_H) continue;
        if (wallSet.has(pointKey(pushDest))) continue;
        const pushDoorIdx = doors.findIndex(d => samePoint(d, pushDest));
        if (pushDoorIdx >= 0 && !ns.doorsOpen[pushDoorIdx]) continue;
        if (ns.screens.some(sc => samePoint(sc, pushDest))) continue;
        if (exhibits.some(e => samePoint(e, pushDest))) continue;
        ns.screens[screenIdx] = { ...pushDest };
        actionLabel = `推屏风+${dirName}`;
        soundLoudness = 2;
      }

      const doorIdx = doors.findIndex(d => d.x === nx && d.y === ny);
      if (doorIdx >= 0 && !ns.doorsOpen[doorIdx]) {
        if (ns.keys <= 0) continue;
        ns.keys -= 1;
        ns.doorsOpen[doorIdx] = true;
        ns.openedDoors.push({ x: nx, y: ny, turn: ns.turnCount });
        actionLabel = "开门+" + actionLabel;
        soundLoudness = 3;
      }

      const vision = getFullVisionUnified(cur.guards, ns.screens, cur.visionReduced, cur.camerasDisabled, cur.lightsActive);
      if (vision.has(pk)) continue;

      for (let i = 0; i < keyItems.length; i++) {
        if (!ns.keysTaken[i] && keyItems[i].x === nx && keyItems[i].y === ny) {
          ns.keys += 1;
          ns.keysTaken[i] = true;
          actionLabel += "+拾钥匙";
        }
      }

      ns.pos = newPos;

      for (let pi = 0; pi < numPlates; pi++) {
        const plate = pressurePlates[pi];
        const playerOn = samePoint(ns.pos, plate);
        if (playerOn && !ns.plateTriggered[pi]) {
          ns.plateTriggered[pi] = true;
          for (const td of plate.targetDoors) {
            const tdi = doors.findIndex(d => samePoint(d, td));
            if (tdi >= 0) ns.doorsOpen[tdi] = !ns.doorsOpen[tdi];
          }
          actionLabel += "+踩压板";
        } else if (!playerOn && ns.plateTriggered[pi]) {
          ns.plateTriggered[pi] = false;
        }
      }

      for (let li = 0; li < numLights; li++) {
        const light = lights[li];
        if (!ns.lightsActive[li] && samePoint(ns.pos, light)) {
          ns.lightsActive[li] = true;
          ns.pendingVisionReduction = true;
          ns.camerasDisabled = true;
          ns.cameraShutdownTurns = Math.max(ns.cameraShutdownTurns || 0, 2);
          actionLabel += "+熄灯";
        }
      }

      emitSoundUnified(ns, soundLoudness, ns.pos, dirName);

      const camVision = getCameraVisionUnified(ns.screens, cur.visionReduced, cur.camerasDisabled, ns.lightsActive);
      if (camVision.has(pk)) {
        ns.alertLevel = Math.min(3, ns.alertLevel + 1);
        if (ns.alertLevel >= 3) continue;
        updateGlobalAlertLevelUnified(ns);
      }

      ns.path.push({ ...ns.pos });
      ns.actionLabels = ns.actionLabels || [...ns.actions];
      ns.actionLabels.push(actionLabel);
      ns.actions = ns.actionLabels;
      ns.ap -= 1;

      if (ns.ap <= 0) {
        const nextState = cloneSolverStateUnified(ns);
        emitSoundUnified(nextState, 0, nextState.pos, "等待");
        advanceLightAndCameraEffectsUnified(nextState);
        decayAlertLevelsUnified(nextState);
        nextState.guards.forEach(g => moveGuardUnified(g, nextState.openedDoors));

        const nextVision = getFullVisionUnified(nextState.guards, nextState.screens, nextState.visionReduced, nextState.camerasDisabled, nextState.lightsActive);
        const curPk = pointKey(ns.pos);
        if (!nextVision.has(curPk)) {
          const nextCamVision = getCameraVisionUnified(nextState.screens, nextState.visionReduced, nextState.camerasDisabled, nextState.lightsActive);
          if (nextCamVision.has(curPk)) {
            nextState.alertLevel = Math.min(3, nextState.alertLevel + 1);
            if (nextState.alertLevel >= 3) continue;
            updateGlobalAlertLevelUnified(nextState);
          }

          nextState.step = (cur.step + 1) % (cur.guards.length > 0 ? Math.max(...cur.guards.map(g => g.path.length)) : 1);
          nextState.turnCount = cur.turnCount + 1;
          nextState.ap = 4;
          nextState.actions[nextState.actions.length - 1] = actionLabel + "+等待";
          const found = checkAndEnqueue(nextState);
          if (found) {
            return {
              solvable: true,
              path: found.path,
              actions: found.actions,
              steps: found.path.length,
              totalActions: iterations,
              finalAlertLevel: found.alertLevel
            };
          }
        }
      } else {
        const found = checkAndEnqueue(ns);
        if (found) {
          return {
            solvable: true,
            path: found.path,
            actions: found.actions,
            steps: found.path.length,
            totalActions: iterations,
            finalAlertLevel: found.alertLevel
          };
        }
      }
    }

    for (let i = 0; i < numExhibits; i++) {
      if (cur.ap <= 0) continue;
      if (!cur.fixed[i] && isAdjacent(cur.pos, exhibits[i])) {
        const ns = cloneSolverStateUnified(cur);
        ns.fixed[i] = true;
        ns.ap -= 1;

        emitSoundUnified(ns, 2, ns.pos, "修复");

        const allFixedNow = ns.fixed.every(f => f);
        const atExitNow = samePoint(ns.pos, exit);
        if (allFixedNow && atExitNow) {
          ns.path.push({ ...ns.pos });
          ns.actionLabels = ns.actionLabels || [...ns.actions];
          ns.actionLabels.push("修复展柜");
          ns.actions = ns.actionLabels;
          return {
            solvable: true,
            path: ns.path,
            actions: ns.actions,
            steps: ns.path.length,
            totalActions: iterations,
            finalAlertLevel: ns.alertLevel
          };
        }

        ns.path.push({ ...ns.pos });
        ns.actionLabels = ns.actionLabels || [...ns.actions];
        ns.actionLabels.push("修复展柜");
        ns.actions = ns.actionLabels;

        if (ns.ap <= 0) {
          const nextState = cloneSolverStateUnified(ns);
          emitSoundUnified(nextState, 0, nextState.pos, "等待");
          advanceLightAndCameraEffectsUnified(nextState);
          decayAlertLevelsUnified(nextState);
          nextState.guards.forEach(g => moveGuardUnified(g, nextState.openedDoors));

          const curPk = pointKey(ns.pos);
          const nextVision = getFullVisionUnified(nextState.guards, nextState.screens, nextState.visionReduced, nextState.camerasDisabled, nextState.lightsActive);
          if (!nextVision.has(curPk)) {
            const nextCamVision = getCameraVisionUnified(nextState.screens, nextState.visionReduced, nextState.camerasDisabled, nextState.lightsActive);
            if (nextCamVision.has(curPk)) {
              nextState.alertLevel = Math.min(3, nextState.alertLevel + 1);
              if (nextState.alertLevel >= 3) continue;
              updateGlobalAlertLevelUnified(nextState);
            }

            nextState.step = (cur.step + 1) % (cur.guards.length > 0 ? Math.max(...cur.guards.map(g => g.path.length)) : 1);
            nextState.turnCount = cur.turnCount + 1;
            nextState.ap = 4;
            nextState.actions[nextState.actions.length - 1] = "修复展柜+等待";
            const found = checkAndEnqueue(nextState);
            if (found) {
              return {
                solvable: true,
                path: found.path,
                actions: found.actions,
                steps: found.path.length,
                totalActions: iterations,
                finalAlertLevel: found.alertLevel
              };
            }
          }
        } else {
          const found = checkAndEnqueue(ns);
          if (found) {
            return {
              solvable: true,
              path: found.path,
              actions: found.actions,
              steps: found.path.length,
              totalActions: iterations,
              finalAlertLevel: found.alertLevel
            };
          }
        }
      }
    }

    {
      const nextState = cloneSolverStateUnified(cur);
      emitSoundUnified(nextState, 0, nextState.pos, "等待");
      advanceLightAndCameraEffectsUnified(nextState);
      decayAlertLevelsUnified(nextState);
      nextState.guards.forEach(g => moveGuardUnified(g, nextState.openedDoors));

      const nextVision = getFullVisionUnified(nextState.guards, nextState.screens, nextState.visionReduced, nextState.camerasDisabled, nextState.lightsActive);
      const curPk = pointKey(cur.pos);
      if (!nextVision.has(curPk)) {
        const nextCamVision = getCameraVisionUnified(nextState.screens, nextState.visionReduced, nextState.camerasDisabled, nextState.lightsActive);
        if (nextCamVision.has(curPk)) {
          nextState.alertLevel = Math.min(3, nextState.alertLevel + 1);
          if (nextState.alertLevel >= 3) continue;
          updateGlobalAlertLevelUnified(nextState);
        }

        nextState.step = (cur.step + 1) % (cur.guards.length > 0 ? Math.max(...cur.guards.map(g => g.path.length)) : 1);
        nextState.turnCount = cur.turnCount + 1;
        nextState.ap = 4;
        nextState.path.push({ ...nextState.pos });
        nextState.actionLabels = nextState.actionLabels || [...nextState.actions];
        nextState.actionLabels.push("等待回合");
        nextState.actions = nextState.actionLabels;
        const found = checkAndEnqueue(nextState);
        if (found) {
          return {
            solvable: true,
            path: found.path,
            actions: found.actions,
            steps: found.path.length,
            totalActions: iterations,
            finalAlertLevel: found.alertLevel
          };
        }
      }
    }
  }

  return {
    solvable: false,
    path: null,
    actions: null,
    steps: 0,
    totalActions: iterations
  };
}

console.log('=== 测试统一求解器 ===\n');

let allPassed = true;

for (let i = 0; i < levels.length; i++) {
  const level = JSON.parse(JSON.stringify(levels[i]));
  
  console.log(`测试关卡 ${level.name}:`);
  console.log(`  机制: ${level.guards.map(g => g.behavior).join(', ')}`);
  
  const startTime = Date.now();
  try {
    const result = unifiedSolveLevel(level, { maxIterations: 1000000, mode: 'full' });
    const endTime = Date.now();
    
    if (result && result.solvable) {
      console.log(`  ✓ 可解 - 步数: ${result.steps}, 迭代: ${result.totalActions}, 耗时: ${endTime - startTime}ms`);
      console.log(`  路径: ${result.actions.slice(0, 5).join(' → ')}${result.actions.length > 5 ? '...' : ''}`);
      if (result.finalAlertLevel !== undefined) {
        console.log(`  最终警觉等级: ${result.finalAlertLevel}`);
      }
    } else {
      console.log(`  ✗ 无解 - 迭代: ${result ? result.totalActions : 'unknown'}, 耗时: ${endTime - startTime}ms`);
      allPassed = false;
    }
  } catch (e) {
    console.log(`  ✗ 错误: ${e.message}`);
    console.log(e.stack);
    allPassed = false;
  }
  console.log('');
}

console.log('=== 测试提示系统模式 ===\n');

for (let i = 0; i < Math.min(3, levels.length); i++) {
  const level = JSON.parse(JSON.stringify(levels[i]));
  
  const startState = {
    player: { ...level.player },
    keys: 0,
    keysTaken: level.keys.map(() => false),
    doorsOpen: level.doors.map(() => false),
    fixed: level.exhibits.map(() => false),
    plateTriggered: (level.mechanisms?.pressurePlates || []).map(() => false),
    screens: (level.mechanisms?.screens || []).map(s => ({ ...s })),
    lightsActive: (level.mechanisms?.lights || []).map(() => false),
    visionReduced: false,
    pendingVisionReduction: false,
    cameraShutdownTurns: 0,
    alertLevel: 0,
    ap: 4,
    step: 0,
    guards: initializeGuards(level.guards),
    openedDoors: []
  };
  
  console.log(`关卡 ${level.name} 从初始状态提示:`);
  try {
    const result = unifiedSolveLevel(level, {
      startState: startState,
      maxIterations: 300000,
      mode: 'hint'
    });
    
    if (result && result.solvable) {
      console.log(`  ✓ 找到路径 - 长度: ${result.path.length}`);
      console.log(`  推荐: ${result.actions.slice(1, 4).join(' → ')}`);
    } else {
      console.log(`  ⚠ 未找到路径`);
    }
  } catch (e) {
    console.log(`  ✗ 错误: ${e.message}`);
    allPassed = false;
  }
  console.log('');
}

console.log('\n=== 测试总结 ===');
console.log(`所有测试: ${allPassed ? '✓ 通过' : '✗ 失败'}`);

process.exit(allPassed ? 0 : 1);
