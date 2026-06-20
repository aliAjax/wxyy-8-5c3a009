const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = Number(process.env.PORT || 8799);
const MAX_PORT_ATTEMPTS = Number(process.env.PORT_ATTEMPTS || 20);
const ROOT = path.resolve(__dirname, '..');

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

function createServer() {
  return http.createServer((req, res) => {
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
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
  });
}

function listen(port, remainingAttempts) {
  const server = createServer();

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && remainingAttempts > 1) {
      console.log(`  端口 ${port} 已被占用，尝试 ${port + 1}...`);
      listen(port + 1, remainingAttempts - 1);
      return;
    }

    console.error(`\n  启动失败: ${err.message}`);
    process.exit(1);
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`\n  🎮 博物馆夜间修复师 已启动`);
    console.log(`  👉 本地访问: http://localhost:${port}\n`);
  });
}

listen(DEFAULT_PORT, MAX_PORT_ATTEMPTS);
