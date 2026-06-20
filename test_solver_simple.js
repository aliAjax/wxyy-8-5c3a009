const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'app.js');
const source = fs.readFileSync(appPath, 'utf8');

function assertMatch(name, pattern) {
  if (!pattern.test(source)) {
    throw new Error(`FAIL: ${name}`);
  }
  console.log(`PASS: ${name}`);
}

function assertNotMatch(name, pattern) {
  if (pattern.test(source)) {
    throw new Error(`FAIL: ${name}`);
  }
  console.log(`PASS: ${name}`);
}

assertMatch(
  'unified solver exists',
  /function unifiedSolveLevel\(level, options = \{\}\)/
);

assertMatch(
  'hint, diagnosis, and daily verification use unified solver',
  /function verifyLevelSolvable\(level\)[\s\S]*?unifiedSolveLevel\(level,[\s\S]*?function generateDailyLevel/
);
assertMatch(
  'hint path delegates to unified solver',
  /function searchHintPath\(\)[\s\S]*?unifiedSolveLevel\(state\.level,[\s\S]*?mode: 'hint'/
);
assertMatch(
  'diagnostic solution delegates to unified solver',
  /function solveLevelDetailed\(level\)[\s\S]*?unifiedSolveLevel\(level,[\s\S]*?mode: 'full'/
);

assertMatch(
  'guard vision includes alert bonus like live gameplay',
  /function getGuardVisionUnified\(guardsList, screenList, visionReduced\)[\s\S]*?const baseRange = visionReduced \? 1 : 2;[\s\S]*?const alertBonus = Math\.floor\(guard\.alertLevel \/ 2\);[\s\S]*?const maxRange = baseRange \+ alertBonus;/
);

assertMatch(
  'movement sound updates guard state before vision check',
  /emitSoundUnified\(ns, soundLoudness, ns\.pos, dirName\);[\s\S]*?const vision = getFullVisionUnified\(ns\.guards, ns\.screens, ns\.visionReduced, ns\.camerasDisabled, ns\.lightsActive\);/
);

assertMatch(
  'pressure plate door openings are recorded for trace guards',
  /const wasClosed = !ns\.doorsOpen\[tdi\];[\s\S]*?ns\.doorsOpen\[tdi\] = !ns\.doorsOpen\[tdi\];[\s\S]*?if \(wasClosed && ns\.doorsOpen\[tdi\]\) \{[\s\S]*?recordOpenedDoorUnified\(ns, doors\[tdi\]\);/
);

assertMatch(
  'direct door openings are deduplicated through recordOpenedDoorUnified',
  /recordOpenedDoorUnified\(ns, \{ x: nx, y: ny \}\);/
);

assertMatch(
  'end turn uses shared unified state advancement',
  /function processEndTurnUnified\(curState, lastActionLabel\)[\s\S]*?emitSoundUnified\(nextState, 0, nextState\.pos, "等待"\);[\s\S]*?decayAlertLevelsUnified\(nextState\);[\s\S]*?moveGuardUnified\(g, nextState\.openedDoors\)/
);

assertMatch(
  'movement labels use the direction label once',
  /let actionLabel = dirName;/
);
assertNotMatch(
  'movement labels do not duplicate 向',
  /let actionLabel = `向\$\{dirName\}`|向向/
);

console.log('\nAll solver regression checks passed.');
