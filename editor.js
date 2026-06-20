const editorEl = document.getElementById("editor");
const editorBoardEl = document.getElementById("editorBoard");
const editorToggleBtn = document.getElementById("editorToggleBtn");
const editorCloseBtn = document.getElementById("editorCloseBtn");
const editorPlayBtn = document.getElementById("editorPlayBtn");
const editorSaveBtn = document.getElementById("editorSaveBtn");
const editorLibraryBtn = document.getElementById("editorLibraryBtn");
const editorClearBtn = document.getElementById("editorClearBtn");
const editorLevelNameInput = document.getElementById("editorLevelName");
const editorWarningEl = document.getElementById("editorWarning");

const editorWallCountEl = document.getElementById("editorWallCount");
const editorDoorCountEl = document.getElementById("editorDoorCount");
const editorKeyCountEl = document.getElementById("editorKeyCount");
const editorExhibitCountEl = document.getElementById("editorExhibitCount");
const editorExitCountEl = document.getElementById("editorExitCount");
const editorPlayerCountEl = document.getElementById("editorPlayerCount");
const editorGuardCountEl = document.getElementById("editorGuardCount");
const editorPlateCountEl = document.getElementById("editorPlateCount");
const editorScreenCountEl = document.getElementById("editorScreenCount");
const editorLightCountEl = document.getElementById("editorLightCount");
const editorCameraCountEl = document.getElementById("editorCameraCount");

const editorDiagnoseBtn = document.getElementById("editorDiagnoseBtn");
const diagnosisStatusEl = document.getElementById("diagnosisStatus");
const diagnosisChecksEl = document.getElementById("diagnosisChecks");
const diagnosisIssuesEl = document.getElementById("diagnosisIssues");
const diagnosisWarningsEl = document.getElementById("diagnosisWarnings");
const diagnosisSolutionEl = document.getElementById("diagnosisSolution");

const levelLibraryEl = document.getElementById("levelLibrary");
const libraryCloseBtn = document.getElementById("libraryCloseBtn");
const librarySaveBtn = document.getElementById("librarySaveBtn");
const librarySaveNameEl = document.getElementById("librarySaveName");
const libraryListEl = document.getElementById("libraryList");
const libraryCountEl = document.getElementById("libraryCount");

const backToEditorBtn = document.getElementById("backToEditorBtn");

const GRID_WIDTH = 8;
const GRID_HEIGHT = 7;
const STORAGE_KEY = "museum_editor_level";
const LIBRARY_STORAGE_KEY = "museum_level_library";

const GUARD_BEHAVIOR_OPTIONS = [
  { value: "fixed", label: "固定巡逻", desc: "沿固定路径循环移动" },
  { value: "patrol", label: "往返巡逻", desc: "沿路径往返移动" },
  { value: "investigate", label: "听觉调查", desc: "听到声响后短暂调查" },
  { value: "trace", label: "痕迹追踪", desc: "发现开门痕迹后改变路线" }
];

const CAMERA_DIRECTION_OPTIONS = [
  { value: "up", label: "↑ 向上" },
  { value: "down", label: "↓ 向下" },
  { value: "left", label: "← 向左" },
  { value: "right", label: "→ 向右" }
];

const guardBehaviorListEl = document.getElementById("guardBehaviorList");
const cameraListEl = document.getElementById("cameraList");

let editorState = {
  currentTool: "wall",
  level: createEmptyLevel(),
  currentGuardPath: null,
  isOpen: false,
  diagnosisTimer: null,
  lastDiagnosisResult: null,
  library: [],
  libraryOpen: false,
  activeDiagnosticId: null,
  activeDiagnosticCells: [],
  activeDiagnosticClass: "",
  activeDebugCategory: null,
  activeSolutionStep: null,
  stepNumberCells: []
};

function createEmptyLevel() {
  return {
    name: "自定义",
    walls: [],
    doors: [],
    keys: [],
    exhibits: [],
    player: null,
    guards: [],
    exit: null,
    mechanisms: {
      pressurePlates: [],
      screens: [],
      lights: [],
      cameras: []
    }
  };
}

function initEditor() {
  bindEditorEvents();
  loadLibraryFromStorage();
  renderEditorBoard();
  updateEditorStats();
}

function bindEditorEvents() {
  editorToggleBtn.addEventListener("click", toggleEditor);
  editorCloseBtn.addEventListener("click", toggleEditor);
  editorPlayBtn.addEventListener("click", playEditorLevel);
  editorSaveBtn.addEventListener("click", () => {
    finishGuardPath();
    if (!validateLevel()) {
      showWarning("关卡不完整，无法保存");
      return;
    }
    openLevelLibrary(true);
    librarySaveNameEl.value = editorState.level.name || "自定义";
  });
  editorLibraryBtn.addEventListener("click", () => {
    openLevelLibrary(false);
  });
  editorClearBtn.addEventListener("click", clearEditorLevel);
  editorDiagnoseBtn.addEventListener("click", runDiagnosis);
  editorLevelNameInput.addEventListener("input", (e) => {
    editorState.level.name = e.target.value || "自定义";
  });

  libraryCloseBtn.addEventListener("click", closeLevelLibrary);
  librarySaveBtn.addEventListener("click", handleLibrarySave);

  backToEditorBtn.addEventListener("click", returnToEditor);

  document.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectTool(btn.dataset.tool);
    });
  });
}

function selectTool(tool) {
  if (editorState.currentTool === "guard" && tool !== "guard") {
    finishGuardPath();
  }

  editorState.currentTool = tool;
  document.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tool === tool);
  });
  if (tool === "guard") {
    editorState.currentGuardPath = [];
  } else {
    editorState.currentGuardPath = null;
  }
  renderEditorBoard();
}

function toggleEditor() {
  editorState.isOpen = !editorState.isOpen;
  editorEl.classList.toggle("hidden", !editorState.isOpen);
  if (editorState.isOpen) {
    renderEditorBoard();
    updateEditorStats();
    validateLevel();
    scheduleDiagnosis();
  } else {
    if (editorState.libraryOpen) {
      closeLevelLibrary();
    }
  }
}

function renderEditorBoard() {
  editorBoardEl.innerHTML = "";
  const level = editorState.level;

  const highlightSet = new Set(
    editorState.activeDiagnosticCells.map(p => `${p.x},${p.y}`)
  );
  const stepNumberMap = new Map();
  editorState.stepNumberCells.forEach(s => {
    stepNumberMap.set(`${s.pos.x},${s.pos.y}`, s.step);
  });

  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const point = { x, y };
      const pointKey = `${x},${y}`;
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.x = x;
      tile.dataset.y = y;

      const label = document.createElement("span");

      if (isEditorWall(point)) tile.classList.add("wall");

      const door = editorDoorAt(point);
      if (door) {
        tile.classList.add("door");
        label.textContent = "门";
      }

      const key = editorKeyAt(point);
      if (key) {
        tile.classList.add("key");
        label.textContent = "钥匙";
      }

      const exhibit = editorExhibitAt(point);
      if (exhibit) {
        tile.classList.add("exhibit");
        label.textContent = "展柜";
      }

      if (level.exit && samePoint(level.exit, point)) {
        tile.classList.add("exit");
        label.textContent = "出口";
      }

      if (level.player && samePoint(level.player, point)) {
        tile.classList.add("player");
      }

      const guardInfo = getGuardInfoAt(point);
      if (guardInfo) {
        tile.classList.add("guard");
        label.textContent = `巡${guardInfo.guardIndex + 1}`;
      }

      const mech = level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
      const plate = mech.pressurePlates.find(p => samePoint(p, point));
      if (plate) {
        tile.classList.add("pressure-plate");
        label.textContent = "压板";
      }
      const scr = mech.screens.find(s => samePoint(s, point));
      if (scr) {
        tile.classList.add("screen");
        label.textContent = "屏风";
      }
      const light = mech.lights.find(l => samePoint(l, point));
      if (light) {
        tile.classList.add("light-switch");
        label.textContent = "熄灯";
      }
      const cam = (mech.cameras || []).find(c => samePoint(c, point));
      if (cam) {
        tile.classList.add("camera");
        tile.classList.add(`camera-${cam.direction}`);
        const dirLabels = { up: "↑", down: "↓", left: "←", right: "→" };
        label.textContent = `摄像${dirLabels[cam.direction] || ""}`;
      }

      if (editorState.currentGuardPath) {
        const pathIndex = editorState.currentGuardPath.findIndex(
          (p) => p.x === x && p.y === y
        );
        if (pathIndex !== -1) {
          tile.classList.add("guard-path");
          if (!label.textContent) {
            label.textContent = `${pathIndex + 1}`;
          }
        }
      }

      if (highlightSet.has(pointKey) && editorState.activeDiagnosticClass) {
        tile.classList.add(editorState.activeDiagnosticClass);
      }
      if (stepNumberMap.has(pointKey)) {
        const stepNum = stepNumberMap.get(pointKey);
        const stepBadge = document.createElement("div");
        stepBadge.className = "diag-step-number";
        stepBadge.textContent = String(stepNum + 1);
        tile.appendChild(stepBadge);
      }

      tile.appendChild(label);
      tile.addEventListener("click", () => handleTileClick(x, y));
      editorBoardEl.appendChild(tile);
    }
  }
}

function handleTileClick(x, y) {
  const point = { x, y };
  const tool = editorState.currentTool;

  if (tool === "eraser") {
    eraseAt(point);
  } else if (tool === "guard") {
    handleGuardPathClick(point);
  } else if (tool === "pressurePlate") {
    handlePressurePlateClick(point);
  } else if (tool === "camera") {
    handleCameraClick(point);
  } else {
    placeOrRemove(tool, point);
  }

  clearDiagnosticHighlight();
  renderEditorBoard();
  updateEditorStats();
  validateLevel();
  scheduleDiagnosis();
}

function placeOrRemove(tool, point) {
  const level = editorState.level;

  if (tool === "wall") {
    const key = pointKey(point);
    const index = level.walls.indexOf(key);
    if (index !== -1) {
      level.walls.splice(index, 1);
    } else {
      eraseAt(point);
      level.walls.push(key);
    }
  } else if (tool === "door") {
    const existing = editorDoorAt(point);
    if (existing) {
      level.doors = level.doors.filter((d) => !samePoint(d, point));
    } else {
      eraseAt(point);
      level.doors.push({ x: point.x, y: point.y, open: false });
    }
  } else if (tool === "key") {
    const existing = editorKeyAt(point);
    if (existing) {
      level.keys = level.keys.filter((k) => !samePoint(k, point));
    } else {
      eraseAt(point);
      level.keys.push({ x: point.x, y: point.y });
    }
  } else if (tool === "exhibit") {
    const existing = editorExhibitAt(point);
    if (existing) {
      level.exhibits = level.exhibits.filter((e) => !samePoint(e, point));
    } else {
      eraseAt(point);
      level.exhibits.push({ x: point.x, y: point.y, fixed: false });
    }
  } else if (tool === "exit") {
    if (level.exit && samePoint(level.exit, point)) {
      level.exit = null;
    } else {
      eraseAt(point);
      level.exit = { x: point.x, y: point.y };
    }
  } else if (tool === "player") {
    if (level.player && samePoint(level.player, point)) {
      level.player = null;
    } else {
      eraseAt(point);
      level.player = { x: point.x, y: point.y };
    }
  } else if (tool === "screen") {
    const mech = level.mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
    const existing = mech.screens.find(s => samePoint(s, point));
    if (existing) {
      mech.screens = mech.screens.filter(s => !samePoint(s, point));
    } else {
      eraseAt(point);
      mech.screens.push({ x: point.x, y: point.y });
    }
  } else if (tool === "light") {
    const mech = level.mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
    const existing = mech.lights.find(l => samePoint(l, point));
    if (existing) {
      mech.lights = mech.lights.filter(l => !samePoint(l, point));
    } else {
      eraseAt(point);
      mech.lights.push({ x: point.x, y: point.y, active: false });
    }
  }
}

function handleGuardPathClick(point) {
  if (!editorState.currentGuardPath) {
    editorState.currentGuardPath = [];
  }

  const pathIndex = editorState.currentGuardPath.findIndex(
    (p) => p.x === point.x && p.y === point.y
  );

  if (pathIndex !== -1) {
    editorState.currentGuardPath = editorState.currentGuardPath.slice(0, pathIndex);
  } else {
    editorState.currentGuardPath.push({ x: point.x, y: point.y });
  }

  if (editorState.currentGuardPath.length >= 2) {
    const lastPoint = editorState.currentGuardPath[editorState.currentGuardPath.length - 1];
    const secondLast = editorState.currentGuardPath[editorState.currentGuardPath.length - 2];
    const dx = Math.abs(lastPoint.x - secondLast.x);
    const dy = Math.abs(lastPoint.y - secondLast.y);
    if (dx + dy !== 1) {
      editorState.currentGuardPath.pop();
      showWarning("巡逻路径必须是相邻格子");
    }
  }
}

function handlePressurePlateClick(point) {
  const level = editorState.level;
  const mech = level.mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  const existing = mech.pressurePlates.find(p => samePoint(p, point));
  if (existing) {
    mech.pressurePlates = mech.pressurePlates.filter(p => !samePoint(p, point));
  } else {
    eraseAt(point);
    const targetDoors = level.doors.map(d => ({ x: d.x, y: d.y }));
    mech.pressurePlates.push({ x: point.x, y: point.y, targetDoors, triggered: false });
    if (level.doors.length === 0) {
      showWarning("当前没有门，压力板将不会有效果");
    }
  }
}

function handleCameraClick(point) {
  const level = editorState.level;
  const mech = level.mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  mech.cameras = mech.cameras || [];
  const existing = mech.cameras.find(c => samePoint(c, point));
  if (existing) {
    mech.cameras = mech.cameras.filter(c => !samePoint(c, point));
  } else {
    eraseAt(point);
    mech.cameras.push({ x: point.x, y: point.y, direction: "right", disabled: false });
    renderCameraList();
  }
}

function eraseAt(point) {
  const level = editorState.level;
  const key = pointKey(point);

  level.walls = level.walls.filter((w) => w !== key);
  level.doors = level.doors.filter((d) => !samePoint(d, point));
  level.keys = level.keys.filter((k) => !samePoint(k, point));
  level.exhibits = level.exhibits.filter((e) => !samePoint(e, point));

  if (level.exit && samePoint(level.exit, point)) {
    level.exit = null;
  }
  if (level.player && samePoint(level.player, point)) {
    level.player = null;
  }

  level.guards = level.guards.filter((guard) =>
    !guard.path.some((p) => samePoint(p, point))
  );

  const mech = level.mechanisms;
  if (mech) {
    mech.pressurePlates = mech.pressurePlates.filter((p) => !samePoint(p, point));
    mech.screens = mech.screens.filter((s) => !samePoint(s, point));
    mech.lights = mech.lights.filter((l) => !samePoint(l, point));
    if (mech.cameras) {
      const before = mech.cameras.length;
      mech.cameras = mech.cameras.filter((c) => !samePoint(c, point));
      if (mech.cameras.length !== before) {
        renderCameraList();
      }
    }
  }
}

function isEditorWall(point) {
  return editorState.level.walls.includes(pointKey(point));
}

function editorDoorAt(point) {
  return editorState.level.doors.find((door) => samePoint(door, point));
}

function editorKeyAt(point) {
  return editorState.level.keys.find((key) => samePoint(key, point));
}

function editorExhibitAt(point) {
  return editorState.level.exhibits.find((exhibit) => samePoint(exhibit, point));
}

function getGuardInfoAt(point) {
  for (let i = 0; i < editorState.level.guards.length; i += 1) {
    const guard = editorState.level.guards[i];
    const pathIndex = guard.path.findIndex((p) => samePoint(p, point));
    if (pathIndex !== -1) {
      return { guardIndex: i, pathIndex };
    }
  }
  return null;
}

function samePoint(a, b) {
  return a.x === b.x && a.y === b.y;
}

function pointKey(point) {
  return `${point.x},${point.y}`;
}

function updateEditorStats() {
  const level = editorState.level;
  const mech = level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  editorWallCountEl.textContent = level.walls.length;
  editorDoorCountEl.textContent = level.doors.length;
  editorKeyCountEl.textContent = level.keys.length;
  editorExhibitCountEl.textContent = level.exhibits.length;
  editorExitCountEl.textContent = level.exit ? 1 : 0;
  editorPlayerCountEl.textContent = level.player ? 1 : 0;
  editorGuardCountEl.textContent = level.guards.length;
  editorPlateCountEl.textContent = mech.pressurePlates.length;
  editorScreenCountEl.textContent = mech.screens.length;
  editorLightCountEl.textContent = mech.lights.length;
  editorCameraCountEl.textContent = (mech.cameras || []).length;
  renderGuardBehaviorConfig();
  renderCameraList();
}

function validateLevel() {
  const level = editorState.level;
  const warnings = [];

  if (!level.player) warnings.push("需要设置玩家起点");
  if (!level.exit) warnings.push("需要设置出口");
  if (level.exhibits.length === 0) warnings.push("至少需要一个展柜");
  if (level.player && isEditorWall(level.player)) warnings.push("玩家起点不能在墙上");
  if (level.exit && isEditorWall(level.exit)) warnings.push("出口不能在墙上");

  level.keys.forEach((key, i) => {
    if (isEditorWall(key)) warnings.push(`钥匙${i + 1}不能在墙上`);
  });

  level.exhibits.forEach((exhibit, i) => {
    if (isEditorWall(exhibit)) warnings.push(`展柜${i + 1}不能在墙上`);
  });

  level.doors.forEach((door, i) => {
    if (isEditorWall(door)) warnings.push(`门${i + 1}不能在墙上`);
  });

  if (warnings.length > 0) {
    editorWarningEl.innerHTML = warnings.map((w) => `<p>${w}</p>`).join("");
    editorWarningEl.classList.add("show");
  } else {
    editorWarningEl.classList.remove("show");
    editorWarningEl.innerHTML = "";
  }

  return warnings.length === 0;
}

function showWarning(msg) {
  const warning = document.createElement("div");
  warning.className = "editor-toast";
  warning.textContent = msg;
  editorEl.appendChild(warning);
  setTimeout(() => warning.remove(), 1500);
}

function finishGuardPath() {
  if (editorState.currentGuardPath && editorState.currentGuardPath.length >= 2) {
    editorState.level.guards.push({
      path: [...editorState.currentGuardPath],
      step: 0,
      behavior: "fixed",
      hearingRange: 4
    });
    editorState.currentGuardPath = [];
  }
}

function renderGuardBehaviorConfig() {
  if (!guardBehaviorListEl) return;

  const guards = editorState.level.guards;
  if (guards.length === 0) {
    guardBehaviorListEl.innerHTML = '<p class="no-guards-hint">先放置巡逻员路径后可配置行为</p>';
    return;
  }

  guardBehaviorListEl.innerHTML = "";
  guards.forEach((guard, index) => {
    const card = document.createElement("div");
    card.className = "guard-behavior-card";
    const currentBehavior = guard.behavior || "fixed";
    const behaviorInfo = GUARD_BEHAVIOR_OPTIONS.find(b => b.value === currentBehavior) || GUARD_BEHAVIOR_OPTIONS[0];

    card.innerHTML = `
      <div class="guard-behavior-header">
        <span class="guard-behavior-title">巡逻员 ${index + 1}</span>
        <select class="guard-behavior-select" data-guard-index="${index}">
          ${GUARD_BEHAVIOR_OPTIONS.map(opt => 
            `<option value="${opt.value}" ${opt.value === currentBehavior ? 'selected' : ''}>${opt.label}</option>`
          ).join('')}
        </select>
      </div>
      <div class="guard-behavior-desc">${behaviorInfo.desc}</div>
      <div class="guard-hearing-config">
        <label>听觉范围：</label>
        <input type="range" class="guard-hearing-range" data-guard-index="${index}" 
               min="1" max="8" value="${guard.hearingRange || 4}">
        <span class="guard-hearing-value">${guard.hearingRange || 4}</span>
      </div>
      <div class="guard-path-info">
        <span>路径长度：${guard.path.length} 格</span>
        <button type="button" class="guard-delete-btn" data-guard-index="${index}">删除</button>
      </div>
    `;
    guardBehaviorListEl.appendChild(card);
  });

  guardBehaviorListEl.querySelectorAll(".guard-behavior-select").forEach(select => {
    select.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.guardIndex, 10);
      const guard = editorState.level.guards[index];
      if (guard) {
        guard.behavior = e.target.value;
        clearDiagnosticHighlight();
        renderGuardBehaviorConfig();
        scheduleDiagnosis();
      }
    });
  });

  guardBehaviorListEl.querySelectorAll(".guard-hearing-range").forEach(slider => {
    slider.addEventListener("input", (e) => {
      const index = parseInt(e.target.dataset.guardIndex, 10);
      const value = parseInt(e.target.value, 10);
      const guard = editorState.level.guards[index];
      if (guard) {
        guard.hearingRange = value;
        const valueEl = e.target.parentElement.querySelector(".guard-hearing-value");
        if (valueEl) valueEl.textContent = value;
        clearDiagnosticHighlight();
        scheduleDiagnosis();
      }
    });
  });

  guardBehaviorListEl.querySelectorAll(".guard-delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.guardIndex, 10);
      if (confirm(`确定要删除巡逻员 ${index + 1} 吗？`)) {
        editorState.level.guards.splice(index, 1);
        clearDiagnosticHighlight();
        renderEditorBoard();
        updateEditorStats();
        renderGuardBehaviorConfig();
        scheduleDiagnosis();
      }
    });
  });
}

function renderCameraList() {
  if (!cameraListEl) return;

  const mech = editorState.level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  const cameras = mech.cameras || [];

  if (cameras.length === 0) {
    cameraListEl.innerHTML = '<p class="no-cameras-hint">先放置安保摄像头后可配置方向</p>';
    return;
  }

  cameraListEl.innerHTML = "";
  cameras.forEach((cam, index) => {
    const card = document.createElement("div");
    card.className = "camera-config-card";
    const currentDir = cam.direction || "right";

    card.innerHTML = `
      <div class="camera-config-header">
        <span class="camera-config-title">摄像头 ${index + 1} <small>(${cam.x}, ${cam.y})</small></span>
        <select class="camera-direction-select" data-camera-index="${index}">
          ${CAMERA_DIRECTION_OPTIONS.map(opt => 
            `<option value="${opt.value}" ${opt.value === currentDir ? 'selected' : ''}>${opt.label}</option>`
          ).join('')}
        </select>
      </div>
      <div class="camera-config-actions">
        <button type="button" class="camera-delete-btn" data-camera-index="${index}">删除</button>
      </div>
    `;
    cameraListEl.appendChild(card);
  });

  cameraListEl.querySelectorAll(".camera-direction-select").forEach(select => {
    select.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.cameraIndex, 10);
      const cameras = editorState.level.mechanisms?.cameras || [];
      if (cameras[index]) {
        cameras[index].direction = e.target.value;
        clearDiagnosticHighlight();
        renderEditorBoard();
        scheduleDiagnosis();
      }
    });
  });

  cameraListEl.querySelectorAll(".camera-delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.cameraIndex, 10);
      if (confirm(`确定要删除摄像头 ${index + 1} 吗？`)) {
        if (editorState.level.mechanisms?.cameras) {
          editorState.level.mechanisms.cameras.splice(index, 1);
        }
        clearDiagnosticHighlight();
        renderEditorBoard();
        updateEditorStats();
        renderCameraList();
        scheduleDiagnosis();
      }
    });
  });
}

function playEditorLevel() {
  finishGuardPath();

  if (!validateLevel()) {
    showWarning("关卡不完整，请检查警告");
    return;
  }

  const levelData = JSON.parse(JSON.stringify(editorState.level));
  if (!levelData.mechanisms) {
    levelData.mechanisms = { pressurePlates: [], screens: [], lights: [], cameras: [] };
  } else if (!levelData.mechanisms.cameras) {
    levelData.mechanisms.cameras = [];
  }

  if (typeof diagnoseLevel === "function") {
    const result = diagnoseLevel(levelData);
    editorState.lastDiagnosisResult = result;
    renderDiagnosisResult(result);
    if (!result.solvable) {
      const issues = result.issues.map(i => typeof i === "string" ? i : i.message);
      showSaveValidationDialog(issues, () => {
        if (typeof diagnosisIssuesEl !== "undefined" && diagnosisIssuesEl.scrollIntoView) {
          diagnosisIssuesEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      return;
    }
  }

  if (typeof loadCustomLevel === "function") {
    loadCustomLevel(levelData);
    if (backToEditorBtn) {
      backToEditorBtn.classList.remove("hidden");
    }
    if (typeof toggleBackToEditorBtn === "function") {
      toggleBackToEditorBtn(true);
    }
    toggleEditor();
  }
}

function clearEditorLevel() {
  if (confirm("确定要清空当前关卡吗？")) {
    editorState.level = createEmptyLevel();
    editorState.currentGuardPath = null;
    editorLevelNameInput.value = "自定义";
    clearDiagnosticHighlight();
    renderEditorBoard();
    updateEditorStats();
    validateLevel();
    scheduleDiagnosis();
  }
}

function showSaveValidationDialog(issues, onGoToDiagnose) {
  const overlay = document.createElement("div");
  overlay.className = "save-validation-overlay";

  const dialog = document.createElement("div");
  dialog.className = "save-validation-dialog";

  const issueListHtml = issues.length > 0
    ? `<div class="save-validation-issues">
         ${issues.map(i => `<div class="save-validation-issue">⚠️ ${typeof i === "string" ? i : (i.message || String(i))}</div>`).join("")}
       </div>`
    : "";

  dialog.innerHTML = `
    <h3>⚠️ 关卡不可通关</h3>
    <p>检测到以下问题，无法保存此关卡：</p>
    ${issueListHtml}
    <p style="font-size: 12px; color: #7a7280;">请使用右侧的调试视图定位和修复问题</p>
    <div class="save-validation-actions">
      <button type="button" class="save-validation-btn-cancel" id="svCancelBtn">取消</button>
      <button type="button" class="save-validation-btn-diagnose" id="svDiagnoseBtn">查看诊断</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  document.getElementById("svCancelBtn").addEventListener("click", () => {
    overlay.remove();
  });

  document.getElementById("svDiagnoseBtn").addEventListener("click", () => {
    overlay.remove();
    if (typeof onGoToDiagnose === "function") {
      onGoToDiagnose();
    }
    if (!editorState.isOpen) {
      toggleEditor();
    }
    if (diagnosisIssuesEl && diagnosisIssuesEl.scrollIntoView) {
      diagnosisIssuesEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (editorDiagnoseBtn) {
      editorDiagnoseBtn.focus();
    }
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function loadLibraryFromStorage() {
  try {
    const data = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (data) {
      editorState.library = JSON.parse(data);
    } else {
      editorState.library = [];
    }
  } catch (e) {
    editorState.library = [];
  }
}

function saveLibraryToStorage() {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(editorState.library));
    return true;
  } catch (e) {
    showWarning("保存失败，存储空间不足");
    return false;
  }
}

function openLevelLibrary(focusSave) {
  loadLibraryFromStorage();
  editorState.libraryOpen = true;
  levelLibraryEl.classList.remove("hidden");
  renderLibraryList();
  if (focusSave) {
    librarySaveNameEl.focus();
    librarySaveNameEl.select();
  }
}

function closeLevelLibrary() {
  editorState.libraryOpen = false;
  levelLibraryEl.classList.add("hidden");
}

function handleLibrarySave() {
  const name = librarySaveNameEl.value.trim();
  if (!name) {
    showWarning("请输入关卡名称");
    return;
  }

  finishGuardPath();

  if (!validateLevel()) {
    showWarning("关卡不完整，无法保存");
    return;
  }

  const levelData = JSON.parse(JSON.stringify(editorState.level));
  if (!levelData.mechanisms) {
    levelData.mechanisms = { pressurePlates: [], screens: [], lights: [] };
  }

  let solvable = true;
  if (typeof diagnoseLevel === "function") {
    const result = diagnoseLevel(levelData);
    editorState.lastDiagnosisResult = result;
    renderDiagnosisResult(result);
    solvable = result.solvable;
    if (!solvable) {
      showSaveValidationDialog(result.issues, () => {
        closeLevelLibrary();
        if (diagnosisIssuesEl && diagnosisIssuesEl.scrollIntoView) {
          diagnosisIssuesEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      return;
    }
  }

  levelData.name = name;
  const existingIndex = editorState.library.findIndex((item) => item.name === name);

  if (existingIndex !== -1) {
    if (!confirm(`关卡"${name}"已存在，是否覆盖？`)) {
      return;
    }
    editorState.library[existingIndex] = {
      ...editorState.library[existingIndex],
      name: name,
      data: levelData,
      updatedAt: Date.now()
    };
    showWarning("关卡已覆盖 ✓");
  } else {
    editorState.library.push({
      id: `level_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name,
      data: levelData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    showWarning("关卡已保存 ✓");
  }

  saveLibraryToStorage();
  renderLibraryList();
  librarySaveNameEl.value = "";
}

function renderLibraryList() {
  const items = editorState.library;
  libraryCountEl.textContent = `${items.length} 个关卡`;

  if (items.length === 0) {
    libraryListEl.innerHTML = '<div class="library-empty">暂无保存的关卡</div>';
    return;
  }

  const sortedItems = [...items].sort((a, b) => b.updatedAt - a.updatedAt);

  libraryListEl.innerHTML = sortedItems.map((item) => {
    const date = new Date(item.updatedAt);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    const data = item.data;
    const exhibitCount = data.exhibits ? data.exhibits.length : 0;
    const guardCount = data.guards ? data.guards.length : 0;
    return `
      <div class="library-item" data-id="${item.id}">
        <div class="library-item-info">
          <div class="library-item-name">${escapeHtml(item.name)}</div>
          <div class="library-item-meta">
            <span>展柜 ${exhibitCount}</span>
            <span>巡逻员 ${guardCount}</span>
            <span>更新于 ${dateStr}</span>
          </div>
        </div>
        <div class="library-item-actions">
          <button type="button" class="library-btn library-load-btn" data-id="${item.id}">读取</button>
          <button type="button" class="library-btn library-overwrite-btn" data-id="${item.id}">覆盖</button>
          <button type="button" class="library-btn library-delete-btn" data-id="${item.id}">删除</button>
        </div>
      </div>
    `;
  }).join("");

  libraryListEl.querySelectorAll(".library-load-btn").forEach((btn) => {
    btn.addEventListener("click", () => loadLevelFromLibrary(btn.dataset.id));
  });
  libraryListEl.querySelectorAll(".library-overwrite-btn").forEach((btn) => {
    btn.addEventListener("click", () => overwriteLevelInLibrary(btn.dataset.id));
  });
  libraryListEl.querySelectorAll(".library-delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteLevelFromLibrary(btn.dataset.id));
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function loadLevelFromLibrary(id) {
  const item = editorState.library.find((l) => l.id === id);
  if (!item) {
    showWarning("未找到关卡");
    return;
  }
  editorState.level = JSON.parse(JSON.stringify(item.data));
  if (!editorState.level.mechanisms) {
    editorState.level.mechanisms = { pressurePlates: [], screens: [], lights: [] };
  }
  editorState.currentGuardPath = null;
  editorLevelNameInput.value = editorState.level.name || "自定义";
  clearDiagnosticHighlight();
  renderEditorBoard();
  updateEditorStats();
  validateLevel();
  scheduleDiagnosis();
  showWarning("已加载关卡");
}

function overwriteLevelInLibrary(id) {
  const item = editorState.library.find((l) => l.id === id);
  if (!item) {
    showWarning("未找到关卡");
    return;
  }

  finishGuardPath();
  if (!validateLevel()) {
    showWarning("关卡不完整，无法覆盖");
    return;
  }

  if (!confirm(`确定要覆盖"${item.name}"吗？`)) {
    return;
  }

  const levelData = JSON.parse(JSON.stringify(editorState.level));
  if (!levelData.mechanisms) {
    levelData.mechanisms = { pressurePlates: [], screens: [], lights: [] };
  }

  let solvable = true;
  if (typeof diagnoseLevel === "function") {
    const result = diagnoseLevel(levelData);
    editorState.lastDiagnosisResult = result;
    renderDiagnosisResult(result);
    solvable = result.solvable;
    if (!solvable) {
      showSaveValidationDialog(result.issues, () => {
        closeLevelLibrary();
        if (diagnosisIssuesEl && diagnosisIssuesEl.scrollIntoView) {
          diagnosisIssuesEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      return;
    }
  }

  levelData.name = item.name;
  item.data = levelData;
  item.updatedAt = Date.now();
  saveLibraryToStorage();
  renderLibraryList();
  showWarning("已覆盖关卡 ✓");
}

function deleteLevelFromLibrary(id) {
  const item = editorState.library.find((l) => l.id === id);
  if (!item) {
    showWarning("未找到关卡");
    return;
  }
  if (!confirm(`确定要删除"${item.name}"吗？此操作不可撤销。`)) {
    return;
  }
  editorState.library = editorState.library.filter((l) => l.id !== id);
  saveLibraryToStorage();
  renderLibraryList();
  showWarning("已删除关卡");
}

function returnToEditor() {
  if (typeof customLevelSource !== "undefined" && customLevelSource) {
    editorState.level = JSON.parse(JSON.stringify(customLevelSource));
    if (!editorState.level.mechanisms) {
      editorState.level.mechanisms = { pressurePlates: [], screens: [], lights: [] };
    }
    editorState.currentGuardPath = null;
    editorLevelNameInput.value = editorState.level.name || "自定义";
    clearDiagnosticHighlight();
    renderEditorBoard();
    updateEditorStats();
    validateLevel();
    scheduleDiagnosis();
  }
  if (backToEditorBtn) {
    backToEditorBtn.classList.add("hidden");
  }
  if (typeof toggleBackToEditorBtn === "function") {
    toggleBackToEditorBtn(false);
  }
  if (!editorState.isOpen) {
    toggleEditor();
  }
}

function scheduleDiagnosis() {
  if (editorState.diagnosisTimer) {
    clearTimeout(editorState.diagnosisTimer);
  }
  diagnosisStatusEl.querySelector(".status-icon").textContent = "⏳";
  diagnosisStatusEl.querySelector(".status-text").textContent = "正在分析...";
  diagnosisStatusEl.className = "diagnosis-status status-analyzing";

  editorState.diagnosisTimer = setTimeout(() => {
    runDiagnosis();
  }, 500);
}

function runDiagnosis() {
  finishGuardPath();

  const levelData = JSON.parse(JSON.stringify(editorState.level));
  if (!levelData.mechanisms) {
    levelData.mechanisms = { pressurePlates: [], screens: [], lights: [] };
  }

  if (!levelData.player || !levelData.exit || levelData.exhibits.length === 0) {
    diagnosisStatusEl.querySelector(".status-icon").textContent = "⚠️";
    diagnosisStatusEl.querySelector(".status-text").textContent = "关卡不完整";
    diagnosisStatusEl.className = "diagnosis-status status-incomplete";
    diagnosisChecksEl.innerHTML = "";
    diagnosisIssuesEl.innerHTML = "";
    diagnosisWarningsEl.innerHTML = "";
    diagnosisSolutionEl.innerHTML = "";
    editorState.lastDiagnosisResult = null;
    clearDiagnosticHighlight();
    return;
  }

  try {
    if (typeof diagnoseLevel === "function") {
      const result = diagnoseLevel(levelData);
      editorState.lastDiagnosisResult = result;
      renderDiagnosisResult(result);
    } else {
      diagnosisStatusEl.querySelector(".status-icon").textContent = "❌";
      diagnosisStatusEl.querySelector(".status-text").textContent = "诊断系统未加载";
      diagnosisStatusEl.className = "diagnosis-status status-error";
    }
  } catch (e) {
    console.error("诊断出错:", e);
    diagnosisStatusEl.querySelector(".status-icon").textContent = "❌";
    diagnosisStatusEl.querySelector(".status-text").textContent = "诊断出错";
    diagnosisStatusEl.className = "diagnosis-status status-error";
  }
}

function clearDiagnosticHighlight() {
  editorState.activeDiagnosticId = null;
  editorState.activeDiagnosticCells = [];
  editorState.activeDiagnosticClass = "";
  editorState.activeDebugCategory = null;
  editorState.activeSolutionStep = null;
  editorState.stepNumberCells = [];
  renderEditorBoard();
}

function setDiagnosticHighlight(id, cells, highlightClass) {
  if (editorState.activeDiagnosticId === id) {
    clearDiagnosticHighlight();
  } else {
    editorState.activeDiagnosticId = id;
    editorState.activeDiagnosticCells = cells || [];
    editorState.activeDiagnosticClass = highlightClass || "diag-generic-highlight";
    editorState.activeDebugCategory = null;
    editorState.activeSolutionStep = null;
    editorState.stepNumberCells = [];
    renderEditorBoard();
  }
  renderDiagnosisResult(editorState.lastDiagnosisResult);
}

function getHighlightClassForType(type) {
  if (type && type.indexOf("unreachable") !== -1) return "diag-unreachable";
  if (type && type.indexOf("vision") !== -1) return "diag-vision-blocked";
  if (type && type.indexOf("key") !== -1) return "diag-key-dependency";
  if (type && type.indexOf("door") !== -1) return "diag-problem-door";
  if (type && type.indexOf("exhibit") !== -1) return "diag-vision-blocked";
  if (type && type.indexOf("exit") !== -1) return "diag-unreachable";
  if (type && type.indexOf("timing") !== -1) return "diag-vision-blocked";
  if (type && type.indexOf("no_solution") !== -1) return "diag-unreachable";
  return "diag-generic-highlight";
}

function setDebugCategoryHighlight(category) {
  const result = editorState.lastDiagnosisResult;
  if (!result || !result.debug) return;

  if (editorState.activeDebugCategory === category) {
    clearDiagnosticHighlight();
    return;
  }

  let cells = [];
  let highlightClass = "diag-generic-highlight";
  editorState.stepNumberCells = [];

  switch (category) {
    case "unreachable":
      cells = result.debug.unreachableCells || [];
      highlightClass = "diag-unreachable";
      break;
    case "vision":
      cells = result.debug.permanentlyBlockedCells || [];
      highlightClass = "diag-vision-blocked";
      break;
    case "key":
      (result.debug.keyDependencies || []).forEach(kd => {
        cells = cells.concat(kd.cells || []);
      });
      highlightClass = "diag-key-dependency";
      break;
    case "door":
      (result.debug.problemDoors || []).forEach(pd => {
        cells = cells.concat(pd.cells || []);
      });
      highlightClass = "diag-problem-door";
      break;
    case "solution":
      cells = (result.debug.solutionPreview || []).map(s => s.pos);
      editorState.stepNumberCells = result.debug.solutionPreview || [];
      highlightClass = "diag-solution-step";
      break;
  }

  editorState.activeDiagnosticId = null;
  editorState.activeDebugCategory = category;
  editorState.activeSolutionStep = null;
  editorState.activeDiagnosticCells = cells;
  editorState.activeDiagnosticClass = highlightClass;
  renderEditorBoard();
  renderDiagnosisResult(result);
}

function setSolutionStepHighlight(stepIndex) {
  const result = editorState.lastDiagnosisResult;
  if (!result || !result.debug || !result.debug.solutionPreview) return;

  if (editorState.activeSolutionStep === stepIndex) {
    clearDiagnosticHighlight();
    return;
  }

  const preview = result.debug.solutionPreview;
  let cells = [];
  let stepCells = [];

  for (let i = 0; i <= stepIndex && i < preview.length; i++) {
    cells.push(preview[i].pos);
    stepCells.push(preview[i]);
  }

  editorState.activeDiagnosticId = null;
  editorState.activeDebugCategory = null;
  editorState.activeSolutionStep = stepIndex;
  editorState.activeDiagnosticCells = cells;
  editorState.activeDiagnosticClass = "diag-solution-step";
  editorState.stepNumberCells = stepCells;
  renderEditorBoard();
  renderDiagnosisResult(result);
}

function renderDiagnosisResult(result) {
  if (!result) return;

  if (result.solvable) {
    diagnosisStatusEl.querySelector(".status-icon").textContent = "✅";
    diagnosisStatusEl.querySelector(".status-text").textContent = "关卡可通关";
    diagnosisStatusEl.className = "diagnosis-status status-solvable";
  } else {
    diagnosisStatusEl.querySelector(".status-icon").textContent = "❌";
    diagnosisStatusEl.querySelector(".status-text").textContent = "关卡不可通关";
    diagnosisStatusEl.className = "diagnosis-status status-unsolvable";
  }

  let checksHtml = "";
  result.checks.forEach(check => {
    const icon = check.passed ? "✓" : "✗";
    const className = check.passed ? "check-item check-passed" : "check-item check-failed";
    checksHtml += `<div class="${className}"><span class="check-icon">${icon}</span><span class="check-name">${check.name}</span></div>`;
  });
  diagnosisChecksEl.innerHTML = checksHtml;

  let debugSummaryHtml = renderDebugSummary(result);

  if (result.issues.length > 0) {
    let issuesHtml = `<div class="diagnosis-section-title">问题</div>`;
    result.issues.forEach(issue => {
      const issueId = issue.id || "";
      const issueMsg = issue.message || String(issue);
      const issueCells = issue.cells || [];
      const isActive = editorState.activeDiagnosticId === issueId;
      const highlightClass = getHighlightClassForType(issue.type);
      issuesHtml += `<div class="issue-item diagnostic-item ${isActive ? "active" : ""}" data-diagnostic-id="${issueId}" data-highlight-class="${highlightClass}">⚠️ ${issueMsg}`;
      if (issueCells.length > 0) {
        issuesHtml += ` <span class="diagnosis-count-badge">${issueCells.length}格</span>`;
      }
      issuesHtml += `</div>`;
    });
    diagnosisIssuesEl.innerHTML = issuesHtml + debugSummaryHtml;
  } else {
    diagnosisIssuesEl.innerHTML = debugSummaryHtml;
  }

  if (result.warnings.length > 0) {
    let warningsHtml = `<div class="diagnosis-section-title">提示</div>`;
    result.warnings.forEach(warning => {
      const warnId = warning.id || "";
      const warnMsg = warning.message || String(warning);
      const warnCells = warning.cells || [];
      const isActive = editorState.activeDiagnosticId === warnId;
      const highlightClass = getHighlightClassForType(warning.type);
      warningsHtml += `<div class="warning-item diagnostic-item ${isActive ? "active" : ""}" data-diagnostic-id="${warnId}" data-highlight-class="${highlightClass}">💡 ${warnMsg}`;
      if (warnCells.length > 0) {
        warningsHtml += ` <span class="diagnosis-count-badge">${warnCells.length}格</span>`;
      }
      warningsHtml += `</div>`;
    });
    diagnosisWarningsEl.innerHTML = warningsHtml;
  } else {
    diagnosisWarningsEl.innerHTML = "";
  }

  if (result.solution && result.solution.actions) {
    const steps = result.solution.actions.length;
    let solutionHtml = `<div class="diagnosis-section-title">示例解法</div>`;
    solutionHtml += `<div class="solution-info">约 ${steps} 步完成</div>`;

    solutionHtml += `<div class="solution-step-preview">`;
    const previewCount = Math.min(6, result.solution.actions.length);
    const preview = result.debug && result.debug.solutionPreview ? result.debug.solutionPreview : [];
    for (let i = 0; i < previewCount; i++) {
      const action = result.solution.actions[i] || "";
      const pos = preview[i] ? preview[i].pos : null;
      const isActive = editorState.activeSolutionStep === i;
      const posStr = pos ? `(${pos.x},${pos.y})` : "";
      solutionHtml += `<div class="solution-step-item ${isActive ? "active" : ""}" data-step-index="${i}">
        <span class="solution-step-num">${i + 1}</span>
        <span class="solution-step-action">${action}</span>
        <span class="solution-step-pos">${posStr}</span>
      </div>`;
    }
    if (result.solution.actions.length > previewCount) {
      solutionHtml += `<span class="action-more">... 还有 ${result.solution.actions.length - previewCount} 步</span>`;
    }
    solutionHtml += `</div>`;

    diagnosisSolutionEl.innerHTML = solutionHtml;
  } else {
    diagnosisSolutionEl.innerHTML = "";
  }

  bindDiagnosticClickHandlers(result);
}

function renderDebugSummary(result) {
  const debug = result.debug || {};
  const unreachableCount = (debug.unreachableCells || []).length;
  const visionCount = (debug.permanentlyBlockedCells || []).length;
  const keyCount = (debug.keyDependencies || []).length;
  const doorCount = (debug.problemDoors || []).length;
  const solutionCount = (debug.solutionPreview || []).length;

  if (unreachableCount === 0 && visionCount === 0 && keyCount === 0 && doorCount === 0 && solutionCount === 0) {
    return "";
  }

  const unreachableActive = editorState.activeDebugCategory === "unreachable";
  const visionActive = editorState.activeDebugCategory === "vision";
  const keyActive = editorState.activeDebugCategory === "key";
  const doorActive = editorState.activeDebugCategory === "door";
  const solutionActive = editorState.activeDebugCategory === "solution";
  const hasAnyActive = editorState.activeDiagnosticId || editorState.activeDebugCategory || editorState.activeSolutionStep !== null;

  let html = `<div class="debug-summary-section">
    <div class="debug-summary-title">
      <span>调试视图</span>
      ${hasAnyActive ? '<button type="button" class="debug-summary-clear" id="debugClearBtn">清除高亮</button>' : ""}
    </div>
    <div class="debug-summary-items">`;

  if (unreachableCount > 0) {
    html += `<span class="debug-chip debug-chip-unreachable ${unreachableActive ? "active" : ""}" data-debug-category="unreachable">
      <span class="debug-chip-icon">🚫</span>不可达 ${unreachableCount}格
    </span>`;
  }
  if (visionCount > 0) {
    html += `<span class="debug-chip debug-chip-vision ${visionActive ? "active" : ""}" data-debug-category="vision">
      <span class="debug-chip-icon">👁</span>视线封锁 ${visionCount}格
    </span>`;
  }
  if (keyCount > 0) {
    html += `<span class="debug-chip debug-chip-key ${keyActive ? "active" : ""}" data-debug-category="key">
      <span class="debug-chip-icon">🔑</span>钥匙依赖 ${keyCount}个
    </span>`;
  }
  if (doorCount > 0) {
    html += `<span class="debug-chip debug-chip-door ${doorActive ? "active" : ""}" data-debug-category="door">
      <span class="debug-chip-icon">🚪</span>问题门 ${doorCount}个
    </span>`;
  }
  if (solutionCount > 0) {
    html += `<span class="debug-chip debug-chip-solution ${solutionActive ? "active" : ""}" data-debug-category="solution">
      <span class="debug-chip-icon">🗺</span>解法前${solutionCount}步
    </span>`;
  }

  html += `</div></div>`;
  return html;
}

function bindDiagnosticClickHandlers(result) {
  diagnosisIssuesEl.querySelectorAll(".diagnostic-item").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.diagnosticId;
      const highlightClass = el.dataset.highlightClass || "diag-generic-highlight";
      const allIssues = (result.issues || []).concat(result.warnings || []);
      const item = allIssues.find(i => i.id === id);
      const cells = item && item.cells ? item.cells : [];
      setDiagnosticHighlight(id, cells, highlightClass);
    });
  });

  diagnosisWarningsEl.querySelectorAll(".diagnostic-item").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.diagnosticId;
      const highlightClass = el.dataset.highlightClass || "diag-generic-highlight";
      const allIssues = (result.issues || []).concat(result.warnings || []);
      const item = allIssues.find(i => i.id === id);
      const cells = item && item.cells ? item.cells : [];
      setDiagnosticHighlight(id, cells, highlightClass);
    });
  });

  const clearBtn = document.getElementById("debugClearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearDiagnosticHighlight();
      renderDiagnosisResult(editorState.lastDiagnosisResult);
    });
  }

  document.querySelectorAll(".debug-chip").forEach(el => {
    el.addEventListener("click", () => {
      const category = el.dataset.debugCategory;
      setDebugCategoryHighlight(category);
    });
  });

  diagnosisSolutionEl.querySelectorAll(".solution-step-item").forEach(el => {
    el.addEventListener("click", () => {
      const stepIndex = parseInt(el.dataset.stepIndex, 10);
      if (!isNaN(stepIndex)) {
        setSolutionStepHighlight(stepIndex);
      }
    });
  });
}

function isLevelSolvable() {
  if (editorState.lastDiagnosisResult) {
    return editorState.lastDiagnosisResult.solvable;
  }
  return false;
}

initEditor();
