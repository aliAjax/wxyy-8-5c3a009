const { unifiedSolveLevel, BOARD_W, BOARD_H, GUARD_BEHAVIOR, CAMERA_DIRECTION } = require('./debug_level3.js');

let passed = 0;
let failed = 0;
let testCount = 0;

function test(name, fn) {
  testCount++;
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name}`);
    console.log(`    ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'assertion failed');
  }
}

function assertEq(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'assertEq failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function solveQuiet(level, options = {}) {
  return unifiedSolveLevel(level, { ...options, quiet: true });
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

console.log('=== 关卡求解器回归测试 ===\n');

console.log('1. 钥匙开门规则测试');
(function testKeyDoor() {
  test('有钥匙时可以开门并到达目标', () => {
    const lv = {
      name: "钥匙开门-有钥匙",
      walls: ["3,0", "3,1", "3,2", "3,4", "3,5", "3,6"],
      doors: [{ x: 3, y: 3, open: false }],
      keys: [{ x: 1, y: 3 }],
      exhibits: [{ x: 5, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 5, y: 3 }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(result.solvable, '有钥匙时应该能开门到达目标');
    const doorOpened = result.actions.some(a => a.includes('开门'));
    assert(doorOpened, '动作路径中应包含开门动作');
    const keyPicked = result.actions.some(a => a.includes('拾钥匙'));
    assert(keyPicked, '动作路径中应包含拾钥匙动作');
  });

  test('无钥匙时无法开门到达目标', () => {
    const lv = {
      name: "钥匙开门-无钥匙",
      walls: ["3,0", "3,1", "3,2", "3,4", "3,5", "3,6"],
      doors: [{ x: 3, y: 3, open: false }],
      keys: [],
      exhibits: [{ x: 5, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 5, y: 3 }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(!result.solvable, '没有钥匙且墙完全阻隔时应该无法到达目标');
  });

  test('一把钥匙只能开一扇门', () => {
    const lv = {
      name: "钥匙开门-钥匙不足",
      walls: [
        "2,0", "2,1", "2,2", "2,4", "2,5", "2,6",
        "5,0", "5,1", "5,2", "5,4", "5,5", "5,6"
      ],
      doors: [{ x: 2, y: 3, open: false }, { x: 5, y: 3, open: false }],
      keys: [{ x: 0, y: 3 }],
      exhibits: [{ x: 7, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 7, y: 3 }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(!result.solvable, '只有一把钥匙但有两扇门时应该无法通过');
  });

  test('两把钥匙可以开两扇门', () => {
    const lv = {
      name: "钥匙开门-两把钥匙",
      walls: [
        "2,0", "2,1", "2,2", "2,4", "2,5", "2,6",
        "5,0", "5,1", "5,2", "5,4", "5,5", "5,6"
      ],
      doors: [{ x: 2, y: 3, open: false }, { x: 5, y: 3, open: false }],
      keys: [{ x: 0, y: 3 }, { x: 3, y: 3 }],
      exhibits: [{ x: 7, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 7, y: 3 }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(result.solvable, '两把钥匙应该能开两扇门通过');
  });
})();

console.log('\n2. 压力板开门规则测试');
(function testPressurePlate() {
  test('踩压力板可以打开目标门', () => {
    const lv = {
      name: "压力板-开门",
      walls: ["4,0", "4,1", "4,2", "4,4", "4,5", "4,6"],
      doors: [{ x: 4, y: 3, open: false }],
      keys: [],
      exhibits: [{ x: 6, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 6, y: 3 },
      mechanisms: {
        pressurePlates: [{ x: 2, y: 3, targetDoors: [{ x: 4, y: 3 }], triggered: false }],
        screens: [],
        lights: [],
        cameras: []
      }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(result.solvable, '踩压力板应该能开门并通过');
    const hasPlateAction = result.actions.some(a => a.includes('踩压板'));
    assert(hasPlateAction, '动作路径中应包含踩压板动作');
  });

  test('没有压力板且无钥匙时门无法打开', () => {
    const lv = {
      name: "压力板-无",
      walls: ["4,0", "4,1", "4,2", "4,4", "4,5", "4,6"],
      doors: [{ x: 4, y: 3, open: false }],
      keys: [],
      exhibits: [{ x: 6, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 6, y: 3 },
      mechanisms: {
        pressurePlates: [],
        screens: [],
        lights: [],
        cameras: []
      }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(!result.solvable, '没有压力板且没有钥匙时门应该无法打开');
  });

  test('压力板可以控制多扇门', () => {
    const lv = {
      name: "压力板-多门",
      walls: [
        "2,0", "2,1", "2,2", "2,4", "2,5", "2,6",
        "5,0", "5,1", "5,2", "5,4", "5,5", "5,6"
      ],
      doors: [{ x: 2, y: 3, open: false }, { x: 5, y: 3, open: false }],
      keys: [],
      exhibits: [{ x: 7, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 7, y: 3 },
      mechanisms: {
        pressurePlates: [
          { x: 1, y: 3, targetDoors: [{ x: 2, y: 3 }, { x: 5, y: 3 }], triggered: false }
        ],
        screens: [],
        lights: [],
        cameras: []
      }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(result.solvable, '一个压力板可以控制多扇门同时打开');
  });
})();

console.log('\n3. 屏风遮挡规则测试');
(function testScreenBlock() {
  test('屏风能阻挡摄像头视线', () => {
    const lv = {
      name: "屏风-阻挡摄像头",
      walls: ["4,0", "4,1", "4,2", "4,4", "4,5", "4,6"],
      doors: [{ x: 4, y: 3, open: false }],
      keys: [{ x: 2, y: 3 }],
      exhibits: [{ x: 6, y: 3, fixed: false }],
      player: { x: 0, y: 0 },
      guards: [],
      exit: { x: 7, y: 3 },
      mechanisms: {
        pressurePlates: [],
        screens: [{ x: 1, y: 3 }],
        lights: [],
        cameras: [
          { x: 0, y: 3, direction: "right", disabled: false }
        ]
      }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(result.solvable, '有屏风挡住摄像头视线时，玩家应该能安全拿到钥匙开门通过');
    const hasKeyAction = result.actions.some(a => a.includes('拾钥匙'));
    assert(hasKeyAction, '动作路径中应包含拾钥匙动作');
  });

  test('无屏风阻挡时摄像头会发现玩家', () => {
    const lv = {
      name: "屏风-无阻挡摄像头",
      walls: ["4,0", "4,1", "4,2", "4,4", "4,5", "4,6"],
      doors: [{ x: 4, y: 3, open: false }],
      keys: [{ x: 2, y: 3 }],
      exhibits: [{ x: 6, y: 3, fixed: false }],
      player: { x: 0, y: 0 },
      guards: [],
      exit: { x: 7, y: 3 },
      mechanisms: {
        pressurePlates: [],
        screens: [],
        lights: [],
        cameras: [
          { x: 0, y: 3, direction: "right", disabled: false }
        ]
      }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(!result.solvable, '没有屏风时，钥匙在摄像头视野内，玩家去拿钥匙会被发现导致警戒升级');
  });

  test('可以推动屏风移动位置', () => {
    const lv = {
      name: "屏风-推动",
      walls: [
        "0,0", "1,0", "2,0", "3,0", "4,0", "5,0", "6,0", "7,0",
        "0,6", "1,6", "2,6", "3,6", "4,6", "5,6", "6,6", "7,6",
        "0,1", "0,2", "0,3", "0,4", "0,5",
        "7,1", "7,2", "7,3", "7,4", "7,5",
        "3,1", "3,2", "3,4", "3,5"
      ],
      doors: [],
      keys: [{ x: 5, y: 3 }],
      exhibits: [{ x: 6, y: 3, fixed: false }],
      player: { x: 1, y: 3 },
      guards: [],
      exit: { x: 6, y: 3 },
      mechanisms: {
        pressurePlates: [],
        screens: [{ x: 2, y: 3 }],
        lights: [],
        cameras: []
      }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(result.solvable, '通道被屏风挡住，应该能推动屏风前进拿钥匙');
    const hasPushAction = result.actions.some(a => a.includes('推屏风'));
    assert(hasPushAction, '动作路径中应包含推屏风动作');
  });
})();

console.log('\n4. 熄灯影响摄像头规则测试');
(function testLightCamera() {
  test('摄像头在正常状态下会监视并提升警戒', () => {
    const lv = {
      name: "摄像头-正常",
      walls: ["0,1", "1,1", "2,1", "3,1", "4,1", "5,1", "6,1", "7,1",
              "0,5", "1,5", "2,5", "3,5", "4,5", "5,5", "6,5", "7,5"],
      doors: [],
      keys: [],
      exhibits: [{ x: 7, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 7, y: 3 },
      mechanisms: {
        pressurePlates: [],
        screens: [],
        lights: [],
        cameras: [
          { x: 3, y: 3, direction: "right", disabled: false }
        ]
      }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(!result.solvable, '穿越摄像头长视野时警戒会升到3级导致失败');
  });

  test('熄灯后摄像头失效可以安全通过', () => {
    const lv = {
      name: "摄像头-熄灯",
      walls: ["0,1", "1,1", "2,1", "3,1", "4,1", "5,1", "6,1", "7,1",
              "0,5", "1,5", "2,5", "3,5", "4,5", "5,5", "6,5", "7,5"],
      doors: [],
      keys: [],
      exhibits: [{ x: 7, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 7, y: 3 },
      mechanisms: {
        pressurePlates: [],
        screens: [],
        lights: [{ x: 1, y: 3, active: false }],
        cameras: [
          { x: 3, y: 3, direction: "right", disabled: false }
        ]
      }
    };
    const result = solveQuiet(lv, { maxIterations: 100000, mode: 'full' });
    assert(result.solvable, '熄灯后摄像头应该失效，玩家可以安全通过');
    const hasLightAction = result.actions.some(a => a.includes('熄灯'));
    assert(hasLightAction, '动作路径中应包含熄灯动作');
  });

  test('视野缩减时摄像头视野从6格缩小为3格', () => {
    const lv = {
      name: "摄像头视野缩减",
      walls: [
        "0,1", "1,1", "2,1", "3,1", "4,1", "5,1", "6,1", "7,1",
        "0,4", "1,4", "2,4", "3,4", "4,4", "5,4", "6,4", "7,4"
      ],
      doors: [],
      keys: [],
      exhibits: [{ x: 7, y: 3, fixed: false }],
      player: { x: 6, y: 2 },
      guards: [],
      exit: { x: 7, y: 3 },
      mechanisms: {
        pressurePlates: [],
        screens: [],
        lights: [],
        cameras: [
          { x: 3, y: 3, direction: "right", disabled: false }
        ]
      }
    };

    const normalState = {
      player: { x: 6, y: 2 },
      keys: 0,
      keysTaken: [],
      doorsOpen: [],
      fixed: [false],
      screens: [],
      lightsActive: [],
      visionReduced: false,
      cameraShutdownTurns: 0,
      alertLevel: 0,
      ap: 4,
      step: 0
    };
    const normalResult = solveQuiet(lv, { maxIterations: 50000, mode: 'full', startState: normalState });
    assert(!normalResult.solvable, '正常视野6格时，目标(7,3)在摄像头视野内，玩家一靠近就失败');

    const reducedState = deepClone(normalState);
    reducedState.visionReduced = true;
    const reducedResult = solveQuiet(lv, { maxIterations: 50000, mode: 'full', startState: reducedState });
    assert(reducedResult.solvable, '视野缩减为3格时，目标(7,3)不在视野内，玩家可以安全接近并修复');
    const hasFixAction = reducedResult.actions.some(a => a.includes('修复展柜'));
    assert(hasFixAction, '动作路径中应包含修复展柜动作');
  });
})();

console.log('\n5. Trace 守卫追踪开门痕迹测试');
(function testTraceGuard() {
  test('开门后 openedDoors 会记录痕迹', () => {
    const lv = {
      name: "Trace-开门留痕",
      walls: ["3,0", "3,1", "3,2", "3,4", "3,5", "3,6"],
      doors: [{ x: 3, y: 3, open: false }],
      keys: [{ x: 1, y: 3 }],
      exhibits: [{ x: 5, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 5, y: 3 }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(result.solvable, '应该能找到解');
    const hasOpenDoor = result.actions.some(a => a.includes('开门'));
    assert(hasOpenDoor, '应包含开门动作');
  });

  test('trace 守卫初始状态为 patrol', () => {
    const startState = {
      player: { x: 0, y: 0 },
      keys: 0,
      keysTaken: [],
      doorsOpen: [],
      fixed: [],
      guards: [
        {
          path: [{ x: 4, y: 4 }, { x: 4, y: 4 }],
          originalPath: [{ x: 4, y: 4 }, { x: 4, y: 4 }],
          step: 0,
          originalStep: 0,
          pos: { x: 4, y: 4 },
          behavior: "trace",
          direction: 1,
          state: "patrol",
          investigateTarget: null,
          investigateTimer: 0,
          traceTarget: null,
          tracePath: [],
          alertLevel: 0,
          hearingRange: 0,
          id: 0
        }
      ],
      openedDoors: [],
      ap: 4,
      step: 0
    };
    assertEq(startState.guards[0].state, 'patrol', 'trace 守卫初始状态应为 patrol');
    assertEq(startState.openedDoors.length, 0, '初始状态没有开门痕迹');
  });

  test('trace 守卫附近有开门痕迹会进入追踪状态', () => {
    const lv = {
      name: "Trace-守卫追踪",
      walls: ["4,0", "4,1", "4,2", "4,4", "4,5", "4,6"],
      doors: [{ x: 4, y: 3, open: false }],
      keys: [{ x: 0, y: 3 }],
      exhibits: [{ x: 6, y: 0, fixed: false }],
      player: { x: 0, y: 6 },
      guards: [
        { path: [{ x: 5, y: 4 }, { x: 5, y: 4 }], step: 0, behavior: "trace", hearingRange: 0 }
      ],
      exit: { x: 6, y: 6 }
    };
    const result = solveQuiet(lv, { maxIterations: 200000, mode: 'full' });
    assert(result.solvable, '虽然有 trace 守卫，但应能找到通关路径');
    assert(result.actions.length > 0, '动作路径不应为空');
  });
})();

console.log('\n6. 求解器边界条件与模式测试');
(function testEdgeCases() {
  test('已完成状态直接返回成功且零迭代', () => {
    const lv = {
      name: "边界-已完成",
      walls: [],
      doors: [],
      keys: [],
      exhibits: [{ x: 3, y: 3, fixed: true }],
      player: { x: 3, y: 3 },
      guards: [],
      exit: { x: 3, y: 3 }
    };
    const startState = {
      player: { x: 3, y: 3 },
      keys: 0,
      keysTaken: [],
      doorsOpen: [],
      fixed: [true],
      ap: 4,
      step: 0
    };
    const result = solveQuiet(lv, { maxIterations: 1000, mode: 'full', startState: startState });
    assert(result.solvable, '已完成状态应该直接返回可解');
    assertEq(result.totalActions, 0, '已完成状态总迭代数应为0');
  });

  test('完全被墙阻隔的关卡返回无解', () => {
    const lv = {
      name: "边界-无解",
      walls: ["0,3", "1,3", "2,3", "3,3", "4,3", "5,3", "6,3", "7,3"],
      doors: [],
      keys: [],
      exhibits: [{ x: 7, y: 0, fixed: false }],
      player: { x: 0, y: 6 },
      guards: [],
      exit: { x: 7, y: 0 }
    };
    const result = solveQuiet(lv, { maxIterations: 10000, mode: 'full' });
    assert(!result.solvable, '被墙完全隔开的关卡应该无解');
  });

  test('hint 模式也能返回有效路径', () => {
    const lv = deepClone(levels[0]);
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'hint' });
    assert(result.solvable, 'hint 模式应该也能找到解');
    assert(Array.isArray(result.path) && result.path.length > 0, 'hint 模式应返回非空路径');
  });

  test('返回结果包含完整的动作描述', () => {
    const lv = {
      name: "边界-动作描述",
      walls: [],
      doors: [],
      keys: [{ x: 1, y: 0 }],
      exhibits: [],
      player: { x: 0, y: 0 },
      guards: [],
      exit: { x: 2, y: 0 }
    };
    const result = solveQuiet(lv, { maxIterations: 10000, mode: 'full' });
    assert(result.solvable, '简单关卡应该可解');
    assert(result.actions.length >= 2, '至少有开局和移动');
    assert(typeof result.actions[0] === 'string', '动作应该是字符串');
  });

  test('压力板开门会记录到 openedDoors 供 trace 使用', () => {
    const lv = {
      name: "压力板开门-留痕",
      walls: ["4,0", "4,1", "4,2", "4,4", "4,5", "4,6"],
      doors: [{ x: 4, y: 3, open: false }],
      keys: [],
      exhibits: [{ x: 6, y: 3, fixed: false }],
      player: { x: 0, y: 3 },
      guards: [],
      exit: { x: 6, y: 3 },
      mechanisms: {
        pressurePlates: [{ x: 2, y: 3, targetDoors: [{ x: 4, y: 3 }], triggered: false }],
        screens: [],
        lights: [],
        cameras: []
      }
    };
    const result = solveQuiet(lv, { maxIterations: 50000, mode: 'full' });
    assert(result.solvable, '压力板开门关卡应该可解');
    const hasPlateAction = result.actions.some(a => a.includes('踩压板'));
    assert(hasPlateAction, '动作中应包含踩压板');
  });
})();

console.log('\n7. 内置关卡可解性回归测试');
const fastLevels = [0, 1, 2, 3, 5, 6];
const slowLevels = [4];
const levelIterMap = [500000, 500000, 1000000, 500000, 2000000, 500000, 500000];
const runSlow = process.argv.includes('--slow');

for (let i = 0; i < levels.length; i++) {
  if (!runSlow && slowLevels.includes(i)) {
    console.log(`  SKIP: 关卡 ${levels[i].name} 可解（慢速测试，使用 --slow 参数运行）`);
    continue;
  }
  const lv = deepClone(levels[i]);
  const maxIter = levelIterMap[i];
  const result = solveQuiet(lv, { maxIterations: maxIter, mode: 'full' });
  test(`关卡 ${lv.name} 可解`, () => {
    assert(result.solvable, `关卡 ${lv.name} 应该有解，但求解器返回无解（迭代 ${result.totalActions} 次）`);
    assert(Array.isArray(result.path) && result.path.length > 0, '路径不能为空');
    assert(Array.isArray(result.actions) && result.actions.length > 0, '动作列表不能为空');
  });
}

console.log('\n=== 测试结果 ===');
console.log(`共 ${testCount} 个测试，通过: ${passed}, 失败: ${failed}`);
if (failed > 0) {
  console.log('\n❌ 有测试失败，请检查上述错误信息。');
  process.exit(1);
} else {
  console.log('\n✅ 所有测试通过!');
}