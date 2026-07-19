"use client";

import { useEffect, useState } from "react";

/**
 * Animates from 0 up to `value` on mount. Parents should remount this
 * (e.g. via a `key` on the slide wrapper) whenever the recap advances so
 * the count-up replays instead of jumping straight to the final number.
 */
export default function CountUp({
  value,
  durationMs = 1100,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }

    let frame: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
