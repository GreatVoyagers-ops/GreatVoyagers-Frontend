import { useEffect, useState } from "react";
import useInView from "../hooks/useInView";
import useReducedMotion from "../hooks/useReducedMotion";

export default function CountUp({ value, suffix = "", duration = 1600 }) {
  const [ref, inView] = useInView();
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setCurrent(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(eased * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, value, duration]);

  return (
    <span ref={ref} aria-label={`${value}${suffix}`}>
      <span aria-hidden="true">
        {current}
        {suffix}
      </span>
    </span>
  );
}
