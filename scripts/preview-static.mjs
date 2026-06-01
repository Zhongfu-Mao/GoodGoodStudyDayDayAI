#!/usr/bin/env node
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { resolveAppBasePath } from './lib/base-path.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const args = parseArgs(process.argv.slice(2));
const host = args.host ?? '127.0.0.1';
const port = Number(args.port ?? 4321);
const appBasePath = resolveAppBasePath();
const basePrefix = appBasePath === '/' ? '' : appBasePath.slice(0, -1);

const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? `${host}:${port}`}`);
    const filePath = await resolveFilePath(requestUrl.pathname);

    if (!filePath) {
      sendNotFound(res);
      return;
    }

    const fileStat = await stat(filePath);
    res.writeHead(200, {
      'Content-Length': fileStat.size,
      'Content-Type': contentType(filePath),
      'Cache-Control': 'no-cache',
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error instanceof Error ? error.message : String(error));
  }
});

server.listen(port, host, () => {
  console.log(`Static preview ready at http://${host}:${port}${appBasePath}`);
});

async function resolveFilePath(rawPathname) {
  const strippedPathname = stripBasePath(rawPathname);
  const decodedPathname = decodeURIComponent(strippedPathname);
  const relativePath = decodedPathname.replace(/^\/+/, '');
  const candidate = path.resolve(distDir, relativePath);

  if (!isInsideDist(candidate)) {
    return null;
  }

  if (existsSync(candidate)) {
    const candidateStat = await stat(candidate);
    if (candidateStat.isDirectory()) {
      return existingFile(path.join(candidate, 'index.html'));
    }
    return candidateStat.isFile() ? candidate : null;
  }

  if (!path.extname(candidate)) {
    return existingFile(path.join(candidate, 'index.html'));
  }

  return null;
}

function stripBasePath(rawPathname) {
  if (!basePrefix) {
    return rawPathname;
  }

  if (rawPathname === basePrefix) {
    return '/';
  }

  if (rawPathname.startsWith(`${basePrefix}/`)) {
    return rawPathname.slice(basePrefix.length);
  }

  return rawPathname;
}

function existingFile(filePath) {
  return existsSync(filePath) ? filePath : null;
}

function isInsideDist(filePath) {
  const relative = path.relative(distDir, filePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--host' || arg === '--port') {
      parsed[arg.slice(2)] = argv[index + 1];
      index += 1;
    }
  }

  return parsed;
}

function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

function contentType(filePath) {
  const extension = path.extname(filePath);
  return (
    {
      '.avif': 'image/avif',
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.ico': 'image/x-icon',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.mjs': 'text/javascript; charset=utf-8',
      '.mp3': 'audio/mpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.webmanifest': 'application/manifest+json',
      '.webp': 'image/webp',
      '.xml': 'application/xml; charset=utf-8',
    }[extension] ?? 'application/octet-stream'
  );
}
