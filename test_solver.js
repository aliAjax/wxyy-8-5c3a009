const fs = require('fs');

const mockElements = {};
global.document = {
  getElementById: (id) => {
    if (!mockElements[id]) {
      mockElements[id] = {
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        textContent: '',
        innerHTML: '',
        addEventListener: () => {},
        appendChild: () => {},
        children: []
      };
    }
    return mockElements[id];
  },
  querySelector: () => mockElements['default'] || { classList: { add: () => {}, remove: () => {} } }
};
global.window = {
  addEventListener: () => {},
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
};

const appCode = fs.readFileSync('app.js', 'utf8');

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
    walls: ["2,2", "2,3", "2,4", "4,2", "4,3", "4,4", "5,0", "5,1"],
    doors: [{ x: 3, y: 3, open: false }],
    keys: [{ x: 0, y: 1 }],
    exhibits: [{ x: 6, y: 6, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [
      { path: [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 3 }, { x: 3, y: 3 }], step: 0, behavior: "patrol", hearingRange: 5 }
    ],
    exit: { x: 7, y: 0 }
  },
  {
    name: "三",
    walls: ["2,1", "2,2", "4,4", "4,5", "6,2", "6,3"],
    doors: [{ x: 3, y: 2, open: false }, { x: 5, y: 4, open: false }],
    keys: [{ x: 1, y: 3 }, { x: 7, y: 6 }],
    exhibits: [{ x: 6, y: 0, fixed: false }, { x: 0, y: 0, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [
      { path: [{ x: 5, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 3 }, { x: 5, y: 3 }], step: 0, behavior: "investigate", hearingRange: 5 },
      { path: [{ x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }], step: 0, behavior: "fixed", hearingRange: 3 }
    ],
    exit: { x: 7, y: 0 }
  },
  {
    name: "四",
    walls: ["1,2", "1,3", "3,1", "3,2", "5,3", "5,4", "5,5", "6,5"],
    doors: [{ x: 4, y: 3, open: false }],
    keys: [{ x: 2, y: 5 }, { x: 0, y: 0 }],
    exhibits: [{ x: 7, y: 2, fixed: false }, { x: 6, y: 0, fixed: false }],
    player: { x: 0, y: 6 },
    guards: [
      { path: [{ x: 5, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 3 }, { x: 5, y: 3 }], step: 0, behavior: "trace", hearingRange: 4 }
    ],
    exit: { x: 7, y: 6 },
    mechanisms: {
      pressurePlates: [{ x: 2, y: 1, targetDoors: [{ x: 4, y: 3 }] }],
      screens: [],
      lights: [],
      cameras: []
    }
  },
  {
    name: "五",
    walls: ["1,1", "1,4", "3,2", "3,3", "3,5", "5,1", "5,4", "6,2", "6,3"],
    doors: [{ x: 2, y: 3, open: false }, { x: 4, y: 4, open: false }],
    keys: [{ x: 0, y: 2 }, { x: 7, y: 5 }],
    exhibits: [{ x: 7, y: 1, fixed: false }, { x: 6, y: 6, fixed: false }, { x: 0, y: 6, fixed: false }],
    player: { x: 0, y: 0 },
    guards: [
      { path: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 4 }, { x: 2, y: 4 }], step: 0, behavior: "investigate", hearingRange: 6 },
      { path: [{ x: 6, y: 2 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 7, y: 2 }], step: 0, behavior: "trace", hearingRange: 4 }
    ],
    exit: { x: 7, y: 0 }
  },
  {
    name: "六",
    walls: ["2,2", "2,3", "4,1", "4,2", "4,5", "5,3", "5,4", "6,1", "6,4"],
    doors: [{ x: 3, y: 2, open: false }, { x: 5, y: 2, open: false }],
    keys: [{ x: 1, y: 0 }, { x: 0, y: 4 }],
    exhibits: [{ x: 7, y: 3, fixed: false }, { x: 6, y: 6, fixed: false }, { x: 1, y: 6, fixed: false }],
    player: { x: 0, y: 0 },
    guards: [
      { path: [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 3, y: 4 }], step: 0, behavior: "patrol", hearingRange: 5 },
      { path: [{ x: 1, y: 5 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 2, y: 5 }], step: 0, behavior: "investigate", hearingRange: 5 },
      { path: [{ x: 6, y: 0 }, { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 7, y: 0 }], step: 0, behavior: "trace", hearingRange: 4 }
    ],
    exit: { x: 7, y: 6 }
  }
];

eval(appCode.replace(/init\(\);?$/, ''));

console.log('=== 测试统一求解器 ===\n');

let allPassed = true;

for (let i = 0; i < levels.length; i++) {
  const level = JSON.parse(JSON.stringify(levels[i]));
  
  console.log(`测试关卡 ${level.name}:`);
  console.log(`  机制: ${level.guards.map(g => g.behavior).join(', ')}`);
  
  try {
    const result = unifiedSolveLevel(level, { maxIterations: 150000, mode: 'full' });
    
    if (result && result.solvable) {
      console.log(`  ✓ 可解 - 步数: ${result.steps}, 迭代: ${result.totalActions}`);
      console.log(`  路径: ${result.actions.slice(0, 5).join(' → ')}${result.actions.length > 5 ? '...' : ''}`);
      if (result.finalAlertLevel !== undefined) {
        console.log(`  最终警觉等级: ${result.finalAlertLevel}`);
      }
    } else {
      console.log(`  ✗ 无解 - 迭代: ${result ? result.totalActions : 'unknown'}`);
      allPassed = false;
    }
  } catch (e) {
    console.log(`  ✗ 错误: ${e.message}`);
    console.log(e.stack);
    allPassed = false;
  }
  console.log('');
}

console.log('=== 测试提示系统 ===\n');

for (let i = 0; i < Math.min(3, levels.length); i++) {
  const level = JSON.parse(JSON.stringify(levels[i]));
  level.keys = level.keys.map((k) => ({ ...k, taken: false }));
  level.exhibits = level.exhibits.map((e) => ({ ...e, fixed: false }));
  level.doors = level.doors.map((d) => ({ ...d, open: false }));
  level.guards = initializeGuards(level.guards || []);
  level.mechanisms = level.mechanisms || { pressurePlates: [], screens: [], lights: [], cameras: [] };
  level.mechanisms.pressurePlates = (level.mechanisms.pressurePlates || []).map((p) => ({ ...p, triggered: false }));
  level.mechanisms.screens = (level.mechanisms.screens || []).map((s) => ({ ...s }));
  level.mechanisms.lights = (level.mechanisms.lights || []).map((l) => ({ ...l, active: false }));
  level.mechanisms.cameras = (level.mechanisms.cameras || []).map((c) => ({ ...c, disabled: false }));
  level.openedDoors = [];
  
  const mockState = {
    level: level,
    player: { ...level.player },
    keys: 0,
    ap: 4,
    visionReduced: false,
    pendingVisionReduction: false,
    cameraShutdownTurns: 0,
    alertLevel: 0
  };
  
  global.state = mockState;
  
  console.log(`关卡 ${level.name} 提示测试:`);
  try {
    const hintResult = searchHintPath();
    if (hintResult) {
      console.log(`  ✓ 找到提示路径 - 长度: ${hintResult.path.length}`);
      console.log(`  推荐: ${hintResult.actionLabels.slice(1, 4).join(' → ')}`);
    } else {
      console.log(`  ⚠ 未找到提示路径（可能需要先移动）`);
    }
  } catch (e) {
    console.log(`  ✗ 错误: ${e.message}`);
    allPassed = false;
  }
  console.log('');
}

console.log('=== 测试关卡诊断 ===\n');

for (let i = 0; i < Math.min(3, levels.length); i++) {
  const level = JSON.parse(JSON.stringify(levels[i]));
  
  console.log(`关卡 ${level.name} 诊断测试:`);
  try {
    const diagnoseResult = diagnoseLevel(level);
    console.log(`  可解: ${diagnoseResult.solvable}`);
    console.log(`  检查项: ${diagnoseResult.checks.map(c => `${c.name}: ${c.passed ? '✓' : '✗'}`).join(', ')}`);
    if (diagnoseResult.issues.length > 0) {
      console.log(`  问题: ${diagnoseResult.issues.map(i => i.message).join(', ')}`);
    }
    if (diagnoseResult.warnings.length > 0) {
      console.log(`  警告: ${diagnoseResult.warnings.map(w => w.message).join(', ')}`);
    }
  } catch (e) {
    console.log(`  ✗ 错误: ${e.message}`);
    allPassed = false;
  }
  console.log('');
}

console.log('=== 测试每日挑战校验 ===\n');

const testDate = '2024-01-15';
console.log(`测试日期: ${testDate}`);
try {
  const testLevel = generateDailyLevel(testDate);
  console.log(`  ✓ 生成关卡成功: ${testLevel.name}`);
  console.log(`  展柜: ${testLevel.exhibits.length}, 钥匙: ${testLevel.keys.length}, 门: ${testLevel.doors.length}, 巡逻员: ${testLevel.guards.length}`);
  
  const verifyResult = verifyLevelSolvable(testLevel);
  console.log(`  校验可解: ${verifyResult ? '✓' : '✗'}`);
  
  const solveResult = unifiedSolveLevel(testLevel, { maxIterations: 100000, mode: 'full' });
  console.log(`  统一求解器: ${solveResult.solvable ? '✓ 可解' : '✗ 无解'}`);
  if (solveResult.solvable) {
    console.log(`  步数: ${solveResult.steps}`);
  }
} catch (e) {
  console.log(`  ✗ 错误: ${e.message}`);
  console.log(e.stack);
  allPassed = false;
}

console.log('\n=== 测试总结 ===');
console.log(`所有测试: ${allPassed ? '✓ 通过' : '✗ 失败'}`);

process.exit(allPassed ? 0 : 1);
