const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'app.js');
const solverPath = path.join(__dirname, 'solver.js');
const appSource = fs.readFileSync(appPath, 'utf8');
const solverSource = fs.readFileSync(solverPath, 'utf8');

function assertMatch(name, pattern, source) {
  if (!pattern.test(source)) {
    throw new Error(`FAIL: ${name}`);
  }
  console.log(`PASS: ${name}`);
}

function assertNotMatch(name, pattern, source) {
  if (pattern.test(source)) {
    throw new Error(`FAIL: ${name}`);
  }
  console.log(`PASS: ${name}`);
}

assertMatch(
  'unified solver exists',
  /window\.unifiedSolveLevel = function\(level, options = \{\}\)/,
  solverSource
);

assertMatch(
  'hint, diagnosis, and daily verification use unified solver',
  /window\.verifyLevelSolvable = function\(level\)[\s\S]*?unifiedSolveLevel\(level,[\s\S]*?window\.generateDailyLevel = function/,
  solverSource
);
assertMatch(
  'hint path delegates to unified solver',
  /function searchHintPath\(\)[\s\S]*?unifiedSolveLevel\(state\.level,[\s\S]*?mode: 'hint'/,
  appSource
);
assertMatch(
  'diagnostic solution delegates to unified solver',
  /window\.solveLevelDetailed = function\(level\)[\s\S]*?unifiedSolveLevel\(level,[\s\S]*?mode: 'full'/,
  solverSource
);

assertMatch(
  'guard vision includes alert bonus like live gameplay',
  /function getGuardVisionUnified\(guardsList, screenList, visionReduced\)[\s\S]*?const baseRange = visionReduced \? 1 : 2;[\s\S]*?const alertBonus = Math\.floor\(guard\.alertLevel \/ 2\);[\s\S]*?const maxRange = baseRange \+ alertBonus;/,
  solverSource
);

assertMatch(
  'movement sound updates guard state before vision check',
  /emitSoundUnified\(ns, soundLoudness, ns\.pos, dirName\);[\s\S]*?const vision = getFullVisionUnified\(ns\.guards, ns\.screens, ns\.visionReduced, ns\.camerasDisabled, ns\.lightsActive\);/,
  solverSource
);

assertMatch(
  'pressure plate door openings are recorded for trace guards',
  /const wasClosed = !ns\.doorsOpen\[tdi\];[\s\S]*?ns\.doorsOpen\[tdi\] = !ns\.doorsOpen\[tdi\];[\s\S]*?if \(wasClosed && ns\.doorsOpen\[tdi\]\) \{[\s\S]*?recordOpenedDoorUnified\(ns, doors\[tdi\]\);/,
  solverSource
);

assertMatch(
  'direct door openings are deduplicated through recordOpenedDoorUnified',
  /recordOpenedDoorUnified\(ns, \{ x: nx, y: ny \}\);/,
  solverSource
);

assertMatch(
  'end turn uses shared unified state advancement',
  /function processEndTurnUnified\(curState, lastActionLabel\)[\s\S]*?emitSoundUnified\(nextState, 0, nextState\.pos, "等待"\);[\s\S]*?decayAlertLevelsUnified\(nextState\);[\s\S]*?moveGuardUnified\(g, nextState\.openedDoors\)/,
  solverSource
);

assertMatch(
  'movement labels use the direction label once',
  /let actionLabel = dirName;/,
  solverSource
);
assertNotMatch(
  'movement labels do not duplicate 向',
  /let actionLabel = `向\$\{dirName\}`|向向/,
  solverSource
);

console.log('\nAll solver regression checks passed.');
