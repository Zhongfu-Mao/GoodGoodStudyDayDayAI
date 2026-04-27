import process from 'node:process';

export function resolveBasePath({ env = process.env, trailingSlash = false } = {}) {
  const repository = env.GITHUB_REPOSITORY?.split('/')[1];
  const rawBasePath =
    env.BASE_PATH ?? (repository && !repository.endsWith('.github.io') ? `/${repository}` : '/');

  return normalizeBasePath(rawBasePath, { trailingSlash });
}

export function resolveAppBasePath(options = {}) {
  return resolveBasePath({ ...options, trailingSlash: true });
}

export function withBasePath(path, { basePath = resolveAppBasePath() } = {}) {
  if (!path?.startsWith('/')) {
    return path;
  }

  const normalizedBase = normalizeBasePath(basePath, { trailingSlash: true });

  if (normalizedBase === '/') {
    return path;
  }

  const basePrefix = normalizedBase.slice(0, -1);

  if (path === normalizedBase || path === basePrefix || path.startsWith(`${basePrefix}/`)) {
    return path;
  }

  return path === '/' ? normalizedBase : `${basePrefix}${path}`;
}

function normalizeBasePath(rawBasePath, { trailingSlash }) {
  const normalized = `/${String(rawBasePath ?? '/').replace(/^\/+|\/+$/g, '')}`;

  if (normalized === '/') {
    return '/';
  }

  return trailingSlash ? `${normalized}/` : normalized;
}
