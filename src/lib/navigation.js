let navigator = null;

/** Lets non-component code (like `openEnquiry`) use the router's navigate function. */
export function setNavigator(navigate) {
  navigator = navigate;
}

export function navigateTo(to) {
  if (navigator) navigator(to);
  else window.location.assign(to);
}

export function scrollToId(id, behavior) {
  const element = document.getElementById(id);
  if (!element) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: behavior ?? (reduce ? "auto" : "smooth"), block: "start" });
  return true;
}
