import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

const dist = join(process.cwd(), 'dist');
const serverDir = join(dist, 'server');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'server') files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const files = await walk(dist);
const assets = {};

for (const file of files) {
  const route = `/${relative(dist, file).split(sep).join('/')}`;
  const extension = extname(file);
  const buffer = await readFile(file);
  const isText = ['.html', '.js', '.css', '.svg', '.txt', '.json'].includes(extension);
  assets[route] = {
    type: mimeTypes[extension] ?? 'application/octet-stream',
    body: isText ? buffer.toString('utf8') : buffer.toString('base64'),
    encoding: isText ? 'text' : 'base64',
  };
}

const worker = `const assets = ${JSON.stringify(assets)};

function responseFor(asset) {
  const headers = {
    "content-type": asset.type,
    "cache-control": asset.type.startsWith("text/html") ? "no-cache" : "public, max-age=31536000, immutable"
  };
  if (asset.encoding === "base64") {
    const raw = atob(asset.body);
    const bytes = new Uint8Array(raw.length);
    for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
    return new Response(bytes, { headers });
  }
  return new Response(asset.body, { headers });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = assets[url.pathname] || assets["/index.html"];
    return responseFor(asset);
  }
};
`;

await mkdir(serverDir, { recursive: true });
await writeFile(join(serverDir, 'index.js'), worker, 'utf8');
