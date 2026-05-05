export function createRehypeImageAltFallback(options?: {
  fallbackAlt?: string;
}): () => (tree: unknown, file?: unknown) => void;
