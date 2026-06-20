window.BOARD_W = 8;
window.BOARD_H = 7;

window.GUARD_BEHAVIOR = {
  FIXED: "fixed",
  PATROL: "patrol",
  INVESTIGATE: "investigate",
  TRACE: "trace"
};

window.CAMERA_DIRECTION = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right"
};

window.ALERT_LEVEL = {
  CALM: { name: "平静", value: 0, color: "#4f7f6a" },
  CURIOUS: { name: "警觉", value: 1, color: "#d7bd77" },
  SUSPICIOUS: { name: "怀疑", value: 2, color: "#e67e22" },
  ALERT: { name: "警戒", value: 3, color: "#d14c3f" }
};

window.levels = [
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

window.chapters = [
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

window.levelDescriptions = [
  { brief: "简单展厅，一个展柜需要修复，小心巡逻员视线", optimalActions: 12 },
  { brief: "需要找到钥匙开门，注意往返巡逻的守卫", optimalActions: 15 },
  { brief: "两个展柜与会调查声响的巡逻员", optimalActions: 24 },
  { brief: "利用压力板开门，小心会追踪开门痕迹的守卫", optimalActions: 18 },
  { brief: "两个展柜、多个门锁，巡逻员会调查声响并追踪痕迹", optimalActions: 32 },
  { brief: "三个巡逻员的终极挑战：往返巡逻、听觉调查、痕迹追踪", optimalActions: 38 },
  { brief: "安保摄像头守护展柜，利用熄灯开关和屏风绕过监视", optimalActions: 28 }
];

window.tutorialLevel = {
  name: "教学",
  walls: ["4,2", "4,3", "4,4", "4,5", "4,6"],
  doors: [{ x: 4, y: 1, open: false }],
  keys: [{ x: 2, y: 3 }],
  exhibits: [{ x: 6, y: 2, fixed: false }],
  player: { x: 0, y: 6 },
  guards: [{ path: [{ x: 5, y: 4 }, { x: 6, y: 4 }], step: 0 }],
  exit: { x: 7, y: 0 }
};

window.tutorialSteps = [
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

window.OBJECTIVE_TYPES = {
  NO_HINTS: "no_hints",
  WITHIN_STEPS: "within_steps",
  NO_ALERT: "no_alert",
  ALL_KEYS: "all_keys"
};

window.OBJECTIVE_DEFS = {
  [window.OBJECTIVE_TYPES.NO_HINTS]: {
    name: "不使用提示",
    icon: "💡",
    desc: "全程不使用任何提示"
  },
  [window.OBJECTIVE_TYPES.WITHIN_STEPS]: {
    name: "推荐步数内",
    icon: "👣",
    desc: "在推荐步数内完成关卡"
  },
  [window.OBJECTIVE_TYPES.NO_ALERT]: {
    name: "不触发警戒",
    icon: "🤫",
    desc: "全程警觉程度保持平静"
  },
  [window.OBJECTIVE_TYPES.ALL_KEYS]: {
    name: "收集所有钥匙",
    icon: "🔑",
    desc: "拾取关卡中所有钥匙"
  }
};

window.levelObjectives = [
  {
    objectives: [window.OBJECTIVE_TYPES.NO_HINTS, window.OBJECTIVE_TYPES.WITHIN_STEPS]
  },
  {
    objectives: [window.OBJECTIVE_TYPES.NO_HINTS, window.OBJECTIVE_TYPES.NO_ALERT, window.OBJECTIVE_TYPES.WITHIN_STEPS]
  },
  {
    objectives: [window.OBJECTIVE_TYPES.NO_HINTS, window.OBJECTIVE_TYPES.NO_ALERT, window.OBJECTIVE_TYPES.ALL_KEYS]
  },
  {
    objectives: [window.OBJECTIVE_TYPES.NO_HINTS, window.OBJECTIVE_TYPES.WITHIN_STEPS, window.OBJECTIVE_TYPES.NO_ALERT]
  },
  {
    objectives: [window.OBJECTIVE_TYPES.NO_HINTS, window.OBJECTIVE_TYPES.WITHIN_STEPS, window.OBJECTIVE_TYPES.ALL_KEYS]
  },
  {
    objectives: [window.OBJECTIVE_TYPES.NO_HINTS, window.OBJECTIVE_TYPES.WITHIN_STEPS, window.OBJECTIVE_TYPES.NO_ALERT, window.OBJECTIVE_TYPES.ALL_KEYS]
  }
];

window.AUTOSAVE_KEY = "museum_autosave_v1";
window.CHAPTER_STAR_KEY = "museum_chapter_stars";
window.REPLAY_SPEEDS = { slow: 2000, normal: 1000, fast: 350 };
window.DAILY_KEY_PREFIX = "museum_daily_challenge_";
window.ACHIEVEMENT_KEY = "museum_achievement_stats";

window.FAILURE_REASONS = {
  guard_sight: "被巡逻员发现",
  guard_turn: "巡逻员换班撞见",
  other: "其他原因"
};

window.ACHIEVEMENT_DEFS = [
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

window.CHALLENGE_PACK_STORAGE_KEY = "museum_challenge_packs_v1";
window.CHALLENGE_PACK_PROGRESS_KEY = "museum_challenge_pack_progress_v1";
window.CHALLENGE_PACK_FORMAT_VERSION = 1;
