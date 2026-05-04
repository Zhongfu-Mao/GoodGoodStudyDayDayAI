import { withBasePath } from './base-path.mjs';

export function createRehypeGitHubPagesBase(basePath) {
  return function rehypeGitHubPagesBase() {
    return function transform(tree) {
      visitHtmlNode(tree, basePath);
    };
  };
}

export function createRemarkGitHubPagesBase(basePath) {
  return function remarkGitHubPagesBase() {
    return function transform(tree) {
      visitMarkdownNode(tree, basePath);
    };
  };
}

function visitHtmlNode(node, basePath) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (node.type === 'element' && node.properties) {
    if (typeof node.properties.href === 'string') {
      node.properties.href = withBasePath(node.properties.href, { basePath });
    }

    if (typeof node.properties.src === 'string') {
      node.properties.src = withBasePath(node.properties.src, { basePath });
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      visitHtmlNode(child, basePath);
    }
  }
}

function visitMarkdownNode(node, basePath) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if ((node.type === 'link' || node.type === 'image') && typeof node.url === 'string') {
    node.url = withBasePath(node.url, { basePath });
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      visitMarkdownNode(child, basePath);
    }
  }
}
