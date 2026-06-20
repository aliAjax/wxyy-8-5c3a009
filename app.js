const boardEl = document.getElementById("board");
const logEl = document.getElementById("log");
const resultEl = document.getElementById("result");
const levelButtonsEl = document.getElementById("levelButtons");
const levelNameEl = document.getElementById("levelName");
const apEl = document.getElementById("ap");
const keysEl = document.getElementById("keys");
const fixedEl = document.getElementById("fixed");
const alertLevelEl = document.getElementById("alertLevel");

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

function getCameraDirectionLabel(direction) {
  switch (direction) {
    case CAMERA_DIRECTION.UP: return "↑";
    case CAMERA_DIRECTION.DOWN: return "↓";
    case CAMERA_DIRECTION.LEFT: return "←";
    case CAMERA_DIRECTION.RIGHT: return "→";
    default: return "→";
  }
}

const ALERT_LEVEL = {
  CALM: { name: "平静", value: 0, color: "#4f7f6a" },
  CURIOUS: { name: "警觉", value: 1, color: "#d7bd77" },
  SUSPICIOUS: { name: "怀疑", value: 2, color: "#e67e22" },
  ALERT: { name: "警戒", value: 3, color: "#d14c3f" }
};
const waitBtn = document.getElementById("waitBtn");
const repairBtn = document.getElementById("repairBtn");
const hintBtn = document.getElementById("hintBtn");
const restartBtn = document.getElementById("restartBtn");
const undoBtn = document.getElementById("undoBtn");
const tutorialBtn = document.getElementById("tutorialBtn");
const dailyBtn = document.getElementById("dailyBtn");
const achievementBtn = document.getElementById("achievementBtn");
const achievementEl = document.getElementById("achievement");
const achievementCloseBtn = document.getElementById("achievementCloseBtn");
const achievementResetBtn = document.getElementById("achievementResetBtn");
const achievementLevelStatsEl = document.getElementById("achievementLevelStats");
const achievementOverallEl = document.getElementById("achievementOverall");
const achievementListEl = document.getElementById("achievementList");
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
const replaySpeedSlowBtn = document.getElementById("replaySpeedSlow");
const replaySpeedNormalBtn = document.getElementById("replaySpeedNormal");
const replaySpeedFastBtn = document.getElementById("replaySpeedFast");
const replayJumpFixBtn = document.getElementById("replayJumpFix");
const replayJumpDoorBtn = document.getElementById("replayJumpDoor");
const replayJumpKeyBtn = document.getElementById("replayJumpKey");
const replayJumpSeenBtn = document.getElementById("replayJumpSeen");
const replayJumpWinBtn = document.getElementById("replayJumpWin");

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
  },
  {
    name: "七",
    walls: ["3,1", "3,2", "3,5", "3,6", "6,0", "6,1", "6,5", "6,6"],
    doors: [{ x: 3, y: 3, open: false }],
    keys: [{ x: 0, y: 0 }],
    exhibits: [{ x: 7, y: 3, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [
      { path: [{ x: 4, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 4, y: 1 }], step: 0, behavior: "fixed", hearingRange: 3 },
      { path: [{ x: 4, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }], step: 0, behavior: "investigate", hearingRange: 4 }
    ],
    exit: { x: 7, y: 0 },
    mechanisms: {
      pressurePlates: [{ x: 1, y: 3, targetDoors: [{ x: 3, y: 3 }], triggered: false }],
      screens: [{ x: 4, y: 3 }],
      lights: [{ x: 1, y: 0, active: false }],
      cameras: [
        { x: 2, y: 3, direction: "right", disabled: false },
        { x: 5, y: 2, direction: "left", disabled: false }
      ]
    }
  }
];

const chapters = [
  {
    id: 0,
    name: "初入展厅",
    description: "初次夜巡，学习基本潜行与修复技巧",
    levelIndices: [0, 1]
  },
  {
    id: 1,
    name: "深入探索",
    description: "更复杂的巡逻路线与机关谜题",
    levelIndices: [2, 3]
  },
  {
    id: 2,
    name: "行为编排",
    description: "遭遇拥有复杂行为模式的巡逻员",
    levelIndices: [4, 5]
  },
  {
    id: 3,
    name: "安保警戒",
    description: "遭遇安保摄像头，学会利用熄灯开关与屏风",
    levelIndices: [6]
  }
];

const levelDescriptions = [
  { brief: "简单展厅，一个展柜需要修复，小心巡逻员视线", optimalActions: 12 },
  { brief: "需要找到钥匙开门，注意往返巡逻的守卫", optimalActions: 15 },
  { brief: "两个展柜与会调查声响的巡逻员", optimalActions: 24 },
  { brief: "利用压力板开门，小心会追踪开门痕迹的守卫", optimalActions: 18 },
  { brief: "两个展柜、多个门锁，巡逻员会调查声响并追踪痕迹", optimalActions: 32 },
  { brief: "三个巡逻员的终极挑战：往返巡逻、听觉调查、痕迹追踪", optimalActions: 38 },
  { brief: "安保摄像头守护展柜，利用熄灯开关和屏风绕过监视", optimalActions: 28 }
];

const CHAPTER_STAR_KEY = "museum_chapter_stars";

function loadChapterStars() {
  try {
    const raw = localStorage.getItem(CHAPTER_STAR_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (!data.levels) data.levels = {};
      return data;
    }
  } catch (e) {}
  return { levels: {}, version: 2 };
}

function saveChapterStars(data) {
  try {
    data.version = 2;
    localStorage.setItem(CHAPTER_STAR_KEY, JSON.stringify(data));
  } catch (e) {}
}

function getLevelStarData(levelIndex) {
  const data = loadChapterStars();
  const key = String(levelIndex);
  const levelData = data.levels[key];
  if (!levelData) {
    return { bestStars: 0, completed: false, completedObjectives: [] };
  }
  return {
    bestStars: levelData.bestStars || 0,
    completed: levelData.completed || false,
    completedObjectives: levelData.completedObjectives || []
  };
}

function updateLevelStarData(levelIndex, stars, completedObjectives) {
  const data = loadChapterStars();
  const key = String(levelIndex);
  const existing = data.levels[key] || { bestStars: 0, completed: false, completedObjectives: [] };

  if (!existing.completedObjectives) {
    existing.completedObjectives = [];
  }

  if (stars > existing.bestStars) {
    existing.bestStars = stars;
  }
  existing.completed = true;

  if (completedObjectives && completedObjectives.length > 0) {
    const currentSet = new Set(existing.completedObjectives);
    completedObjectives.forEach(obj => currentSet.add(obj));
    existing.completedObjectives = Array.from(currentSet);
  }

  data.levels[key] = existing;
  saveChapterStars(data);
}

function evaluateObjectives(levelIndex) {
  const objectives = getLevelObjectives(levelIndex);
  if (objectives.length === 0) return [];

  const completed = [];
  const desc = levelDescriptions[levelIndex];

  if (objectives.includes(OBJECTIVE_TYPES.NO_HINTS)) {
    if (gameplayMetrics.objectiveHintsUsed === 0) {
      completed.push(OBJECTIVE_TYPES.NO_HINTS);
    }
  }

  if (objectives.includes(OBJECTIVE_TYPES.WITHIN_STEPS)) {
    if (desc && gameplayMetrics.currentActions <= desc.optimalActions) {
      completed.push(OBJECTIVE_TYPES.WITHIN_STEPS);
    }
  }

  if (objectives.includes(OBJECTIVE_TYPES.NO_ALERT)) {
    if (gameplayMetrics.objectiveMaxAlertLevel === 0) {
      completed.push(OBJECTIVE_TYPES.NO_ALERT);
    }
  }

  if (objectives.includes(OBJECTIVE_TYPES.ALL_KEYS)) {
    if (gameplayMetrics.totalKeysInLevel > 0 && gameplayMetrics.objectiveKeysCollected >= gameplayMetrics.totalKeysInLevel) {
      completed.push(OBJECTIVE_TYPES.ALL_KEYS);
    }
  }

  return completed;
}

function calculateStars(levelIndex, currentActions, hasRetried, hintsUsedTotal) {
  const desc = levelDescriptions[levelIndex];
  if (!desc) return 1;
  if (!hasRetried && hintsUsedTotal === 0 && currentActions <= Math.ceil(desc.optimalActions * 1.2)) return 3;
  if (!hasRetried && hintsUsedTotal <= 1) return 2;
  if (hasRetried && hintsUsedTotal === 0 && currentActions <= Math.ceil(desc.optimalActions * 1.3)) return 2;
  return 1;
}

function isChapterUnlocked(chapterId) {
  if (chapterId === 0) return true;
  const prevChapter = chapters[chapterId - 1];
  if (!prevChapter) return false;
  const data = loadChapterStars();
  return prevChapter.levelIndices.every(idx => {
    const ls = data.levels[String(idx)];
    return ls && ls.completed;
  });
}

function isLevelUnlocked(levelIndex) {
  for (const ch of chapters) {
    const pos = ch.levelIndices.indexOf(levelIndex);
    if (pos === -1) continue;
    if (!isChapterUnlocked(ch.id)) return false;
    if (pos === 0) return true;
    const prevLevelIndex = ch.levelIndices[pos - 1];
    const data = loadChapterStars();
    const prevData = data.levels[String(prevLevelIndex)];
    return prevData && prevData.completed;
  }
  return true;
}

function getNextLevelIndex(currentIndex) {
  for (const ch of chapters) {
    const pos = ch.levelIndices.indexOf(currentIndex);
    if (pos === -1) continue;
    if (pos < ch.levelIndices.length - 1) return ch.levelIndices[pos + 1];
    const nextChapter = chapters[ch.id + 1];
    if (nextChapter && isChapterUnlocked(nextChapter.id)) return nextChapter.levelIndices[0];
    return -1;
  }
  if (currentIndex + 1 < levels.length) return currentIndex + 1;
  return -1;
}

function renderStars(count) {
  let s = "";
  for (let i = 0; i < 3; i++) {
    s += i < count ? "★" : "☆";
  }
  return s;
}

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
let hintState = {
  active: false,
  path: [],
  actionLabels: []
};

let replayState = {
  history: [],
  currentStep: 0,
  isPlaying: false,
  playInterval: null,
  playSpeed: 1000,
  speedLevel: "normal",
  keySteps: {
    fix: -1,
    door: -1,
    key: -1,
    seen: -1,
    win: -1
  }
};

const REPLAY_SPEEDS = {
  slow: 2000,
  normal: 1000,
  fast: 350
};

const OBJECTIVE_TYPES = {
  NO_HINTS: "no_hints",
  WITHIN_STEPS: "within_steps",
  NO_ALERT: "no_alert",
  ALL_KEYS: "all_keys"
};

const OBJECTIVE_DEFS = {
  [OBJECTIVE_TYPES.NO_HINTS]: {
    name: "不使用提示",
    icon: "💡",
    desc: "全程不使用任何提示"
  },
  [OBJECTIVE_TYPES.WITHIN_STEPS]: {
    name: "推荐步数内",
    icon: "👣",
    desc: "在推荐步数内完成关卡"
  },
  [OBJECTIVE_TYPES.NO_ALERT]: {
    name: "不触发警戒",
    icon: "🤫",
    desc: "全程警觉程度保持平静"
  },
  [OBJECTIVE_TYPES.ALL_KEYS]: {
    name: "收集所有钥匙",
    icon: "🔑",
    desc: "拾取关卡中所有钥匙"
  }
};

const levelObjectives = [
  {
    objectives: [OBJECTIVE_TYPES.NO_HINTS, OBJECTIVE_TYPES.WITHIN_STEPS]
  },
  {
    objectives: [OBJECTIVE_TYPES.NO_HINTS, OBJECTIVE_TYPES.NO_ALERT, OBJECTIVE_TYPES.WITHIN_STEPS]
  },
  {
    objectives: [OBJECTIVE_TYPES.NO_HINTS, OBJECTIVE_TYPES.NO_ALERT, OBJECTIVE_TYPES.ALL_KEYS]
  },
  {
    objectives: [OBJECTIVE_TYPES.NO_HINTS, OBJECTIVE_TYPES.WITHIN_STEPS, OBJECTIVE_TYPES.NO_ALERT]
  },
  {
    objectives: [OBJECTIVE_TYPES.NO_HINTS, OBJECTIVE_TYPES.WITHIN_STEPS, OBJECTIVE_TYPES.ALL_KEYS]
  },
  {
    objectives: [OBJECTIVE_TYPES.NO_HINTS, OBJECTIVE_TYPES.WITHIN_STEPS, OBJECTIVE_TYPES.NO_ALERT, OBJECTIVE_TYPES.ALL_KEYS]
  }
];

function getLevelObjectives(levelIndex) {
  const config = levelObjectives[levelIndex];
  if (!config || !config.objectives) return [];
  return config.objectives;
}

function hasLevelObjectives(levelIndex) {
  return getLevelObjectives(levelIndex).length > 0;
}

let gameplayMetrics = {
  hasRetried: false,
  hintsUsedTotal: 0,
  currentActions: 0,
  maxAlertLevel: 0,
  objectiveHintsUsed: 0,
  objectiveMaxAlertLevel: 0,
  objectiveKeysCollected: 0,
  totalKeysInLevel: 0
};

function resetGameplayMetrics() {
  gameplayMetrics.hasRetried = false;
  gameplayMetrics.hintsUsedTotal = 0;
  gameplayMetrics.currentActions = 0;
  gameplayMetrics.maxAlertLevel = 0;
  gameplayMetrics.objectiveHintsUsed = 0;
  gameplayMetrics.objectiveMaxAlertLevel = 0;
  gameplayMetrics.objectiveKeysCollected = 0;
  gameplayMetrics.totalKeysInLevel = 0;
}

function initObjectiveTracking() {
  if (state && state.level && state.level.keys) {
    gameplayMetrics.totalKeysInLevel = state.level.keys.length;
  }
  gameplayMetrics.maxAlertLevel = state ? state.alertLevel || 0 : 0;
  gameplayMetrics.objectiveMaxAlertLevel = state ? state.alertLevel || 0 : 0;
  gameplayMetrics.objectiveHintsUsed = 0;
  gameplayMetrics.objectiveKeysCollected = 0;
}

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
    pendingVisionReduction: state.pendingVisionReduction,
    cameraShutdownTurns: state.cameraShutdownTurns || 0,
    alertLevel: state.alertLevel,
    alertDecayTimer: state.alertDecayTimer || 0,
    soundSources: state.soundSources.map(s => ({ ...s, position: { ...s.position } })),
    level: {
      walls: [...state.level.walls],
      doors: state.level.doors.map(d => ({ ...d })),
      keys: state.level.keys.map(k => ({ ...k })),
      exhibits: state.level.exhibits.map(e => ({ ...e })),
      guards: state.level.guards.map(g => ({
        path: g.path.map(p => ({ ...p })),
        step: g.step,
        pos: { ...g.pos },
        behavior: g.behavior,
        direction: g.direction,
        originalPath: g.originalPath.map(p => ({ ...p })),
        originalStep: g.originalStep,
        state: g.state,
        investigateTarget: g.investigateTarget ? { ...g.investigateTarget } : null,
        investigateTimer: g.investigateTimer,
        traceTarget: g.traceTarget ? { ...g.traceTarget } : null,
        tracePath: g.tracePath.map(p => ({ ...p })),
        alertLevel: g.alertLevel,
        hearingRange: g.hearingRange,
        id: g.id
      })),
      openedDoors: state.level.openedDoors ? state.level.openedDoors.map(d => ({ ...d })) : [],
      exit: state.level.exit ? { ...state.level.exit } : null,
      player: state.level.player ? { ...state.level.player } : null,
      name: state.level.name,
      mechanisms: m ? {
        pressurePlates: m.pressurePlates.map(p => ({ ...p, targetDoors: p.targetDoors.map(td => ({ ...td })) })),
        screens: m.screens.map(s => ({ ...s })),
        lights: m.lights.map(l => ({ ...l })),
        cameras: m.cameras ? m.cameras.map(c => ({ ...c })) : []
      } : { pressurePlates: [], screens: [], lights: [], cameras: [] }
    },
    log: [...state.log],
    gameplayMetrics: { ...gameplayMetrics },
    hintState: {
      active: hintState.active,
      path: hintState.path.map(p => ({ ...p })),
      actionLabels: [...hintState.actionLabels]
    }
  };
}

function recordHistory(action) {
  state.history.push(snapshotState(action));
}

function syncCurrentHistorySnapshot() {
  if (!state || !state.history || state.history.length === 0) return;
  const snapshot = state.history[state.history.length - 1];
  snapshot.log = [...state.log];
  snapshot.hintState = {
    active: hintState.active,
    path: hintState.path.map(p => ({ ...p })),
    actionLabels: [...hintState.actionLabels]
  };
  snapshot.gameplayMetrics = { ...gameplayMetrics };
}

function canUndo() {
  if (!state || !state.history || state.history.length <= 1) return false;
  if (state.done) return false;
  return true;
}

function restoreStateFromSnapshot(snapshot) {
  state.player = { ...snapshot.player };
  state.ap = snapshot.ap;
  state.keys = snapshot.keys;
  state.done = snapshot.done;
  state.visionReduced = snapshot.visionReduced;
  state.pendingVisionReduction = snapshot.pendingVisionReduction;
  state.cameraShutdownTurns = snapshot.cameraShutdownTurns || 0;
  state.alertLevel = snapshot.alertLevel;
  state.alertDecayTimer = snapshot.alertDecayTimer || 0;
  state.soundSources = snapshot.soundSources.map(s => ({ ...s, position: { ...s.position } }));

  state.level.walls = [...snapshot.level.walls];
  state.level.doors = snapshot.level.doors.map(d => ({ ...d }));
  state.level.keys = snapshot.level.keys.map(k => ({ ...k }));
  state.level.exhibits = snapshot.level.exhibits.map(e => ({ ...e }));
  state.level.guards = snapshot.level.guards.map(g => ({
    path: g.path.map(p => ({ ...p })),
    step: g.step,
    pos: { ...g.pos },
    behavior: g.behavior,
    direction: g.direction,
    originalPath: g.originalPath.map(p => ({ ...p })),
    originalStep: g.originalStep,
    state: g.state,
    investigateTarget: g.investigateTarget ? { ...g.investigateTarget } : null,
    investigateTimer: g.investigateTimer,
    traceTarget: g.traceTarget ? { ...g.traceTarget } : null,
    tracePath: g.tracePath.map(p => ({ ...p })),
    alertLevel: g.alertLevel,
    hearingRange: g.hearingRange,
    id: g.id
  }));
  state.level.openedDoors = snapshot.level.openedDoors ? snapshot.level.openedDoors.map(d => ({ ...d })) : [];
  state.level.exit = snapshot.level.exit ? { ...snapshot.level.exit } : null;
  state.level.player = snapshot.level.player ? { ...snapshot.level.player } : null;
  state.level.name = snapshot.level.name;

  const sm = snapshot.level.mechanisms;
  const tm = state.level.mechanisms;
  if (sm && tm) {
    tm.pressurePlates = sm.pressurePlates.map(p => ({ ...p, targetDoors: p.targetDoors.map(td => ({ ...td })) }));
    tm.screens = sm.screens.map(s => ({ ...s }));
    tm.lights = sm.lights.map(l => ({ ...l }));
    tm.cameras = sm.cameras ? sm.cameras.map(c => ({ ...c })) : [];
  }

  state.log = [...snapshot.log];

  if (snapshot.gameplayMetrics) {
    Object.assign(gameplayMetrics, snapshot.gameplayMetrics);
  }

  if (snapshot.hintState) {
    hintState.active = snapshot.hintState.active;
    hintState.path = snapshot.hintState.path.map(p => ({ ...p }));
    hintState.actionLabels = [...snapshot.hintState.actionLabels];
  } else {
    hintState.active = false;
    hintState.path = [];
    hintState.actionLabels = [];
  }
}

function undo() {
  if (!canUndo()) return;

  const undoneSnapshot = state.history.pop();

  const snapshot = state.history[state.history.length - 1];
  const undoAction = undoneSnapshot.action;
  restoreStateFromSnapshot(snapshot);

  state.log.push(`↶ 撤销了"${undoAction}"操作`);
  state.log = state.log.slice(-28);

  syncCurrentHistorySnapshot();

  render();
}

function freshState(index) {
  const level = cloneLevel(index);
  level.mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  level.mechanisms.pressurePlates = level.mechanisms.pressurePlates.map((p) => ({ ...p, triggered: false }));
  level.mechanisms.screens = level.mechanisms.screens.map((s) => ({ ...s }));
  level.mechanisms.lights = level.mechanisms.lights.map((l) => ({ ...l, active: false }));
  level.mechanisms.cameras = level.mechanisms.cameras ? level.mechanisms.cameras.map((c) => ({ ...c, disabled: false })) : [];
  level.guards = initializeGuards(level.guards);
  level.openedDoors = [];
  return {
    levelIndex: index,
    level,
    player: { ...level.player },
    ap: 4,
    keys: 0,
    done: false,
    visionReduced: false,
    pendingVisionReduction: false,
    cameraShutdownTurns: 0,
    alertLevel: 0,
    alertDecayTimer: 0,
    soundSources: [],
    log: [`第${level.name}展厅夜巡开始，避开视线完成修复。`],
    history: []
  };
}

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

function freshStateFromLevel(levelData) {
  const level = JSON.parse(JSON.stringify(levelData));
  level.keys = level.keys.map((k) => ({ ...k, taken: false }));
  level.exhibits = level.exhibits.map((e) => ({ ...e, fixed: false }));
  level.doors = level.doors.map((d) => ({ ...d, open: false }));
  level.guards = initializeGuards(level.guards || []);
  level.mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  level.mechanisms.pressurePlates = level.mechanisms.pressurePlates.map((p) => ({ ...p, triggered: false }));
  level.mechanisms.screens = level.mechanisms.screens.map((s) => ({ ...s }));
  level.mechanisms.lights = level.mechanisms.lights.map((l) => ({ ...l, active: false }));
  level.mechanisms.cameras = level.mechanisms.cameras ? level.mechanisms.cameras.map((c) => ({ ...c, disabled: false })) : [];
  level.openedDoors = [];
  return {
    levelIndex: -1,
    level,
    player: { ...level.player },
    ap: 4,
    keys: 0,
    done: false,
    visionReduced: false,
    pendingVisionReduction: false,
    cameraShutdownTurns: 0,
    alertLevel: 0,
    alertDecayTimer: 0,
    soundSources: [],
    log: [`${level.name}关卡夜巡开始，避开视线完成修复。`],
    history: []
  };
}

function loadCustomLevel(levelData) {
  customLevelSource = JSON.parse(JSON.stringify(levelData));
  state = freshStateFromLevel(levelData);
  resultEl.classList.add("hidden");
  resultEl.classList.remove("daily-result-style");
  resetGameplayMetrics();
  tutorialState.active = false;
  tutorialHintEl.classList.add("hidden");
  [...levelButtonsEl.children].forEach((button) => {
    button.classList.remove("active");
  });
  toggleBackToEditorBtn(true);
  render();
}

function toggleBackToEditorBtn(show) {
  const backToEditorBtn = document.getElementById("backToEditorBtn");
  if (backToEditorBtn) {
    if (show) {
      backToEditorBtn.classList.remove("hidden");
    } else {
      backToEditorBtn.classList.add("hidden");
    }
  }
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
  level.guards = initializeGuards(level.guards || []);
  level.openedDoors = [];
  state = {
    levelIndex: -2,
    level,
    player: { ...level.player },
    ap: 4,
    keys: 0,
    done: false,
    visionReduced: false,
    pendingVisionReduction: false,
    cameraShutdownTurns: 0,
    alertLevel: 0,
    alertDecayTimer: 0,
    soundSources: [],
    log: ["欢迎来到博物馆！让我们学习如何成为一名优秀的夜间修复师。"],
    history: []
  };
  tutorialState.active = true;
  tutorialState.currentStep = 0;
  tutorialState.hasWaited = false;
  tutorialState.wrongAttempts = 0;
  customLevelSource = null;
  toggleBackToEditorBtn(false);
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

  level.guards = initializeGuards(level.guards || []);
  level.openedDoors = [];
  state = {
    levelIndex: -2,
    level,
    player: playerStart,
    ap: 4,
    keys: keys,
    done: false,
    visionReduced: false,
    pendingVisionReduction: false,
    cameraShutdownTurns: 0,
    alertLevel: 0,
    alertDecayTimer: 0,
    soundSources: [],
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

const chapterPanelEl = document.getElementById("chapterPanel");
const chapterContentEl = document.getElementById("chapterContent");
const chapterBtn = document.getElementById("chapterBtn");
const chapterCloseBtn = document.getElementById("chapterCloseBtn");

function renderChapterView() {
  if (chapterPanelEl.classList.contains("hidden")) return;
  chapterContentEl.innerHTML = "";

  chapters.forEach(ch => {
    const unlocked = isChapterUnlocked(ch.id);
    const card = document.createElement("div");
    card.className = `chapter-card ${unlocked ? "unlocked" : "locked"}`;

    const completedCount = ch.levelIndices.filter(idx => {
      const d = getLevelStarData(idx);
      return d.completed;
    }).length;
    const totalStars = ch.levelIndices.reduce((sum, idx) => sum + getLevelStarData(idx).bestStars, 0);
    const maxStars = ch.levelIndices.length * 3;

    let totalObjectives = 0;
    let completedObjectives = 0;
    ch.levelIndices.forEach(idx => {
      const levelObj = getLevelObjectives(idx);
      const starData = getLevelStarData(idx);
      totalObjectives += levelObj.length;
      levelObj.forEach(objType => {
        if (starData.completedObjectives.includes(objType)) {
          completedObjectives += 1;
        }
      });
    });

    let statusText = "";
    if (!unlocked) {
      statusText = "🔒 未解锁";
    } else if (completedCount === ch.levelIndices.length) {
      statusText = `✅ 已完成 ★${totalStars}/${maxStars}`;
    } else {
      statusText = `⏳ 进度 ${completedCount}/${ch.levelIndices.length}`;
    }

    const headerDiv = document.createElement("div");
    headerDiv.className = "chapter-card-header";
    headerDiv.innerHTML = `
      <div>
        <div class="chapter-card-title">第${ch.id + 1}章：${ch.name}</div>
        <div class="chapter-card-desc">${ch.description}</div>
      </div>
      <div class="chapter-card-status">
        <div>${statusText}</div>
        ${totalObjectives > 0 ? `<div class="chapter-objective-count">🎯 ${completedObjectives}/${totalObjectives}</div>` : ""}
      </div>
    `;
    card.appendChild(headerDiv);

    const levelsDiv = document.createElement("div");
    levelsDiv.className = "chapter-levels";

    ch.levelIndices.forEach(idx => {
      const levelUnlocked = isLevelUnlocked(idx);
      const starData = getLevelStarData(idx);
      const desc = levelDescriptions[idx];
      const levelObj = getLevelObjectives(idx);
      const levelCard = document.createElement("div");
      levelCard.className = `chapter-level-card ${levelUnlocked ? "unlocked" : "locked"} ${state.levelIndex === idx ? "active-level" : ""}`;

      let starsHtml = "";
      if (levelUnlocked) {
        for (let i = 0; i < 3; i++) {
          if (i < starData.bestStars) {
            starsHtml += "★";
          } else {
            starsHtml += '<span class="star-empty">☆</span>';
          }
        }
      }

      let objectivesHtml = "";
      if (levelUnlocked && levelObj.length > 0) {
        const objIcons = levelObj.map(objType => {
          const def = OBJECTIVE_DEFS[objType];
          const isCompleted = starData.completedObjectives.includes(objType);
          return `<span class="level-objective-icon ${isCompleted ? "completed" : "incomplete"}" title="${def.name}：${def.desc}">${def.icon}</span>`;
        }).join("");
        objectivesHtml = `<div class="level-objectives">${objIcons}</div>`;
      }

      levelCard.innerHTML = `
        <div class="chapter-level-name">关卡${levels[idx].name}</div>
        <div class="chapter-level-brief">${desc ? desc.brief : ""}</div>
        ${levelUnlocked
          ? `<div class="chapter-level-stars">${starsHtml}</div>`
          : `<div class="chapter-level-lock">🔒 需通关上一关</div>`
        }
        ${objectivesHtml}
      `;

      if (levelUnlocked) {
        levelCard.addEventListener("click", () => {
          loadLevel(idx);
          renderChapterView();
        });
      }

      levelsDiv.appendChild(levelCard);
    });

    card.appendChild(levelsDiv);
    chapterContentEl.appendChild(card);
  });
}

function openChapterPanel() {
  chapterPanelEl.classList.remove("hidden");
  chapterBtn.classList.add("active");
  renderChapterView();
}

function closeChapterPanel() {
  chapterPanelEl.classList.add("hidden");
  chapterBtn.classList.remove("active");
}

function init() {
  renderLevelButtons();
  state = freshState(0);
  bindControls();
  bindReplayControls();
  bindAchievementControls();
  chapterBtn.addEventListener("click", () => {
    if (chapterPanelEl.classList.contains("hidden")) {
      openChapterPanel();
    } else {
      closeChapterPanel();
    }
  });
  if (chapterCloseBtn) {
    chapterCloseBtn.addEventListener("click", closeChapterPanel);
  }
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

function emitSound(source, loudness, position) {
  const sound = {
    source,
    loudness,
    position: { ...position },
    turn: state.history.length
  };
  state.soundSources.push(sound);
  state.soundSources = state.soundSources.slice(-5);

  state.level.guards.forEach((guard) => {
    if (guard.state === "investigate" || guard.state === "trace") return;
    const distance = Math.abs(guard.pos.x - position.x) + Math.abs(guard.pos.y - position.y);
    if (distance <= guard.hearingRange + loudness) {
      const alertIncrease = Math.max(1, Math.ceil((guard.hearingRange + loudness - distance) / 2));
      guard.alertLevel = Math.min(3, guard.alertLevel + alertIncrease);
      if (guard.behavior === GUARD_BEHAVIOR.INVESTIGATE && guard.alertLevel >= 1) {
        guard.state = "investigate";
        guard.investigateTarget = { ...position };
        guard.investigateTimer = 3;
        addLog(`🔊 巡逻员似乎听到了什么，朝${source ? source + "方向" : "声响处"}看去...`);
      }
    }
  });

  updateGlobalAlertLevel();
}

function updateGlobalAlertLevel() {
  let maxAlert = 0;
  state.level.guards.forEach((guard) => {
    maxAlert = Math.max(maxAlert, guard.alertLevel);
  });
  state.alertLevel = maxAlert;
  if (maxAlert > gameplayMetrics.maxAlertLevel) {
    gameplayMetrics.maxAlertLevel = maxAlert;
  }
  if (maxAlert > gameplayMetrics.objectiveMaxAlertLevel) {
    gameplayMetrics.objectiveMaxAlertLevel = maxAlert;
  }
}

function decayAlertLevels() {
  state.level.guards.forEach((guard) => {
    if (guard.alertLevel > 0 && guard.state === "patrol") {
      guard.alertLevel = Math.max(0, guard.alertLevel - 1);
    }
  });
  updateGlobalAlertLevel();
}

function recordOpenedDoor(door) {
  const existing = state.level.openedDoors.find((d) => samePoint(d, door));
  if (!existing) {
    state.level.openedDoors.push({
      x: door.x,
      y: door.y,
      turn: state.history.length
    });
  }
}

function getGuardCurrentPosition(guard) {
  return guard.pos;
}

function getGuardNextDirection(guard) {
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
}

function findNearestPathStep(guard, pos) {
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

function moveGuard(guard) {
  if (guard.state === "investigate") {
    moveGuardTowardsTarget(guard, guard.investigateTarget);
    guard.investigateTimer -= 1;
    if (guard.investigateTimer <= 0 || samePoint(guard.pos, guard.investigateTarget)) {
      guard.state = "patrol";
      guard.investigateTarget = null;
      guard.alertLevel = Math.max(0, guard.alertLevel - 1);
      guard.step = findNearestPathStep(guard, guard.pos);
      guard.pos = { ...guard.path[guard.step] };
      addLog("巡逻员没有发现异常，继续巡逻。");
    }
    return;
  }

  if (guard.state === "trace") {
    if (guard.tracePath.length > 0) {
      const target = guard.tracePath[0];
      moveGuardTowardsTarget(guard, target);
      if (samePoint(guard.pos, target)) {
        guard.tracePath.shift();
      }
    }
    if (guard.tracePath.length === 0) {
      guard.state = "patrol";
      guard.traceTarget = null;
      guard.step = findNearestPathStep(guard, guard.pos);
      guard.pos = { ...guard.path[guard.step] };
      addLog("巡逻员检查了可疑的门，继续巡逻。");
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

  checkForDoorTraces(guard);
}

function moveGuardTowardsTarget(guard, target) {
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

  if (!isWall({ x: newX, y: newY })) {
    guard.pos = { x: newX, y: newY };
  }
}

function checkForDoorTraces(guard) {
  if (guard.behavior !== GUARD_BEHAVIOR.TRACE) return;
  if (guard.state === "investigate" || guard.state === "trace") return;

  const currentPos = guard.pos;
  for (const openedDoor of state.level.openedDoors) {
    const distance = Math.abs(currentPos.x - openedDoor.x) + Math.abs(currentPos.y - openedDoor.y);
    if (distance <= 2) {
      guard.state = "trace";
      guard.traceTarget = { x: openedDoor.x, y: openedDoor.y };
      guard.tracePath = [{ x: openedDoor.x, y: openedDoor.y }];
      guard.alertLevel = Math.min(3, guard.alertLevel + 2);
      addLog(`🚪 巡逻员发现了被打开的门，前去检查！`);
      updateGlobalAlertLevel();
      break;
    }
  }
}

function getAlertLevelInfo(value) {
  const levels = [ALERT_LEVEL.CALM, ALERT_LEVEL.CURIOUS, ALERT_LEVEL.SUSPICIOUS, ALERT_LEVEL.ALERT];
  return levels[Math.min(value, levels.length - 1)];
}

function bindControls() {
  document.getElementById("upBtn").addEventListener("click", () => move(0, -1));
  document.getElementById("downBtn").addEventListener("click", () => move(0, 1));
  document.getElementById("leftBtn").addEventListener("click", () => move(-1, 0));
  document.getElementById("rightBtn").addEventListener("click", () => move(1, 0));
  const undoBtnTouch = document.getElementById("undoBtnTouch");
  if (undoBtnTouch) {
    undoBtnTouch.addEventListener("click", undo);
  }
  waitBtn.addEventListener("click", endTurn);
  repairBtn.addEventListener("click", repair);
  if (undoBtn) {
    undoBtn.addEventListener("click", undo);
  }
  hintBtn.addEventListener("click", requestHint);
  restartBtn.addEventListener("click", restartLevel);
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "z") {
      event.preventDefault();
      undo();
      return;
    }
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
  replaySpeedSlowBtn.addEventListener("click", () => setReplaySpeed("slow"));
  replaySpeedNormalBtn.addEventListener("click", () => setReplaySpeed("normal"));
  replaySpeedFastBtn.addEventListener("click", () => setReplaySpeed("fast"));
  replayJumpFixBtn.addEventListener("click", () => jumpToKeyStep("fix"));
  replayJumpDoorBtn.addEventListener("click", () => jumpToKeyStep("door"));
  replayJumpKeyBtn.addEventListener("click", () => jumpToKeyStep("key"));
  replayJumpSeenBtn.addEventListener("click", () => jumpToKeyStep("seen"));
  replayJumpWinBtn.addEventListener("click", () => jumpToKeyStep("win"));
}

function renderLevelButtons() {
  levelButtonsEl.innerHTML = "";
  levels.forEach((level, index) => {
    const button = document.createElement("button");
    button.type = "button";
    const unlocked = isLevelUnlocked(index);
    const starData = getLevelStarData(index);
    const starStr = starData.bestStars > 0 ? ` ${renderStars(starData.bestStars)}` : "";
    const lockStr = unlocked ? "" : " 🔒";
    button.textContent = `关卡${level.name}${starStr}${lockStr}`;
    button.disabled = !unlocked;
    if (!unlocked) {
      button.title = "需先通关上一关卡";
    }
    button.addEventListener("click", () => {
      if (!unlocked) return;
      loadLevel(index);
    });
    levelButtonsEl.appendChild(button);
  });
}

function loadLevel(index, preserveMetrics) {
  customLevelSource = null;
  state = freshState(index);
  resultEl.classList.add("hidden");
  resultEl.classList.remove("daily-result-style");
  tutorialState.active = false;
  tutorialHintEl.classList.add("hidden");
  tutorialBtn.classList.remove("active");
  toggleBackToEditorBtn(false);
  if (!preserveMetrics) {
    resetGameplayMetrics();
    initObjectiveTracking();
  } else {
    gameplayMetrics.currentActions = 0;
    initObjectiveTracking();
  }
  recordHistory("开局");
  render();
}

function restartLevel() {
  if (tutorialState.active) {
    restartTutorialStep();
    return;
  }
  gameplayMetrics.hasRetried = true;
  if (state.levelIndex === -1 && customLevelSource) {
    state = freshStateFromLevel(customLevelSource);
    gameplayMetrics.currentActions = 0;
    resultEl.classList.add("hidden");
    resultEl.classList.remove("daily-result-style");
    recordHistory("开局");
    render();
    return;
  }
  if (state.levelIndex === -3 && customLevelSource) {
    state = freshStateFromLevel(customLevelSource);
    state.levelIndex = -3;
    gameplayMetrics.currentActions = 0;
    resultEl.classList.add("hidden");
    resultEl.classList.remove("daily-result-style");
    recordHistory("开局");
    render();
    renderDailyInfo();
    return;
  }
  loadLevel(state.levelIndex, true);
}

function getDirectionName(dx, dy) {
  if (dx === 0 && dy === -1) return "向上移动";
  if (dx === 0 && dy === 1) return "向下移动";
  if (dx === -1 && dy === 0) return "向左移动";
  if (dx === 1 && dy === 0) return "向右移动";
  return "移动";
}

function move(dx, dy) {
  clearHint();
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
  let madeSound = true;
  let soundLoudness = 1;
  let soundSource = "移动";

  if (door && !door.open) {
    if (state.keys > 0) {
      state.keys -= 1;
      door.open = true;
      action = "开门并" + action;
      addLog("用钥匙打开了侧门。");
      recordOpenedDoor(door);
      soundLoudness = 3;
      soundSource = "开门";
    } else {
      addLog("门锁着，需要先找到钥匙。");
      render();
      return;
    }
  }

  if (screen) {
    soundLoudness = 2;
    soundSource = "推屏风";
  }

  state.player = next;
  state.ap -= 1;
  gameplayMetrics.currentActions += 1;

  if (madeSound) {
    emitSound(soundSource, soundLoudness, state.player);
  }

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
  if (seenByCamera()) {
    if (tutorialState.active) {
      showTutorialError("seenByGuard", true);
      restartTutorialStep("guard");
      return;
    }
    state.alertLevel = Math.min(3, state.alertLevel + 1);
    if (state.alertLevel >= 3) {
      recordHistory(action);
      fail("安保摄像头捕捉到了你的身影，警报拉响！");
      return;
    }
    addLog("⚠️ 你被安保摄像头拍到了，警觉程度上升！");
    updateGlobalAlertLevel();
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
  clearHint();
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
  gameplayMetrics.currentActions += 1;
  addLog("展品被悄悄修回了正确状态。");
  emitSound("修复", 2, state.player);

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
  clearHint();
  if (state.done) return;

  if (tutorialState.active) {
    if (!isTutorialActionAllowed("wait")) {
      showTutorialError("wrongAction");
      return;
    }
    tutorialState.hasWaited = true;
  }

  emitSound("等待", 0, state.player);

  state.ap = 4;
  gameplayMetrics.currentActions += 1;
  advanceLightAndCameraEffects();

  decayAlertLevels();

  state.level.guards.forEach((guard) => {
    moveGuard(guard);
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
  if (seenByCamera()) {
    if (tutorialState.active) {
      showTutorialError("seenByGuard", true);
      restartTutorialStep("guard");
      return;
    }
    state.alertLevel = Math.min(3, state.alertLevel + 1);
    if (state.alertLevel >= 3) {
      recordHistory("等待回合");
      fail("安保摄像头捕捉到了你的身影，警报拉响！");
      return;
    }
    addLog("⚠️ 你被安保摄像头拍到了，警觉程度上升！");
    updateGlobalAlertLevel();
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

function restoreCameras() {
  const cameras = getMechanisms().cameras || [];
  cameras.forEach(cam => {
    cam.disabled = false;
  });
}

function advanceLightAndCameraEffects() {
  state.visionReduced = state.pendingVisionReduction;
  state.pendingVisionReduction = false;
  if (state.cameraShutdownTurns > 0) {
    state.cameraShutdownTurns -= 1;
    if (state.cameraShutdownTurns === 0) {
      restoreCameras();
      addLog("安保摄像头重新上线。");
    }
  }
}

function pickKey() {
  const key = state.level.keys.find((item) => !item.taken && samePoint(item, state.player));
  if (key) {
    key.taken = true;
    state.keys += 1;
    gameplayMetrics.objectiveKeysCollected += 1;
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

  updateStatsOnWin(state.levelIndex);

  if (state.levelIndex === -3) {
    const dateKey = getDateKey();
    const steps = calculateSteps();
    const hintsUsed = gameplayMetrics.hintsUsedTotal;
    const existing = getDailyRecord(dateKey);
    const isNewRecord = !existing || !existing.bestSteps || steps < existing.bestSteps;
    const bestSteps = isNewRecord ? steps : (existing.bestSteps || steps);
    const newRecord = {
      completed: true,
      bestSteps: bestSteps,
      bestHintsUsed: isNewRecord ? hintsUsed : (existing.bestHintsUsed ?? hintsUsed),
      lastSteps: steps,
      lastHintsUsed: hintsUsed,
      date: dateKey,
      completedAt: Date.now()
    };
    saveDailyRecord(dateKey, newRecord);
    renderDailyInfo();

    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    const hintsText = hintsUsed === 0 ? "未使用提示" : `使用提示 ${hintsUsed} 次`;
    const newRecordBadge = isNewRecord ? '<span class="daily-new-record-badge">🏆 新纪录！</span>' : "";

    resultEl.innerHTML = `
      <div class="daily-result-panel">
        <h2>每日挑战完成！</h2>
        <div class="daily-result-date">${dateStr}</div>
        ${newRecordBadge}
        <div class="daily-result-stats">
          <div class="daily-result-stat">
            <span class="stat-label">本次步数</span>
            <span class="stat-value">${steps}</span>
          </div>
          <div class="daily-result-stat">
            <span class="stat-label">最佳步数</span>
            <span class="stat-value">${bestSteps}</span>
          </div>
          <div class="daily-result-stat">
            <span class="stat-label">提示使用</span>
            <span class="stat-value">${hintsUsed} 次</span>
          </div>
        </div>
        <p class="daily-result-desc">所有展品复位，并从指定出口离开。</p>
        <div class="daily-share-section">
          <div class="daily-share-text" id="dailyShareText">${generateDailyShareText(dateStr, steps, bestSteps, hintsUsed, isNewRecord)}</div>
          <button id="dailyCopyBtn" type="button" class="daily-copy-btn">📋 复制分享文案</button>
        </div>
        <div class="daily-result-actions">
          <button id="replayBtn" type="button" class="replay-trigger">查看本局回放</button>
          <button id="dailyRetryBtn" type="button" class="daily-retry-btn">再来一次</button>
        </div>
      </div>
    `;
    resultEl.classList.add("daily-result-style");
    resultEl.classList.remove("hidden");
    addLog("警报没有响，展厅恢复安静。每日挑战完成！");
    recordHistory("通关成功");

    const replayBtn = document.getElementById("replayBtn");
    if (replayBtn) replayBtn.addEventListener("click", () => openReplay(true));

    const copyBtn = document.getElementById("dailyCopyBtn");
    if (copyBtn) copyBtn.addEventListener("click", copyDailyShareText);

    const retryBtn = document.getElementById("dailyRetryBtn");
    if (retryBtn) retryBtn.addEventListener("click", () => {
      resultEl.classList.add("hidden");
      loadDailyChallenge();
    });

    render();
    return;
  }

  if (state.levelIndex >= 0 && state.levelIndex < levels.length) {
    const stars = calculateStars(state.levelIndex, gameplayMetrics.currentActions, gameplayMetrics.hasRetried, gameplayMetrics.hintsUsedTotal);
    const prevData = getLevelStarData(state.levelIndex);
    const isNewBest = stars > prevData.bestStars;

    const levelObj = getLevelObjectives(state.levelIndex);
    const completedObj = evaluateObjectives(state.levelIndex);
    const newObjectives = completedObj.filter(obj => !prevData.completedObjectives.includes(obj));
    updateLevelStarData(state.levelIndex, stars, completedObj);

    const nextIdx = getNextLevelIndex(state.levelIndex);
    let nextLevelHtml = "";
    if (nextIdx >= 0) {
      nextLevelHtml = `<button id="nextLevelBtn" type="button" class="next-level-btn">进入下一关：关卡${levels[nextIdx].name}</button>`;
    } else {
      nextLevelHtml = `<p class="all-complete-msg">🎉 恭喜！你已通关所有关卡！</p>`;
    }

    const starDisplay = renderStars(stars);
    const bestStarDisplay = isNewBest ? `<span class="star-new-best">新纪录！</span>` : `<span class="star-prev-best">历史最佳：${renderStars(prevData.bestStars)}</span>`;

    let objectivesHtml = "";
    if (levelObj.length > 0) {
      const objItems = levelObj.map(objType => {
        const def = OBJECTIVE_DEFS[objType];
        const isCompleted = completedObj.includes(objType);
        const isNew = newObjectives.includes(objType);
        const statusClass = isCompleted ? "completed" : "failed";
        const newBadge = isNew ? '<span class="objective-new">新达成！</span>' : "";
        return `
          <div class="objective-item ${statusClass}">
            <span class="objective-icon">${def.icon}</span>
            <span class="objective-name">${def.name}</span>
            <span class="objective-status">${isCompleted ? "✓ 完成" : "✗ 未完成"}</span>
            ${newBadge}
          </div>
        `;
      }).join("");
      objectivesHtml = `
        <div class="objectives-section">
          <h3>🎯 展厅目标</h3>
          <div class="objectives-list">
            ${objItems}
          </div>
        </div>
      `;
    }

    resultEl.innerHTML = `
      <h2>本关修复完成</h2>
      <div class="star-rating">
        <span class="star-display">${starDisplay}</span>
        ${bestStarDisplay}
      </div>
      <div class="star-breakdown">
        <p>行动数：${gameplayMetrics.currentActions}${levelDescriptions[state.levelIndex] ? `（三星 ≤${Math.ceil(levelDescriptions[state.levelIndex].optimalActions * 1.2)}）` : ""}</p>
        <p>${gameplayMetrics.hasRetried ? "⚠️ 有重试记录" : "✓ 无重试"}</p>
        <p>使用提示：${gameplayMetrics.hintsUsedTotal}次</p>
      </div>
      ${objectivesHtml}
      <p>所有展品复位，并从指定出口离开。</p>
      ${nextLevelHtml}
      <button id="replayBtn" type="button" class="replay-trigger">查看本局回放</button>
      <button id="retryForStarsBtn" type="button" class="retry-stars-btn">重试刷星</button>
    `;
    resultEl.classList.remove("daily-result-style");
    resultEl.classList.remove("hidden");
    addLog("警报没有响，展厅恢复安静。");
    recordHistory("通关成功");

    const replayBtn = document.getElementById("replayBtn");
    if (replayBtn) replayBtn.addEventListener("click", () => openReplay(true));

    const nextLevelBtn = document.getElementById("nextLevelBtn");
    if (nextLevelBtn) {
      nextLevelBtn.addEventListener("click", () => {
        resultEl.classList.add("hidden");
        loadLevel(nextIdx);
        renderChapterView();
      });
    }

    const retryForStarsBtn = document.getElementById("retryForStarsBtn");
    if (retryForStarsBtn) {
      retryForStarsBtn.addEventListener("click", () => {
        resultEl.classList.add("hidden");
        loadLevel(state.levelIndex);
        renderChapterView();
      });
    }

    render();
    renderChapterView();
    return;
  }

  resultEl.innerHTML = `<h2>本关修复完成</h2><p>所有展品复位，并从指定出口离开。可以选择下一关继续。</p><button id="replayBtn" type="button" class="replay-trigger">查看本局回放</button>`;
  resultEl.classList.remove("daily-result-style");
  resultEl.classList.remove("hidden");
  addLog("警报没有响，展厅恢复安静。");
  recordHistory("通关成功");
  const replayBtn = document.getElementById("replayBtn");
  if (replayBtn) replayBtn.addEventListener("click", () => openReplay(true));
  render();
}

function fail(reason) {
  state.done = true;
  gameplayMetrics.hasRetried = true;

  updateStatsOnFail(state.levelIndex, reason);

  resultEl.innerHTML = `<h2>行动失败</h2><p>${reason}</p><button id="failRetryBtn" type="button">重试本关</button><button id="replayBtn" type="button" class="replay-trigger">查看本局回放</button>`;
  resultEl.classList.remove("daily-result-style");
  resultEl.classList.remove("hidden");
  addLog(reason);
  if (!state.history[state.history.length - 1] || state.history[state.history.length - 1].action !== "被发现") {
    recordHistory("被发现");
  }
  const replayBtn = document.getElementById("replayBtn");
  if (replayBtn) replayBtn.addEventListener("click", () => openReplay(false));
  const failRetryBtn = document.getElementById("failRetryBtn");
  if (failRetryBtn) failRetryBtn.addEventListener("click", () => {
    resultEl.classList.add("hidden");
    restartLevel();
  });
  render();
}

function guardVisionSet() {
  const set = new Set();
  const m = getMechanisms();
  const wallSet = new Set(state.level.walls);
  const screenSet = new Set(m.screens.map(s => pointKey(s)));
  state.level.guards.forEach((guard) => {
    const pos = getGuardCurrentPosition(guard);
    set.add(pointKey(pos));
    const baseRange = state.visionReduced ? 1 : 2;
    const alertBonus = Math.floor(guard.alertLevel / 2);
    const maxRange = baseRange + alertBonus;
    const dir = getGuardNextDirection(guard);
    const dx = dir.dx;
    const dy = dir.dy;
    for (let i = 1; i <= maxRange; i += 1) {
      const point = { x: pos.x + dx * i, y: pos.y + dy * i };
      if (!inside(point) || wallSet.has(pointKey(point)) || screenSet.has(pointKey(point))) break;
      set.add(pointKey(point));
    }
  });
  return set;
}

function cameraVisionSet() {
  const m = getMechanisms();
  const wallSet = new Set(state.level.walls);
  const screenSet = new Set(m.screens.map(s => pointKey(s)));
  const cameras = m.cameras || [];
  return getCameraVisionSet(cameras, wallSet, screenSet, state.visionReduced);
}

function seenByGuard() {
  return guardVisionSet().has(pointKey(state.player));
}

function seenByCamera() {
  const camVision = cameraVisionSet();
  const playerKey = pointKey(state.player);
  if (camVision.has(playerKey)) {
    const m = getMechanisms();
    const cameras = m.cameras || [];
    for (const cam of cameras) {
      if (!cam.disabled && samePoint(cam, state.player)) return false;
    }
    return true;
  }
  return false;
}

function getCameraVisionSet(cameras, wallSet, screenSet, visionReduced) {
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
}

function visionSet() {
  const set = guardVisionSet();
  const camVision = cameraVisionSet();
  camVision.forEach(k => set.add(k));
  return set;
}

function visionSetForSnapshot(snapshot) {
  const set = new Set();
  const sm = snapshot.level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  const wallSet = new Set(snapshot.level.walls);
  const screenSet = new Set(sm.screens.map(s => pointKey(s)));
  const maxRange = snapshot.visionReduced ? 1 : 2;
  snapshot.level.guards.forEach((guard) => {
    const pos = guard.pos;
    set.add(pointKey(pos));
    let dx = 0, dy = 0;
    if (guard.state === "investigate" && guard.investigateTarget) {
      dx = Math.sign(guard.investigateTarget.x - pos.x);
      dy = Math.sign(guard.investigateTarget.y - pos.y);
      if (Math.abs(guard.investigateTarget.x - pos.x) >= Math.abs(guard.investigateTarget.y - pos.y)) {
        dy = 0;
      } else {
        dx = 0;
      }
    } else if (guard.state === "trace" && guard.tracePath.length > 0) {
      const target = guard.tracePath[0];
      dx = Math.sign(target.x - pos.x);
      dy = Math.sign(target.y - pos.y);
    } else if (guard.behavior === GUARD_BEHAVIOR.PATROL) {
      let nextStep = guard.step + guard.direction;
      if (nextStep >= guard.path.length || nextStep < 0) {
        nextStep = guard.step - guard.direction;
      }
      if (guard.path[nextStep]) {
        dx = Math.sign(guard.path[nextStep].x - pos.x);
        dy = Math.sign(guard.path[nextStep].y - pos.y);
      }
    } else {
      const next = guard.path[(guard.step + 1) % guard.path.length];
      if (next) {
        dx = Math.sign(next.x - pos.x);
        dy = Math.sign(next.y - pos.y);
      }
    }
    for (let i = 1; i <= maxRange; i += 1) {
      const point = { x: pos.x + dx * i, y: pos.y + dy * i };
      if (!inside(point) || isWallForSnapshot(snapshot, point) || screenSet.has(pointKey(point))) break;
      set.add(pointKey(point));
    }
  });
  const cameras = sm.cameras || [];
  const cameraVision = getCameraVisionSet(cameras, wallSet, screenSet, snapshot.visionReduced);
  cameraVision.forEach(k => set.add(k));
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
  return state.level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
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

function cameraAt(point) {
  const m = getMechanisms();
  return (m.cameras || []).find(c => samePoint(c, point)) || null;
}

function isCamera(point) {
  return cameraAt(point) !== null;
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
        if (door) {
          const wasClosed = !door.open;
          door.open = !door.open;
          if (wasClosed && door.open) {
            recordOpenedDoor(door);
          }
        }
      });
      addLog("踩下压力板，远处的门发生了变化。");
    } else if (!playerOn && plate.triggered) {
      plate.triggered = false;
    }
  });
}

function activateLights() {
  const m = getMechanisms();
  let anyLightActivated = false;
  m.lights.forEach(light => {
    if (light.active) return;
    if (samePoint(state.player, light)) {
      light.active = true;
      state.pendingVisionReduction = true;
      anyLightActivated = true;
    }
  });
  if (anyLightActivated) {
    const cameras = m.cameras || [];
    cameras.forEach(cam => {
      if (!cam.disabled) {
        cam.disabled = true;
      }
    });
    if (cameras.length > 0) {
      state.cameraShutdownTurns = Math.max(state.cameraShutdownTurns || 0, 2);
      addLog("按下了熄灯开关，巡逻员视野缩短，安保摄像头也被暂时关闭。");
    } else {
      addLog("按下了熄灯开关，巡逻员下一回合视野会缩短。");
    }
  }
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

  const alertInfo = getAlertLevelInfo(state.alertLevel);
  if (alertLevelEl) {
    alertLevelEl.innerHTML = `
      <span class="alert-label">警觉程度</span>
      <span class="alert-level" style="color: ${alertInfo.color}">${alertInfo.name}</span>
      <span class="alert-dots">
        ${[0, 1, 2, 3].map(i => `<span class="alert-dot ${i <= state.alertLevel ? 'active' : ''}" style="background: ${i <= state.alertLevel ? alertInfo.color : '#3c3642'}"></span>`).join('')}
      </span>
    `;
  }

  renderLevelButtons();
  [...levelButtonsEl.children].forEach((button, index) => {
    button.classList.toggle("active", index === state.levelIndex);
  });
  if (dailyBtn) {
    dailyBtn.classList.toggle("active", state.levelIndex === -3);
  }
  waitBtn.disabled = state.done;
  repairBtn.disabled = state.done;
  if (undoBtn) {
    undoBtn.disabled = !canUndo();
  }
  const undoBtnTouch = document.getElementById("undoBtnTouch");
  if (undoBtnTouch) {
    undoBtnTouch.disabled = !canUndo();
  }
  hintBtn.disabled = state.done;
  hintBtn.classList.toggle("hint-btn", !state.done);
  renderBoard();
  renderLog();
}

function renderBoard() {
  const guards = state.level.guards.map((guard) => ({
    pos: { ...guard.pos },
    alertLevel: guard.alertLevel,
    state: guard.state,
    investigateTarget: guard.investigateTarget,
    traceTarget: guard.traceTarget,
    id: guard.id
  }));
  const vision = visionSet();
  boardEl.innerHTML = "";

  let tutorialHighlights = [];
  if (tutorialState.active) {
    const step = tutorialSteps[tutorialState.currentStep];
    if (step.highlight) {
      tutorialHighlights = step.highlight;
    }
  }

  let hintHighlights = [];
  let hintStepMap = new Map();
  let hintActionMap = new Map();
  if (hintState.active && hintState.path.length > 0) {
    const maxShow = Math.min(5, hintState.path.length);
    for (let i = 0; i < maxShow; i++) {
      const p = hintState.path[i];
      const key = `${p.x},${p.y}`;
      if (!hintStepMap.has(key)) {
        hintStepMap.set(key, i + 1);
        hintActionMap.set(key, hintState.actionLabels[i] || "");
      }
      hintHighlights.push(p);
    }
  }

  const investigateTargets = new Set();
  const traceTargets = new Set();
  guards.forEach(g => {
    if (g.investigateTarget) {
      investigateTargets.add(pointKey(g.investigateTarget));
    }
    if (g.traceTarget) {
      traceTargets.add(pointKey(g.traceTarget));
    }
  });

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
      const cam = (m.cameras || []).find(c => samePoint(c, point));
      if (cam) {
        tile.classList.add("camera");
        if (cam.disabled) tile.classList.add("camera-disabled");
        tile.classList.add(`camera-${cam.direction}`);
        label.textContent = cam.disabled ? "摄像✗" : `摄像${getCameraDirectionLabel(cam.direction)}`;
      }
      if (samePoint(state.level.exit, point)) {
        tile.classList.add("exit");
        label.textContent = "出口";
      }
      if (vision.has(pointKey(point))) tile.classList.add("vision");
      const camVision = cameraVisionSet();
      if (camVision.has(pointKey(point))) tile.classList.add("camera-vision");
      if (investigateTargets.has(pointKey(point))) tile.classList.add("investigate-target");
      if (traceTargets.has(pointKey(point))) tile.classList.add("trace-target");

      const guardHere = guards.find((g) => samePoint(g.pos, point));
      if (guardHere) {
        tile.classList.add("guard");
        tile.classList.add(`guard-alert-${guardHere.alertLevel}`);
        if (guardHere.state === "investigate") {
          tile.classList.add("guard-investigating");
        }
        if (guardHere.state === "trace") {
          tile.classList.add("guard-tracing");
        }
      }
      if (samePoint(state.player, point)) tile.classList.add("player");

      if (tutorialHighlights.some(p => samePoint(p, point))) {
        tile.classList.add("tutorial-highlight");
      }

      const pk = `${point.x},${point.y}`;
      if (hintStepMap.has(pk)) {
        const stepNum = hintStepMap.get(pk);
        tile.classList.add("hint-highlight");
        tile.classList.add(`hint-highlight-step-${stepNum}`);
        const numEl = document.createElement("div");
        numEl.className = "hint-number";
        numEl.textContent = stepNum;
        tile.appendChild(numEl);
        const actionText = hintActionMap.get(pk);
        if (actionText) {
          const actEl = document.createElement("div");
          actEl.className = "hint-action-label";
          actEl.textContent = actionText;
          tile.appendChild(actEl);
        }
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
  replayState.speedLevel = "normal";
  replayState.playSpeed = REPLAY_SPEEDS.normal;
  replayPlayBtn.textContent = "▶ 播放";
  replayTotalEl.textContent = replayState.history.length;
  replayStepEl.textContent = "1";
  replayProgressEl.max = replayState.history.length - 1;
  replayProgressEl.value = 0;
  replayProgressEl.oninput = (e) => {
    goToReplayStep(parseInt(e.target.value, 10));
  };
  updateReplaySpeedButtons();
  detectKeySteps();
  replayEl.classList.remove("hidden");
  renderReplayStep();
}

function detectKeySteps() {
  const history = replayState.history;
  replayState.keySteps = { fix: -1, door: -1, key: -1, seen: -1, win: -1 };

  for (let i = 0; i < history.length; i += 1) {
    const snap = history[i];
    const prevSnap = i > 0 ? history[i - 1] : null;

    if (replayState.keySteps.fix === -1 && snap.action.indexOf("修复展柜") !== -1) {
      replayState.keySteps.fix = i;
    }
    if (replayState.keySteps.door === -1 && snap.action.indexOf("开门") !== -1) {
      replayState.keySteps.door = i;
    }
    if (replayState.keySteps.seen === -1 && snap.action.indexOf("被发现") !== -1) {
      replayState.keySteps.seen = i;
    }
    if (replayState.keySteps.win === -1 && snap.action.indexOf("通关成功") !== -1) {
      replayState.keySteps.win = i;
    }
    if (replayState.keySteps.key === -1 && prevSnap) {
      const prevKeyCount = prevSnap.keys;
      const curKeyCount = snap.keys;
      if (curKeyCount > prevKeyCount) {
        replayState.keySteps.key = i;
      }
    }
  }
}

function setReplaySpeed(level) {
  if (!REPLAY_SPEEDS[level]) return;
  replayState.speedLevel = level;
  replayState.playSpeed = REPLAY_SPEEDS[level];
  updateReplaySpeedButtons();
  if (replayState.isPlaying) {
    stopReplayPlay();
    startReplayPlay();
  }
}

function updateReplaySpeedButtons() {
  const btns = { slow: replaySpeedSlowBtn, normal: replaySpeedNormalBtn, fast: replaySpeedFastBtn };
  Object.keys(btns).forEach((level) => {
    btns[level].classList.toggle("active", replayState.speedLevel === level);
  });
}

function jumpToKeyStep(keyType) {
  const stepIndex = replayState.keySteps[keyType];
  if (stepIndex === -1) return;
  stopReplayPlay();
  goToReplayStep(stepIndex);
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
  const guards = snapshot.level.guards.map((guard) => guard.pos);
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
      const sm = snapshot.level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
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
      const cam = (sm.cameras || []).find(c => samePoint(c, point));
      if (cam) {
        tile.classList.add("camera");
        if (cam.disabled) tile.classList.add("camera-disabled");
        tile.classList.add(`camera-${cam.direction}`);
        label.textContent = cam.disabled ? "摄像✗" : `摄像${getCameraDirectionLabel(cam.direction)}`;
      }
      if (snapshot.level.exit && samePoint(snapshot.level.exit, point)) {
        tile.classList.add("exit");
        label.textContent = "出口";
      }
      if (vision.has(pointKey(point))) tile.classList.add("vision");
      const snapshotCamVision = getCameraVisionSet(
        sm.cameras || [],
        new Set(snapshot.level.walls),
        new Set((sm.screens || []).map(s => pointKey(s))),
        snapshot.visionReduced
      );
      if (snapshotCamVision.has(pointKey(point))) tile.classList.add("camera-vision");
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
  replayPlayBtn.disabled = replayState.history.length <= 1;
  replayJumpFixBtn.disabled = replayState.keySteps.fix === -1;
  replayJumpDoorBtn.disabled = replayState.keySteps.door === -1;
  replayJumpKeyBtn.disabled = replayState.keySteps.key === -1;
  replayJumpSeenBtn.disabled = replayState.keySteps.seen === -1;
  replayJumpWinBtn.disabled = replayState.keySteps.win === -1;
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
  resultEl.classList.remove("daily-result-style");
  resetGameplayMetrics();
  tutorialState.active = false;
  tutorialHintEl.classList.add("hidden");
  tutorialBtn.classList.remove("active");
  toggleBackToEditorBtn(false);
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
      const bestHints = record.bestHintsUsed != null ? record.bestHintsUsed : "-";
      const hintsText = bestHints === 0 ? "无提示" : `提示 ${bestHints} 次`;
      statusHtml = `
        <span class="daily-status completed">✅ 已完成</span>
        <span>最佳步数<strong>${record.bestSteps}</strong></span>
        <span class="daily-hint-info">${hintsText}</span>
      `;
    } else {
      statusHtml = `
        <span class="daily-status pending">⏳ 挑战中</span>
        <span>上次步数<strong>${record.lastSteps || record.bestSteps || "-"}</strong></span>
      `;
    }
  } else {
    statusHtml = `<span class="daily-status new">🎯 新挑战</span>`;
  }

  infoEl.innerHTML = `
    <div class="daily-info-left">
      <div class="daily-date">每日挑战 · ${dateStr}</div>
      <div class="daily-status-line">${statusHtml}</div>
    </div>
    <div class="daily-info-right">
      <button id="dailyQuickBtn" type="button" class="daily-quick-btn">
        ${record && record.completed ? "再挑战一次" : "开始挑战"}
      </button>
    </div>
  `;

  const quickBtn = document.getElementById("dailyQuickBtn");
  if (quickBtn) {
    quickBtn.addEventListener("click", () => {
      loadDailyChallenge();
    });
  }
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

function generateDailyShareText(dateStr, steps, bestSteps, hintsUsed, isNewRecord) {
  const hintText = hintsUsed === 0 ? "无提示通关" : `使用 ${hintsUsed} 次提示`;
  const recordText = isNewRecord ? "🏆 新纪录！" : "";
  const shareText = `【博物馆夜间修复师·每日挑战】
📅 ${dateStr}
👣 本次步数：${steps} 步
⭐ 最佳纪录：${bestSteps} 步
💡 ${hintText}
${recordText}
快来挑战今日关卡吧！`;
  return shareText;
}

function copyDailyShareText() {
  const shareTextEl = document.getElementById("dailyShareText");
  const copyBtn = document.getElementById("dailyCopyBtn");
  if (!shareTextEl || !copyBtn) return;

  const text = shareTextEl.textContent || shareTextEl.innerText;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopySuccess(copyBtn);
    }).catch(() => {
      fallbackCopy(text, copyBtn);
    });
  } else {
    fallbackCopy(text, copyBtn);
  }
}

function fallbackCopy(text, btn) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    showCopySuccess(btn);
  } catch (err) {
    console.error("复制失败:", err);
  }
  document.body.removeChild(textArea);
}

function showCopySuccess(btn) {
  const originalText = btn.textContent;
  btn.textContent = "✓ 已复制";
  btn.classList.add("copy-success");
  setTimeout(() => {
    btn.textContent = originalText;
    btn.classList.remove("copy-success");
  }, 2000);
}

function clearHint() {
  hintState.active = false;
  hintState.path = [];
  hintState.actionLabels = [];
}

function requestHint() {
  if (state.done) return;
  if (tutorialState.active) {
    addLog("教学模式中暂不提供提示。");
    render();
    return;
  }
  gameplayMetrics.hintsUsedTotal += 1;
  gameplayMetrics.objectiveHintsUsed += 1;

  addLog("正在分析局势，计算最优路线...");
  render();

  setTimeout(() => {
    const result = searchHintPath();
    if (result && result.path && result.path.length > 1) {
      hintState.active = true;
      hintState.path = result.path;
      hintState.actionLabels = result.actionLabels;
      const actionsSummary = result.actionLabels.slice(0, Math.min(5, result.actionLabels.length)).filter(a => a).join(" → ");
      if (actionsSummary) {
        addLog(`💡 提示：推荐路线 - ${actionsSummary}`);
      } else {
        addLog("💡 提示：已在棋盘上高亮推荐路线");
      }
    } else {
      clearHint();
      addLog("😰 暂时找不到安全路线，建议先等待或调整位置。");
    }
    syncCurrentHistorySnapshot();
    render();
  }, 50);
}

function getGuardVisionAtStepWithScreens(guards, step, walls, screens, visionReduced) {
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
}

function cloneHintState(s) {
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
}

function hintStateKey(s, cycleLen, numExhibits, numPlates, numLights, numCameras) {
  const exhibitMask = s.fixed.reduce((acc, f, i) => f ? acc | (1 << i) : acc, 0);
  const plateMask = s.plateTriggered.reduce((acc, t, i) => t ? acc | (1 << i) : acc, 0);
  const lightMask = s.lightsActive.reduce((acc, a, i) => a ? acc | (1 << i) : acc, 0);
  const doorsMask = s.doorsOpen.reduce((acc, o, i) => o ? acc | (1 << i) : acc, 0);
  const screenKey = s.screens.map(sc => `${sc.x},${sc.y}`).sort().join("|");
  return `${s.pos.x},${s.pos.y}|${s.keys}|${exhibitMask}|${s.step % cycleLen}|${s.ap}|${plateMask}|${lightMask}|${doorsMask}|${screenKey}|${s.visionReduced ? 1 : 0}|${s.camerasDisabled ? 1 : 0}|${s.cameraShutdownTurns || 0}`;
}

function advanceHintLightAndCameraEffects(s) {
  s.visionReduced = s.pendingVisionReduction;
  s.pendingVisionReduction = false;
  if (s.cameraShutdownTurns > 0) {
    s.cameraShutdownTurns -= 1;
    s.camerasDisabled = s.cameraShutdownTurns > 0;
  }
}

function searchHintPath() {
  const { walls, doors, keys: keyItems, exhibits, guards, exit } = state.level;
  const mechanisms = state.level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  const pressurePlates = mechanisms.pressurePlates || [];
  const screens = mechanisms.screens || [];
  const lights = mechanisms.lights || [];
  const cameras = mechanisms.cameras || [];

  const numExhibits = exhibits.length;
  const numDoors = doors.length;
  const numPlates = pressurePlates.length;
  const numLights = lights.length;
  const numCameras = cameras.length;
  const cycleLen = getGuardCycleLength(guards);

  const guardInitSteps = guards.map(g => g.step);

  function getCameraVisionSetForHint(screenList, visionReduced, camerasDisabled) {
    const vision = new Set();
    if (camerasDisabled) return vision;
    const wallSet = new Set(walls);
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

  function getVisionAtOffset(offset, screenList, visionReduced, camerasDisabled) {
    const vision = new Set();
    const wallSet = new Set(walls);
    const screenSet = new Set(screenList.map(s => pointKey(s)));
    const maxRange = visionReduced ? 1 : 2;
    guards.forEach((guard, gi) => {
      const gs = (guardInitSteps[gi] + offset) % guard.path.length;
      const pos = guard.path[gs];
      vision.add(pointKey(pos));
      const nextPos = guard.path[(gs + 1) % guard.path.length];
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
    const camVision = getCameraVisionSetForHint(screenList, visionReduced, camerasDisabled);
    camVision.forEach(k => vision.add(k));
    return vision;
  }

  const currentDoorsOpen = doors.map(d => d.open);
  const currentKeysTaken = keyItems.map(k => k.taken);
  const currentFixed = exhibits.map(e => e.fixed);
  const currentPlateTriggered = pressurePlates.map(p => p.triggered);
  const currentScreens = screens.map(s => ({ ...s }));
  const currentLightsActive = lights.map(l => l.active);

  const allExhibitsFixedNow = currentFixed.every(f => f);
  const atExitNow = samePoint(state.player, exit);
  if (allExhibitsFixedNow && atExitNow) {
    return { path: [{ ...state.player }], actionLabels: ["已完成"] };
  }

  const visited = new Set();
  const initial = {
    pos: { ...state.player },
    keys: state.keys,
    keysTaken: [...currentKeysTaken],
    doorsOpen: [...currentDoorsOpen],
    fixed: [...currentFixed],
    plateTriggered: [...currentPlateTriggered],
    screens: [...currentScreens],
    lightsActive: [...currentLightsActive],
    visionReduced: state.visionReduced,
    pendingVisionReduction: state.pendingVisionReduction,
    camerasDisabled: (state.cameraShutdownTurns || 0) > 0,
    cameraShutdownTurns: state.cameraShutdownTurns || 0,
    step: 0,
    ap: state.ap,
    path: [{ ...state.player }],
    actionLabels: ["当前位置"]
  };

  const initKey = hintStateKey(initial, cycleLen, numExhibits, numPlates, numLights, numCameras);
  visited.add(initKey);

  const queue = [initial];
  let iterations = 0;
  const maxIterations = 80000;

  function checkAndEnqueue(newState) {
    const allFixed = newState.fixed.every(f => f);
    const atExit = samePoint(newState.pos, exit);
    if (allFixed && atExit) {
      return newState;
    }
    const sk = hintStateKey(newState, cycleLen, numExhibits, numPlates, numLights, numCameras);
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
      [1, 0, "右"],
      [-1, 0, "左"],
      [0, 1, "下"],
      [0, -1, "上"]
    ];

    for (const [dx, dy, dirName] of dirs) {
      if (cur.ap <= 0) continue;
      const nx = cur.pos.x + dx;
      const ny = cur.pos.y + dy;
      if (nx < 0 || nx >= BOARD_W || ny < 0 || ny >= BOARD_H) continue;
      const newPos = { x: nx, y: ny };
      const pk = pointKey(newPos);
      if (walls.includes(pk)) continue;

      const ns = cloneHintState(cur);
      let actionLabel = `向${dirName}`;
      let usedKey = false;

      const screenIdx = ns.screens.findIndex(sc => samePoint(sc, newPos));
      if (screenIdx >= 0) {
        const pushDest = { x: nx + dx, y: ny + dy };
        if (pushDest.x < 0 || pushDest.x >= BOARD_W || pushDest.y < 0 || pushDest.y >= BOARD_H) continue;
        if (walls.includes(pointKey(pushDest))) continue;
        const pushDoorIdx = doors.findIndex(d => samePoint(d, pushDest));
        if (pushDoorIdx >= 0 && !ns.doorsOpen[pushDoorIdx]) continue;
        if (ns.screens.some(sc => samePoint(sc, pushDest))) continue;
        if (exhibits.some(e => samePoint(e, pushDest))) continue;
        ns.screens[screenIdx] = { ...pushDest };
        actionLabel = `推屏风+${dirName}`;
      }

      const doorIdx = doors.findIndex(d => d.x === nx && d.y === ny);
      if (doorIdx >= 0 && !ns.doorsOpen[doorIdx]) {
        if (ns.keys <= 0) continue;
        ns.keys -= 1;
        ns.doorsOpen[doorIdx] = true;
        usedKey = true;
        actionLabel = "开门+" + actionLabel;
      }

      const vision = getVisionAtOffset(cur.step, ns.screens, ns.visionReduced, ns.camerasDisabled);
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

      ns.path.push({ ...ns.pos });
      ns.actionLabels.push(actionLabel);
      ns.ap -= 1;

      if (ns.ap <= 0) {
        const nextStep = (cur.step + 1) % cycleLen;
        const nextVisionState = cloneHintState(ns);
        advanceHintLightAndCameraEffects(nextVisionState);
        const nextVision = getVisionAtOffset(nextStep, nextVisionState.screens, nextVisionState.visionReduced, nextVisionState.camerasDisabled);
        const curPk = pointKey(ns.pos);
        if (!nextVision.has(curPk)) {
          ns.step = nextStep;
          ns.ap = 4;
          advanceHintLightAndCameraEffects(ns);
          ns.actionLabels[ns.actionLabels.length - 1] = actionLabel + "+等待";
          const found = checkAndEnqueue(ns);
          if (found) return { path: found.path, actionLabels: found.actionLabels };
        }
      } else {
        const found = checkAndEnqueue(ns);
        if (found) return { path: found.path, actionLabels: found.actionLabels };
      }
    }

    for (let i = 0; i < numExhibits; i++) {
      if (cur.ap <= 0) continue;
      if (!cur.fixed[i] && isAdjacent(cur.pos, exhibits[i])) {
        const ns = cloneHintState(cur);
        ns.fixed[i] = true;
        ns.ap -= 1;
        ns.path.push({ ...ns.pos });
        ns.actionLabels.push("修复展柜");

        if (ns.ap <= 0) {
          const nextStep = (cur.step + 1) % cycleLen;
          const nextVisionState = cloneHintState(ns);
          advanceHintLightAndCameraEffects(nextVisionState);
          const nextVision = getVisionAtOffset(nextStep, nextVisionState.screens, nextVisionState.visionReduced, nextVisionState.camerasDisabled);
          const curPk = pointKey(ns.pos);
          if (!nextVision.has(curPk)) {
            ns.step = nextStep;
            ns.ap = 4;
            advanceHintLightAndCameraEffects(ns);
            ns.actionLabels[ns.actionLabels.length - 1] = "修复展柜+等待";
            const found = checkAndEnqueue(ns);
            if (found) return { path: found.path, actionLabels: found.actionLabels };
          }
        } else {
          const found = checkAndEnqueue(ns);
          if (found) return { path: found.path, actionLabels: found.actionLabels };
        }
      }
    }

    {
      const nextStep = (cur.step + 1) % cycleLen;
      const nextVisionState = cloneHintState(cur);
      advanceHintLightAndCameraEffects(nextVisionState);
      const nextVision = getVisionAtOffset(nextStep, nextVisionState.screens, nextVisionState.visionReduced, nextVisionState.camerasDisabled);
      const curPk = pointKey(cur.pos);
      if (!nextVision.has(curPk)) {
        const ns = cloneHintState(cur);
        ns.step = nextStep;
        ns.ap = 4;
        advanceHintLightAndCameraEffects(ns);
        ns.path.push({ ...ns.pos });
        ns.actionLabels.push("等待回合");
        const found = checkAndEnqueue(ns);
        if (found) return { path: found.path, actionLabels: found.actionLabels };
      }
    }
  }

  return null;
}

// ============== 成就与统计系统 ==============

const ACHIEVEMENT_KEY = "museum_achievement_stats";

const ACHIEVEMENT_DEFS = [
  { id: "first_win", name: "初出茅庐", desc: "首次通关任意关卡", icon: "🎯" },
  { id: "all_levels", name: "完美修复师", desc: "通关所有正式关卡", icon: "🏆" },
  { id: "no_wait", name: "迅雷不及掩耳", desc: "在任意关卡无等待通关", icon: "⚡" },
  { id: "no_wait_all", name: "风驰电掣", desc: "在所有正式关卡无等待通关", icon: "🌪️" },
  { id: "min_keys", name: "节俭达人", desc: "累计使用钥匙不超过 5 次通关 3 个关卡", icon: "🔑" },
  { id: "survivor", name: "越挫越勇", desc: "累计失败 10 次后仍成功通关", icon: "💪" },
  { id: "master", name: "博物馆大师", desc: "每个正式关卡都达成最少回合通关", icon: "👑" },
  { id: "first_objective", name: "目标达成", desc: "首次完成任意展厅目标", icon: "🎯" },
  { id: "all_objectives_one", name: "全目标达人", desc: "在单个关卡完成所有展厅目标", icon: "⭐" },
  { id: "all_objectives_all", name: "完美展厅", desc: "在所有正式关卡完成所有展厅目标", icon: "🏅" }
];

const FAILURE_REASONS = {
  guard_sight: "被巡逻员发现",
  guard_turn: "巡逻员换班撞见",
  other: "其他原因"
};

let achievementState = loadAchievements();

function defaultAchievementData() {
  return {
    levels: {},
    overall: {
      totalWins: 0,
      totalFailures: 0,
      totalKeysUsed: 0,
      totalActions: 0,
      totalTurns: 0,
      totalObjectivesCompleted: 0,
      failureReasons: { guard_sight: 0, guard_turn: 0, other: 0 }
    },
    achievements: {}
  };
}

function loadAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const def = defaultAchievementData();
      const levels = {};
      if (data.levels) {
        Object.keys(data.levels).forEach(key => {
          const l = data.levels[key];
          levels[key] = {
            bestTurns: l.bestTurns !== undefined ? l.bestTurns : null,
            bestActions: l.bestActions !== undefined ? l.bestActions : null,
            totalKeysUsed: l.totalKeysUsed || 0,
            wins: l.wins || 0,
            noWait: l.noWait || false,
            completedObjectives: l.completedObjectives || []
          };
        });
      }
      return {
        levels,
        overall: {
          ...def.overall,
          ...(data.overall || {}),
          failureReasons: { ...def.overall.failureReasons, ...((data.overall || {}).failureReasons || {}) },
          totalObjectivesCompleted: (data.overall && data.overall.totalObjectivesCompleted) || 0
        },
        achievements: data.achievements || def.achievements
      };
    }
  } catch (e) {}
  return defaultAchievementData();
}

function saveAchievements() {
  try {
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(achievementState));
  } catch (e) {}
}

function resetAchievements() {
  achievementState = defaultAchievementData();
  saveAchievements();
}

function refreshAchievementsIfOpen() {
  if (!achievementEl.classList.contains("hidden")) {
    renderAchievements();
  }
}

function calculateGameStats() {
  let turns = 0;
  let actions = 0;
  let keysUsed = 0;
  let waited = false;

  for (const snap of state.history) {
    const a = snap.action || "";
    if (a.includes("等待回合") || a.includes("等待")) {
      turns += 1;
      waited = true;
    }
    if (a.includes("移动") || a.includes("修复展柜") || a.includes("开门") || a.includes("推屏风")) {
      actions += 1;
    }
    if (a.includes("开门") || a.includes("用钥匙")) {
      keysUsed += 1;
    }
  }

  return {
    turns: Math.max(1, turns),
    actions: Math.max(1, actions),
    keysUsed,
    noWait: !waited
  };
}

function classifyFailureReason(reason) {
  if (reason.includes("手电反光") || reason.includes("发现了")) return "guard_sight";
  if (reason.includes("换班") || reason.includes("撞见")) return "guard_turn";
  return "other";
}

function updateStatsOnWin(levelIndex) {
  if (levelIndex < 0 || levelIndex >= levels.length) return;

  const stats = calculateGameStats();
  const key = String(levelIndex);

  if (!achievementState.levels[key]) {
    achievementState.levels[key] = {
      bestTurns: null,
      bestActions: null,
      totalKeysUsed: 0,
      wins: 0,
      noWait: false,
      completedObjectives: []
    };
  }

  const ls = achievementState.levels[key];
  if (!Array.isArray(ls.completedObjectives)) {
    ls.completedObjectives = [];
  }
  ls.wins += 1;
  ls.totalKeysUsed += stats.keysUsed;

  if (ls.bestTurns === null || stats.turns < ls.bestTurns) {
    ls.bestTurns = stats.turns;
  }
  if (ls.bestActions === null || stats.actions < ls.bestActions) {
    ls.bestActions = stats.actions;
  }
  if (stats.noWait) {
    ls.noWait = true;
  }

  const completedObj = evaluateObjectives(levelIndex);
  const prevObjCount = ls.completedObjectives.length;
  const objSet = new Set(ls.completedObjectives);
  completedObj.forEach(obj => objSet.add(obj));
  ls.completedObjectives = Array.from(objSet);
  const newObjCount = ls.completedObjectives.length - prevObjCount;

  achievementState.overall.totalWins += 1;
  achievementState.overall.totalKeysUsed += stats.keysUsed;
  achievementState.overall.totalActions += stats.actions;
  achievementState.overall.totalTurns += stats.turns;
  achievementState.overall.totalObjectivesCompleted += newObjCount;

  checkAchievements();
  saveAchievements();
  refreshAchievementsIfOpen();
}

function updateStatsOnFail(levelIndex, reason) {
  achievementState.overall.totalFailures += 1;
  const reasonKey = classifyFailureReason(reason);
  achievementState.overall.failureReasons[reasonKey] = (achievementState.overall.failureReasons[reasonKey] || 0) + 1;

  if (levelIndex >= 0 && levelIndex < levels.length) {
    const key = String(levelIndex);
    if (!achievementState.levels[key]) {
      achievementState.levels[key] = {
        bestTurns: null,
        bestActions: null,
        totalKeysUsed: 0,
        wins: 0,
        noWait: false,
        completedObjectives: []
      };
    }
  }

  saveAchievements();
  refreshAchievementsIfOpen();
}

function checkAchievements() {
  const unlock = (id) => {
    if (!achievementState.achievements[id]) {
      achievementState.achievements[id] = { unlocked: true, unlockedAt: Date.now() };
    }
  };

  const totalWins = achievementState.overall.totalWins;
  if (totalWins >= 1) unlock("first_win");

  const allLevelsPlayed = levels.every((_, i) => achievementState.levels[String(i)] && achievementState.levels[String(i)].wins > 0);
  if (allLevelsPlayed) unlock("all_levels");

  const anyNoWait = Object.values(achievementState.levels).some(l => l.noWait);
  if (anyNoWait) unlock("no_wait");

  const allNoWait = levels.length > 0 && levels.every((_, i) => achievementState.levels[String(i)] && achievementState.levels[String(i)].noWait);
  if (allNoWait) unlock("no_wait_all");

  const totalFailures = achievementState.overall.totalFailures;
  if (totalFailures >= 10 && totalWins >= 1) unlock("survivor");

  const lowKeyLevels = Object.values(achievementState.levels).filter(l => l.wins > 0).length;
  const totalKeys = achievementState.overall.totalKeysUsed;
  if (lowKeyLevels >= 3 && totalKeys <= 5) unlock("min_keys");

  const allBestTurns = levels.length > 0 && levels.every((_, i) => {
    const ls = achievementState.levels[String(i)];
    return ls && ls.bestTurns !== null && ls.wins >= 1;
  });
  if (allBestTurns) unlock("master");

  const totalObjectives = achievementState.overall.totalObjectivesCompleted;
  if (totalObjectives >= 1) unlock("first_objective");

  const anyAllObjectives = levels.some((_, i) => {
    const levelObj = getLevelObjectives(i);
    if (levelObj.length === 0) return false;
    const ls = achievementState.levels[String(i)];
    if (!ls || !ls.completedObjectives) return false;
    return levelObj.every(obj => ls.completedObjectives.includes(obj));
  });
  if (anyAllObjectives) unlock("all_objectives_one");

  const allAllObjectives = levels.length > 0 && levels.every((_, i) => {
    const levelObj = getLevelObjectives(i);
    if (levelObj.length === 0) return true;
    const ls = achievementState.levels[String(i)];
    if (!ls || !ls.completedObjectives) return false;
    return levelObj.every(obj => ls.completedObjectives.includes(obj));
  });
  if (allAllObjectives) unlock("all_objectives_all");
}

function openAchievement() {
  achievementEl.classList.remove("hidden");
  achievementBtn.classList.add("active");
  renderAchievements();
}

function closeAchievement() {
  achievementEl.classList.add("hidden");
  achievementBtn.classList.remove("active");
}

function renderAchievements() {
  renderLevelStats();
  renderOverallStats();
  renderAchievementList();
}

function renderLevelStats() {
  achievementLevelStatsEl.innerHTML = "";
  levels.forEach((level, index) => {
    const key = String(index);
    const ls = achievementState.levels[key];
    const levelObj = getLevelObjectives(index);
    const card = document.createElement("div");
    card.className = "level-stat-card";

    if (!ls || ls.wins === 0) {
      let objectivesHtml = "";
      if (levelObj.length > 0) {
        const objItems = levelObj.map(objType => {
          const def = OBJECTIVE_DEFS[objType];
          return `<span class="stat-objective incomplete" title="${def.desc}">${def.icon} ${def.name}</span>`;
        }).join("");
        objectivesHtml = `<div class="stat-objectives">${objItems}</div>`;
      }
      card.innerHTML = `
        <h4>关卡${level.name}</h4>
        <p class="not-played">尚未通关</p>
        ${objectivesHtml}
      `;
    } else {
      let objectivesHtml = "";
      if (levelObj.length > 0) {
        const completedCount = ls.completedObjectives ? ls.completedObjectives.length : 0;
        const objItems = levelObj.map(objType => {
          const def = OBJECTIVE_DEFS[objType];
          const isCompleted = ls.completedObjectives && ls.completedObjectives.includes(objType);
          return `<span class="stat-objective ${isCompleted ? 'completed' : 'incomplete'}" title="${def.desc}">${def.icon} ${def.name}</span>`;
        }).join("");
        objectivesHtml = `
          <div class="stat-objectives-header">
            展厅目标：<strong>${completedCount}/${levelObj.length}</strong>
          </div>
          <div class="stat-objectives">${objItems}</div>
        `;
      }
      card.innerHTML = `
        <h4>关卡${level.name}</h4>
        <p>通关次数：<strong>${ls.wins}</strong></p>
        <p>最少回合：<strong>${ls.bestTurns}</strong></p>
        <p>最少行动：<strong>${ls.bestActions}</strong></p>
        <p>累计使用钥匙：<strong>${ls.totalKeysUsed}</strong></p>
        <p>${ls.noWait ? '<span class="no-wait">✓ 无等待通关记录</span>' : '无等待通关：未达成'}</p>
        ${objectivesHtml}
      `;
    }
    achievementLevelStatsEl.appendChild(card);
  });
}

function renderOverallStats() {
  const o = achievementState.overall;
  const playedLevels = Object.values(achievementState.levels).filter(l => l.wins > 0).length;
  const winRate = o.totalWins + o.totalFailures > 0
    ? Math.round((o.totalWins / (o.totalWins + o.totalFailures)) * 100)
    : 0;

  let totalLevelObjectives = 0;
  levels.forEach((_, i) => {
    totalLevelObjectives += getLevelObjectives(i).length;
  });

  achievementOverallEl.innerHTML = `
    <div class="overall-stat-card">
      <span class="stat-label">已通关关卡</span>
      <span class="stat-value">${playedLevels}/${levels.length}</span>
    </div>
    <div class="overall-stat-card">
      <span class="stat-label">总通关次数</span>
      <span class="stat-value">${o.totalWins}</span>
    </div>
    <div class="overall-stat-card">
      <span class="stat-label">总失败次数</span>
      <span class="stat-value">${o.totalFailures}</span>
      <span class="stat-sub">胜率 ${winRate}%</span>
    </div>
    <div class="overall-stat-card">
      <span class="stat-label">展厅目标完成</span>
      <span class="stat-value">${o.totalObjectivesCompleted}/${totalLevelObjectives}</span>
    </div>
    <div class="overall-stat-card">
      <span class="stat-label">累计行动数</span>
      <span class="stat-value">${o.totalActions}</span>
    </div>
    <div class="overall-stat-card">
      <span class="stat-label">累计回合数</span>
      <span class="stat-value">${o.totalTurns}</span>
    </div>
    <div class="overall-stat-card">
      <span class="stat-label">累计使用钥匙</span>
      <span class="stat-value">${o.totalKeysUsed}</span>
    </div>
    <div class="overall-stat-card">
      <span class="stat-label">被发现失败</span>
      <span class="stat-value">${o.failureReasons.guard_sight || 0}</span>
      <span class="stat-sub">${FAILURE_REASONS.guard_sight}</span>
    </div>
    <div class="overall-stat-card">
      <span class="stat-label">换班撞见</span>
      <span class="stat-value">${o.failureReasons.guard_turn || 0}</span>
      <span class="stat-sub">${FAILURE_REASONS.guard_turn}</span>
    </div>
  `;
}

function renderAchievementList() {
  achievementListEl.innerHTML = "";
  ACHIEVEMENT_DEFS.forEach(def => {
    const unlocked = achievementState.achievements[def.id] && achievementState.achievements[def.id].unlocked;
    const item = document.createElement("div");
    item.className = `achievement-item ${unlocked ? "unlocked" : "locked"}`;
    item.innerHTML = `
      <div class="achievement-icon">${unlocked ? def.icon : "🔒"}</div>
      <div class="achievement-info">
        <div class="achievement-name">${def.name}</div>
        <div class="achievement-desc">${def.desc}</div>
      </div>
    `;
    achievementListEl.appendChild(item);
  });
}

function bindAchievementControls() {
  achievementBtn.addEventListener("click", () => {
    if (achievementEl.classList.contains("hidden")) {
      openAchievement();
    } else {
      closeAchievement();
    }
  });
  achievementCloseBtn.addEventListener("click", closeAchievement);
  achievementResetBtn.addEventListener("click", () => {
    if (confirm("确定要重置所有成就和统计记录吗？此操作不可撤销。")) {
      resetAchievements();
      renderAchievements();
    }
  });
}

// ============== 关卡诊断与求解系统 ==============

function diagnoseLevel(level) {
  const result = {
    solvable: false,
    checks: [],
    issues: [],
    warnings: [],
    solution: null
  };

  const { walls, doors, keys: keyItems, exhibits, guards, player, exit } = level;
  const mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
  const screens = mechanisms.screens || [];

  result.checks.push({ name: "基础要素", passed: true });

  if (!player) {
    result.issues.push("缺少玩家起点");
    result.checks[result.checks.length - 1].passed = false;
    return result;
  }
  if (!exit) {
    result.issues.push("缺少出口");
    result.checks[result.checks.length - 1].passed = false;
    return result;
  }
  if (exhibits.length === 0) {
    result.issues.push("至少需要一个展柜");
    result.checks[result.checks.length - 1].passed = false;
    return result;
  }

  const wallSet = new Set(walls);
  const playerKey = pointKey(player);
  const exitKey = pointKey(exit);

  if (wallSet.has(playerKey)) {
    result.issues.push("玩家起点在墙上");
    result.checks[result.checks.length - 1].passed = false;
  }
  if (wallSet.has(exitKey)) {
    result.issues.push("出口在墙上");
    result.checks[result.checks.length - 1].passed = false;
  }

  result.checks.push({ name: "出口可达性", passed: true });
  const reachAllDoorsOpen = bfsReachableWithScreens(walls, doors, player, false, screens);
  if (!reachAllDoorsOpen.has(exitKey)) {
    result.issues.push("出口不可达：即使所有门都打开，从玩家起点也无法到达出口");
    result.checks[result.checks.length - 1].passed = false;
  } else {
    const reachDoorsClosed = bfsReachableWithScreens(walls, doors, player, true, screens);
    if (!reachDoorsClosed.has(exitKey) && keyItems.length === 0 && doors.length > 0) {
      result.warnings.push("出口被门封锁，但没有钥匙");
    }
  }

  result.checks.push({ name: "展柜可修复性", passed: true });
  for (let i = 0; i < exhibits.length; i++) {
    const ex = exhibits[i];
    const exKey = pointKey(ex);
    if (wallSet.has(exKey)) {
      result.issues.push(`展柜${i + 1}在墙上，无法修复`);
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
      result.issues.push(`展柜${i + 1}无法邻接修复：周围没有可到达的相邻格子`);
      result.checks[result.checks.length - 1].passed = false;
    }
  }

  result.checks.push({ name: "钥匙可达性", passed: true });
  if (doors.length > 0 && keyItems.length === 0) {
    result.warnings.push("有门但没有钥匙，门可能无法打开");
  }

  for (let i = 0; i < keyItems.length; i++) {
    const key = keyItems[i];
    const keyK = pointKey(key);
    if (wallSet.has(keyK)) {
      result.issues.push(`钥匙${i + 1}在墙上`);
      result.checks[result.checks.length - 1].passed = false;
      continue;
    }

    const reachNoKeys = bfsReachableWithScreens(walls, doors, player, true, screens);
    if (!reachNoKeys.has(keyK)) {
      const reachWithKeys = bfsReachableWithScreens(walls, doors, player, false, screens);
      if (!reachWithKeys.has(keyK)) {
        result.issues.push(`钥匙${i + 1}被封死：无法到达该钥匙位置`);
        result.checks[result.checks.length - 1].passed = false;
      } else {
        result.warnings.push(`钥匙${i + 1}需要先打开其他门才能拿到，注意钥匙顺序`);
      }
    }
  }

  result.checks.push({ name: "巡逻视线分析", passed: true });
  if (guards.length > 0) {
    const cycleLen = getGuardCycleLength(guards);
    const alwaysBlocked = new Set();
    const allCells = [];
    for (let y = 0; y < BOARD_H; y++) {
      for (let x = 0; x < BOARD_W; x++) {
        allCells.push({ x, y });
      }
    }

    allCells.forEach(cell => {
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
      }
    });

    const playerOnPath = bfsReachableWithScreens(walls, doors, player, false, screens);
    const criticalPathCells = new Set();
    playerOnPath.forEach(ck => {
      if (alwaysBlocked.has(ck)) {
        criticalPathCells.add(ck);
      }
    });

    if (criticalPathCells.size > 0) {
      const exitBlocked = alwaysBlocked.has(exitKey);
      if (exitBlocked) {
        result.issues.push("巡逻视线永久封锁出口：出口位置始终在巡逻员视野内");
        result.checks[result.checks.length - 1].passed = false;
      }

      let allExhibitsBlocked = true;
      for (const ex of exhibits) {
        const exAdj = getAdjacentCells(ex).some(c => !alwaysBlocked.has(pointKey(c)) && reachAllDoorsOpen.has(pointKey(c)));
        if (exAdj) {
          allExhibitsBlocked = false;
          break;
        }
      }
      if (allExhibitsBlocked && exhibits.length > 0) {
        result.issues.push("巡逻视线永久封锁所有展柜的修复位置");
        result.checks[result.checks.length - 1].passed = false;
      }

      if (!exitBlocked && !allExhibitsBlocked && criticalPathCells.size > 0) {
        result.warnings.push(`有 ${criticalPathCells.size} 个格子始终在巡逻视野内，可能影响通行`);
      }
    }
  }

  result.checks.push({ name: "完整求解验证", passed: false });
  const solution = solveLevelDetailed(level);
  if (solution) {
    result.solvable = true;
    result.solution = solution;
    result.checks[result.checks.length - 1].passed = true;
  } else {
    result.issues.push("关卡无解：找不到合法的通关路线");
    result.checks[result.checks.length - 1].passed = false;

    if (guards.length > 0 && result.checks.filter(c => c.name !== "完整求解验证").every(c => c.passed)) {
      result.warnings.push("静态检查通过但动态无解，可能是巡逻时机问题导致无法通过");
    }
  }

  return result;
}

function getAdjacentCells(pos) {
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
}

function bfsReachableWithScreens(walls, doors, start, considerDoorsClosed, screens) {
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
}

function getGuardVisionAtStepWithScreensSimple(guards, step, walls, screens) {
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
}

function solveLevelDetailed(level) {
  const { walls, doors, keys: keyItems, exhibits, guards, player: startPos, exit } = level;
  const mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  const pressurePlates = mechanisms.pressurePlates || [];
  const screens = mechanisms.screens || [];
  const lights = mechanisms.lights || [];
  const cameras = mechanisms.cameras || [];

  const numExhibits = exhibits.length;
  const numDoors = doors.length;
  const numPlates = pressurePlates.length;
  const numLights = lights.length;
  const cycleLen = getGuardCycleLength(guards);

  function getCameraVisionForSolver(screenList, visionReduced, camerasDisabled) {
    const vision = new Set();
    if (camerasDisabled) return vision;
    const wallSet = new Set(walls);
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

  function stateKeyObj(s) {
    const exhibitMask = s.fixed.reduce((acc, f, i) => f ? acc | (1 << i) : acc, 0);
    const plateMask = s.plateTriggered.reduce((acc, t, i) => t ? acc | (1 << i) : acc, 0);
    const lightMask = s.lightsActive.reduce((acc, a, i) => a ? acc | (1 << i) : acc, 0);
    const doorsMask = s.doorsOpen.reduce((acc, o, i) => o ? acc | (1 << i) : acc, 0);
    const screenKey = s.screens.map(sc => `${sc.x},${sc.y}`).sort().join("|");
    return `${s.pos.x},${s.pos.y}|${s.keys}|${exhibitMask}|${s.step % cycleLen}|${s.ap}|${plateMask}|${lightMask}|${doorsMask}|${screenKey}|${s.visionReduced ? 1 : 0}|${s.camerasDisabled ? 1 : 0}|${s.cameraShutdownTurns || 0}`;
  }

  function advanceSolverLightAndCameraEffects(s) {
    s.visionReduced = s.pendingVisionReduction;
    s.pendingVisionReduction = false;
    if (s.cameraShutdownTurns > 0) {
      s.cameraShutdownTurns -= 1;
      s.camerasDisabled = s.cameraShutdownTurns > 0;
    }
  }

  function cloneSolverState(s) {
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
      path: s.path.map(p => ({ ...p })),
      actions: [...s.actions]
    };
  }

  function getVisionAtStepObj(step, screenList, visionReduced, camerasDisabled) {
    const vision = new Set();
    const wallSet = new Set(walls);
    const screenSet = new Set(screenList.map(s => pointKey(s)));
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
    const camVision = getCameraVisionForSolver(screenList, visionReduced, camerasDisabled);
    camVision.forEach(k => vision.add(k));
    return vision;
  }

  const visited = new Set();
  const initial = {
    pos: { ...startPos },
    keys: 0,
    keysTaken: new Array(keyItems.length).fill(false),
    doorsOpen: new Array(numDoors).fill(false),
    fixed: new Array(numExhibits).fill(false),
    plateTriggered: new Array(numPlates).fill(false),
    screens: screens.map(s => ({ ...s })),
    lightsActive: new Array(numLights).fill(false),
    visionReduced: false,
    pendingVisionReduction: false,
    camerasDisabled: false,
    cameraShutdownTurns: 0,
    step: 0,
    ap: 4,
    path: [{ ...startPos }],
    actions: ["开局"]
  };

  const initKey = stateKeyObj(initial);
  visited.add(initKey);

  const queue = [initial];
  let iterations = 0;
  const maxIterations = 100000;

  while (queue.length > 0 && iterations < maxIterations) {
    iterations++;
    const cur = queue.shift();

    const allFixed = cur.fixed.every(f => f);
    const atExit = samePoint(cur.pos, exit);
    if (allFixed && atExit) {
      return {
        steps: cur.path.length,
        path: cur.path,
        actions: cur.actions,
        totalActions: iterations
      };
    }

    const dirs = [
      [1, 0, "向右移动"],
      [-1, 0, "向左移动"],
      [0, 1, "向下移动"],
      [0, -1, "向上移动"]
    ];

    for (const [dx, dy, actionName] of dirs) {
      if (cur.ap <= 0) continue;
      const nx = cur.pos.x + dx;
      const ny = cur.pos.y + dy;
      if (nx < 0 || nx >= BOARD_W || ny < 0 || ny >= BOARD_H) continue;
      const newPos = { x: nx, y: ny };
      const pk = pointKey(newPos);
      if (walls.includes(pk)) continue;

      let ns = {
        pos: { ...newPos },
        keys: cur.keys,
        keysTaken: [...cur.keysTaken],
        doorsOpen: [...cur.doorsOpen],
        fixed: [...cur.fixed],
        plateTriggered: [...cur.plateTriggered],
        screens: cur.screens.map(sc => ({ ...sc })),
        lightsActive: [...cur.lightsActive],
        visionReduced: cur.visionReduced,
        pendingVisionReduction: cur.pendingVisionReduction,
        camerasDisabled: cur.camerasDisabled,
        cameraShutdownTurns: cur.cameraShutdownTurns,
        step: cur.step,
        ap: cur.ap - 1,
        path: [...cur.path, { ...newPos }],
        actions: [...cur.actions, actionName]
      };

      let actionLabel = actionName;

      const screenIdx = ns.screens.findIndex(sc => samePoint(sc, newPos));
      if (screenIdx >= 0) {
        const pushDest = { x: nx + dx, y: ny + dy };
        if (pushDest.x < 0 || pushDest.x >= BOARD_W || pushDest.y < 0 || pushDest.y >= BOARD_H) continue;
        if (walls.includes(pointKey(pushDest))) continue;
        const pushDoorIdx = doors.findIndex(d => samePoint(d, pushDest));
        if (pushDoorIdx >= 0 && !ns.doorsOpen[pushDoorIdx]) continue;
        if (ns.screens.some(sc => samePoint(sc, pushDest))) continue;
        if (exhibits.some(e => samePoint(e, pushDest))) continue;
        ns.screens[screenIdx] = { ...pushDest };
        actionLabel = "推屏风+" + actionLabel;
      }

      const doorIdx = doors.findIndex(d => d.x === nx && d.y === ny);
      if (doorIdx >= 0 && !ns.doorsOpen[doorIdx]) {
        if (ns.keys <= 0) continue;
        ns.keys -= 1;
        ns.doorsOpen[doorIdx] = true;
        actionLabel = "开门+" + actionLabel;
      }

      const vision = getVisionAtStepObj(cur.step, ns.screens, ns.visionReduced, ns.camerasDisabled);
      if (vision.has(pk)) continue;

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

      ns.actions[ns.actions.length - 1] = actionLabel;

      if (ns.ap <= 0) {
        const nextStep = (cur.step + 1) % cycleLen;
        const nextVisionState = cloneSolverState(ns);
        advanceSolverLightAndCameraEffects(nextVisionState);
        const nextVision = getVisionAtStepObj(nextStep, nextVisionState.screens, nextVisionState.visionReduced, nextVisionState.camerasDisabled);
        if (!nextVision.has(pk)) {
          ns.step = nextStep;
          ns.ap = 4;
          advanceSolverLightAndCameraEffects(ns);
          ns.actions[ns.actions.length - 1] = actionLabel + "+等待";
          const sk = stateKeyObj(ns);
          if (!visited.has(sk)) {
            visited.add(sk);
            const allF = ns.fixed.every(f => f);
            const atE = samePoint(ns.pos, exit);
            if (allF && atE) {
              return {
                steps: ns.path.length,
                path: ns.path,
                actions: ns.actions,
                totalActions: iterations
              };
            }
            queue.push(ns);
          }
        }
      } else {
        const sk = stateKeyObj(ns);
        if (!visited.has(sk)) {
          visited.add(sk);
          queue.push(ns);
        }
      }
    }

    for (let i = 0; i < numExhibits; i++) {
      if (cur.ap <= 0) continue;
      if (!cur.fixed[i] && isAdjacent(cur.pos, exhibits[i])) {
        const ns = {
          pos: { ...cur.pos },
          keys: cur.keys,
          keysTaken: [...cur.keysTaken],
          doorsOpen: [...cur.doorsOpen],
          fixed: [...cur.fixed],
          plateTriggered: [...cur.plateTriggered],
          screens: cur.screens.map(sc => ({ ...sc })),
          lightsActive: [...cur.lightsActive],
          visionReduced: cur.visionReduced,
          pendingVisionReduction: cur.pendingVisionReduction,
          camerasDisabled: cur.camerasDisabled,
          cameraShutdownTurns: cur.cameraShutdownTurns,
          step: cur.step,
          ap: cur.ap - 1,
          path: [...cur.path, { ...cur.pos }],
          actions: [...cur.actions, "修复展柜"]
        };
        ns.fixed[i] = true;

        if (ns.ap <= 0) {
          const nextStep = (cur.step + 1) % cycleLen;
          const nextVisionState = cloneSolverState(ns);
          advanceSolverLightAndCameraEffects(nextVisionState);
          const nextVision = getVisionAtStepObj(nextStep, nextVisionState.screens, nextVisionState.visionReduced, nextVisionState.camerasDisabled);
          const pk = pointKey(ns.pos);
          if (!nextVision.has(pk)) {
            ns.step = nextStep;
            ns.ap = 4;
            advanceSolverLightAndCameraEffects(ns);
            ns.actions[ns.actions.length - 1] = "修复展柜+等待";
            const sk = stateKeyObj(ns);
            if (!visited.has(sk)) {
              visited.add(sk);
              const allF = ns.fixed.every(f => f);
              const atE = samePoint(ns.pos, exit);
              if (allF && atE) {
                return {
                  steps: ns.path.length,
                  path: ns.path,
                  actions: ns.actions,
                  totalActions: iterations
                };
              }
              queue.push(ns);
            }
          }
        } else {
          const sk = stateKeyObj(ns);
          if (!visited.has(sk)) {
            visited.add(sk);
            queue.push(ns);
          }
        }
      }
    }

    {
      const nextStep = (cur.step + 1) % cycleLen;
      const nextVisionState = cloneSolverState(cur);
      advanceSolverLightAndCameraEffects(nextVisionState);
      const nextVision = getVisionAtStepObj(nextStep, nextVisionState.screens, nextVisionState.visionReduced, nextVisionState.camerasDisabled);
      const pk = pointKey(cur.pos);
      if (!nextVision.has(pk)) {
        const ns = {
          pos: { ...cur.pos },
          keys: cur.keys,
          keysTaken: [...cur.keysTaken],
          doorsOpen: [...cur.doorsOpen],
          fixed: [...cur.fixed],
          plateTriggered: [...cur.plateTriggered],
          screens: cur.screens.map(sc => ({ ...sc })),
          lightsActive: [...cur.lightsActive],
          visionReduced: cur.visionReduced,
          pendingVisionReduction: cur.pendingVisionReduction,
          camerasDisabled: cur.camerasDisabled,
          cameraShutdownTurns: cur.cameraShutdownTurns,
          step: nextStep,
          ap: 4,
          path: [...cur.path, { ...cur.pos }],
          actions: [...cur.actions, "等待回合"]
        };
        advanceSolverLightAndCameraEffects(ns);
        const sk = stateKeyObj(ns);
        if (!visited.has(sk)) {
          visited.add(sk);
          queue.push(ns);
        }
      }
    }
  }

  return null;
}

init();
