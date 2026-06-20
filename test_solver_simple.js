const fs = require('fs');
const path = require('path');

const __projectRoot = __dirname;

function readSrc(name) {
  return fs.readFileSync(path.join(__projectRoot, name), 'utf8');
}

const SOURCE_FILES = [
  'app.js',
  'solver.js',
  'levels.js',
  'guardLogic.js',
  'pointUtils.js',
  'editor.js'
];

let _passed = 0;
let _failed = 0;
const _errors = [];

function assertMatch(name, pattern, source, sourceName) {
  if (!pattern.test(source)) {
    _failed++;
    const msg = `FAIL: ${name}${sourceName ? ` [in ${sourceName}]` : ''}`;
    _errors.push(msg);
    console.error(`  ❌ ${msg}`);
    return false;
  }
  _passed++;
  console.log(`  ✅ ${name}`);
  return true;
}

function assertNotMatch(name, pattern, source, sourceName) {
  if (pattern.test(source)) {
    _failed++;
    const msg = `FAIL: ${name}${sourceName ? ` [in ${sourceName}]` : ''}`;
    _errors.push(msg);
    console.error(`  ❌ ${msg}`);
    return false;
  }
  _passed++;
  console.log(`  ✅ ${name}`);
  return true;
}

function checkFileExists(name) {
  const full = path.join(__projectRoot, name);
  if (!fs.existsSync(full)) {
    _failed++;
    const msg = `FAIL: 文件不存在 - ${name}`;
    _errors.push(msg);
    console.error(`  ❌ ${msg}`);
    return false;
  }
  try {
    const stat = fs.statSync(full);
    if (stat.size === 0) {
      _failed++;
      const msg = `FAIL: 文件为空 - ${name}`;
      _errors.push(msg);
      console.error(`  ❌ ${msg}`);
      return false;
    }
  } catch (e) {
    _failed++;
    const msg = `FAIL: 无法读取文件 - ${name}: ${e.message}`;
    _errors.push(msg);
    console.error(`  ❌ ${msg}`);
    return false;
  }
  _passed++;
  console.log(`  ✅ 文件存在: ${name}`);
  return true;
}

function checkValidJS(name) {
  const full = path.join(__projectRoot, name);
  try {
    const content = fs.readFileSync(full, 'utf8');
    new Function(content);
    _passed++;
    console.log(`  ✅ JS 语法合法: ${name}`);
    return true;
  } catch (e) {
    _failed++;
    const msg = `FAIL: JS 语法错误 - ${name}: ${e.message}`;
    _errors.push(msg);
    console.error(`  ❌ ${msg}`);
    return false;
  }
}

function checkHTMLIntegrity() {
  const html = readSrc('index.html');
  let ok = true;

  for (const src of SOURCE_FILES) {
    ok = assertMatch(
      `HTML 中引用 ${src}`,
      new RegExp(`<script\\s+src=["']${src}["']`),
      html,
      'index.html'
    ) && ok;
  }

  ok = assertMatch(
    'HTML 包含关卡编辑器切换按钮',
    /id="editorToggleBtn"/,
    html,
    'index.html'
  ) && ok;

  ok = assertMatch(
    'HTML 包含挑战包面板切换按钮',
    /id="challengePackBtn"/,
    html,
    'index.html'
  ) && ok;

  ok = assertMatch(
    'HTML 包含关卡按钮容器',
    /id="levelButtons"/,
    html,
    'index.html'
  ) && ok;

  ok = assertMatch(
    'HTML 包含编辑器诊断面板',
    /id="editorDiagnosis"/,
    html,
    'index.html'
  ) && ok;

  return ok;
}

function runSolverIntegrity() {
  const solverSource = readSrc('solver.js');
  const appSource = readSrc('app.js');
  let ok = true;

  ok = assertMatch(
    'unified solver 函数存在',
    /window\.unifiedSolveLevel\s*=\s*function\(level,\s*options\s*=\s*\{\}\)/,
    solverSource,
    'solver.js'
  ) && ok;

  ok = assertMatch(
    'verifyLevelSolvable 内部调用 unified solver',
    /window\.verifyLevelSolvable\s*=\s*function\(level\)\s*\{[\s\S]{0,200}?unifiedSolveLevel\(level,[\s\S]{0,100}?mode:\s*['"]verify['"]/,
    solverSource,
    'solver.js'
  ) && ok;

  ok = assertMatch(
    'hint path 委托给 unified solver',
    /function\s+searchHintPath\(\)[\s\S]{0,2500}?unifiedSolveLevel\(state\.level[\s\S]{0,300}?mode:\s*['"]hint['"]/,
    appSource,
    'app.js'
  ) && ok;

  ok = assertMatch(
    'diagnostic solution 委托给 unified solver',
    /window\.solveLevelDetailed\s*=\s*function\(level\)[\s\S]{0,500}?unifiedSolveLevel\(level,[\s\S]{0,100}?mode:\s*['"]full['"]/,
    solverSource,
    'solver.js'
  ) && ok;

  ok = assertMatch(
    '警卫视野包含警觉加成（与实际游戏一致）',
    /function\s+getGuardVisionUnified\(guardsList,\s*screenList,\s*visionReduced\)[\s\S]{0,300}?const\s+baseRange\s*=\s*visionReduced\s*\?\s*1\s*:\s*2;[\s\S]{0,200}?const\s+alertBonus\s*=\s*Math\.floor\(guard\.alertLevel\s*\/\s*2\);[\s\S]{0,100}?const\s+maxRange\s*=\s*baseRange\s*\+\s*alertBonus;/,
    solverSource,
    'solver.js'
  ) && ok;

  ok = assertMatch(
    '移动声音在视野检查前更新警卫状态',
    /emitSoundUnified\(ns,\s*soundLoudness,\s*ns\.pos,\s*dirName\);[\s\S]{0,3000}?const\s+vision\s*=\s*getFullVisionUnified\(ns\.guards/,
    solverSource,
    'solver.js'
  ) && ok;

  ok = assertMatch(
    '压力板开门被记录用于追踪型警卫',
    /const\s+wasClosed\s*=\s*!ns\.doorsOpen\[tdi\];[\s\S]{0,200}?ns\.doorsOpen\[tdi\]\s*=\s*!ns\.doorsOpen\[tdi\];[\s\S]{0,200}?if\s*\(wasClosed\s*&&\s*ns\.doorsOpen\[tdi\]\)\s*\{[\s\S]{0,200}?recordOpenedDoorUnified\(ns,\s*doors\[tdi\]\);/,
    solverSource,
    'solver.js'
  ) && ok;

  ok = assertMatch(
    '直接开门通过 recordOpenedDoorUnified 去重',
    /recordOpenedDoorUnified\(ns,\s*\{\s*x:\s*nx,\s*y:\s*ny\s*\}\);/,
    solverSource,
    'solver.js'
  ) && ok;

  ok = assertMatch(
    '回合结束使用共享统一状态推进函数',
    /function\s+processEndTurnUnified\(curState,\s*lastActionLabel\)[\s\S]{0,600}?emitSoundUnified\(nextState,\s*0,\s*nextState\.pos,\s*["']等待["']\);[\s\S]{0,300}?decayAlertLevelsUnified\(nextState\);[\s\S]{0,300}?moveGuardUnified\(g,\s*nextState\.openedDoors\)/,
    solverSource,
    'solver.js'
  ) && ok;

  ok = assertMatch(
    '移动标签仅使用一次方向名',
    /let\s+actionLabel\s*=\s*dirName;/,
    solverSource,
    'solver.js'
  ) && ok;

  ok = assertNotMatch(
    '移动标签不出现重复的「向」字',
    /let\s+actionLabel\s*=\s*`向\$\{dirName\}`|向向/,
    solverSource,
    'solver.js'
  ) && ok;

  ok = assertMatch(
    '存在关卡诊断入口 diagnoseLevel',
    /window\.diagnoseLevel\s*=\s*function\(level\)/,
    solverSource,
    'solver.js'
  ) && ok;

  return ok;
}

function checkLevelsIntegrity() {
  const levelsSource = readSrc('levels.js');
  let ok = true;

  ok = assertMatch(
    'levels 数组被定义且导出',
    /window\.levels\s*=\s*\[|const\s+levels\s*=\s*\[|var\s+levels\s*=\s*\[/,
    levelsSource,
    'levels.js'
  ) && ok;

  try {
    const sandbox = { window: {} };
    const vm = require('vm');
    vm.createContext(sandbox);
    vm.runInContext(levelsSource, sandbox);
    const levels = sandbox.levels || sandbox.window.levels;
    if (Array.isArray(levels) && levels.length >= 3) {
      _passed++;
      console.log(`  ✅ 关卡数组有效，共 ${levels.length} 关`);
    } else {
      _failed++;
      const msg = `FAIL: 关卡数组无效或过少 (期望至少 3 关)`;
      _errors.push(msg);
      console.error(`  ❌ ${msg}`);
      ok = false;
    }
  } catch (e) {
    _failed++;
    const msg = `FAIL: 无法解析 levels.js: ${e.message}`;
    _errors.push(msg);
    console.error(`  ❌ ${msg}`);
    ok = false;
  }

  return ok;
}

function main() {
  console.log('='.repeat(60));
  console.log('🧪 静态代码完整性与架构回归检查');
  console.log('='.repeat(60));

  console.log('\n1. 源文件存在性检查');
  checkFileExists('index.html');
  checkFileExists('style.css');
  SOURCE_FILES.forEach(checkFileExists);

  console.log('\n2. JS 文件语法合法性检查');
  SOURCE_FILES.forEach(checkValidJS);

  console.log('\n3. HTML 引用完整性检查');
  checkHTMLIntegrity();

  console.log('\n4. 求解器架构约束回归');
  runSolverIntegrity();

  console.log('\n5. 关卡数据完整性');
  checkLevelsIntegrity();

  console.log('\n' + '-'.repeat(60));
  console.log(`📊 静态检查结果: ${_passed} 通过, ${_failed} 失败`);
  console.log('-'.repeat(60));

  if (_failed > 0) {
    console.error('\n❌ 以下检查失败:\n');
    _errors.forEach(e => console.error(`   - ${e}`));
    console.error('');
    process.exit(1);
  }

  console.log('\n✅ 所有静态回归检查通过。\n');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { assertMatch, assertNotMatch, checkFileExists, checkValidJS };
