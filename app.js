const boardEl = document.getElementById("board");
const logEl = document.getElementById("log");
const resultEl = document.getElementById("result");
const levelButtonsEl = document.getElementById("levelButtons");
const levelNameEl = document.getElementById("levelName");
const apEl = document.getElementById("ap");
const keysEl = document.getElementById("keys");
const fixedEl = document.getElementById("fixed");
const alertLevelEl = document.getElementById("alertLevel");

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
const achievementChallengePacksEl = document.getElementById("achievementChallengePacks");
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

function autoSave() {
  if (!state || state.done) {
    autoSaveClear();
    return;
  }
  if (state.levelIndex === -2) return;
  if (!state.history || state.history.length <= 1) return;
  try {
    let challengePackInfo = null;
    if (challengePackState && challengePackState.playing) {
      const pack = getChallengePack(challengePackState.currentPackId);
      challengePackInfo = {
        packId: challengePackState.currentPackId,
        levelIndex: challengePackState.currentLevelIndex,
        packName: pack ? pack.name : ""
      };
    }
    const data = {
      version: 1,
      timestamp: Date.now(),
      levelIndex: state.levelIndex,
      customLevelSource: customLevelSource,
      challengePackInfo: challengePackInfo,
      state: snapshotState("autosave"),
      history: state.history.map(h => JSON.parse(JSON.stringify(h))),
      tutorialState: {
        active: tutorialState.active,
        currentStep: tutorialState.currentStep,
        hasWaited: tutorialState.hasWaited,
        wrongAttempts: tutorialState.wrongAttempts
      },
      hintState: {
        active: hintState.active,
        path: hintState.path.map(p => ({ ...p })),
        actionLabels: [...hintState.actionLabels]
      },
      gameplayMetrics: { ...gameplayMetrics }
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function autoSaveClear() {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch (e) {}
}

function autoSaveLoad() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || !data.state) {
      autoSaveClear();
      return null;
    }
    return data;
  } catch (e) {
    autoSaveClear();
    return null;
  }
}

function getAutosaveDescription(data) {
  if (!data) return "";
  const li = data.levelIndex;
  const name = data.state.level ? data.state.level.name : "";
  if (li === -5) {
    const cpi = data.challengePackInfo;
    return "挑战包模式 — " + (cpi ? cpi.packName : "") + " 第" + (cpi ? (cpi.levelIndex + 1) : 1) + "关";
  }
  if (li === -3) return "每日挑战 — " + name;
  if (li === -1) return "自定义试玩 — " + name;
  if (li >= 0) return "关卡" + name;
  return name;
}

function getAutosaveTimeDesc(data) {
  if (!data || !data.timestamp) return "";
  const diff = Date.now() - data.timestamp;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return Math.floor(diff / 60000) + "分钟前";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "小时前";
  return Math.floor(diff / 86400000) + "天前";
}

function restoreFromAutosave(data) {
  if (!data || !data.state) return false;
  try {
    const snap = data.state;
    if (data.levelIndex === -5 && data.challengePackInfo) {
      const cpi = data.challengePackInfo;
      if (!cpi || !cpi.packId) return false;
      challengePackState.currentPackId = cpi.packId;
      challengePackState.currentLevelIndex = cpi.levelIndex;
      challengePackState.playing = true;
      const pack = getChallengePack(cpi.packId);
      if (!pack || !pack.levels[cpi.levelIndex]) return false;
      customLevelSource = JSON.parse(JSON.stringify(pack.levels[cpi.levelIndex].level));
      state = freshStateFromLevel(customLevelSource);
      state.levelIndex = -5;
    } else if (data.levelIndex === -1 || data.levelIndex === -3) {
      if (!data.customLevelSource) return false;
      customLevelSource = JSON.parse(JSON.stringify(data.customLevelSource));
      state = freshStateFromLevel(customLevelSource);
      if (data.levelIndex === -3) state.levelIndex = -3;
    } else if (data.levelIndex >= 0) {
      state = freshState(data.levelIndex);
    } else {
      return false;
    }
    restoreStateFromSnapshot(snap);
    state.history = data.history ? data.history.map(h => JSON.parse(JSON.stringify(h))) : [];
    if (data.gameplayMetrics) {
      Object.assign(gameplayMetrics, data.gameplayMetrics);
    }
    if (data.hintState) {
      hintState.active = data.hintState.active;
      hintState.path = data.hintState.path.map(p => ({ ...p }));
      hintState.actionLabels = [...data.hintState.actionLabels];
    }
    resultEl.classList.add("hidden");
    resultEl.classList.remove("daily-result-style");
    tutorialState.active = false;
    tutorialHintEl.classList.add("hidden");
    tutorialBtn.classList.remove("active");
    if (data.levelIndex === -1) {
      toggleBackToEditorBtn(true);
    } else {
      toggleBackToEditorBtn(false);
    }
    if (data.levelIndex === -5) {
      renderCpPlayHeader();
    }
    render();
    if (data.levelIndex === -3) {
      renderDailyInfo();
      dailyBtn.classList.add("active");
    }
    autoSave();
    return true;
  } catch (e) {
    return false;
  }
}

function showAutosaveRestoreDialog(data) {
  const overlay = document.getElementById("autosaveOverlay");
  if (!overlay) return;
  const desc = getAutosaveDescription(data);
  const time = getAutosaveTimeDesc(data);
  const actions = data.state.level && data.state.level.exhibits
    ? data.state.level.exhibits.filter(e => e.fixed).length + "/" + data.state.level.exhibits.length
    : "-";
  const alertNames = ["平静", "警觉", "怀疑", "警戒"];
  const alertName = alertNames[data.state.alertLevel] || "平静";
  document.getElementById("autosaveInfo").innerHTML =
    `<div class="autosave-detail"><span class="autosave-label">进度</span><span class="autosave-value">${desc}</span></div>` +
    `<div class="autosave-detail"><span class="autosave-label">修复</span><span class="autosave-value">${actions}</span></div>` +
    `<div class="autosave-detail"><span class="autosave-label">警觉</span><span class="autosave-value">${alertName}</span></div>` +
    `<div class="autosave-detail"><span class="autosave-label">保存时间</span><span class="autosave-value">${time}</span></div>`;
  overlay.classList.remove("hidden");
}

function dismissAutosaveDialog() {
  const overlay = document.getElementById("autosaveOverlay");
  if (overlay) overlay.classList.add("hidden");
  autoSaveClear();
}

function acceptAutosaveRestore() {
  const overlay = document.getElementById("autosaveOverlay");
  if (overlay) overlay.classList.add("hidden");
  const data = autoSaveLoad();
  if (data) {
    if (!restoreFromAutosave(data)) {
      autoSaveClear();
    }
  }
}

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

  autoSave();
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
  clearChallengePackPlayState();
  customLevelSource = JSON.parse(JSON.stringify(levelData));
  autoSaveClear();
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
  recordHistory("开局");
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
  autoSaveClear();
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
  migrateOldStorageIfNeeded();
  renderLevelButtons();
  state = freshState(0);
  bindControls();
  bindReplayControls();
  bindAchievementControls();
  bindChallengePackControls();
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
  const autosaveAcceptBtn = document.getElementById("autosaveAcceptBtn");
  const autosaveDismissBtn = document.getElementById("autosaveDismissBtn");
  if (autosaveAcceptBtn) {
    autosaveAcceptBtn.addEventListener("click", acceptAutosaveRestore);
  }
  if (autosaveDismissBtn) {
    autosaveDismissBtn.addEventListener("click", dismissAutosaveDialog);
  }
  recordHistory("开局");
  render();
  renderDailyInfo();
  window.addEventListener("beforeunload", () => {
    autoSave();
  });
  const saved = autoSaveLoad();
  if (saved && saved.state && !saved.state.done && saved.history && saved.history.length > 1) {
    showAutosaveRestoreDialog(saved);
  }
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
  clearChallengePackPlayState();
  customLevelSource = null;
  autoSaveClear();
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
  if (challengePackState && challengePackState.playing) {
    loadChallengePackLevel();
    return;
  }
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
    autoSave();
    return;
  }
  recordHistory(action);
  autoSave();
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
    autoSave();
    return;
  }
  recordHistory("修复展柜");
  autoSave();
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
  autoSave();
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
  autoSaveClear();

  if (updateChallengePackProgressOnWin()) {
    return;
  }

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
  autoSaveClear();
  gameplayMetrics.hasRetried = true;

  if (challengePackState && challengePackState.playing) {
    updateChallengePackStatsOnFail(reason);

    resultEl.innerHTML = `
      <h2>行动失败</h2>
      <p>${reason}</p>
      <p>挑战包：${escapeCpHtml(challengePackState.currentPackId ? (getChallengePack(challengePackState.currentPackId)?.name || "") : "")} - 第 ${challengePackState.currentLevelIndex + 1} 关</p>
      <button id="failRetryBtn" type="button">重试本关</button>
      <button id="failCpBackBtn" type="button" class="retry-stars-btn">返回挑战包列表</button>
      <button id="replayBtn" type="button" class="replay-trigger">查看本局回放</button>
    `;
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
      loadChallengePackLevel();
    });
    const backBtn = document.getElementById("failCpBackBtn");
    if (backBtn) backBtn.addEventListener("click", () => {
      resultEl.classList.add("hidden");
      const wrap = document.querySelector(".cp-play-header-wrap");
      if (wrap) wrap.remove();
      challengePackState.playing = false;
      challengePackState.currentPackId = null;
      challengePackState.currentLevelIndex = 0;
      openChallengePackPanel();
    });
    render();
    return;
  }

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
  clearChallengePackPlayState();
  const dateKey = getDateKey();
  const level = generateDailyLevel(dateKey);
  customLevelSource = JSON.parse(JSON.stringify(level));
  autoSaveClear();
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

function searchHintPath() {
  const { walls, doors, keys: keyItems, exhibits, guards, exit } = state.level;

  const currentDoorsOpen = doors.map(d => d.open);
  const currentKeysTaken = keyItems.map(k => k.taken);
  const currentFixed = exhibits.map(e => e.fixed);
  const mechanisms = state.level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  const pressurePlates = mechanisms.pressurePlates || [];
  const screens = mechanisms.screens || [];
  const lights = mechanisms.lights || [];

  const currentPlateTriggered = pressurePlates.map(p => p.triggered);
  const currentScreens = screens.map(s => ({ ...s }));
  const currentLightsActive = lights.map(l => l.active);

  const allExhibitsFixedNow = currentFixed.every(f => f);
  const atExitNow = samePoint(state.player, exit);
  if (allExhibitsFixedNow && atExitNow) {
    return { path: [{ ...state.player }], actionLabels: ["已完成"] };
  }

  const startState = {
    player: { ...state.player },
    keys: state.keys,
    keysTaken: [...currentKeysTaken],
    doorsOpen: [...currentDoorsOpen],
    fixed: [...currentFixed],
    plateTriggered: [...currentPlateTriggered],
    screens: [...currentScreens],
    lightsActive: [...currentLightsActive],
    visionReduced: state.visionReduced,
    pendingVisionReduction: state.pendingVisionReduction,
    cameraShutdownTurns: state.cameraShutdownTurns || 0,
    alertLevel: state.alertLevel,
    ap: state.ap,
    step: 0,
    guards: state.level.guards,
    openedDoors: state.level.openedDoors || []
  };

  const result = unifiedSolveLevel(state.level, {
    startState: startState,
    maxIterations: 300000,
    mode: 'hint'
  });

  if (result && result.solvable && result.path && result.path.length > 1) {
    return {
      path: result.path,
      actionLabels: result.actions
    };
  }

  return null;
}

// ============== 成就与统计系统 ==============

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
  if (levelIndex < 0 || levelIndex >= levels.length) return;

  achievementState.overall.totalFailures += 1;
  const reasonKey = classifyFailureReason(reason);
  achievementState.overall.failureReasons[reasonKey] = (achievementState.overall.failureReasons[reasonKey] || 0) + 1;

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
  renderChallengePackStats();
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

function renderChallengePackStats() {
  if (!achievementChallengePacksEl) return;

  const packs = loadChallengePacks();
  const progress = loadChallengePackProgress();

  if (packs.length === 0) {
    achievementChallengePacksEl.innerHTML = `
      <p class="cp-stats-empty">暂无挑战包记录，去创作你的第一个挑战包吧！</p>
    `;
    return;
  }

  let totalWins = 0;
  let totalFailures = 0;
  let totalStars = 0;
  let completedPacks = 0;

  packs.forEach(pack => {
    const p = progress[pack.id];
    if (p) {
      totalStars += p.totalStars || 0;
      if (p.completed) completedPacks += 1;
      if (p.overall) {
        totalWins += p.overall.totalWins || 0;
        totalFailures += p.overall.totalFailures || 0;
      }
    }
  });

  const maxTotalStars = packs.reduce((sum, pack) => sum + pack.levels.length * 3, 0);
  const totalLevels = packs.reduce((sum, pack) => sum + pack.levels.length, 0);

  achievementChallengePacksEl.innerHTML = `
    <div class="cp-stats-overview">
      <div class="overall-stat-card">
        <span class="stat-label">挑战包数量</span>
        <span class="stat-value">${packs.length}</span>
      </div>
      <div class="overall-stat-card">
        <span class="stat-label">已通关挑战包</span>
        <span class="stat-value">${completedPacks}/${packs.length}</span>
      </div>
      <div class="overall-stat-card">
        <span class="stat-label">总星数</span>
        <span class="stat-value">${totalStars}/${maxTotalStars} ⭐</span>
      </div>
      <div class="overall-stat-card">
        <span class="stat-label">总关卡数</span>
        <span class="stat-value">${totalLevels}</span>
      </div>
      <div class="overall-stat-card">
        <span class="stat-label">总通关次数</span>
        <span class="stat-value">${totalWins}</span>
      </div>
      <div class="overall-stat-card">
        <span class="stat-label">总失败次数</span>
        <span class="stat-value">${totalFailures}</span>
      </div>
    </div>
    <div class="cp-stats-list">
      ${packs.slice(0, 6).map(pack => {
        const p = progress[pack.id] || { totalStars: 0, completed: false };
        const levelCount = pack.levels.length;
        const stars = p.totalStars || 0;
        const maxStars = levelCount * 3;
        const pct = levelCount > 0 ? Math.round((stars / maxStars) * 100) : 0;
        return `
          <div class="cp-stat-card ${p.completed ? "completed" : ""}">
            <div class="cp-stat-card-header">
              <span class="cp-stat-card-name">${escapeCpHtml(pack.name)}</span>
              <span class="cp-stat-card-stars">${stars}/${maxStars} ⭐</span>
            </div>
            <div class="cp-card-progress"><div class="cp-card-progress-fill" style="width: ${pct}%"></div></div>
            <div class="cp-stat-card-meta">
              <span>${levelCount} 关</span>
              <span>${p.completed ? "✓ 已通关" : "未通关"}</span>
            </div>
          </div>
        `;
      }).join("")}
    </div>
    ${packs.length > 6 ? `<p class="cp-stats-more">还有 ${packs.length - 6} 个挑战包…</p>` : ""}
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

// ============== 创作挑战包系统 ==============

const challengePackPanelEl = document.getElementById("challengePackPanel");
const challengePackContentEl = document.getElementById("challengePackContent");
const challengePackBtnEl = document.getElementById("challengePackBtn");
const challengePackCloseBtn = document.getElementById("challengePackCloseBtn");
const challengePackImportBtn = document.getElementById("challengePackImportBtn");

let challengePackState = {
  currentPackId: null,
  currentLevelIndex: 0,
  playing: false,
  expandedPackId: null
};

function clearChallengePackPlayState() {
  if (!challengePackState) return;
  challengePackState.playing = false;
  challengePackState.currentPackId = null;
  challengePackState.currentLevelIndex = 0;
  const wrap = document.querySelector(".cp-play-header-wrap");
  if (wrap) wrap.remove();
}

function defaultChallengePack() {
  return {
    id: "cp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    name: "新挑战包",
    description: "",
    author: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: CHALLENGE_PACK_FORMAT_VERSION,
    levels: []
  };
}

function loadChallengePacks() {
  try {
    const raw = localStorage.getItem(CHALLENGE_PACK_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map(pack => ({
      ...defaultChallengePack(),
      ...pack,
      levels: Array.isArray(pack.levels) ? pack.levels : []
    }));
  } catch (e) {
    return [];
  }
}

function saveChallengePacks(packs) {
  try {
    localStorage.setItem(CHALLENGE_PACK_STORAGE_KEY, JSON.stringify(packs));
    return true;
  } catch (e) {
    alert("保存失败，存储空间不足");
    return false;
  }
}

function getChallengePack(packId) {
  const packs = loadChallengePacks();
  return packs.find(p => p.id === packId) || null;
}

function saveChallengePack(pack) {
  const packs = loadChallengePacks();
  pack.updatedAt = Date.now();
  const idx = packs.findIndex(p => p.id === pack.id);
  if (idx !== -1) {
    packs[idx] = pack;
  } else {
    packs.push(pack);
  }
  return saveChallengePacks(packs);
}

function deleteChallengePack(packId) {
  const packs = loadChallengePacks().filter(p => p.id !== packId);
  saveChallengePacks(packs);
  const progress = loadChallengePackProgress();
  delete progress[packId];
  saveChallengePackProgress(progress);
}

function loadChallengePackProgress() {
  try {
    const raw = localStorage.getItem(CHALLENGE_PACK_PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveChallengePackProgress(progress) {
  try {
    localStorage.setItem(CHALLENGE_PACK_PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch (e) {
    return false;
  }
}

function getPackProgress(packId) {
  const all = loadChallengePackProgress();
  if (!all[packId]) {
    all[packId] = {
      levels: {},
      completed: false,
      totalStars: 0,
      lastPlayedAt: null,
      overall: {
        totalWins: 0,
        totalFailures: 0,
        totalActions: 0,
        totalTurns: 0,
        failureReasons: {}
      }
    };
    saveChallengePackProgress(all);
  }
  return all[packId];
}

function getPackLevelProgress(packId, levelIndex) {
  const progress = getPackProgress(packId);
  const key = String(levelIndex);
  if (!progress.levels[key]) {
    progress.levels[key] = {
      completed: false,
      bestActions: null,
      bestTurns: null,
      bestStars: 0,
      wins: 0,
      failures: 0,
      noWait: false,
      replay: null
    };
  }
  return progress.levels[key];
}

function savePackLevelProgress(packId, levelIndex, levelProgress) {
  const all = loadChallengePackProgress();
  if (!all[packId]) {
    all[packId] = {
      levels: {},
      completed: false,
      totalStars: 0,
      lastPlayedAt: null,
      overall: {
        totalWins: 0,
        totalFailures: 0,
        totalActions: 0,
        totalTurns: 0,
        failureReasons: {}
      }
    };
  }
  all[packId].levels[String(levelIndex)] = levelProgress;
  all[packId].lastPlayedAt = Date.now();
  const pack = getChallengePack(packId);
  if (pack) {
    let totalStars = 0;
    let allCompleted = pack.levels.length > 0;
    for (let i = 0; i < pack.levels.length; i++) {
      const lp = all[packId].levels[String(i)];
      if (lp) {
        totalStars += lp.bestStars || 0;
        if (!lp.completed) allCompleted = false;
      } else {
        allCompleted = false;
      }
    }
    all[packId].totalStars = totalStars;
    all[packId].completed = allCompleted;
  }
  saveChallengePackProgress(all);
}

function isPackLevelUnlocked(packId, levelIndex) {
  if (levelIndex === 0) return true;
  const prevProgress = getPackLevelProgress(packId, levelIndex - 1);
  return prevProgress.completed;
}

function calculatePackStars(currentActions, targetActions, hasRetried, hintsUsedTotal) {
  const target = targetActions || 20;
  if (!hasRetried && hintsUsedTotal === 0 && currentActions <= Math.ceil(target * 1.2)) return 3;
  if (!hasRetried && hintsUsedTotal <= 1 && currentActions <= Math.ceil(target * 1.5)) return 2;
  if (hintsUsedTotal === 0 && currentActions <= Math.ceil(target * 1.8)) return 2;
  return 1;
}

function renderChallengePackPanel() {
  const packs = loadChallengePacks();
  const sortedPacks = [...packs].sort((a, b) => b.updatedAt - a.updatedAt);

  if (sortedPacks.length === 0) {
    challengePackContentEl.innerHTML = `
      <div class="cp-empty">
        <div class="cp-empty-icon">📦</div>
        <div class="cp-empty-title">还没有创作挑战包</div>
        <div class="cp-empty-desc">打开关卡编辑器，创建自定义关卡并组织成挑战包，或导入他人分享的挑战包</div>
        <button id="cpEmptyCreateBtn" type="button">✨ 打开编辑器创建</button>
      </div>
    `;
    const btn = document.getElementById("cpEmptyCreateBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        closeChallengePackPanel();
        if (typeof toggleEditor === "function") toggleEditor();
      });
    }
    return;
  }

  challengePackContentEl.innerHTML = sortedPacks.map(pack => {
    const progress = getPackProgress(pack.id);
    const totalLevels = pack.levels.length;
    const completedLevels = Object.values(progress.levels).filter(l => l.completed).length;
    const totalStars = progress.totalStars || 0;
    const maxStars = totalLevels * 3;
    const pct = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
    const isCompleted = progress.completed;
    const isExpanded = challengePackState.expandedPackId === pack.id;
    const lastPlayed = progress.lastPlayedAt ? new Date(progress.lastPlayedAt) : null;
    const lastPlayedStr = lastPlayed ? `${lastPlayed.getMonth() + 1}/${lastPlayed.getDate()}` : "未玩过";
    const overall = progress.overall || { totalWins: 0, totalFailures: 0 };

    const starsStr = totalStars > 0
      ? Array.from({ length: 3 }, (_, i) => i < Math.ceil(totalStars / Math.max(1, totalLevels)) ? "★" : "☆").join("")
      : "";

    let levelsHtml = "";
    if (isExpanded && pack.levels.length > 0) {
      levelsHtml = `<div class="cp-card-levels">
        <div class="cp-card-levels-title">关卡详情</div>
        <div class="cp-level-list">
          ${pack.levels.map((level, idx) => {
            const lp = progress.levels[String(idx)];
            const levelCompleted = lp && lp.completed;
            const levelStars = lp ? lp.bestStars || 0 : 0;
            const hasReplay = lp && lp.replay && lp.replay.length > 0;
            const unlocked = isPackLevelUnlocked(pack.id, idx);
            const starDisplay = levelStars > 0
              ? Array.from({ length: 3 }, (_, i) => i < levelStars ? "★" : "☆").join("")
              : "☆☆☆";
            return `
              <div class="cp-level-row ${levelCompleted ? "completed" : (unlocked ? "unlocked" : "locked")}">
                <span class="cp-level-num">${idx + 1}</span>
                <span class="cp-level-name">${escapeCpHtml(level.name || `关卡 ${idx + 1}`)}</span>
                <span class="cp-level-stars">${starDisplay}</span>
                <span class="cp-level-actions">
                  ${hasReplay ? `<button type="button" class="cp-btn-replay" data-pack-id="${pack.id}" data-level-index="${idx}" title="查看最佳回放">🎬 回放</button>` : ""}
                </span>
              </div>
            `;
          }).join("")}
        </div>
        <div class="cp-card-stats-summary">
          <span>总通关：${overall.totalWins || 0}</span>
          <span>总失败：${overall.totalFailures || 0}</span>
          <span>胜率：${overall.totalWins + overall.totalFailures > 0 ? Math.round((overall.totalWins / (overall.totalWins + overall.totalFailures)) * 100) : 0}%</span>
        </div>
      </div>`;
    }

    return `
      <div class="cp-card ${isCompleted ? "completed" : "unlocked"} ${isExpanded ? "expanded" : ""}" data-pack-id="${pack.id}">
        <div class="cp-card-header">
          <div>
            <div class="cp-card-title">${escapeCpHtml(pack.name)}</div>
            ${pack.author ? `<div class="cp-card-author">作者：${escapeCpHtml(pack.author)}</div>` : ""}
          </div>
          <div class="cp-card-stars">${starsStr}${totalStars > 0 ? ` ${totalStars}/${maxStars}` : ""}</div>
        </div>
        <div class="cp-card-body">
          <p class="cp-card-desc">${escapeCpHtml(pack.description) || "（暂无描述）"}</p>
          <div class="cp-card-progress"><div class="cp-card-progress-fill" style="width: ${pct}%"></div></div>
          <div class="cp-card-meta">
            <span>关卡 ${completedLevels}/${totalLevels}</span>
            <span>上次：${lastPlayedStr}</span>
            <span class="cp-expand-hint">${isExpanded ? "点击收起 ▲" : "点击展开 ▼"}</span>
          </div>
        </div>
        ${levelsHtml}
        <div class="cp-card-actions">
          <button type="button" class="cp-btn-play" data-action="play" data-pack-id="${pack.id}">▶ 开始游玩</button>
          <button type="button" class="cp-btn-edit" data-action="edit" data-pack-id="${pack.id}">✏️ 编辑</button>
          <button type="button" class="cp-btn-delete" data-action="delete" data-pack-id="${pack.id}">🗑</button>
        </div>
      </div>
    `;
  }).join("");

  challengePackContentEl.querySelectorAll(".cp-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      const packId = card.dataset.packId;
      if (challengePackState.expandedPackId === packId) {
        challengePackState.expandedPackId = null;
      } else {
        challengePackState.expandedPackId = packId;
      }
      renderChallengePackPanel();
    });
  });

  challengePackContentEl.querySelectorAll(".cp-btn-play").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      startChallengePack(btn.dataset.packId);
    });
  });
  challengePackContentEl.querySelectorAll(".cp-btn-edit").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof openChallengePackEditor === "function") {
        openChallengePackEditor(btn.dataset.packId);
      }
    });
  });
  challengePackContentEl.querySelectorAll(".cp-btn-delete").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pack = getChallengePack(btn.dataset.packId);
      if (pack && confirm(`确定要删除挑战包"${pack.name}"吗？进度也会一并删除，此操作不可撤销。`)) {
        deleteChallengePack(btn.dataset.packId);
        renderChallengePackPanel();
      }
    });
  });
  challengePackContentEl.querySelectorAll(".cp-btn-replay").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const packId = btn.dataset.packId;
      const levelIndex = parseInt(btn.dataset.levelIndex, 10);
      openChallengePackReplay(packId, levelIndex);
    });
  });
}

function escapeCpHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function openChallengePackPanel() {
  challengePackPanelEl.classList.remove("hidden");
  challengePackBtnEl.classList.add("active");
  if (!chapterPanelEl.classList.contains("hidden")) closeChapterPanel();
  closeAchievement();
  if (!editorState || !editorState.isOpen) {
  } else if (typeof toggleEditor === "function") {
    toggleEditor();
  }
  renderChallengePackPanel();
}

function closeChallengePackPanel() {
  challengePackPanelEl.classList.add("hidden");
  challengePackBtnEl.classList.remove("active");
}

function startChallengePack(packId) {
  const pack = getChallengePack(packId);
  if (!pack || pack.levels.length === 0) {
    alert("该挑战包为空，请先添加关卡");
    return;
  }
  challengePackState.currentPackId = packId;
  challengePackState.playing = true;
  let startIndex = 0;
  for (let i = 0; i < pack.levels.length; i++) {
    if (!isPackLevelUnlocked(packId, i)) break;
    const lp = getPackLevelProgress(packId, i);
    if (!lp.completed) {
      startIndex = i;
      break;
    }
    startIndex = i + 1;
  }
  if (startIndex >= pack.levels.length) startIndex = 0;
  challengePackState.currentLevelIndex = startIndex;
  closeChallengePackPanel();
  loadChallengePackLevel();
}

function loadChallengePackLevel() {
  const pack = getChallengePack(challengePackState.currentPackId);
  if (!pack) return;
  const levelEntry = pack.levels[challengePackState.currentLevelIndex];
  if (!levelEntry) return;

  customLevelSource = JSON.parse(JSON.stringify(levelEntry.level));
  state = freshStateFromLevel(customLevelSource);
  state.levelIndex = -5;
  resetGameplayMetrics();
  initObjectiveTracking();
  resultEl.classList.add("hidden");
  resultEl.classList.remove("daily-result-style");
  autoSaveClear();
  toggleBackToEditorBtn(false);
  tutorialState.active = false;
  tutorialHintEl.classList.add("hidden");
  tutorialBtn.classList.remove("active");
  dailyBtn.classList.remove("active");
  dailyInfo && (dailyInfo.innerHTML = "");

  recordHistory("开局");
  renderCpPlayHeader();
  render();
}

function renderCpPlayHeader() {
  const pack = getChallengePack(challengePackState.currentPackId);
  if (!pack) return;
  const existing = document.querySelector(".cp-play-header-wrap");
  if (existing) existing.remove();

  const gameSection = document.querySelector(".game");
  if (!gameSection) return;

  const wrapper = document.createElement("div");
  wrapper.className = "cp-play-header-wrap";
  wrapper.innerHTML = `
    <div class="cp-play-header">
      <div class="cp-play-info">
        <span class="cp-play-pack-name">🎁 ${escapeCpHtml(pack.name)}</span>
        <span class="cp-play-level-nav">
          关卡 <span class="cp-play-level-index">${challengePackState.currentLevelIndex + 1}</span>
          / ${pack.levels.length}
          ${pack.levels[challengePackState.currentLevelIndex] ? `· ${escapeCpHtml(pack.levels[challengePackState.currentLevelIndex].name)}` : ""}
        </span>
      </div>
      <button id="cpPlayExitBtn" type="button" class="cp-play-exit-btn">退出挑战包</button>
    </div>
  `;
  gameSection.parentNode.insertBefore(wrapper, gameSection);

  const exitBtn = document.getElementById("cpPlayExitBtn");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      if (confirm("确定要退出挑战包吗？当前进度会保存。")) {
        exitChallengePack();
      }
    });
  }
}

function exitChallengePack() {
  challengePackState.playing = false;
  challengePackState.currentPackId = null;
  challengePackState.currentLevelIndex = 0;
  const wrap = document.querySelector(".cp-play-header-wrap");
  if (wrap) wrap.remove();
  autoSaveClear();
  loadLevel(0);
}

function updateChallengePackProgressOnWin() {
  if (!challengePackState.playing || !challengePackState.currentPackId) return false;

  const packId = challengePackState.currentPackId;
  const levelIndex = challengePackState.currentLevelIndex;
  const pack = getChallengePack(packId);
  if (!pack) return false;

  const levelEntry = pack.levels[levelIndex];
  const targetActions = levelEntry ? levelEntry.targetActions : 20;
  const stats = calculateGameStats();
  const stars = calculatePackStars(
    gameplayMetrics.currentActions,
    targetActions,
    gameplayMetrics.hasRetried,
    gameplayMetrics.hintsUsedTotal
  );

  const lp = getPackLevelProgress(packId, levelIndex);
  const prevStars = lp.bestStars || 0;
  const isNewBest = stars > prevStars;

  lp.completed = true;
  lp.wins = (lp.wins || 0) + 1;
  if (lp.bestActions === null || gameplayMetrics.currentActions < lp.bestActions) {
    lp.bestActions = gameplayMetrics.currentActions;
  }
  if (lp.bestTurns === null || stats.turns < lp.bestTurns) {
    lp.bestTurns = stats.turns;
  }
  if (stars > (lp.bestStars || 0)) {
    lp.bestStars = stars;
  }
  if (stats.noWait) {
    lp.noWait = true;
  }
  try {
    const hs = JSON.parse(JSON.stringify(state.history));
    if (hs.length > 2) lp.replay = hs.slice(0, 300);
  } catch (e) {}

  savePackLevelProgress(packId, levelIndex, lp);

  const allProgress = loadChallengePackProgress();
  if (allProgress[packId]) {
    if (!allProgress[packId].overall) {
      allProgress[packId].overall = {
        totalWins: 0,
        totalFailures: 0,
        totalActions: 0,
        totalTurns: 0,
        failureReasons: {}
      };
    }
    allProgress[packId].overall.totalWins += 1;
    allProgress[packId].overall.totalActions += gameplayMetrics.currentActions;
    allProgress[packId].overall.totalTurns += stats.turns;
    saveChallengePackProgress(allProgress);
  }

  const isLastLevel = levelIndex >= pack.levels.length - 1;
  const hasNext = !isLastLevel && isPackLevelUnlocked(packId, levelIndex + 1);

  let nextBtnHtml = "";
  if (isLastLevel) {
    const finalProgress = getPackProgress(packId);
    if (finalProgress.completed) {
      nextBtnHtml = `<p class="all-complete-msg">🎉 恭喜！你已通关整个挑战包！<br>总星数：${finalProgress.totalStars}/${pack.levels.length * 3} ⭐</p>
        <button id="cpFinishBtn" type="button" class="next-level-btn">返回挑战包列表</button>`;
    } else {
      nextBtnHtml = `<button id="cpFinishBtn" type="button" class="next-level-btn">返回挑战包列表</button>`;
    }
  } else {
    nextBtnHtml = `<button id="cpNextLevelBtn" type="button" class="next-level-btn">下一关（${pack.levels[levelIndex + 1] ? escapeCpHtml(pack.levels[levelIndex + 1].name) : ""}）</button>
      <button id="cpFinishBtn" type="button" class="retry-stars-btn">返回挑战包列表</button>`;
  }

  const starDisplay = renderStars(stars);
  const bestStarDisplay = isNewBest
    ? `<span class="star-new-best">新纪录！</span>`
    : `<span class="star-prev-best">历史最佳：${renderStars(prevStars)}</span>`;

  resultEl.innerHTML = `
    <h2>挑战包关卡完成</h2>
    <div class="star-rating">
      <span class="star-display">${starDisplay}</span>
      ${bestStarDisplay}
    </div>
    <div class="star-breakdown">
      <p>行动数：${gameplayMetrics.currentActions}（三星 ≤${Math.ceil((targetActions || 20) * 1.2)}）</p>
      <p>${gameplayMetrics.hasRetried ? "⚠️ 有重试记录" : "✓ 无重试"}</p>
      <p>使用提示：${gameplayMetrics.hintsUsedTotal}次</p>
    </div>
    <p>${escapeCpHtml(pack.name)} - 第 ${levelIndex + 1}/${pack.levels.length} 关</p>
    ${nextBtnHtml}
    <button id="cpReplayBtn" type="button" class="replay-trigger">查看本局回放</button>
    <button id="cpRetryBtn" type="button" class="retry-stars-btn">重试本关</button>
  `;
  resultEl.classList.remove("daily-result-style");
  resultEl.classList.remove("hidden");
  addLog("警报没有响，展厅恢复安静。挑战包关卡完成！");
  recordHistory("通关成功");

  const replayBtn = document.getElementById("cpReplayBtn");
  if (replayBtn) replayBtn.addEventListener("click", () => openReplay(true));

  const retryBtn = document.getElementById("cpRetryBtn");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      gameplayMetrics.hasRetried = true;
      resultEl.classList.add("hidden");
      loadChallengePackLevel();
    });
  }

  const nextBtn = document.getElementById("cpNextLevelBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      resultEl.classList.add("hidden");
      challengePackState.currentLevelIndex++;
      loadChallengePackLevel();
    });
  }

  const finishBtn = document.getElementById("cpFinishBtn");
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      resultEl.classList.add("hidden");
      const wrap = document.querySelector(".cp-play-header-wrap");
      if (wrap) wrap.remove();
      challengePackState.playing = false;
      challengePackState.currentPackId = null;
      challengePackState.currentLevelIndex = 0;
      openChallengePackPanel();
    });
  }

  render();
  return true;
}

function updateChallengePackStatsOnFail(reason) {
  if (!challengePackState.playing || !challengePackState.currentPackId) return;

  const packId = challengePackState.currentPackId;
  const levelIndex = challengePackState.currentLevelIndex;

  const lp = getPackLevelProgress(packId, levelIndex);
  lp.failures = (lp.failures || 0) + 1;
  savePackLevelProgress(packId, levelIndex, lp);

  const allProgress = loadChallengePackProgress();
  if (allProgress[packId]) {
    if (!allProgress[packId].overall) {
      allProgress[packId].overall = {
        totalWins: 0,
        totalFailures: 0,
        totalActions: 0,
        totalTurns: 0,
        failureReasons: {}
      };
    }
    allProgress[packId].overall.totalFailures += 1;
    const reasonKey = classifyFailureReason(reason);
    allProgress[packId].overall.failureReasons[reasonKey] =
      (allProgress[packId].overall.failureReasons[reasonKey] || 0) + 1;
    saveChallengePackProgress(allProgress);
  }
}

function openChallengePackReplay(packId, levelIndex) {
  const lp = getPackLevelProgress(packId, levelIndex);
  if (!lp.replay || lp.replay.length === 0) {
    alert("暂无回放记录");
    return;
  }
  stopReplayPlay();
  replayState.history = lp.replay;
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

function importChallengePack() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data || !Array.isArray(data.levels) || typeof data.name !== "string") {
          alert("文件格式错误：不是有效的挑战包文件");
          return;
        }
        const newPack = {
          ...defaultChallengePack(),
          id: "cp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
          name: data.name + (data.name.endsWith("（导入）") ? "" : "（导入）"),
          description: data.description || "",
          author: data.author || "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          levels: data.levels.map(l => ({
            libraryId: l.libraryId || "",
            name: l.name || "未命名关卡",
            targetActions: l.targetActions || 20,
            level: l.level || null
          })).filter(l => l.level)
        };
        if (newPack.levels.length === 0) {
          alert("导入失败：没有有效的关卡数据");
          return;
        }
        saveChallengePack(newPack);
        renderChallengePackPanel();
        alert(`成功导入挑战包"${newPack.name}"，包含 ${newPack.levels.length} 个关卡`);
      } catch (err) {
        alert("导入失败：文件解析错误 - " + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportChallengePack(packId) {
  const pack = getChallengePack(packId);
  if (!pack) return;
  const exportData = {
    format: "museum_challenge_pack",
    version: pack.version || CHALLENGE_PACK_FORMAT_VERSION,
    exportAt: Date.now(),
    name: pack.name,
    description: pack.description,
    author: pack.author,
    levels: pack.levels.map(l => ({
      name: l.name,
      targetActions: l.targetActions,
      level: l.level
    }))
  };
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (pack.name || "challenge_pack").replace(/[^\w\u4e00-\u9fa5-]/g, "_");
  a.download = `${safeName}_挑战包.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function bindChallengePackControls() {
  challengePackBtnEl.addEventListener("click", () => {
    if (challengePackPanelEl.classList.contains("hidden")) {
      openChallengePackPanel();
    } else {
      closeChallengePackPanel();
    }
  });
  if (challengePackCloseBtn) {
    challengePackCloseBtn.addEventListener("click", closeChallengePackPanel);
  }
  if (challengePackImportBtn) {
    challengePackImportBtn.addEventListener("click", importChallengePack);
  }
  const createBtn = document.getElementById("challengePackCreateBtn");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      if (typeof openChallengePackEditor === "function") {
        openChallengePackEditor(null);
      }
    });
  }
}

function migrateOldStorageIfNeeded() {
  try {
    const oldKey = "museum_challenge_packs";
    const old = localStorage.getItem(oldKey);
    if (old && !localStorage.getItem(CHALLENGE_PACK_STORAGE_KEY)) {
      localStorage.setItem(CHALLENGE_PACK_STORAGE_KEY, old);
    }
  } catch (e) {}
}

init();
