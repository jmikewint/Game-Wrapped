"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import { computeWrappedStats } from "@/lib/superlatives";
import type { WrappedRawData } from "@/types/wrapped";
import ProgressBar from "@/components/wrapped/ProgressBar";
import { CloseIcon } from "@/components/ui/icons";
import {
  ArchetypeSlide,
  IntroSlide,
  OutroSlide,
  TopGameSlide,
  TopGamesListSlide,
  TotalHoursSlide,
} from "@/components/wrapped/slides";

type SlideId =
  | "intro"
  | "hours"
  | "topgame"
  | "toplist"
  | "archetype"
  | "outro";

/** How long each slide auto-advances after, in ms. `outro` never advances. */
const DURATIONS: Record<SlideId, number> = {
  intro: 3500,
  hours: 3200,
  topgame: 3400,
  toplist: 5200,
  archetype: 4200,
  outro: 0,
};

/** A distinct gradient per slide so the recap reads as a color journey,
 * independent of the site's own (light) theme. */
const BACKGROUNDS: Record<SlideId, string> = {
  intro:
    "radial-gradient(circle at 25% 15%, rgba(151,125,255,0.55), transparent 55%), radial-gradient(circle at 85% 85%, rgba(255,111,156,0.4), transparent 50%), #0b0713",
  hours: "linear-gradient(160deg, #0b0713 0%, #241a3d 55%, #3c2a63 100%)",
  topgame: "#050308",
  toplist: "linear-gradient(160deg, #0b0713 0%, #1a1330 100%)",
  archetype:
    "radial-gradient(circle at 50% 25%, rgba(255,111,156,0.5), transparent 60%), linear-gradient(160deg, #170b28 0%, #2b1642 100%)",
  outro: "linear-gradient(160deg, #0b0713 0%, #1a1330 100%)",
};

export default function WrappedExperience({ raw }: { raw: WrappedRawData }) {
  const router = useRouter();
  const stats = useMemo(() => computeWrappedStats(raw), [raw]);

  const slideOrder = useMemo<SlideId[]>(() => {
    const order: SlideId[] = ["intro", "hours"];
    if (stats.topGame) order.push("topgame");
    if (stats.topGames.length > 1) order.push("toplist");
    order.push("archetype", "outro");
    return order;
  }, [stats]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const isLast = index === slideOrder.length - 1;
  const currentId = slideOrder[index];

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(next, slideOrder.length - 1)));
    },
    [slideOrder.length],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const replay = useCallback(() => setIndex(0), []);

  // Auto-advance unless we're on the final slide or the user is holding down.
  useEffect(() => {
    if (isLast || paused) return;
    const duration = DURATIONS[currentId];
    const timer = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, slideOrder.length - 1));
    }, duration);
    return () => clearTimeout(timer);
  }, [currentId, isLast, paused, slideOrder.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") router.push("/");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, router]);

  // Swipe support: pointerdown/pointerup deltas double as a native-feeling
  // swipe on touch devices, layered on top of the existing tap zones. A
  // pointerup that resolves to a swipe suppresses the click-based tap that
  // follows it (via swipedRef) so a single gesture doesn't navigate twice.
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipedRef = useRef(false);

  const SWIPE_MIN_DISTANCE = 45; // px
  const SWIPE_MAX_DURATION = 600; // ms

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    setPaused(true);
    touchStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    setPaused(false);
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const deltaX = e.clientX - start.x;
    const deltaY = e.clientY - start.y;
    const elapsed = Date.now() - start.time;
    const isMostlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.5;

    if (
      Math.abs(deltaX) > SWIPE_MIN_DISTANCE &&
      isMostlyHorizontal &&
      elapsed < SWIPE_MAX_DURATION
    ) {
      swipedRef.current = true;
      // Most browsers still fire a trailing `click` after a drag, which is
      // what actually clears this flag (see handleTap) — but touch browsers
      // sometimes suppress it entirely. Clear it on a short timer too, so a
      // missing click can never permanently swallow the next real tap.
      window.setTimeout(() => {
        swipedRef.current = false;
      }, 400);
      if (deltaX < 0) {
        next();
      } else {
        prev();
      }
    }
  }

  function handlePointerLeave() {
    setPaused(false);
    touchStart.current = null;
  }

  function handleTap(e: MouseEvent<HTMLDivElement>) {
    // A swipe was already handled on pointerup — don't also treat the
    // trailing click as a tap-zone navigation.
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const isLeftSide = e.clientX - left < width * 0.3;
    if (isLeftSide) {
      prev();
    } else {
      next();
    }
  }

  return (
    <div className="fixed inset-0 z-50 select-none bg-black">
      <div
        className="absolute inset-0 transition-[background] duration-700"
        style={{ background: BACKGROUNDS[currentId] }}
      />

      <div className="relative flex h-full w-full flex-col">
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <ProgressBar
            total={slideOrder.length}
            index={index}
            isPaused={paused}
            durationMs={DURATIONS[currentId] || 1}
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-white/50">
              {index + 1} / {slideOrder.length}
            </span>
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Close wrapped"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className={`relative flex-1 overflow-hidden ${isLast ? "" : "cursor-pointer touch-manipulation"}`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onClick={isLast ? undefined : handleTap}
        >
          <div key={index} className="animate-slide-in absolute inset-0">
            {currentId === "intro" && (
              <IntroSlide
                displayName={raw.displayName}
                avatarUrl={raw.avatarUrl}
                gameCount={stats.gameCount}
                year={stats.year}
              />
            )}
            {currentId === "hours" && (
              <TotalHoursSlide
                totalHours={stats.totalHours}
                gameCount={stats.gameCount}
                isEstimated={stats.isEstimated}
              />
            )}
            {currentId === "topgame" && stats.topGame && (
              <TopGameSlide topGame={stats.topGame} />
            )}
            {currentId === "toplist" && (
              <TopGamesListSlide topGames={stats.topGames} />
            )}
            {currentId === "archetype" && (
              <ArchetypeSlide archetype={stats.archetype} />
            )}
            {currentId === "outro" && (
              <OutroSlide
                displayName={raw.displayName}
                stats={stats}
                onReplay={replay}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
