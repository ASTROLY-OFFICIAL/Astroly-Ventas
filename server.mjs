// Servidor local para ver la tienda: node server.mjs  →  http://127.0.0.1:4180
// (los módulos de JavaScript no cargan abriendo el archivo con doble clic).
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname, join, normalize} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json'};
createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(root, path));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try { const body = await readFile(file); res.writeHead(200, {'content-type': types[extname(file)] || 'application/octet-stream'}).end(body); }
  catch { res.writeHead(404).end('No encontrado'); }
}).listen(4180, '127.0.0.1', () => console.log('Tienda astroly en http://127.0.0.1:4180'));
