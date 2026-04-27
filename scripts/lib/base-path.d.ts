// Keep this declaration file in sync with base-path.mjs; TypeScript consumers import the ESM helper directly.
export function resolveBasePath(options?: {
  env?: Record<string, string | undefined>;
  trailingSlash?: boolean;
}): string;

export function resolveAppBasePath(options?: {
  env?: Record<string, string | undefined>;
}): string;

export function withBasePath(
  path: string,
  options?: {
    basePath?: string;
  },
): string;
