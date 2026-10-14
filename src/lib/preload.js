// Prerendered blog pages embed their post as JSON (see scripts/prerender.mjs) so the first render needs no request.
let preloaded;

function read() {
  if (preloaded !== undefined) return preloaded;
  const element = typeof document !== "undefined" ? document.getElementById("gv-preload") : null;
  try {
    preloaded = element ? JSON.parse(element.textContent) : null;
  } catch {
    preloaded = null;
  }
  element?.remove();
  return preloaded;
}

export function getPreloadedPost(slug) {
  const data = read();
  return data?.post?.slug === slug ? data : null;
}
