window.samePoint = function(a, b) {
  return a.x === b.x && a.y === b.y;
};

window.pointKey = function(point) {
  return `${point.x},${point.y}`;
};

window.inside = function(point) {
  return point.x >= 0 && point.x < 8 && point.y >= 0 && point.y < 7;
};

window.isAdjacent = function(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1;
};

window.getDirectionName = function(dx, dy) {
  if (dx === 0 && dy === -1) return "向上移动";
  if (dx === 0 && dy === 1) return "向下移动";
  if (dx === -1 && dy === 0) return "向左移动";
  if (dx === 1 && dy === 0) return "向右移动";
  return "移动";
};

window.cameraDirToVector = function(direction) {
  switch (direction) {
    case CAMERA_DIRECTION.UP: return { dx: 0, dy: -1 };
    case CAMERA_DIRECTION.DOWN: return { dx: 0, dy: 1 };
    case CAMERA_DIRECTION.LEFT: return { dx: -1, dy: 0 };
    case CAMERA_DIRECTION.RIGHT: return { dx: 1, dy: 0 };
    default: return { dx: 1, dy: 0 };
  }
};

window.getCameraDirectionLabel = function(direction) {
  switch (direction) {
    case CAMERA_DIRECTION.UP: return "↑";
    case CAMERA_DIRECTION.DOWN: return "↓";
    case CAMERA_DIRECTION.LEFT: return "←";
    case CAMERA_DIRECTION.RIGHT: return "→";
    default: return "→";
  }
};

window.gcd = function(a, b) {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
};

window.lcm = function(a, b) {
  return (a * b) / gcd(a, b);
};

window.getGuardCycleLength = function(guards) {
  if (guards.length === 0) return 1;
  return guards.reduce((acc, g) => lcm(acc, g.path.length), 1);
};

window.exhibitMask = function(exhibits, fixedFlags) {
  let mask = 0;
  for (let i = 0; i < exhibits.length; i++) {
    if (fixedFlags[i]) mask |= 1 << i;
  }
  return mask;
};

window.allExhibitsFixed = function(mask, numExhibits) {
  return mask === (1 << numExhibits) - 1;
};

window.getAdjacentCells = function(pos) {
  const cells = [];
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  for (const [dx, dy] of dirs) {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx >= 0 && nx < BOARD_W && ny >= 0 && ny < BOARD_H) {
      cells.push({ x: nx, y: ny });
    }
  }
  return cells;
};

window.getDateKey = function(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

window.hashString = function(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

window.mulberry32 = function(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

window.createDailyRNG = function(dateKey) {
  const seed = hashString(dateKey);
  return mulberry32(seed);
};

window.randomInt = function(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
};

window.randomChoice = function(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
};

window.shuffle = function(rng, arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
