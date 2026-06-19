const editorEl = document.getElementById("editor");
const editorBoardEl = document.getElementById("editorBoard");
const editorToggleBtn = document.getElementById("editorToggleBtn");
const editorCloseBtn = document.getElementById("editorCloseBtn");
const editorPlayBtn = document.getElementById("editorPlayBtn");
const editorSaveBtn = document.getElementById("editorSaveBtn");
const editorLoadBtn = document.getElementById("editorLoadBtn");
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

const GRID_WIDTH = 8;
const GRID_HEIGHT = 7;
const STORAGE_KEY = "museum_editor_level";

let editorState = {
  currentTool: "wall",
  level: createEmptyLevel(),
  currentGuardPath: null,
  isOpen: false
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
      lights: []
    }
  };
}

function initEditor() {
  bindEditorEvents();
  renderEditorBoard();
  updateEditorStats();
}

function bindEditorEvents() {
  editorToggleBtn.addEventListener("click", toggleEditor);
  editorCloseBtn.addEventListener("click", toggleEditor);
  editorPlayBtn.addEventListener("click", playEditorLevel);
  editorSaveBtn.addEventListener("click", saveLevelToStorage);
  editorLoadBtn.addEventListener("click", loadLevelFromStorage);
  editorClearBtn.addEventListener("click", clearEditorLevel);
  editorLevelNameInput.addEventListener("input", (e) => {
    editorState.level.name = e.target.value || "自定义";
  });

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
  }
}

function renderEditorBoard() {
  editorBoardEl.innerHTML = "";
  const level = editorState.level;

  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const point = { x, y };
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

      const mech = level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
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
  } else {
    placeOrRemove(tool, point);
  }

  renderEditorBoard();
  updateEditorStats();
  validateLevel();
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
  const mech = level.mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
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
  const mech = level.mechanisms || { pressurePlates: [], screens: [], lights: [] };
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
      step: 0
    });
    editorState.currentGuardPath = [];
  }
}

function playEditorLevel() {
  finishGuardPath();

  if (!validateLevel()) {
    showWarning("关卡不完整，请检查警告");
    return;
  }

  const levelData = JSON.parse(JSON.stringify(editorState.level));
  if (typeof loadCustomLevel === "function") {
    loadCustomLevel(levelData);
    toggleEditor();
  }
}

function saveLevelToStorage() {
  finishGuardPath();
  const levelData = JSON.parse(JSON.stringify(editorState.level));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levelData));
    showWarning("关卡已保存到本地");
  } catch (e) {
    showWarning("保存失败");
  }
}

function loadLevelFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const levelData = JSON.parse(data);
      editorState.level = levelData;
      editorLevelNameInput.value = levelData.name || "自定义";
      renderEditorBoard();
      updateEditorStats();
      validateLevel();
      showWarning("关卡已读取");
    } else {
      showWarning("没有找到存档");
    }
  } catch (e) {
    showWarning("读取失败");
  }
}

function clearEditorLevel() {
  if (confirm("确定要清空当前关卡吗？")) {
    editorState.level = createEmptyLevel();
    editorState.currentGuardPath = null;
    editorLevelNameInput.value = "自定义";
    renderEditorBoard();
    updateEditorStats();
    validateLevel();
  }
}

initEditor();
