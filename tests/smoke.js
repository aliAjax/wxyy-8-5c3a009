const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const PORT = 18799;
const ROOT = path.join(__dirname, '..');
const BASE_URL = `http://localhost:${PORT}`;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

let server = null;
let browser = null;
let page = null;
let passed = 0;
let failed = 0;
const errors = [];
const jsErrors = [];

function step(name, fn) {
  return async () => {
    try {
      await fn();
      passed++;
      console.log(`  ✅ ${name}`);
    } catch (e) {
      failed++;
      const msg = `${name}: ${e.message}`;
      errors.push(msg);
      console.error(`  ❌ ${name}`);
      console.error(`     ${e.message}`);
    }
  };
}

function startServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath === '/') urlPath = '/index.html';
      const filePath = path.join(ROOT, urlPath);
      const ext = path.extname(filePath).toLowerCase();

      if (!filePath.startsWith(path.resolve(ROOT))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
        });
        res.end(data);
      });
    });

    server.listen(PORT, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });
}

async function cleanup() {
  if (page) {
    try { await page.close(); } catch (e) {}
  }
  if (browser) {
    try { await browser.close(); } catch (e) {}
  }
  if (server) {
    try { server.close(); } catch (e) {}
  }
}

async function main() {
  const headless = process.env.HEADLESS !== 'false';
  const slowMo = headless ? 0 : 80;

  console.log('='.repeat(60));
  console.log('🌫️  浏览器端冒烟测试（关键入口不报错检查）');
  console.log('='.repeat(60));

  try {
    console.log('\n🚀 启动本地静态服务器...');
    await startServer();
    console.log(`   服务运行于 ${BASE_URL}`);

    console.log('\n🌐 启动 Puppeteer 浏览器...');
    browser = await puppeteer.launch({
      headless: headless ? 'new' : false,
      slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const context = browser.createBrowserContext
      ? await browser.createBrowserContext()
      : browser.defaultBrowserContext
        ? browser.defaultBrowserContext()
        : { newPage: () => browser.newPage() };
    page = await context.newPage();

    page.on('pageerror', (err) => {
      jsErrors.push(`pageerror: ${err.message}`);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('status of 404') && text.includes('favicon')) return;
        if (text.includes('Failed to load resource')) return;
        jsErrors.push(`console.error: ${text}`);
      }
    });

    const tests = [
      step('加载首页不报错', async () => {
        const resp = await page.goto(BASE_URL + '/', { waitUntil: 'networkidle2', timeout: 30000 });
        if (!resp || !resp.ok()) {
          throw new Error(`页面加载失败: HTTP ${resp ? resp.status() : 'no response'}`);
        }
        await page.waitForFunction(
          () => document.getElementById('board') && document.getElementById('board').children.length > 0,
          { timeout: 5000 }
        );
        await new Promise(r => setTimeout(r, 500));
        if (jsErrors.length > 0) {
          const snapshot = jsErrors.slice();
          throw new Error(`存在 JS 错误: ${snapshot.join(' | ')}`);
        }
      }),

      step('关卡名称正确显示', async () => {
        const name = await page.$eval('#levelName', el => el.textContent.trim());
        if (!name) throw new Error('关卡名称元素为空');
      }),

      step('关卡按钮容器已渲染', async () => {
        const hasButtons = await page.$eval('#levelButtons', el => el.querySelectorAll('button').length >= 3);
        if (!hasButtons) throw new Error('关卡按钮不足 3 个');
      }),

      step('点击切换到关卡 2（第二关）', async () => {
        const beforeJsErrors = jsErrors.length;
        await page.evaluate(() => {
          if (typeof loadLevel !== 'function') throw new Error('loadLevel 全局函数不存在');
          loadLevel(1);
        });
        await new Promise(r => setTimeout(r, 400));
        if (jsErrors.length > beforeJsErrors) {
          const newOnes = jsErrors.slice(beforeJsErrors);
          throw new Error(`切换关卡后出现 JS 错误: ${newOnes.join(' | ')}`);
        }
        const name = await page.$eval('#levelName', el => el.textContent.trim());
        if (!name) throw new Error('切换后关卡名称为空');
      }),

      step('打开关卡编辑器面板', async () => {
        const beforeJsErrors = jsErrors.length;
        const btn = await page.$('#editorToggleBtn');
        if (!btn) throw new Error('#editorToggleBtn 不存在');
        await btn.click();
        await page.waitForFunction(
          () => !document.getElementById('editor').classList.contains('hidden'),
          { timeout: 3000 }
        );
        await new Promise(r => setTimeout(r, 300));
        if (jsErrors.length > beforeJsErrors) {
          const newOnes = jsErrors.slice(beforeJsErrors);
          throw new Error(`打开编辑器后出现 JS 错误: ${newOnes.join(' | ')}`);
        }
      }),

      step('编辑器面板正常显示棋盘和工具', async () => {
        const boardExists = await page.$('#editorBoard');
        if (!boardExists) throw new Error('#editorBoard 不存在');
        const toolBtns = await page.$$('.tool-btn');
        if (toolBtns.length < 5) throw new Error('编辑器工具按钮不足');
      }),

      step('运行编辑器关卡诊断功能', async () => {
        const beforeJsErrors = jsErrors.length;
        const diagBtn = await page.$('#editorDiagnoseBtn');
        if (!diagBtn) throw new Error('#editorDiagnoseBtn 不存在');
        await diagBtn.click();
        await new Promise(r => setTimeout(r, 800));
        await page.waitForFunction(
          () => {
            const s = document.getElementById('diagnosisStatus');
            return s && s.textContent && !s.textContent.includes('等待');
          },
          { timeout: 10000 }
        );
        await new Promise(r => setTimeout(r, 200));
        if (jsErrors.length > beforeJsErrors) {
          const newOnes = jsErrors.slice(beforeJsErrors);
          throw new Error(`运行诊断后出现 JS 错误: ${newOnes.join(' | ')}`);
        }
        const statusText = await page.$eval('#diagnosisStatus', el => el.textContent);
        if (!statusText || statusText.includes('等待')) {
          throw new Error('诊断未完成或状态未更新');
        }
      }),

      step('关闭关卡编辑器', async () => {
        const beforeJsErrors = jsErrors.length;
        const closeBtn = await page.$('#editorCloseBtn');
        if (!closeBtn) throw new Error('#editorCloseBtn 不存在');
        await closeBtn.click();
        await page.waitForFunction(
          () => document.getElementById('editor').classList.contains('hidden'),
          { timeout: 3000 }
        );
        if (jsErrors.length > beforeJsErrors) {
          const newOnes = jsErrors.slice(beforeJsErrors);
          throw new Error(`关闭编辑器后出现 JS 错误: ${newOnes.join(' | ')}`);
        }
      }),

      step('打开挑战包面板', async () => {
        const beforeJsErrors = jsErrors.length;
        const btn = await page.$('#challengePackBtn');
        if (!btn) throw new Error('#challengePackBtn 不存在');
        await btn.click();
        await page.waitForFunction(
          () => !document.getElementById('challengePackPanel').classList.contains('hidden'),
          { timeout: 3000 }
        );
        await new Promise(r => setTimeout(r, 300));
        if (jsErrors.length > beforeJsErrors) {
          const newOnes = jsErrors.slice(beforeJsErrors);
          throw new Error(`打开挑战包面板后出现 JS 错误: ${newOnes.join(' | ')}`);
        }
      }),

      step('挑战包面板按钮正常渲染', async () => {
        const createBtn = await page.$('#challengePackCreateBtn');
        const importBtn = await page.$('#challengePackImportBtn');
        const closeBtn = await page.$('#challengePackCloseBtn');
        if (!createBtn) throw new Error('#challengePackCreateBtn 不存在');
        if (!importBtn) throw new Error('#challengePackImportBtn 不存在');
        if (!closeBtn) throw new Error('#challengePackCloseBtn 不存在');
      }),

      step('关闭挑战包面板', async () => {
        const beforeJsErrors = jsErrors.length;
        const closeBtn = await page.$('#challengePackCloseBtn');
        if (!closeBtn) throw new Error('#challengePackCloseBtn 不存在');
        await closeBtn.click();
        await page.waitForFunction(
          () => document.getElementById('challengePackPanel').classList.contains('hidden'),
          { timeout: 3000 }
        );
        if (jsErrors.length > beforeJsErrors) {
          const newOnes = jsErrors.slice(beforeJsErrors);
          throw new Error(`关闭挑战包面板后出现 JS 错误: ${newOnes.join(' | ')}`);
        }
      }),

      step('切回关卡 1 后无异常', async () => {
        const beforeJsErrors = jsErrors.length;
        await page.evaluate(() => {
          if (typeof loadLevel !== 'function') throw new Error('loadLevel 全局函数不存在');
          loadLevel(0);
        });
        await new Promise(r => setTimeout(r, 400));
        if (jsErrors.length > beforeJsErrors) {
          const newOnes = jsErrors.slice(beforeJsErrors);
          throw new Error(`切回关卡 1 后出现 JS 错误: ${newOnes.join(' | ')}`);
        }
      })
    ];

    for (const t of tests) {
      await t();
    }

    console.log('\n' + '-'.repeat(60));
    console.log(`📊 冒烟测试结果: ${passed} 通过, ${failed} 失败`);
    console.log(`💡 累计捕获 JS 异常: ${jsErrors.length}`);
    console.log('-'.repeat(60));

    if (jsErrors.length > 0) {
      console.error('\n⚠️  JS 异常详情:\n');
      jsErrors.forEach(e => console.error(`   - ${e}`));
    }

    if (failed > 0) {
      console.error('\n❌ 以下冒烟检查失败:\n');
      errors.forEach(e => console.error(`   - ${e}`));
      console.error('');
      await cleanup();
      process.exit(1);
    }

    console.log('\n✅ 所有浏览器端冒烟检查通过。\n');
    await cleanup();
    process.exit(0);
  } catch (e) {
    console.error('\n💥 测试框架崩溃:', e.message);
    console.error(e.stack);
    await cleanup();
    process.exit(2);
  }
}

process.on('SIGINT', async () => {
  console.log('\n收到中断信号，正在清理资源...');
  await cleanup();
  process.exit(130);
});

main();
