window.initializeGuards = function(guards) {
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
};

window.getGuardCurrentPosition = function(guard) {
  return guard.pos;
};

window.getGuardNextDirection = function(guard) {
  if (guard.state === "investigate" && guard.investigateTarget) {
    const current = guard.pos;
    const target = guard.investigateTarget;
    const dx = Math.sign(target.x - current.x);
    const dy = Math.sign(target.y - current.y);
    if (Math.abs(target.x - current.x) >= Math.abs(target.y - current.y)) {
      return { dx, dy: 0 };
    }
    return { dx: 0, dy };
  }

  if (guard.state === "trace" && guard.tracePath.length > 0) {
    const current = guard.pos;
    const target = guard.tracePath[0];
    const dx = Math.sign(target.x - current.x);
    const dy = Math.sign(target.y - current.y);
    return { dx, dy };
  }

  if (guard.behavior === GUARD_BEHAVIOR.PATROL) {
    const nextStep = guard.step + guard.direction;
    if (nextStep >= guard.path.length || nextStep < 0) {
      guard.direction *= -1;
    }
    const nextIndex = guard.step + guard.direction;
    const current = guard.path[guard.step];
    const next = guard.path[nextIndex];
    return {
      dx: Math.sign(next.x - current.x),
      dy: Math.sign(next.y - current.y)
    };
  }

  const current = guard.path[guard.step];
  const next = guard.path[(guard.step + 1) % guard.path.length];
  return {
    dx: Math.sign(next.x - current.x),
    dy: Math.sign(next.y - current.y)
  };
};

window.findNearestPathStep = function(guard, pos) {
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
};

window.getAlertLevelInfo = function(value) {
  const levels = [ALERT_LEVEL.CALM, ALERT_LEVEL.CURIOUS, ALERT_LEVEL.SUSPICIOUS, ALERT_LEVEL.ALERT];
  return levels[Math.min(value, levels.length - 1)];
};

window.getGuardVisionAtStep = function(guards, step, walls) {
  const vision = new Set();
  const wallSet = new Set(walls);
  guards.forEach((guard) => {
    const pos = guard.path[step % guard.path.length];
    vision.add(pointKey(pos));
    const nextPos = guard.path[(step + 1) % guard.path.length];
    const dx = Math.sign(nextPos.x - pos.x);
    const dy = Math.sign(nextPos.y - pos.y);
    for (let i = 1; i <= 2; i++) {
      const p = { x: pos.x + dx * i, y: pos.y + dy * i };
      if (p.x < 0 || p.x >= BOARD_W || p.y < 0 || p.y >= BOARD_H) break;
      if (wallSet.has(pointKey(p))) break;
      vision.add(pointKey(p));
    }
  });
  return vision;
};

window.getGuardVisionAtStepWithScreens = function(guards, step, walls, screens, visionReduced) {
  const vision = new Set();
  const wallSet = new Set(walls);
  const screenSet = new Set(screens.map(s => pointKey(s)));
  const maxRange = visionReduced ? 1 : 2;
  guards.forEach((guard) => {
    const pos = guard.path[step % guard.path.length];
    vision.add(pointKey(pos));
    const nextPos = guard.path[(step + 1) % guard.path.length];
    const dx = Math.sign(nextPos.x - pos.x);
    const dy = Math.sign(nextPos.y - pos.y);
    for (let i = 1; i <= maxRange; i++) {
      const p = { x: pos.x + dx * i, y: pos.y + dy * i };
      if (p.x < 0 || p.x >= BOARD_W || p.y < 0 || p.y >= BOARD_H) break;
      if (wallSet.has(pointKey(p))) break;
      if (screenSet.has(pointKey(p))) break;
      vision.add(pointKey(p));
    }
  });
  return vision;
};

window.getGuardVisionAtStepWithScreensSimple = function(guards, step, walls, screens) {
  const vision = new Set();
  const wallSet = new Set(walls);
  const screenSet = new Set((screens || []).map(s => pointKey(s)));
  const maxRange = 2;
  guards.forEach((guard) => {
    const pos = guard.path[step % guard.path.length];
    vision.add(pointKey(pos));
    const nextPos = guard.path[(step + 1) % guard.path.length];
    const dx = Math.sign(nextPos.x - pos.x);
    const dy = Math.sign(nextPos.y - pos.y);
    for (let i = 1; i <= maxRange; i++) {
      const p = { x: pos.x + dx * i, y: pos.y + dy * i };
      if (p.x < 0 || p.x >= BOARD_W || p.y < 0 || p.y >= BOARD_H) break;
      if (wallSet.has(pointKey(p))) break;
      if (screenSet.has(pointKey(p))) break;
      vision.add(pointKey(p));
    }
  });
  return vision;
};

window.getCameraVisionSet = function(cameras, wallSet, screenSet, visionReduced) {
  const set = new Set();
  const maxRange = visionReduced ? 3 : 6;
  cameras.forEach((camera) => {
    if (camera.disabled) return;
    const dir = cameraDirToVector(camera.direction);
    for (let i = 1; i <= maxRange; i += 1) {
      const point = { x: camera.x + dir.dx * i, y: camera.y + dir.dy * i };
      if (!inside(point) || wallSet.has(pointKey(point)) || screenSet.has(pointKey(point))) break;
      set.add(pointKey(point));
    }
  });
  return set;
};
