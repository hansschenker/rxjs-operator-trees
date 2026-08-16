export type Attrs = Record<string, string | boolean | EventListener>;

/** Minimal DOM element factory — framework-less by design. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Array<Node | string>
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === 'function') {
      node.addEventListener(key.replace(/^on/, '').toLowerCase(), value);
    } else if (typeof value === 'boolean') {
      if (value) node.setAttribute(key, '');
    } else {
      node.setAttribute(key, value);
    }
  }
  node.append(...children);
  return node;
}
