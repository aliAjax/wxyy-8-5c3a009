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
const tutorialBtn = document.getElementById("tutorialBtn");
const dailyBtn = document.getElementById("dailyBtn");
const tutorialHintEl = document.getElementById("tutorialHint");
const tutorialStepEl = document.getElementById("tutorialStep");
const tutorialTitleEl = document.getElementById("tutorialTitle");
const tutorialTextEl = document.getElementById("tutorialText");
const tutorialErrorEl = document.getElementById("tutorialError");

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
  },
  {
    name: "四",
    walls: ["3,0", "3,1", "3,2", "3,4", "3,5", "3,6"],
    doors: [{ x: 3, y: 3, open: false }],
    keys: [],
    exhibits: [{ x: 7, y: 2, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [
      { path: [{ x: 5, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 3 }, { x: 5, y: 3 }], step: 0 }
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
      { path: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 4 }, { x: 2, y: 4 }], step: 0 },
      { path: [{ x: 6, y: 2 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 7, y: 2 }], step: 0 }
    ],
    exit: { x: 7, y: 0 },
    mechanisms: {
      pressurePlates: [
        { x: 2, y: 5, targetDoors: [{ x: 4, y: 3 }], triggered: false }
      ],
      screens: [{ x: 3, y: 3 }],
      lights: [{ x: 5, y: 3, active: false }]
    }
  }
];

const tutorialLevel = {
  name: "教学",
  walls: ["4,2", "4,3", "4,4", "4,5", "4,6"],
  doors: [{ x: 4, y: 1, open: false }],
  keys: [{ x: 2, y: 3 }],
  exhibits: [{ x: 6, y: 2, fixed: false }],
  player: { x: 0, y: 6 },
  guards: [{ path: [{ x: 5, y: 4 }, { x: 6, y: 4 }], step: 0 }],
  exit: { x: 7, y: 0 }
};

const tutorialSteps = [
  {
    id: 0,
    title: "学习移动",
    text: "使用方向键或 WASD 移动到高亮的格子。按右方向键 3 次，移动到 (3,6)。",
    errorHints: {
      wrongDirection: "请按右方向键 → 向右移动",
      wrongAction: "现在还不能修复或等待，请先移动到指定位置"
    },
    target: { x: 3, y: 6 },
    highlight: [{ x: 3, y: 6 }],
    validate: (state) => samePoint(state.player, { x: 3, y: 6 }),
    allowedActions: ["move"]
  },
  {
    id: 1,
    title: "拾取钥匙",
    text: "移动到高亮的钥匙位置拾取它。钥匙可以打开上锁的门。",
    errorHints: {
      wrongDirection: "请向钥匙方向移动",
      wrongAction: "现在还不能修复或等待，请先去拿钥匙"
    },
    target: { x: 2, y: 3 },
    highlight: [{ x: 2, y: 3 }],
    validate: (state) => state.keys > 0,
    allowedActions: ["move", "wait"]
  },
  {
    id: 2,
    title: "开门并避开巡逻",
    text: "用钥匙打开门，然后观察巡逻员的视线（红色区域）。按\"等待回合\"让巡逻员移动，等他转身后再通过。",
    errorHints: {
      wrongDirection: "小心！不要进入红色视线区域",
      seenByGuard: "被发现了！等巡逻员转身后再移动",
      wrongAction: "先按等待回合观察巡逻员的移动规律"
    },
    target: { x: 5, y: 3 },
    highlight: [{ x: 5, y: 3 }],
    validate: (state) => samePoint(state.player, { x: 5, y: 3 }),
    allowedActions: ["move", "wait"],
    requireWait: true
  },
  {
    id: 3,
    title: "修复展柜",
    text: "移动到高亮的展柜旁边，然后点击\"修复展柜\"按钮或按空格键修复它。",
    errorHints: {
      wrongDirection: "请移动到展柜旁边",
      wrongAction: "先移动到展柜旁边才能修复",
      seenByGuard: "被发现了！注意巡逻员的动向。"
    },
    target: { x: 6, y: 2 },
    highlight: [{ x: 6, y: 2 }],
    validate: (state) => state.level.exhibits.every(e => e.fixed),
    allowedActions: ["move", "repair", "wait"]
  },
  {
    id: 4,
    title: "到达出口",
    text: "所有展柜修复完成后，移动到高亮的出口位置离开博物馆。",
    errorHints: {
      wrongDirection: "请移动到出口位置",
      wrongAction: "直接移动到出口即可",
      seenByGuard: "被发现了！小心避开巡逻员。"
    },
    target: { x: 7, y: 0 },
    highlight: [{ x: 7, y: 0 }],
    validate: (state) => allFixed() && samePoint(state.player, state.level.exit),
    allowedActions: ["move", "wait"]
  }
];

let tutorialState = {
  active: false,
  currentStep: 0,
  hasWaited: false,
  wrongAttempts: 0,
  errorTimeout: null
};

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
  const m = state.level.mechanisms;
  return {
    action: action,
    player: { ...state.player },
    ap: state.ap,
    keys: state.keys,
    done: state.done,
    visionReduced: state.visionReduced,
    level: {
      walls: [...state.level.walls],
      doors: state.level.doors.map(d => ({ ...d })),
      keys: state.level.keys.map(k => ({ ...k })),
      exhibits: state.level.exhibits.map(e => ({ ...e })),
      guards: state.level.guards.map(g => ({ path: g.path.map(p => ({ ...p })), step: g.step })),
      exit: state.level.exit ? { ...state.level.exit } : null,
      player: state.level.player ? { ...state.level.player } : null,
      name: state.level.name,
      mechanisms: m ? {
        pressurePlates: m.pressurePlates.map(p => ({ ...p, targetDoors: p.targetDoors.map(td => ({ ...td })) })),
        screens: m.screens.map(s => ({ ...s })),
        lights: m.lights.map(l => ({ ...l }))
      } : { pressurePlates: [], screens: [], lights: [] }
    },
    log: [...state.log]
  };
}

function recordHistory(action) {
  state.history.push(snapshotState(action));
}

function freshState(index) {
  const level = cloneLevel(index);
  level.mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
  level.mechanisms.pressurePlates = level.mechanisms.pressurePlates.map((p) => ({ ...p, triggered: false }));
  level.mechanisms.screens = level.mechanisms.screens.map((s) => ({ ...s }));
  level.mechanisms.lights = level.mechanisms.lights.map((l) => ({ ...l, active: false }));
  return {
    levelIndex: index,
    level,
    player: { ...level.player },
    ap: 4,
    keys: 0,
    done: false,
    visionReduced: false,
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
  level.mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
  level.mechanisms.pressurePlates = level.mechanisms.pressurePlates.map((p) => ({ ...p, triggered: false }));
  level.mechanisms.screens = level.mechanisms.screens.map((s) => ({ ...s }));
  level.mechanisms.lights = level.mechanisms.lights.map((l) => ({ ...l, active: false }));
  return {
    levelIndex: -1,
    level,
    player: { ...level.player },
    ap: 4,
    keys: 0,
    done: false,
    visionReduced: false,
    log: [`${level.name}关卡夜巡开始，避开视线完成修复。`],
    history: []
  };
}

function loadCustomLevel(levelData) {
  customLevelSource = JSON.parse(JSON.stringify(levelData));
  state = freshStateFromLevel(levelData);
  resultEl.classList.add("hidden");
  tutorialState.active = false;
  tutorialHintEl.classList.add("hidden");
  [...levelButtonsEl.children].forEach((button) => {
    button.classList.remove("active");
  });
  render();
}

function startTutorial() {
  if (tutorialState.errorTimeout) {
    clearTimeout(tutorialState.errorTimeout);
    tutorialState.errorTimeout = null;
  }
  const level = JSON.parse(JSON.stringify(tutorialLevel));
  level.keys = level.keys.map((k) => ({ ...k, taken: false }));
  level.exhibits = level.exhibits.map((e) => ({ ...e, fixed: false }));
  level.doors = level.doors.map((d) => ({ ...d, open: false }));
  level.guards = level.guards.map((g) => ({ path: [...g.path], step: 0 }));
  state = {
    levelIndex: -2,
    level,
    player: { ...level.player },
    ap: 4,
    keys: 0,
    done: false,
    log: ["欢迎来到博物馆！让我们学习如何成为一名优秀的夜间修复师。"],
    history: []
  };
  tutorialState.active = true;
  tutorialState.currentStep = 0;
  tutorialState.hasWaited = false;
  tutorialState.wrongAttempts = 0;
  resultEl.classList.add("hidden");
  tutorialHintEl.classList.remove("hidden");
  [...levelButtonsEl.children].forEach((button) => {
    button.classList.remove("active");
  });
  tutorialBtn.classList.add("active");
  recordHistory("教学开始");
  renderTutorial();
  render();
}

function exitTutorial() {
  tutorialState.active = false;
  tutorialHintEl.classList.add("hidden");
  tutorialBtn.classList.remove("active");
  if (tutorialState.errorTimeout) {
    clearTimeout(tutorialState.errorTimeout);
    tutorialState.errorTimeout = null;
  }
  tutorialErrorEl.textContent = "";
  loadLevel(0);
}

function renderTutorial() {
  const step = tutorialSteps[tutorialState.currentStep];
  tutorialStepEl.textContent = `步骤 ${step.id + 1}/${tutorialSteps.length}`;
  tutorialTitleEl.textContent = step.title;
  tutorialTextEl.textContent = step.text;
  tutorialErrorEl.textContent = "";
}

function showTutorialError(errorType, persist = false) {
  const step = tutorialSteps[tutorialState.currentStep];
  const hint = step.errorHints[errorType] || "请按照提示操作";
  tutorialErrorEl.textContent = hint;
  tutorialState.wrongAttempts += 1;
  if (tutorialState.errorTimeout) {
    clearTimeout(tutorialState.errorTimeout);
  }
  if (!persist) {
    tutorialState.errorTimeout = setTimeout(() => {
      tutorialErrorEl.textContent = "";
      tutorialState.errorTimeout = null;
    }, 2000);
  }
}

function checkTutorialStep() {
  const step = tutorialSteps[tutorialState.currentStep];
  if (step.requireWait && !tutorialState.hasWaited) {
    return false;
  }
  if (step.validate(state)) {
    advanceTutorialStep();
    return true;
  }
  return false;
}

function advanceTutorialStep() {
  tutorialState.wrongAttempts = 0;
  if (tutorialState.errorTimeout) {
    clearTimeout(tutorialState.errorTimeout);
    tutorialState.errorTimeout = null;
  }
  tutorialErrorEl.textContent = "";
  if (tutorialState.currentStep < tutorialSteps.length - 1) {
    tutorialState.currentStep += 1;
    tutorialState.hasWaited = false;
    addLog(`✓ 完成步骤${tutorialState.currentStep}：${tutorialSteps[tutorialState.currentStep - 1].title}`);
    renderTutorial();
    render();
  } else {
    addLog("🎉 恭喜！你已完成所有教学步骤！");
    tutorialState.active = false;
    tutorialHintEl.classList.add("hidden");
    tutorialBtn.classList.remove("active");
    resultEl.innerHTML = `
      <h2>教学完成！</h2>
      <p>你已经掌握了游戏的基本操作：移动、拾取钥匙、避开巡逻、修复展柜、到达出口。</p>
      <p>现在可以开始挑战正式关卡了！</p>
      <button id="startGameBtn" type="button" class="replay-trigger">开始正式游戏</button>
    `;
    resultEl.classList.remove("hidden");
    const startGameBtn = document.getElementById("startGameBtn");
    if (startGameBtn) {
      startGameBtn.addEventListener("click", () => {
        resultEl.classList.add("hidden");
        loadLevel(0);
      });
    }
    render();
  }
}

function isTutorialActionAllowed(action) {
  if (!tutorialState.active) return true;
  const step = tutorialSteps[tutorialState.currentStep];
  return step.allowedActions.includes(action);
}

function restartTutorialStep(reason = "manual") {
  const currentStep = tutorialState.currentStep;
  const hasWaited = tutorialState.hasWaited;

  const level = JSON.parse(JSON.stringify(tutorialLevel));
  level.keys = level.keys.map((k) => ({ ...k, taken: false }));
  level.exhibits = level.exhibits.map((e) => ({ ...e, fixed: false }));
  level.doors = level.doors.map((d) => ({ ...d, open: false }));
  level.guards = level.guards.map((g) => ({ path: [...g.path], step: 0 }));

  let playerStart = { ...level.player };
  let keys = 0;

  if (currentStep >= 1) {
    playerStart = { x: 3, y: 6 };
  }
  if (currentStep >= 2) {
    playerStart = { x: 2, y: 3 };
    level.keys[0].taken = true;
    keys = 1;
  }
  if (currentStep >= 3) {
    playerStart = { x: 5, y: 3 };
    level.keys[0].taken = true;
    keys = 0;
    level.doors[0].open = true;
  }
  if (currentStep >= 4) {
    playerStart = { x: 6, y: 3 };
    level.keys[0].taken = true;
    keys = 0;
    level.doors[0].open = true;
    level.exhibits[0].fixed = true;
  }

  state = {
    levelIndex: -2,
    level,
    player: playerStart,
    ap: 4,
    keys: keys,
    done: false,
    log: [
      ...state.log,
      reason === "guard" ? "⚠️ 被巡逻员发现了！回到安全位置重试。" : "重试当前教学步骤。"
    ],
    history: []
  };

  tutorialState.active = true;
  tutorialState.currentStep = currentStep;
  tutorialState.hasWaited = hasWaited;

  const step = tutorialSteps[currentStep];
  tutorialStepEl.textContent = `步骤 ${step.id + 1}/${tutorialSteps.length}`;
  tutorialTitleEl.textContent = step.title;
  tutorialTextEl.textContent = step.text;

  if (tutorialState.errorTimeout) {
    clearTimeout(tutorialState.errorTimeout);
  }
  if (reason === "guard") {
    tutorialState.errorTimeout = setTimeout(() => {
      tutorialErrorEl.textContent = "";
      tutorialState.errorTimeout = null;
    }, 3000);
  } else {
    tutorialErrorEl.textContent = "";
    tutorialState.errorTimeout = null;
  }

  recordHistory("重试当前步骤");
  render();
}

function init() {
  renderLevelButtons();
  state = freshState(0);
  bindControls();
  bindReplayControls();
  tutorialBtn.addEventListener("click", () => {
    if (tutorialState.active) {
      exitTutorial();
    } else {
      startTutorial();
    }
  });
  if (dailyBtn) {
    dailyBtn.addEventListener("click", () => {
      loadDailyChallenge();
    });
  }
  recordHistory("开局");
  render();
  renderDailyInfo();
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
  tutorialState.active = false;
  tutorialHintEl.classList.add("hidden");
  tutorialBtn.classList.remove("active");
  recordHistory("开局");
  render();
}

function restartLevel() {
  if (tutorialState.active) {
    restartTutorialStep();
    return;
  }
  if (state.levelIndex === -1 && customLevelSource) {
    state = freshStateFromLevel(customLevelSource);
    resultEl.classList.add("hidden");
    recordHistory("开局");
    render();
    return;
  }
  if (state.levelIndex === -3 && customLevelSource) {
    state = freshStateFromLevel(customLevelSource);
    state.levelIndex = -3;
    resultEl.classList.add("hidden");
    recordHistory("开局");
    render();
    renderDailyInfo();
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

  if (tutorialState.active) {
    if (!isTutorialActionAllowed("move")) {
      showTutorialError("wrongAction");
      return;
    }
    const step = tutorialSteps[tutorialState.currentStep];
    if (step.id === 0) {
      if (dx !== 1 || dy !== 0) {
        showTutorialError("wrongDirection");
        return;
      }
    }
    if (step.id === 1) {
      if (dy === 1) {
        showTutorialError("wrongDirection");
        return;
      }
    }
  }

  const next = { x: state.player.x + dx, y: state.player.y + dy };
  if (!inside(next) || isWall(next)) return;

  const screen = screenAt(next);
  if (screen) {
    const pushDest = { x: next.x + dx, y: next.y + dy };
    if (!canPushScreenTo(pushDest)) {
      addLog("屏风无法推动。");
      render();
      return;
    }
    screen.x = pushDest.x;
    screen.y = pushDest.y;
    addLog("推开了一扇屏风。");
  }

  if (tutorialState.active && tutorialSteps[tutorialState.currentStep].id === 2) {
    const vision = visionSet();
    if (vision.has(pointKey(next))) {
      if (screen) {
        screen.x = next.x;
        screen.y = next.y;
      }
      showTutorialError("wrongDirection");
      return;
    }
  }

  let action = screen ? "推屏风并" + getDirectionName(dx, dy) : getDirectionName(dx, dy);
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
  activatePressurePlates();
  activateLights();
  if (seenByGuard()) {
    if (tutorialState.active) {
      showTutorialError("seenByGuard", true);
      restartTutorialStep("guard");
      return;
    }
    recordHistory(action);
    fail("巡逻员发现了你的手电反光。");
    return;
  }

  if (tutorialState.active) {
    checkTutorialStep();
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

  if (tutorialState.active) {
    if (!isTutorialActionAllowed("repair")) {
      showTutorialError("wrongAction");
      return;
    }
    const exhibit = adjacentExhibit();
    if (!exhibit) {
      showTutorialError("wrongAction");
      return;
    }
  }

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

  if (tutorialState.active) {
    checkTutorialStep();
  }

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

  if (tutorialState.active) {
    if (!isTutorialActionAllowed("wait")) {
      showTutorialError("wrongAction");
      return;
    }
    tutorialState.hasWaited = true;
  }

  state.ap = 4;
  state.visionReduced = false;
  state.level.guards.forEach((guard) => {
    guard.step = (guard.step + 1) % guard.path.length;
  });
  addLog("巡逻员换了一段路线。");
  if (seenByGuard()) {
    if (tutorialState.active) {
      showTutorialError("seenByGuard", true);
      restartTutorialStep("guard");
      return;
    }
    recordHistory("等待回合");
    fail("换班瞬间被巡逻员撞见。");
    return;
  }

  if (tutorialState.active) {
    checkTutorialStep();
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

  if (state.levelIndex === -3) {
    const dateKey = getDateKey();
    const steps = calculateSteps();
    const existing = getDailyRecord(dateKey);
    const newRecord = {
      completed: true,
      bestSteps: existing && existing.bestSteps ? Math.min(existing.bestSteps, steps) : steps,
      date: dateKey,
      completedAt: Date.now()
    };
    saveDailyRecord(dateKey, newRecord);
    renderDailyInfo();

    const bestSteps = newRecord.bestSteps;
    const isNewRecord = !existing || !existing.bestSteps || steps < existing.bestSteps;
    const recordMsg = isNewRecord ? `🏆 新纪录！步数：${steps}` : `本次步数：${steps}，最佳：${bestSteps}`;
    resultEl.innerHTML = `<h2>每日挑战完成！</h2><p>所有展品复位，并从指定出口离开。</p><p>${recordMsg}</p><button id="replayBtn" type="button" class="replay-trigger">查看本局回放</button>`;
    resultEl.classList.remove("hidden");
    addLog("警报没有响，展厅恢复安静。每日挑战完成！");
    recordHistory("通关成功");
    const replayBtn = document.getElementById("replayBtn");
    if (replayBtn) replayBtn.addEventListener("click", () => openReplay(true));
    render();
    return;
  }

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
  const m = getMechanisms();
  const screenSet = new Set(m.screens.map(s => pointKey(s)));
  const maxRange = state.visionReduced ? 1 : 2;
  state.level.guards.forEach((guard) => {
    const pos = guard.path[guard.step];
    set.add(pointKey(pos));
    const next = guard.path[(guard.step + 1) % guard.path.length];
    const dx = Math.sign(next.x - pos.x);
    const dy = Math.sign(next.y - pos.y);
    for (let i = 1; i <= maxRange; i += 1) {
      const point = { x: pos.x + dx * i, y: pos.y + dy * i };
      if (!inside(point) || isWall(point) || screenSet.has(pointKey(point))) break;
      set.add(pointKey(point));
    }
  });
  return set;
}

function visionSetForSnapshot(snapshot) {
  const set = new Set();
  const sm = snapshot.level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
  const screenSet = new Set(sm.screens.map(s => pointKey(s)));
  const maxRange = snapshot.visionReduced ? 1 : 2;
  snapshot.level.guards.forEach((guard) => {
    const pos = guard.path[guard.step];
    set.add(pointKey(pos));
    const next = guard.path[(guard.step + 1) % guard.path.length];
    const dx = Math.sign(next.x - pos.x);
    const dy = Math.sign(next.y - pos.y);
    for (let i = 1; i <= maxRange; i += 1) {
      const point = { x: pos.x + dx * i, y: pos.y + dy * i };
      if (!inside(point) || isWallForSnapshot(snapshot, point) || screenSet.has(pointKey(point))) break;
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

function getMechanisms() {
  return state.level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
}

function screenAt(point) {
  const m = getMechanisms();
  return m.screens.find(s => samePoint(s, point)) || null;
}

function pressurePlateAt(point) {
  const m = getMechanisms();
  return m.pressurePlates.find(p => samePoint(p, point)) || null;
}

function lightAt(point) {
  const m = getMechanisms();
  return m.lights.find(l => samePoint(l, point)) || null;
}

function isScreen(point) {
  return screenAt(point) !== null;
}

function canPushScreenTo(point) {
  if (!inside(point)) return false;
  if (isWall(point)) return false;
  const d = doorAt(point);
  if (d && !d.open) return false;
  if (isScreen(point)) return false;
  const ex = state.level.exhibits.find(e => samePoint(e, point));
  if (ex) return false;
  return true;
}

function activatePressurePlates() {
  const m = getMechanisms();
  m.pressurePlates.forEach(plate => {
    const playerOn = samePoint(state.player, plate);
    if (playerOn && !plate.triggered) {
      plate.triggered = true;
      plate.targetDoors.forEach(td => {
        const door = state.level.doors.find(d => samePoint(d, td));
        if (door) door.open = !door.open;
      });
      addLog("踩下压力板，远处的门发生了变化。");
    } else if (!playerOn && plate.triggered) {
      plate.triggered = false;
    }
  });
}

function activateLights() {
  const m = getMechanisms();
  m.lights.forEach(light => {
    if (light.active) return;
    if (samePoint(state.player, light)) {
      light.active = true;
      state.visionReduced = true;
      addLog("按下了熄灯开关，巡逻员视野暂时缩短。");
    }
  });
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
  if (dailyBtn) {
    dailyBtn.classList.toggle("active", state.levelIndex === -3);
  }
  waitBtn.disabled = state.done;
  repairBtn.disabled = state.done;
  renderBoard();
  renderLog();
}

function renderBoard() {
  const guards = state.level.guards.map((guard) => guard.path[guard.step]);
  const vision = visionSet();
  boardEl.innerHTML = "";

  let tutorialHighlights = [];
  if (tutorialState.active) {
    const step = tutorialSteps[tutorialState.currentStep];
    if (step.highlight) {
      tutorialHighlights = step.highlight;
    }
  }

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
      const m = getMechanisms();
      const plate = m.pressurePlates.find(p => samePoint(p, point));
      if (plate) {
        tile.classList.add("pressure-plate");
        if (plate.triggered) tile.classList.add("triggered");
        label.textContent = plate.triggered ? "压板✓" : "压板";
      }
      const scr = m.screens.find(s => samePoint(s, point));
      if (scr) {
        tile.classList.add("screen");
        label.textContent = "屏风";
      }
      const light = m.lights.find(l => samePoint(l, point));
      if (light) {
        tile.classList.add("light-switch");
        if (light.active) tile.classList.add("active");
        label.textContent = light.active ? "熄灯✓" : "熄灯";
      }
      if (samePoint(state.level.exit, point)) {
        tile.classList.add("exit");
        label.textContent = "出口";
      }
      if (vision.has(pointKey(point))) tile.classList.add("vision");
      if (guards.some((guard) => samePoint(guard, point))) tile.classList.add("guard");
      if (samePoint(state.player, point)) tile.classList.add("player");

      if (tutorialHighlights.some(p => samePoint(p, point))) {
        tile.classList.add("tutorial-highlight");
      }

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
      const sm = snapshot.level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
      const plate = sm.pressurePlates.find(p => samePoint(p, point));
      if (plate) {
        tile.classList.add("pressure-plate");
        if (plate.triggered) tile.classList.add("triggered");
        label.textContent = plate.triggered ? "压板✓" : "压板";
      }
      const scr = sm.screens.find(s => samePoint(s, point));
      if (scr) {
        tile.classList.add("screen");
        label.textContent = "屏风";
      }
      const light = sm.lights.find(l => samePoint(l, point));
      if (light) {
        tile.classList.add("light-switch");
        if (light.active) tile.classList.add("active");
        label.textContent = light.active ? "熄灯✓" : "熄灯";
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

// ============== 每日挑战系统 ==============

const BOARD_W = 8;
const BOARD_H = 7;
const DAILY_KEY_PREFIX = "museum_daily_challenge_";

function getDateKey(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createDailyRNG(dateKey) {
  const seed = hashString(dateKey);
  return mulberry32(seed);
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle(rng, arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function bfsReachable(walls, doors, start, considerDoorsClosed = true) {
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
}

function bfsPath(walls, start, end, doorsOpen = []) {
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
}

function getGuardPositionsAtStep(guards, step) {
  return guards.map((g) => g.path[step % g.path.length]);
}

function getGuardVisionAtStep(guards, step, walls) {
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
}

function gcd(a, b) {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function getGuardCycleLength(guards) {
  if (guards.length === 0) return 1;
  return guards.reduce((acc, g) => lcm(acc, g.path.length), 1);
}

function exhibitMask(exhibits, fixedFlags) {
  let mask = 0;
  for (let i = 0; i < exhibits.length; i++) {
    if (fixedFlags[i]) mask |= 1 << i;
  }
  return mask;
}

function allExhibitsFixed(mask, numExhibits) {
  return mask === (1 << numExhibits) - 1;
}

function isAdjacent(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1;
}

function canPassWallDoor(pos, walls, doors, keys, keysOnGround, doorsOpen) {
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
}

function verifyLevelSolvable(level) {
  const { walls, doors, keys: keyItems, exhibits, guards, player: startPos, exit } = level;
  const numExhibits = exhibits.length;
  const numDoors = doors.length;
  const cycleLen = getGuardCycleLength(guards);

  const doorsOpenInit = new Array(numDoors).fill(false);
  const keysTakenInit = new Array(keyItems.length).fill(false);
  const fixedInit = new Array(numExhibits).fill(false);

  function stateKey(pos, keysCount, exhibitBitmask, step) {
    return `${pos.x},${pos.y}|${keysCount}|${exhibitBitmask}|${step % cycleLen}`;
  }

  const visited = new Set();
  const initialKey = stateKey(startPos, 0, 0, 0);
  visited.add(initialKey);

  const queue = [
    {
      pos: { ...startPos },
      keys: 0,
      keysTaken: [...keysTakenInit],
      doorsOpen: [...doorsOpenInit],
      fixed: [...fixedInit],
      step: 0,
      ap: 4
    }
  ];

  let iterations = 0;
  const maxIterations = 50000;

  while (queue.length > 0 && iterations < maxIterations) {
    iterations++;
    const cur = queue.shift();

    const mask = exhibitMask(exhibits, cur.fixed);
    if (allExhibitsFixed(mask, numExhibits) && cur.pos.x === exit.x && cur.pos.y === exit.y) {
      return true;
    }

    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    for (const [dx, dy] of dirs) {
      const nx = cur.pos.x + dx;
      const ny = cur.pos.y + dy;
      if (nx < 0 || nx >= BOARD_W || ny < 0 || ny >= BOARD_H) continue;

      const newPos = { x: nx, y: ny };
      const pk = pointKey(newPos);
      if (walls.includes(pk)) continue;

      let newKeys = cur.keys;
      const newDoorsOpen = [...cur.doorsOpen];
      const newKeysTaken = [...cur.keysTaken];

      const doorIdx = doors.findIndex((d) => d.x === nx && d.y === ny);
      if (doorIdx >= 0 && !newDoorsOpen[doorIdx]) {
        if (newKeys <= 0) continue;
        newKeys -= 1;
        newDoorsOpen[doorIdx] = true;
      }

      const vision = getGuardVisionAtStep(guards, cur.step, walls);
      if (vision.has(pk)) continue;

      for (let i = 0; i < keyItems.length; i++) {
        if (!newKeysTaken[i] && keyItems[i].x === nx && keyItems[i].y === ny) {
          newKeys += 1;
          newKeysTaken[i] = true;
        }
      }

      const newFixed = [...cur.fixed];
      const newMask = exhibitMask(exhibits, newFixed);
      const sk = stateKey(newPos, newKeys, newMask, cur.step);

      if (!visited.has(sk)) {
        visited.add(sk);
        const newAp = cur.ap - 1;

        if (newAp <= 0) {
          const nextStep = (cur.step + 1) % cycleLen;
          const nextVision = getGuardVisionAtStep(guards, nextStep, walls);
          if (!nextVision.has(pk)) {
            const nextSk = stateKey(newPos, newKeys, newMask, nextStep);
            if (!visited.has(nextSk)) {
              visited.add(nextSk);
              queue.push({
                pos: newPos,
                keys: newKeys,
                keysTaken: newKeysTaken,
                doorsOpen: newDoorsOpen,
                fixed: newFixed,
                step: nextStep,
                ap: 4
              });
            }
          }
        } else {
          queue.push({
            pos: newPos,
            keys: newKeys,
            keysTaken: newKeysTaken,
            doorsOpen: newDoorsOpen,
            fixed: newFixed,
            step: cur.step,
            ap: newAp
          });
        }
      }
    }

    for (let i = 0; i < numExhibits; i++) {
      if (!cur.fixed[i] && isAdjacent(cur.pos, exhibits[i])) {
        const newFixed = [...cur.fixed];
        newFixed[i] = true;
        const newMask = exhibitMask(exhibits, newFixed);
        const sk = stateKey(cur.pos, cur.keys, newMask, cur.step);

        if (!visited.has(sk)) {
          visited.add(sk);
          const newAp = cur.ap - 1;

          if (newAp <= 0) {
            const nextStep = (cur.step + 1) % cycleLen;
            const nextVision = getGuardVisionAtStep(guards, nextStep, walls);
            const pk = pointKey(cur.pos);
            if (!nextVision.has(pk)) {
              const nextSk = stateKey(cur.pos, cur.keys, newMask, nextStep);
              if (!visited.has(nextSk)) {
                visited.add(nextSk);
                queue.push({
                  pos: { ...cur.pos },
                  keys: cur.keys,
                  keysTaken: [...cur.keysTaken],
                  doorsOpen: [...cur.doorsOpen],
                  fixed: newFixed,
                  step: nextStep,
                  ap: 4
                });
              }
            }
          } else {
            queue.push({
              pos: { ...cur.pos },
              keys: cur.keys,
              keysTaken: [...cur.keysTaken],
              doorsOpen: [...cur.doorsOpen],
              fixed: newFixed,
              step: cur.step,
              ap: newAp
            });
          }
        }
      }
    }

    {
      const nextStep = (cur.step + 1) % cycleLen;
      const nextVision = getGuardVisionAtStep(guards, nextStep, walls);
      const pk = pointKey(cur.pos);
      if (!nextVision.has(pk)) {
        const mask = exhibitMask(exhibits, cur.fixed);
        const nextSk = stateKey(cur.pos, cur.keys, mask, nextStep);
        if (!visited.has(nextSk)) {
          visited.add(nextSk);
          queue.push({
            pos: { ...cur.pos },
            keys: cur.keys,
            keysTaken: [...cur.keysTaken],
            doorsOpen: [...cur.doorsOpen],
            fixed: [...cur.fixed],
            step: nextStep,
            ap: 4
          });
        }
      }
    }
  }

  return false;
}

function generateDailyLevel(dateKey) {
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
}

function fallbackLevel(dateKey) {
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
}

function tryGenerateLevel(rng, dateKey) {
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
}

function generateGuards(rng, walls, doors, player, exit, exhibits, mainPath, reserved) {
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
}

function getDailyRecord(dateKey) {
  try {
    const raw = localStorage.getItem(DAILY_KEY_PREFIX + dateKey);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveDailyRecord(dateKey, record) {
  try {
    localStorage.setItem(DAILY_KEY_PREFIX + dateKey, JSON.stringify(record));
  } catch (e) {}
}

function loadDailyChallenge() {
  const dateKey = getDateKey();
  const level = generateDailyLevel(dateKey);
  customLevelSource = JSON.parse(JSON.stringify(level));
  state = freshStateFromLevel(level);
  state.levelIndex = -3;
  resultEl.classList.add("hidden");
  tutorialState.active = false;
  tutorialHintEl.classList.add("hidden");
  tutorialBtn.classList.remove("active");
  [...levelButtonsEl.children].forEach((button) => {
    button.classList.remove("active");
  });
  dailyBtn.classList.add("active");
  recordHistory("开局");
  render();
  renderDailyInfo();
}

function renderDailyInfo() {
  const dateKey = getDateKey();
  const record = getDailyRecord(dateKey);
  const infoEl = document.getElementById("dailyInfo");
  if (!infoEl) return;

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  let statusHtml = "";
  if (record) {
    if (record.completed) {
      statusHtml = `
        <span class="daily-status completed">✅ 已完成</span>
        <span>最佳步数<strong>${record.bestSteps}</strong></span>
      `;
    } else {
      statusHtml = `
        <span class="daily-status pending">⏳ 挑战中</span>
        <span>上次步数<strong>${record.bestSteps || "-"}</strong></span>
      `;
    }
  } else {
    statusHtml = `<span class="daily-status new">🎯 新挑战</span>`;
  }

  infoEl.innerHTML = `
    <div class="daily-date">挑战日期：${dateStr}</div>
    <div class="daily-status-line">${statusHtml}</div>
  `;
}

function calculateSteps() {
  let steps = 0;
  for (const snap of state.history) {
    const a = snap.action || "";
    if (a.includes("移动") || a.includes("修复展柜") || a.includes("等待回合") || a.includes("开门")) {
      steps++;
    }
  }
  return Math.max(1, steps);
}

init();
