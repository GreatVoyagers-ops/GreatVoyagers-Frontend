import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setNavigator, scrollToId } from "../lib/navigation";

/** Wires the router into non-component helpers and handles scroll position on navigation. */
export default function RouterEffects() {
  const navigate = useNavigate();
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    setNavigator(navigate);
    return () => setNavigator(null);
  }, [navigate]);

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    // Lazy pages may not have rendered the target yet, so retry for a short while. Content loading above the
    // target (e.g. the journal teaser) can push it down, so settle once more unless the visitor has scrolled.
    const id = decodeURIComponent(hash.slice(1));
    let frame = 0;
    let handle;
    let settleTimer;
    let userScrolled = false;
    const markUserScroll = () => {
      userScrolled = true;
    };
    const userEvents = ["wheel", "touchstart", "keydown", "mousedown"];
    userEvents.forEach((type) => window.addEventListener(type, markUserScroll, { passive: true, once: true }));

    const attempt = () => {
      if (scrollToId(id)) {
        settleTimer = window.setTimeout(() => !userScrolled && scrollToId(id, "auto"), 900);
        return;
      }
      if (frame++ < 60) handle = requestAnimationFrame(attempt);
    };
    attempt();
    return () => {
      cancelAnimationFrame(handle);
      window.clearTimeout(settleTimer);
      userEvents.forEach((type) => window.removeEventListener(type, markUserScroll));
    };
  }, [pathname, hash, key]);

  return null;
}
