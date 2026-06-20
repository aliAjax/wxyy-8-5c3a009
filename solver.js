window.bfsReachable = function(walls, doors, start, considerDoorsClosed = true) {
  const reachable = new Set();
  const queue = [{ x: start.x, y: start.y }];
  reachable.add(pointKey(start));
  const wallSet = new Set(walls);
  const doorSet = new Set(doors.map((d) => pointKey(d)));

  while (queue.length > 0) {
    const cur = queue.shift();
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const nkey = `${nx},${ny}`;
      if (nx < 0 || nx >= BOARD_W || ny < 0 || ny >= BOARD_H) continue;
      if (reachable.has(nkey)) continue;
      if (wallSet.has(nkey)) continue;
      if (considerDoorsClosed && doorSet.has(nkey)) continue;
      reachable.add(nkey);
      queue.push({ x: nx, y: ny });
    }
  }
  return reachable;
};

window.bfsPath = function(walls, start, end, doorsOpen = []) {
  const wallSet = new Set(walls);
  const openDoorSet = new Set(doorsOpen.map((d) => pointKey(d)));
  const visited = new Map();
  const queue = [{ x: start.x, y: start.y, path: [{ x: start.x, y: start.y }] }];
  visited.set(pointKey(start), true);

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur.x === end.x && cur.y === end.y) {
      return cur.path;
    }
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const nkey = `${nx},${ny}`;
      if (nx < 0 || nx >= BOARD_W || ny < 0 || ny >= BOARD_H) continue;
      if (visited.has(nkey)) continue;
      if (wallSet.has(nkey)) continue;
      visited.set(nkey, true);
      queue.push({ x: nx, y: ny, path: [...cur.path, { x: nx, y: ny }] });
    }
  }
  return null;
};

window.getGuardPositionsAtStep = function(guards, step) {
  return guards.map((g) => g.path[step % g.path.length]);
};

window.canPassWallDoor = function(pos, walls, doors, keys, keysOnGround, doorsOpen) {
  const pk = pointKey(pos);
  if (walls.includes(pk)) return { pass: false };
  const doorIdx = doors.findIndex((d) => d.x === pos.x && d.y === pos.y);
  if (doorIdx >= 0 && !doorsOpen[doorIdx]) {
    if (keys > 0) {
      return { pass: true, useKey: true, doorIdx };
    }
    return { pass: false };
  }
  return { pass: true };
};

window.bfsReachableWithScreens = function(walls, doors, start, considerDoorsClosed, screens) {
  const reachable = new Set();
  const queue = [{ x: start.x, y: start.y }];
  reachable.add(pointKey(start));
  const wallSet = new Set(walls);
  const doorSet = new Set(doors.map((d) => pointKey(d)));
  const screenSet = new Set((screens || []).map(s => pointKey(s)));

  while (queue.length > 0) {
    const cur = queue.shift();
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const nkey = `${nx},${ny}`;
      if (nx < 0 || nx >= BOARD_W || ny < 0 || ny >= BOARD_H) continue;
      if (reachable.has(nkey)) continue;
      if (wallSet.has(nkey)) continue;
      if (screenSet.has(nkey)) continue;
      if (considerDoorsClosed && doorSet.has(nkey)) continue;
      reachable.add(nkey);
      queue.push({ x: nx, y: ny });
    }
  }
  return reachable;
};

window.bfsReachableWithScreensReverse = function(walls, doors, start, considerDoorsClosed, screens) {
  const reachable = new Set();
  const queue = [{ x: start.x, y: start.y }];
  reachable.add(pointKey(start));
  const wallSet = new Set(walls);
  const doorSet = new Set(doors.map((d) => pointKey(d)));
  const screenSet = new Set((screens || []).map(s => pointKey(s)));

  while (queue.length > 0) {
    const cur = queue.shift();
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const nkey = `${nx},${ny}`;
      if (nx < 0 || nx >= BOARD_W || ny < 0 || ny >= BOARD_H) continue;
      if (reachable.has(nkey)) continue;
      if (wallSet.has(nkey)) continue;
      if (screenSet.has(nkey)) continue;
      if (considerDoorsClosed && doorSet.has(nkey)) continue;
      reachable.add(nkey);
      queue.push({ x: nx, y: ny });
    }
  }
  return reachable;
};

window.bfsReachableWithScreensDoorsOpen = function(walls, closedDoors, openDoors, start, screens) {
  const reachable = new Set();
  const queue = [{ x: start.x, y: start.y }];
  reachable.add(pointKey(start));
  const wallSet = new Set(walls);
  const closedDoorSet = new Set(closedDoors.map((d) => pointKey(d)));
  const screenSet = new Set((screens || []).map(s => pointKey(s)));

  while (queue.length > 0) {
    const cur = queue.shift();
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const nkey = `${nx},${ny}`;
      if (nx < 0 || nx >= BOARD_W || ny < 0 || ny >= BOARD_H) continue;
      if (reachable.has(nkey)) continue;
      if (wallSet.has(nkey)) continue;
      if (screenSet.has(nkey)) continue;
      if (closedDoorSet.has(nkey)) continue;
      reachable.add(nkey);
      queue.push({ x: nx, y: ny });
    }
  }
  return reachable;
};

window.verifyLevelSolvable = function(level) {
  const result = unifiedSolveLevel(level, {
    maxIterations: 200000,
    mode: 'verify'
  });
  return result && result.solvable;
};

window.solveLevelDetailed = function(level) {
  const result = unifiedSolveLevel(level, {
    maxIterations: 500000,
    mode: 'full'
  });

  if (result && result.solvable) {
    return {
      steps: result.steps,
      path: result.path,
      actions: result.actions,
      totalActions: result.totalActions,
      solvable: true,
      finalAlertLevel: result.finalAlertLevel
    };
  }

  return null;
};

window.generateDailyLevel = function(dateKey) {
  const rng = createDailyRNG(dateKey);
  let attempts = 0;

  while (attempts < 50) {
    attempts++;
    try {
      const level = tryGenerateLevel(rng, dateKey);
      if (level) {
        if (verifyLevelSolvable(level)) {
          return level;
        }
      }
    } catch (e) {
    }
  }

  const fb = fallbackLevel(dateKey);
  if (verifyLevelSolvable(fb)) return fb;
  return fb;
};

window.fallbackLevel = function(dateKey) {
  return {
    name: `每日挑战 ${dateKey}`,
    walls: ["3,1", "3,2", "3,4", "3,5", "5,2", "5,3", "5,4"],
    doors: [{ x: 3, y: 3, open: false }],
    keys: [{ x: 1, y: 0, taken: false }],
    exhibits: [
      { x: 6, y: 1, fixed: false },
      { x: 6, y: 5, fixed: false }
    ],
    player: { x: 0, y: 6 },
    guards: [
      { path: [{ x: 5, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 3 }, { x: 5, y: 3 }], step: 0 },
      { path: [{ x: 1, y: 3 }, { x: 2, y: 3 }, { x: 2, y: 6 }, { x: 1, y: 6 }], step: 0 }
    ],
    exit: { x: 7, y: 0 }
  };
};

window.tryGenerateLevel = function(rng, dateKey) {
  const allCells = [];
  for (let y = 0; y < BOARD_H; y++) {
    for (let x = 0; x < BOARD_W; x++) {
      allCells.push({ x, y });
    }
  }

  const corners = [
    { x: 0, y: 0 },
    { x: BOARD_W - 1, y: 0 },
    { x: 0, y: BOARD_H - 1 },
    { x: BOARD_W - 1, y: BOARD_H - 1 }
  ];

  const shuffledCorners = shuffle(rng, corners);
  const player = { ...shuffledCorners[0] };
  const exit = { ...shuffledCorners[1] };

  const manhattan = Math.abs(player.x - exit.x) + Math.abs(player.y - exit.y);
  if (manhattan < 6) return null;

  const walls = [];
  const doors = [];
  const keys = [];
  const exhibits = [];

  const reserved = new Set();
  reserved.add(pointKey(player));
  reserved.add(pointKey(exit));

  let mainPath = bfsPath(walls, player, exit);
  if (!mainPath) return null;

  const pathSet = new Set(mainPath.map((p) => pointKey(p)));

  const numWalls = randomInt(rng, 5, 9);
  let wallAttempts = 0;
  while (walls.length < numWalls && wallAttempts < 200) {
    wallAttempts++;
    const cell = randomChoice(rng, allCells);
    const ckey = pointKey(cell);
    if (reserved.has(ckey)) continue;
    if (walls.includes(ckey)) continue;
    if (pathSet.has(ckey)) continue;

    const testWalls = [...walls, ckey];
    const newPath = bfsPath(testWalls, player, exit);
    if (!newPath) continue;

    walls.push(ckey);
  }

  mainPath = bfsPath(walls, player, exit);
  if (!mainPath) return null;
  for (const p of mainPath) reserved.add(pointKey(p));

  if (mainPath.length < 7) return null;

  {
    const numDoors = rng() < 0.3 ? 2 : 1;
    let placedDoors = 0;
    let lastDoorIdx = 1;

    for (let d = 0; d < numDoors; d++) {
      if (mainPath.length - lastDoorIdx < 5) break;

      const minIdx = lastDoorIdx + 2;
      const maxIdx = mainPath.length - 3;
      if (minIdx >= maxIdx) break;

      const doorIdx = randomInt(rng, minIdx, maxIdx);
      const doorPos = mainPath[doorIdx];

      doors.push({ x: doorPos.x, y: doorPos.y, open: false });
      reserved.add(pointKey(doorPos));

      const beforeDoorArea = mainPath.slice(0, doorIdx);
      const keyCandidates = [];

      const doorsUpToNow = doors.slice(0, d);
      const reachBeforeDoor = bfsReachable(walls, doorsUpToNow, player, true);

      for (const p of allCells) {
        const pk = pointKey(p);
        if (reserved.has(pk)) continue;
        if (walls.includes(pk)) continue;
        if (doors.some((dd) => dd.x === p.x && dd.y === p.y)) continue;
        if (!reachBeforeDoor.has(pk)) continue;

        let adjCount = 0;
        const dirs = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ];
        for (const [dxx, dyy] of dirs) {
          const nnx = p.x + dxx;
          const nny = p.y + dyy;
          if (nnx >= 0 && nnx < BOARD_W && nny >= 0 && nny < BOARD_H) {
            if (!walls.includes(`${nnx},${nny}`)) adjCount++;
          }
        }
        if (adjCount >= 2) keyCandidates.push(p);
      }

      if (keyCandidates.length > 0) {
        const key = randomChoice(rng, keyCandidates);
        keys.push({ x: key.x, y: key.y, taken: false });
        reserved.add(pointKey(key));
        placedDoors++;
        lastDoorIdx = doorIdx;
      } else {
        doors.pop();
        break;
      }
    }
  }

  if (doors.length === 0 || keys.length < doors.length) {
    return null;
  }

  const reachAllOpen = bfsReachable(walls, doors, player, false);

  const numExhibits = randomInt(rng, 1, 2);
  const exhibitCandidates = [];
  for (const p of allCells) {
    const pk = pointKey(p);
    if (reserved.has(pk)) continue;
    if (walls.includes(pk)) continue;
    if (doors.some((dd) => dd.x === p.x && dd.y === p.y)) continue;
    if (!reachAllOpen.has(pk)) continue;

    let adj = 0;
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    for (const [dx, dy] of dirs) {
      const nx = p.x + dx;
      const ny = p.y + dy;
      if (nx >= 0 && nx < BOARD_W && ny >= 0 && ny < BOARD_H) {
        const nkey = `${nx},${ny}`;
        if (!walls.includes(nkey)) adj++;
      }
    }
    if (adj >= 2) {
      exhibitCandidates.push(p);
    }
  }

  const shuffledExhibits = shuffle(rng, exhibitCandidates);
  for (let i = 0; i < Math.min(numExhibits, shuffledExhibits.length); i++) {
    exhibits.push({ x: shuffledExhibits[i].x, y: shuffledExhibits[i].y, fixed: false });
    reserved.add(pointKey(shuffledExhibits[i]));
  }

  if (exhibits.length === 0) {
    for (let i = mainPath.length - 2; i >= 1; i--) {
      const p = mainPath[i];
      if (!walls.includes(pointKey(p)) && !doors.some((dd) => dd.x === p.x && dd.y === p.y)) {
        exhibits.push({ x: p.x, y: p.y, fixed: false });
        reserved.add(pointKey(p));
        break;
      }
    }
  }
  if (exhibits.length === 0) return null;

  const guards = generateGuards(rng, walls, doors, player, exit, exhibits, mainPath, reserved);

  const allReachable = bfsReachable(walls, doors, player, false);
  for (const ex of exhibits) {
    if (!allReachable.has(pointKey(ex))) return null;
  }
  for (const k of keys) {
    if (!allReachable.has(pointKey(k))) return null;
  }
  if (!allReachable.has(pointKey(exit))) return null;

  for (const g of guards) {
    for (const pos of g.path) {
      if (samePoint(pos, player) && g.step === 0) return null;
    }
  }

  const initVision = getGuardVisionAtStep(guards, 0, walls);
  if (initVision.has(pointKey(player))) return null;

  return {
    name: `每日挑战 ${dateKey}`,
    walls,
    doors,
    keys,
    exhibits,
    player,
    guards,
    exit
  };
};

window.generateGuards = function(rng, walls, doors, player, exit, exhibits, mainPath, reserved) {
  const guards = [];
  const numGuards = randomInt(rng, 1, 2);
  const wallSet = new Set(walls);
  const doorSet = new Set(doors.map((d) => pointKey(d)));
  const pathSet = new Set(mainPath.map((p) => pointKey(p)));

  for (let g = 0; g < numGuards; g++) {
    let guardAttempts = 0;
    while (guardAttempts < 100) {
      guardAttempts++;

      const candidateCells = [];
      for (let y = 0; y < BOARD_H; y++) {
        for (let x = 0; x < BOARD_W; x++) {
          const ck = `${x},${y}`;
          if (wallSet.has(ck)) continue;
          if (doorSet.has(ck)) continue;
          if (reserved.has(ck)) continue;
          if (samePoint({ x, y }, player)) continue;
          if (samePoint({ x, y }, exit)) continue;
          if (pathSet.has(ck) && rng() > 0.25) continue;
          candidateCells.push({ x, y });
        }
      }

      if (candidateCells.length === 0) break;
      const start = randomChoice(rng, candidateCells);

      const startDist = Math.abs(start.x - player.x) + Math.abs(start.y - player.y);
      if (startDist < 3) continue;

      const pathLength = randomInt(rng, 3, 5);
      const path = [{ ...start }];
      let current = { ...start };
      let stepAttempts = 0;

      while (path.length < pathLength && stepAttempts < 50) {
        stepAttempts++;
        const dirs = shuffle(rng, [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ]);
        let moved = false;

        for (const [dx, dy] of dirs) {
          const nx = current.x + dx;
          const ny = current.y + dy;
          const nkey = `${nx},${ny}`;
          if (nx < 0 || nx >= BOARD_W || ny < 0 || ny >= BOARD_H) continue;
          if (wallSet.has(nkey)) continue;
          if (doorSet.has(nkey)) continue;
          if (samePoint({ x: nx, y: ny }, player)) continue;
          if (path.some((p) => p.x === nx && p.y === ny)) continue;
          if (reserved.has(nkey)) continue;

          path.push({ x: nx, y: ny });
          current = { x: nx, y: ny };
          moved = true;
          break;
        }
        if (!moved) break;
      }

      if (path.length >= 3) {
        guards.push({ path: [...path], step: 0 });
        for (const p of path) reserved.add(pointKey(p));
        break;
      }
    }
  }

  return guards;
};

window.cloneHintState = function(s) {
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
    step: s.step,
    ap: s.ap,
    path: [...s.path],
    actionLabels: [...s.actionLabels]
  };
};

window.hintStateKey = function(s, cycleLen, numExhibits, numPlates, numLights, numCameras) {
  const exhibitMask = s.fixed.reduce((acc, f, i) => f ? acc | (1 << i) : acc, 0);
  const plateMask = s.plateTriggered.reduce((acc, t, i) => t ? acc | (1 << i) : acc, 0);
  const lightMask = s.lightsActive.reduce((acc, a, i) => a ? acc | (1 << i) : acc, 0);
  const doorsMask = s.doorsOpen.reduce((acc, o, i) => o ? acc | (1 << i) : acc, 0);
  const screenKey = s.screens.map(sc => `${sc.x},${sc.y}`).sort().join("|");
  return `${s.pos.x},${s.pos.y}|${s.keys}|${exhibitMask}|${s.step % cycleLen}|${s.ap}|${plateMask}|${lightMask}|${doorsMask}|${screenKey}|${s.visionReduced ? 1 : 0}|${s.camerasDisabled ? 1 : 0}|${s.cameraShutdownTurns || 0}`;
};

window.advanceHintLightAndCameraEffects = function(s) {
  s.visionReduced = s.pendingVisionReduction;
  s.pendingVisionReduction = false;
  if (s.cameraShutdownTurns > 0) {
    s.cameraShutdownTurns -= 1;
    s.camerasDisabled = s.cameraShutdownTurns > 0;
  }
};

window.diagnoseLevel = function(level) {
  const result = {
    solvable: false,
    checks: [],
    issues: [],
    warnings: [],
    solution: null,
    debug: {
      unreachableCells: [],
      permanentlyBlockedCells: [],
      keyDependencies: [],
      problemDoors: [],
      solutionPreview: []
    }
  };

  const { walls, doors, keys: keyItems, exhibits, guards, player, exit } = level;
  const mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
  const screens = mechanisms.screens || [];

  let issueCounter = 0;
  let warningCounter = 0;

  function makeIssue(type, message, cells) {
    return {
      id: `issue_${issueCounter++}`,
      type: type,
      message: message,
      cells: cells || []
    };
  }

  function makeWarning(type, message, cells) {
    return {
      id: `warn_${warningCounter++}`,
      type: type,
      message: message,
      cells: cells || []
    };
  }

  result.checks.push({ name: "基础要素", passed: true });

  if (!player) {
    result.issues.push(makeIssue("missing_player", "缺少玩家起点"));
    result.checks[result.checks.length - 1].passed = false;
    return result;
  }
  if (!exit) {
    result.issues.push(makeIssue("missing_exit", "缺少出口"));
    result.checks[result.checks.length - 1].passed = false;
    return result;
  }
  if (exhibits.length === 0) {
    result.issues.push(makeIssue("missing_exhibit", "至少需要一个展柜"));
    result.checks[result.checks.length - 1].passed = false;
    return result;
  }

  const wallSet = new Set(walls);
  const playerKey = pointKey(player);
  const exitKey = pointKey(exit);

  if (wallSet.has(playerKey)) {
    result.issues.push(makeIssue("player_on_wall", "玩家起点在墙上", [{ x: player.x, y: player.y }]));
    result.checks[result.checks.length - 1].passed = false;
  }
  if (wallSet.has(exitKey)) {
    result.issues.push(makeIssue("exit_on_wall", "出口在墙上", [{ x: exit.x, y: exit.y }]));
    result.checks[result.checks.length - 1].passed = false;
  }

  result.checks.push({ name: "出口可达性", passed: true });
  const reachAllDoorsOpen = bfsReachableWithScreens(walls, doors, player, false, screens);

  const unreachableSet = new Set();
  const allBoardCells = [];
  for (let y = 0; y < BOARD_H; y++) {
    for (let x = 0; x < BOARD_W; x++) {
      const ck = `${x},${y}`;
      if (!wallSet.has(ck) && !reachAllDoorsOpen.has(ck)) {
        const isScreen = (screens || []).some(s => s.x === x && s.y === y);
        const isDoor = doors.some(d => d.x === x && d.y === y);
        if (!isScreen && !isDoor && !unreachableSet.has(ck)) {
          unreachableSet.add(ck);
          result.debug.unreachableCells.push({ x, y });
        }
      }
      allBoardCells.push({ x, y });
    }
  }

  if (!reachAllDoorsOpen.has(exitKey)) {
    const cellSet = new Set();
    const unreachableExitCells = [];
    function addCell(c) {
      const k = `${c.x},${c.y}`;
      if (!cellSet.has(k)) {
        cellSet.add(k);
        unreachableExitCells.push(c);
      }
    }
    addCell({ x: exit.x, y: exit.y });
    const bfsFromExit = bfsReachableWithScreensReverse(walls, doors, exit, false, screens);
    bfsFromExit.forEach(k => {
      const [ex, ey] = k.split(",").map(Number);
      if (!wallSet.has(k) && !reachAllDoorsOpen.has(k)) {
        const isScreen = (screens || []).some(s => s.x === ex && s.y === ey);
        const isDoor = doors.some(d => d.x === ex && d.y === ey);
        if (!isScreen && !isDoor) {
          addCell({ x: ex, y: ey });
        }
      }
    });
    result.issues.push(makeIssue(
      "exit_unreachable",
      "出口不可达：即使所有门都打开，从玩家起点也无法到达出口",
      unreachableExitCells
    ));
    result.checks[result.checks.length - 1].passed = false;
  } else {
    const reachDoorsClosed = bfsReachableWithScreens(walls, doors, player, true, screens);
    if (!reachDoorsClosed.has(exitKey) && keyItems.length === 0 && doors.length > 0) {
      const problemDoorCells = doors.map(d => ({ x: d.x, y: d.y }));
      result.warnings.push(makeWarning(
        "exit_locked_no_keys",
        "出口被门封锁，但没有钥匙",
        problemDoorCells
      ));
      doors.forEach((d, i) => {
        result.debug.problemDoors.push({
          doorIndex: i,
          doorPos: { x: d.x, y: d.y },
          reason: "no_key",
          cells: [{ x: d.x, y: d.y }]
        });
      });
    }
  }

  result.checks.push({ name: "展柜可修复性", passed: true });
  for (let i = 0; i < exhibits.length; i++) {
    const ex = exhibits[i];
    const exKey = pointKey(ex);
    if (wallSet.has(exKey)) {
      result.issues.push(makeIssue(
        `exhibit_on_wall_${i}`,
        `展柜${i + 1}在墙上，无法修复`,
        [{ x: ex.x, y: ex.y }]
      ));
      result.checks[result.checks.length - 1].passed = false;
      continue;
    }

    const adjacentCells = getAdjacentCells(ex);
    const reachableAdjacent = adjacentCells.filter(p => {
      const pk = pointKey(p);
      if (wallSet.has(pk)) return false;
      return reachAllDoorsOpen.has(pk);
    });

    if (reachableAdjacent.length === 0) {
      const exhibitCells = [{ x: ex.x, y: ex.y }, ...adjacentCells];
      result.issues.push(makeIssue(
        `exhibit_unreachable_${i}`,
        `展柜${i + 1}无法邻接修复：周围没有可到达的相邻格子`,
        exhibitCells
      ));
      result.checks[result.checks.length - 1].passed = false;
    }
  }

  result.checks.push({ name: "钥匙可达性", passed: true });
  if (doors.length > 0 && keyItems.length === 0) {
    const doorCells = doors.map(d => ({ x: d.x, y: d.y }));
    result.warnings.push(makeWarning(
      "doors_no_keys",
      "有门但没有钥匙，门可能无法打开",
      doorCells
    ));
  }

  for (let i = 0; i < keyItems.length; i++) {
    const key = keyItems[i];
    const keyK = pointKey(key);
    if (wallSet.has(keyK)) {
      result.issues.push(makeIssue(
        `key_on_wall_${i}`,
        `钥匙${i + 1}在墙上`,
        [{ x: key.x, y: key.y }]
      ));
      result.checks[result.checks.length - 1].passed = false;
      continue;
    }

    const reachNoKeys = bfsReachableWithScreens(walls, doors, player, true, screens);
    if (!reachNoKeys.has(keyK)) {
      const reachWithKeys = bfsReachableWithScreens(walls, doors, player, false, screens);
      if (!reachWithKeys.has(keyK)) {
        result.issues.push(makeIssue(
          `key_locked_${i}`,
          `钥匙${i + 1}被封死：无法到达该钥匙位置`,
          [{ x: key.x, y: key.y }]
        ));
        result.checks[result.checks.length - 1].passed = false;
      } else {
        const requiredDoors = [];
        const doorCells = [];
        for (let j = 0; j < doors.length; j++) {
          const d = doors[j];
          const otherDoors = doors.filter((_, idx) => idx !== j);
          const reachWithThisDoorOpen = bfsReachableWithScreensDoorsOpen(walls, otherDoors, [d], player, screens);
          if (reachWithThisDoorOpen.has(keyK)) {
            requiredDoors.push(j);
            doorCells.push({ x: d.x, y: d.y });
          }
        }
        const keyDepCells = [{ x: key.x, y: key.y }, ...doorCells];
        result.warnings.push(makeWarning(
          `key_order_${i}`,
          `钥匙${i + 1}需要先打开其他门才能拿到，注意钥匙顺序`,
          keyDepCells
        ));
        result.debug.keyDependencies.push({
          keyIndex: i,
          keyPos: { x: key.x, y: key.y },
          requiredDoorIndices: requiredDoors,
          cells: keyDepCells
        });
      }
    }
  }

  result.checks.push({ name: "巡逻视线分析", passed: true });
  if (guards.length > 0) {
    const cycleLen = getGuardCycleLength(guards);
    const alwaysBlocked = new Set();

    allBoardCells.forEach(cell => {
      const ck = pointKey(cell);
      if (wallSet.has(ck)) return;
      let alwaysInVision = true;
      for (let step = 0; step < cycleLen; step++) {
        const vision = getGuardVisionAtStepWithScreensSimple(guards, step, walls, screens);
        if (!vision.has(ck)) {
          alwaysInVision = false;
          break;
        }
      }
      if (alwaysInVision) {
        alwaysBlocked.add(ck);
        result.debug.permanentlyBlockedCells.push({ x: cell.x, y: cell.y });
      }
    });

    const playerOnPath = bfsReachableWithScreens(walls, doors, player, false, screens);
    const criticalPathCells = [];
    playerOnPath.forEach(ck => {
      if (alwaysBlocked.has(ck)) {
        const [cx, cy] = ck.split(",").map(Number);
        criticalPathCells.push({ x: cx, y: cy });
      }
    });

    if (criticalPathCells.length > 0) {
      const exitBlocked = alwaysBlocked.has(exitKey);
      if (exitBlocked) {
        result.issues.push(makeIssue(
          "exit_vision_blocked",
          "巡逻视线永久封锁出口：出口位置始终在巡逻员视野内",
          [{ x: exit.x, y: exit.y }]
        ));
        result.checks[result.checks.length - 1].passed = false;
      }

      let allExhibitsBlocked = true;
      const blockedExhibitCells = [];
      for (const ex of exhibits) {
        const exAdj = getAdjacentCells(ex).some(c => !alwaysBlocked.has(pointKey(c)) && reachAllDoorsOpen.has(pointKey(c)));
        if (exAdj) {
          allExhibitsBlocked = false;
        } else {
          blockedExhibitCells.push({ x: ex.x, y: ex.y });
          blockedExhibitCells.push(...getAdjacentCells(ex));
        }
      }
      if (allExhibitsBlocked && exhibits.length > 0) {
        result.issues.push(makeIssue(
          "exhibits_vision_blocked",
          "巡逻视线永久封锁所有展柜的修复位置",
          blockedExhibitCells
        ));
        result.checks[result.checks.length - 1].passed = false;
      }

      if (!exitBlocked && !allExhibitsBlocked && criticalPathCells.length > 0) {
        result.warnings.push(makeWarning(
          "vision_path_cells",
          `有 ${criticalPathCells.length} 个格子始终在巡逻视野内，可能影响通行`,
          criticalPathCells
        ));
      }
    }
  }

  result.checks.push({ name: "完整求解验证", passed: false });
  const solution = solveLevelDetailed(level);
  if (solution && solution.solvable) {
    result.solvable = true;
    result.solution = solution;
    result.checks[result.checks.length - 1].passed = true;

    const previewCount = Math.min(6, solution.path.length);
    for (let i = 0; i < previewCount; i++) {
      result.debug.solutionPreview.push({
        step: i,
        action: solution.actions[i] || "",
        pos: { x: solution.path[i].x, y: solution.path[i].y }
      });
    }
  } else {
    result.issues.push(makeIssue(
      "no_solution",
      "关卡无解：找不到合法的通关路线",
      result.debug.unreachableCells.length > 0
        ? result.debug.unreachableCells.slice(0, 20)
        : (result.debug.permanentlyBlockedCells.length > 0
           ? result.debug.permanentlyBlockedCells.slice(0, 20)
           : [])
    ));
    result.checks[result.checks.length - 1].passed = false;

    if (guards.length > 0 && result.checks.filter(c => c.name !== "完整求解验证").every(c => c.passed)) {
      result.warnings.push(makeWarning(
        "timing_issue",
        "静态检查通过但动态无解，可能是巡逻时机问题导致无法通过",
        result.debug.permanentlyBlockedCells.slice(0, 10)
      ));
    }
  }

  return result;
};

window.unifiedSolveLevel = function(level, options = {}) {
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
  const maxIterations = options.maxIterations || 150000;
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
    guardsList.forEach((guard) => {
      const pos = guard.pos;
      vision.add(pointKey(pos));
      const baseRange = visionReduced ? 1 : 2;
      const alertBonus = Math.floor(guard.alertLevel / 2);
      const maxRange = baseRange + alertBonus;
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

  function updateGlobalAlertLevelUnified(s) {
    let maxAlert = 0;
    s.guards.forEach((guard) => {
      maxAlert = Math.max(maxAlert, guard.alertLevel);
    });
    s.alertLevel = maxAlert;
  }

  function recordOpenedDoorUnified(s, door) {
    if (!s.openedDoors.some(d => samePoint(d, door))) {
      s.openedDoors.push({ x: door.x, y: door.y, turn: s.turnCount });
    }
  }

  function processEndTurnUnified(curState, lastActionLabel) {
    const nextState = cloneSolverStateUnified(curState);
    emitSoundUnified(nextState, 0, nextState.pos, "等待");
    nextState.ap = 4;
    advanceLightAndCameraEffectsUnified(nextState);
    decayAlertLevelsUnified(nextState);
    nextState.guards.forEach(g => moveGuardUnified(g, nextState.openedDoors));

    const nextVision = getFullVisionUnified(nextState.guards, nextState.screens, nextState.visionReduced, nextState.camerasDisabled, nextState.lightsActive);
    const curPk = pointKey(nextState.pos);
    if (nextVision.has(curPk)) {
      return null;
    }

    const nextCamVision = getCameraVisionUnified(nextState.screens, nextState.visionReduced, nextState.camerasDisabled, nextState.lightsActive);
    if (nextCamVision.has(curPk)) {
      nextState.alertLevel = Math.min(3, nextState.alertLevel + 1);
      if (nextState.alertLevel >= 3) {
        return null;
      }
      updateGlobalAlertLevelUnified(nextState);
    }

    nextState.step = (curState.step + 1) % (curState.guards.length > 0 ? Math.max(...curState.guards.map(g => g.path.length)) : 1);
    nextState.turnCount = curState.turnCount + 1;
    nextState.path.push({ ...nextState.pos });
    nextState.actionLabels = nextState.actionLabels || [...nextState.actions];
    if (nextState.actionLabels.length > 0) {
      nextState.actionLabels[nextState.actionLabels.length - 1] = lastActionLabel + "+等待";
    }
    nextState.actions = nextState.actionLabels;
    return nextState;
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
      let actionLabel = dirName;
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
        recordOpenedDoorUnified(ns, { x: nx, y: ny });
        actionLabel = "开门+" + actionLabel;
        soundLoudness = 3;
      }

      ns.pos = newPos;
      ns.ap -= 1;

      emitSoundUnified(ns, soundLoudness, ns.pos, dirName);

      for (let i = 0; i < keyItems.length; i++) {
        if (!ns.keysTaken[i] && keyItems[i].x === nx && keyItems[i].y === ny) {
          ns.keys += 1;
          ns.keysTaken[i] = true;
          actionLabel += "+拾钥匙";
        }
      }

      for (let pi = 0; pi < numPlates; pi++) {
        const plate = pressurePlates[pi];
        const playerOn = samePoint(ns.pos, plate);
        if (playerOn && !ns.plateTriggered[pi]) {
          ns.plateTriggered[pi] = true;
          for (const td of plate.targetDoors) {
            const tdi = doors.findIndex(d => samePoint(d, td));
            if (tdi >= 0) {
              const wasClosed = !ns.doorsOpen[tdi];
              ns.doorsOpen[tdi] = !ns.doorsOpen[tdi];
              if (wasClosed && ns.doorsOpen[tdi]) {
                recordOpenedDoorUnified(ns, doors[tdi]);
              }
            }
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

      const vision = getFullVisionUnified(ns.guards, ns.screens, ns.visionReduced, ns.camerasDisabled, ns.lightsActive);
      if (vision.has(pk)) continue;

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

      if (ns.ap <= 0) {
        const endTurnResult = processEndTurnUnified(ns, actionLabel);
        if (endTurnResult) {
          const found = checkAndEnqueue(endTurnResult);
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
          const endTurnResult = processEndTurnUnified(ns, "修复展柜");
          if (endTurnResult) {
            const found = checkAndEnqueue(endTurnResult);
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
      const endTurnResult = processEndTurnUnified(cur, "等待回合");
      if (endTurnResult) {
        const found = checkAndEnqueue(endTurnResult);
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
};
