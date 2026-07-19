"use client";

export default function ProgressBar({
  total,
  index,
  isPaused,
  durationMs,
}: {
  total: number;
  index: number;
  isPaused: boolean;
  durationMs: number;
}) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
        >
          <div
            key={`${i}-${i === index ? "active" : "idle"}`}
            className="h-full rounded-full bg-white"
            style={
              i < index
                ? { width: "100%" }
                : i === index
                  ? {
                      width: "0%",
                      animationName: "wrapped-progress",
                      animationDuration: `${durationMs}ms`,
                      animationTimingFunction: "linear",
                      animationFillMode: "forwards",
                      animationPlayState: isPaused ? "paused" : "running",
                    }
                  : { width: "0%" }
            }
          />
        </div>
      ))}
    </div>
  );
}
