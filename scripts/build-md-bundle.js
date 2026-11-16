/**
 * 把 docs/ 与 geo-prd/ 下的 Markdown 打进 md-bundle.js。
 * 双击打开 geo-platform-report.html 时，浏览器读不了本地 md 文件，阅读器会用这份快照。
 * 通过 http 打开时优先直接读取 md 文件，不依赖这份快照。
 *
 * 用法：node scripts/build-md-bundle.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const roots = ['docs', 'geo-prd'];

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) walk(abs, out);
    else if (name.toLowerCase().endsWith('.md')) out.push(abs);
  }
  return out;
}

const files = roots.flatMap((dir) => walk(path.join(root, dir), []));
const docs = {};
for (const abs of files) {
  const key = path.relative(root, abs).split(path.sep).join('/');
  docs[key] = fs.readFileSync(abs, 'utf8');
}

const banner = '/* 由 scripts/build-md-bundle.js 生成。改过 Markdown 后请重新运行：node scripts/build-md-bundle.js */\n';
fs.writeFileSync(path.join(root, 'md-bundle.js'), banner + 'window.GEOPRO_MD=' + JSON.stringify(docs) + ';\n');
console.log('wrote md-bundle.js', files.length, 'files');
