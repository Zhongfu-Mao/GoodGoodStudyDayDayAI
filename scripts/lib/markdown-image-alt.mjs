export function createRehypeImageAltFallback({ fallbackAlt = 'Article image' } = {}) {
  return function rehypeImageAltFallback() {
    return function transform(tree, file) {
      const fallback = resolveFallbackAlt(file, fallbackAlt);
      visitNode(tree, fallback);
    };
  };
}

function visitNode(node, fallbackAlt) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (node.type === 'element' && node.tagName === 'img') {
    node.properties = node.properties ?? {};

    if (typeof node.properties.alt !== 'string' || node.properties.alt.trim() === '') {
      node.properties.alt = fallbackAlt;
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      visitNode(child, fallbackAlt);
    }
  }
}

function resolveFallbackAlt(file, fallbackAlt) {
  const data = file?.data;
  const frontmatter =
    data?.astro?.frontmatter ??
    data?.frontmatter ??
    data?.matter;
  const title = frontmatter?.title;

  return typeof title === 'string' && title.trim() ? title.trim() : fallbackAlt;
}
