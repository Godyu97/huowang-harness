import os from 'node:os';

const root = new URL('..', import.meta.url);
const port = Number(process.env.PORT || 8765);
const host = process.env.HOST || '0.0.0.0';

Bun.serve({
  hostname: host,
  port,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/geo-platform-report.html';
    const file = Bun.file(new URL('.' + pathname, root));
    if (!(await file.exists())) return new Response('Not Found', { status: 404 });
    return new Response(file);
  }
});

const lan = Object.values(os.networkInterfaces())
  .flat()
  .filter((n) => n && n.family === 'IPv4' && !n.internal)
  .map((n) => n.address);

console.log(`serving on ${host}:${port}`);
console.log(`  local   http://127.0.0.1:${port}/`);
for (const ip of [...new Set(lan)]) console.log(`  lan     http://${ip}:${port}/`);
