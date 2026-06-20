const { unifiedSolveLevel, BOARD_W, BOARD_H } = require('./debug_level3.js');

const lv = {
  name: "调试",
  walls: ["4,0", "4,1", "4,2", "4,4", "4,5", "4,6"],
  doors: [{ x: 4, y: 3, open: false }],
  keys: [{ x: 2, y: 3 }],
  exhibits: [{ x: 6, y: 3, fixed: false }],
  player: { x: 0, y: 0 },
  guards: [
    { path: [{ x: 0, y: 3 }, { x: 1, y: 3 }], step: 0, behavior: "fixed", hearingRange: 0 }
  ],
  exit: { x: 7, y: 3 },
  mechanisms: {
    pressurePlates: [],
    screens: [],
    lights: [],
    cameras: []
  }
};

console.log("测试：守卫在(0,3)面向右，钥匙在(2,3)，玩家在(0,0)");
console.log("预期：钥匙在守卫视野2格内，玩家拿不到钥匙，关卡不可解");
console.log("");

const result = unifiedSolveLevel(lv, { maxIterations: 50000, mode: 'full' });
console.log("结果:", result.solvable ? "可解" : "不可解");
console.log("迭代次数:", result.totalActions);
if (result.solvable) {
  console.log("动作:", result.actions.join(' → '));
  console.log("路径:", result.path.map(p => `(${p.x},${p.y})`).join(' → '));
}
