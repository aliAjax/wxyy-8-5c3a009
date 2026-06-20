# 博物馆夜间修复师（Museum Night Restorer）

纯前端回合制解谜小游戏。无需构建，浏览器直接打开 `index.html` 即可运行。

## 快速开始

### 环境要求

- Node.js ≥ 16（启动本地预览与运行自动化测试需要）
- 现代浏览器（Chrome / Firefox / Edge / Safari）

### 安装依赖（仅测试时需要）

```bash
npm install
```

> 运行游戏本身不需要依赖。

## 本地启动预览

### 方式一：一条命令启动（推荐）

```bash
npm run preview
```

然后按终端输出的地址打开。默认从 <http://localhost:8799> 启动；如果端口已被占用，会自动尝试后续端口。

### 方式二：指定端口启动

```bash
PORT=18800 npm run preview
```

### 方式三：直接双击

直接用浏览器打开项目根目录的 `index.html` 也可以运行。

## 自动化测试

项目包含三层回归检查，使用 `npm test` 一条命令即可跑完整套：

```bash
npm test
```

### 1. 静态代码完整性检查

```bash
npm run test:static
```

由 [test_solver_simple.js](test_solver_simple.js) 执行，覆盖：
- 所有源文件存在性和 JS 语法合法性
- `index.html` 的 `<script>` 引用完整性
- 求解器架构约束（unified solver 委托关系、视野规则、警卫行为、开门痕迹等）
- 关卡数据结构有效性

### 2. 求解器功能回归测试

```bash
npm run test:solver
```

由 [test_solver.js](test_solver.js) 执行，覆盖：
- 钥匙/门规则（一把钥匙一扇门、多钥匙多门）
- 压力板开门（单板单门、单板多门）
- 屏风遮挡与推动
- 熄灯与摄像头失效、视野缩减
- Trace 型警卫追踪开门痕迹
- 边界条件（已完成、无解、hint 模式、动作描述）
- **内置 7 关可解性回归**（第 5 关默认跳过，加 `--slow` 执行慢速关卡）

```bash
npm run test:solver:slow   # 包含所有慢速关卡
```

### 3. 浏览器端冒烟检查

```bash
npm run test:smoke
```

由 [tests/smoke.js](tests/smoke.js) 通过 Puppeteer 执行，在真实浏览器中验证：
- ✅ 页面加载并渲染棋盘，无 JS 异常
- ✅ 关卡名称正确显示
- ✅ 关卡按钮容器已渲染
- ✅ 点击切换到第 2 关不报错
- ✅ 打开「关卡编辑器」面板，DOM 正常显示
- ✅ 编辑器棋盘和工具按钮存在
- ✅ 点击「立即验证」运行关卡诊断，状态正确更新
- ✅ 关闭编辑器不报错
- ✅ 打开「创作挑战包」面板
- ✅ 挑战包的「创建 / 导入 / 关闭」按钮存在
- ✅ 关闭挑战包面板不报错
- ✅ 切回第 1 关无异常

**调试模式**（打开浏览器窗口，动作慢放 80ms）：

```bash
npm run test:smoke:debug
```

## 新增关卡验证流程

在 `levels.js` 中新增关卡后，按以下顺序验证：

1. **静态检查**：保证代码语法和架构不变
   ```bash
   npm run test:static
   ```

2. **求解器可解性**：确认新关至少被求解器判定有解。修改 `test_solver.js` 末尾的 `levels` 数组与 `levelIterMap`，将新关加入：
   ```bash
   npm run test:solver
   ```
   若求解器迭代超时，适当增大 `levelIterMap` 对应项，或用 `--slow` 模式跑。

3. **浏览器冒烟**：确保新关卡不影响面板交互
   ```bash
   npm run test:smoke
   ```

4. **手工验收**：启动预览，进入新增关卡
   ```bash
   npm run preview
   ```
   - 能否正常通关
   - 提示按钮（请求提示）能否给出有效提示
   - 编辑器内导入该关 → 立即验证 → 检查诊断项

5. **完整回归**：一键确认全部通过
   ```bash
   npm test
   ```

## 项目结构

```
.
├── index.html              主页面（单页入口，不改）
├── style.css               样式
├── levels.js               内置关卡数据
├── pointUtils.js           坐标与工具函数
├── guardLogic.js           警卫行为逻辑
├── solver.js               求解器、诊断、每日关卡生成（unifiedSolveLevel）
├── app.js                  游戏主逻辑、UI 渲染、关卡切换
├── editor.js               关卡编辑器
├── debug_level3.js         Node 版求解器入口（供测试使用）
├── test_solver_simple.js   🧪 静态/架构回归检查
├── test_solver.js          🧪 求解器功能测试 + 内置关卡可解性
├── tests/
│   └── smoke.js            🧪 Puppeteer 浏览器端冒烟测试
├── scripts/
│   └── serve.js            纯 Node 静态服务器
├── package.json            脚本入口
└── README.md               本文档
```

## 常用命令速查

| 命令 | 说明 |
| --- | --- |
| `npm start` / `npm run preview` | 启动本地预览，端口占用时自动尝试后续端口 |
| `PORT=18800 npm run preview` | 使用指定端口启动本地预览 |
| `npm test` | 跑全部三层回归 |
| `npm run test:static` | 仅静态/架构检查 |
| `npm run test:solver` | 求解器 + 内置关卡（跳过慢速关） |
| `npm run test:solver:slow` | 求解器 + 内置关卡全部运行 |
| `npm run test:smoke` | 浏览器端冒烟（无头） |
| `npm run test:smoke:debug` | 浏览器端冒烟（有头 + 慢放） |
