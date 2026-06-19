const boardEl = document.getElementById("board");
const logEl = document.getElementById("log");
const resultEl = document.getElementById("result");
const levelButtonsEl = document.getElementById("levelButtons");
const levelNameEl = document.getElementById("levelName");
const apEl = document.getElementById("ap");
const keysEl = document.getElementById("keys");
const fixedEl = document.getElementById("fixed");
const waitBtn = document.getElementById("waitBtn");
const repairBtn = document.getElementById("repairBtn");
const restartBtn = document.getElementById("restartBtn");

const replayEl = document.getElementById("replay");
const replayCloseBtn = document.getElementById("replayCloseBtn");
const replayBoardEl = document.getElementById("replayBoard");
const replayPlayBtn = document.getElementById("replayPlayBtn");
const replayPrevBtn = document.getElementById("replayPrevBtn");
const replayNextBtn = document.getElementById("replayNextBtn");
const replayStepEl = document.getElementById("replayStep");
const replayTotalEl = document.getElementById("replayTotal");
const replayLogEl = document.getElementById("replayLog");
const replayActionEl = document.getElementById("replayAction");
const replayProgressEl = document.getElementById("replayProgress");

const levels = [
  {
    name: "一",
    walls: ["3,1", "3,2", "3,3", "3,4", "5,5"],
    doors: [],
    keys: [{ x: 1, y: 5 }],
    exhibits: [{ x: 6, y: 1, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [{ path: [{ x: 5, y: 2 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 5, y: 3 }], step: 0 }],
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
      { path: [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 3 }, { x: 3, y: 3 }], step: 0 }
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
      { path: [{ x: 5, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 3 }, { x: 5, y: 3 }], step: 0 },
      { path: [{ x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }], step: 0 }
    ],
    exit: { x: 4, y: 0 }
  }
];

let state;
let customLevelSource = null;

let replayState = {
  history: [],
  currentStep: 0,
  isPlaying: false,
  playInterval: null,
  playSpeed: 1000
};

function cloneLevel(index) {
  return JSON.parse(JSON.stringify(levels[index]));
}

function snapshotState(action) {
  return {
    action: action,
    player: { ...state.player },
    ap: state.ap,
    keys: state.keys,
    done: state.done,
    level: {
      walls: [...state.level.walls],
      doors: state.level.doors.map(d => ({ ...d })),
      keys: state.level.keys.map(k => ({ ...k })),
      exhibits: state.level.exhibits.map(e => ({ ...e })),
      guards: state.level.guards.map(g => ({ path: g.path.map(p => ({ ...p })), step: g.step })),
      exit: state.level.exit ? { ...state.level.exit } : null,
      player: state.level.player ? { ...state.level.player } : null,
      name: state.level.name
    },
    log: [...state.log]
  };
}

function recordHistory(action) {
  state.history.push(snapshotState(action));
}

function freshState(index) {
  const level = cloneLevel(index);
  return {
    levelIndex: index,
    level,
    player: { ...level.player },
    ap: 4,
    keys: 0,
    done: false,
    log: [`第${level.name}展厅夜巡开始，避开视线完成修复。`],
    history: []
  };
}

function freshStateFromLevel(levelData) {
  const level = JSON.parse(JSON.stringify(levelData));
  level.keys = level.keys.map((k) => ({ ...k, taken: false }));
  level.exhibits = level.exhibits.map((e) => ({ ...e, fixed: false }));
  level.doors = level.doors.map((d) => ({ ...d, open: false }));
  level.guards = level.guards.map((g) => ({ path: [...g.path], step: 0 }));
  return {
    levelIndex: -1,
    level,
    player: { ...level.player },
    ap: 4,
    keys: 0,
    done: false,
    log: [`${level.name}关卡夜巡开始，避开视线完成修复。`],
    history: []
  };
}

function loadCustomLevel(levelData) {
  customLevelSource = JSON.parse(JSON.stringify(levelData));
  state = freshStateFromLevel(levelData);
  resultEl.classList.add("hidden");
  [...levelButtonsEl.children].forEach((button) => {
    button.classList.remove("active");
  });
  render();
}

function init() {
  renderLevelButtons();
  state = freshState(0);
  bindControls();
  bindReplayControls();
  recordHistory("开局");
  render();
}

function bindControls() {
  document.getElementById("upBtn").addEventListener("click", () => move(0, -1));
  document.getElementById("downBtn").addEventListener("click", () => move(0, 1));
  document.getElementById("leftBtn").addEventListener("click", () => move(-1, 0));
  document.getElementById("rightBtn").addEventListener("click", () => move(1, 0));
  waitBtn.addEventListener("click", endTurn);
  repairBtn.addEventListener("click", repair);
  restartBtn.addEventListener("click", restartLevel);
  window.addEventListener("keydown", (event) => {
    const keys = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      s: [0, 1],
      a: [-1, 0],
      d: [1, 0]
    };
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      repair();
      return;
    }
    const dir = keys[event.key];
    if (dir) {
      event.preventDefault();
      move(dir[0], dir[1]);
    }
  });
}

function bindReplayControls() {
  replayCloseBtn.addEventListener("click", closeReplay);
  replayPlayBtn.addEventListener("click", toggleReplayPlay);
  replayPrevBtn.addEventListener("click", replayPrevStep);
  replayNextBtn.addEventListener("click", replayNextStep);
}

function renderLevelButtons() {
  levelButtonsEl.innerHTML = "";
  levels.forEach((level, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `关卡${level.name}`;
    button.addEventListener("click", () => loadLevel(index));
    levelButtonsEl.appendChild(button);
  });
}

function loadLevel(index) {
  customLevelSource = null;
  state = freshState(index);
  resultEl.classList.add("hidden");
  recordHistory("开局");
  render();
}

function restartLevel() {
  if (state.levelIndex === -1 && customLevelSource) {
    state = freshStateFromLevel(customLevelSource);
    resultEl.classList.add("hidden");
    recordHistory("开局");
    render();
    return;
  }
  loadLevel(state.levelIndex);
}

function getDirectionName(dx, dy) {
  if (dx === 0 && dy === -1) return "向上移动";
  if (dx === 0 && dy === 1) return "向下移动";
  if (dx === -1 && dy === 0) return "向左移动";
  if (dx === 1 && dy === 0) return "向右移动";
  return "移动";
}

function move(dx, dy) {
  if (state.done || state.ap <= 0) return;
  const next = { x: state.player.x + dx, y: state.player.y + dy };
  if (!inside(next) || isWall(next)) return;
  let action = getDirectionName(dx, dy);
  const door = doorAt(next);
  if (door && !door.open) {
    if (state.keys > 0) {
      state.keys -= 1;
      door.open = true;
      action = "开门并" + action;
      addLog("用钥匙打开了侧门。");
    } else {
      addLog("门锁着，需要先找到钥匙。");
      render();
      return;
    }
  }
  state.player = next;
  state.ap -= 1;
  pickKey();
  if (seenByGuard()) {
    recordHistory(action);
    fail("巡逻员发现了你的手电反光。");
    return;
  }
  if (state.ap === 0) {
    recordHistory(action);
    endTurn();
    return;
  }
  recordHistory(action);
  render();
}

function repair() {
  if (state.done || state.ap <= 0) return;
  const exhibit = adjacentExhibit();
  if (!exhibit) {
    addLog("附近没有需要修复的展柜。");
    render();
    return;
  }
  if (exhibit.fixed) {
    addLog("这个展柜已经复位。");
    render();
    return;
  }
  exhibit.fixed = true;
  state.ap -= 1;
  addLog("展品被悄悄修回了正确状态。");
  if (allFixed() && samePoint(state.player, state.level.exit)) {
    recordHistory("修复展柜");
    win();
    return;
  }
  if (state.ap === 0) {
    recordHistory("修复展柜");
    endTurn();
    return;
  }
  recordHistory("修复展柜");
  render();
}

function endTurn() {
  if (state.done) return;
  state.ap = 4;
  state.level.guards.forEach((guard) => {
    guard.step = (guard.step + 1) % guard.path.length;
  });
  addLog("巡逻员换了一段路线。");
  if (seenByGuard()) {
    recordHistory("等待回合");
    fail("换班瞬间被巡逻员撞见。");
    return;
  }
  if (allFixed() && samePoint(state.player, state.level.exit)) {
    recordHistory("等待回合");
    win();
    return;
  }
  recordHistory("等待回合");
  render();
}

function pickKey() {
  const key = state.level.keys.find((item) => !item.taken && samePoint(item, state.player));
  if (key) {
    key.taken = true;
    state.keys += 1;
    addLog("捡到一枚展柜侧门钥匙。");
  }
}

function adjacentExhibit() {
  return state.level.exhibits.find((item) => Math.abs(item.x - state.player.x) + Math.abs(item.y - state.player.y) <= 1);
}

function allFixed() {
  return state.level.exhibits.every((item) => item.fixed);
}

function win() {
  state.done = true;
  resultEl.innerHTML = `<h2>本关修复完成</h2><p>所有展品复位，并从指定出口离开。可以选择下一关继续。</p><button id="replayBtn" type="button" class="replay-trigger">查看本局回放</button>`;
  resultEl.classList.remove("hidden");
  addLog("警报没有响，展厅恢复安静。");
  recordHistory("通关成功");
  const replayBtn = document.getElementById("replayBtn");
  if (replayBtn) replayBtn.addEventListener("click", () => openReplay(true));
  render();
}

function fail(reason) {
  state.done = true;
  resultEl.innerHTML = `<h2>行动失败</h2><p>${reason}</p><button id="replayBtn" type="button" class="replay-trigger">查看本局回放</button>`;
  resultEl.classList.remove("hidden");
  addLog(reason);
  if (!state.history[state.history.length - 1] || state.history[state.history.length - 1].action !== "被发现") {
    recordHistory("被发现");
  }
  const replayBtn = document.getElementById("replayBtn");
  if (replayBtn) replayBtn.addEventListener("click", () => openReplay(false));
  render();
}

function seenByGuard() {
  return visionSet().has(pointKey(state.player));
}

function visionSet() {
  const set = new Set();
  state.level.guards.forEach((guard) => {
    const pos = guard.path[guard.step];
    set.add(pointKey(pos));
    const next = guard.path[(guard.step + 1) % guard.path.length];
    const dx = Math.sign(next.x - pos.x);
    const dy = Math.sign(next.y - pos.y);
    for (let i = 1; i <= 2; i += 1) {
      const point = { x: pos.x + dx * i, y: pos.y + dy * i };
      if (!inside(point) || isWall(point)) break;
      set.add(pointKey(point));
    }
  });
  return set;
}

function visionSetForSnapshot(snapshot) {
  const set = new Set();
  snapshot.level.guards.forEach((guard) => {
    const pos = guard.path[guard.step];
    set.add(pointKey(pos));
    const next = guard.path[(guard.step + 1) % guard.path.length];
    const dx = Math.sign(next.x - pos.x);
    const dy = Math.sign(next.y - pos.y);
    for (let i = 1; i <= 2; i += 1) {
      const point = { x: pos.x + dx * i, y: pos.y + dy * i };
      if (!inside(point) || isWallForSnapshot(snapshot, point)) break;
      set.add(pointKey(point));
    }
  });
  return set;
}

function isWall(point) {
  return state.level.walls.includes(pointKey(point));
}

function isWallForSnapshot(snapshot, point) {
  return snapshot.level.walls.includes(pointKey(point));
}

function doorAt(point) {
  return state.level.doors.find((door) => samePoint(door, point));
}

function doorAtForSnapshot(snapshot, point) {
  return snapshot.level.doors.find((door) => samePoint(door, point));
}

function inside(point) {
  return point.x >= 0 && point.x < 8 && point.y >= 0 && point.y < 7;
}

function samePoint(a, b) {
  return a.x === b.x && a.y === b.y;
}

function pointKey(point) {
  return `${point.x},${point.y}`;
}

function addLog(text) {
  state.log.push(text);
  state.log = state.log.slice(-28);
}

function render() {
  levelNameEl.textContent = state.level.name;
  apEl.textContent = state.ap;
  keysEl.textContent = state.keys;
  fixedEl.textContent = `${state.level.exhibits.filter((item) => item.fixed).length}/${state.level.exhibits.length}`;
  [...levelButtonsEl.children].forEach((button, index) => {
    button.classList.toggle("active", index === state.levelIndex);
  });
  waitBtn.disabled = state.done;
  repairBtn.disabled = state.done;
  renderBoard();
  renderLog();
}

function renderBoard() {
  const guards = state.level.guards.map((guard) => guard.path[guard.step]);
  const vision = visionSet();
  boardEl.innerHTML = "";
  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const point = { x, y };
      const tile = document.createElement("div");
      tile.className = "tile";
      const label = document.createElement("span");
      if (isWall(point)) tile.classList.add("wall");
      const door = doorAt(point);
      if (door) {
        tile.classList.add("door");
        label.textContent = door.open ? "门开" : "门";
      }
      const key = state.level.keys.find((item) => !item.taken && samePoint(item, point));
      if (key) {
        tile.classList.add("key");
        label.textContent = "钥匙";
      }
      const exhibit = state.level.exhibits.find((item) => samePoint(item, point));
      if (exhibit) {
        tile.classList.add(exhibit.fixed ? "fixed-exhibit" : "exhibit");
        label.textContent = exhibit.fixed ? "已修" : "展柜";
      }
      if (samePoint(state.level.exit, point)) {
        tile.classList.add("exit");
        label.textContent = "出口";
      }
      if (vision.has(pointKey(point))) tile.classList.add("vision");
      if (guards.some((guard) => samePoint(guard, point))) tile.classList.add("guard");
      if (samePoint(state.player, point)) tile.classList.add("player");
      tile.appendChild(label);
      boardEl.appendChild(tile);
    }
  }
}

function renderLog() {
  logEl.innerHTML = "";
  state.log.forEach((entry) => {
    const p = document.createElement("p");
    p.textContent = entry;
    logEl.appendChild(p);
  });
}

function openReplay(isWin) {
  if (state.history.length === 0) return;
  stopReplayPlay();
  replayState.history = state.history;
  replayState.currentStep = 0;
  replayState.isPlaying = false;
  replayPlayBtn.textContent = "▶ 播放";
  replayTotalEl.textContent = replayState.history.length;
  replayStepEl.textContent = "1";
  replayProgressEl.max = replayState.history.length - 1;
  replayProgressEl.value = 0;
  replayProgressEl.oninput = (e) => {
    goToReplayStep(parseInt(e.target.value, 10));
  };
  replayEl.classList.remove("hidden");
  renderReplayStep();
}

function closeReplay() {
  stopReplayPlay();
  replayEl.classList.add("hidden");
}

function goToReplayStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= replayState.history.length) return;
  replayState.currentStep = stepIndex;
  replayStepEl.textContent = stepIndex + 1;
  replayProgressEl.value = stepIndex;
  renderReplayStep();
}

function renderReplayStep() {
  const snapshot = replayState.history[replayState.currentStep];
  replayActionEl.textContent = `第 ${replayState.currentStep + 1} 步 · ${snapshot.action}`;
  const guards = snapshot.level.guards.map((guard) => guard.path[guard.step]);
  const vision = visionSetForSnapshot(snapshot);
  replayBoardEl.innerHTML = "";
  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const point = { x, y };
      const tile = document.createElement("div");
      tile.className = "tile";
      const label = document.createElement("span");
      if (isWallForSnapshot(snapshot, point)) tile.classList.add("wall");
      const door = doorAtForSnapshot(snapshot, point);
      if (door) {
        tile.classList.add("door");
        label.textContent = door.open ? "门开" : "门";
      }
      const key = snapshot.level.keys.find((item) => !item.taken && samePoint(item, point));
      if (key) {
        tile.classList.add("key");
        label.textContent = "钥匙";
      }
      const exhibit = snapshot.level.exhibits.find((item) => samePoint(item, point));
      if (exhibit) {
        tile.classList.add(exhibit.fixed ? "fixed-exhibit" : "exhibit");
        label.textContent = exhibit.fixed ? "已修" : "展柜";
      }
      if (snapshot.level.exit && samePoint(snapshot.level.exit, point)) {
        tile.classList.add("exit");
        label.textContent = "出口";
      }
      if (vision.has(pointKey(point))) tile.classList.add("vision");
      if (guards.some((guard) => samePoint(guard, point))) tile.classList.add("guard");
      if (samePoint(snapshot.player, point)) tile.classList.add("player");
      tile.appendChild(label);
      replayBoardEl.appendChild(tile);
    }
  }
  replayLogEl.innerHTML = "";
  const recentLogs = snapshot.log.slice(-10);
  recentLogs.forEach((entry) => {
    const p = document.createElement("p");
    p.textContent = entry;
    replayLogEl.appendChild(p);
  });
  replayPrevBtn.disabled = replayState.currentStep <= 0;
  replayNextBtn.disabled = replayState.currentStep >= replayState.history.length - 1;
}

function replayPrevStep() {
  stopReplayPlay();
  goToReplayStep(replayState.currentStep - 1);
}

function replayNextStep() {
  stopReplayPlay();
  goToReplayStep(replayState.currentStep + 1);
}

function toggleReplayPlay() {
  if (replayState.isPlaying) {
    stopReplayPlay();
  } else {
    startReplayPlay();
  }
}

function startReplayPlay() {
  if (replayState.currentStep >= replayState.history.length - 1) {
    replayState.currentStep = 0;
    renderReplayStep();
  }
  replayState.isPlaying = true;
  replayPlayBtn.textContent = "⏸ 暂停";
  replayState.playInterval = setInterval(() => {
    if (replayState.currentStep >= replayState.history.length - 1) {
      stopReplayPlay();
      return;
    }
    goToReplayStep(replayState.currentStep + 1);
  }, replayState.playSpeed);
}

function stopReplayPlay() {
  replayState.isPlaying = false;
  replayPlayBtn.textContent = "▶ 播放";
  if (replayState.playInterval) {
    clearInterval(replayState.playInterval);
    replayState.playInterval = null;
  }
}

init();
