import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";

// Deliberately NOT edge runtime: ImageResponse works fine on the default
// Node.js runtime, and edge route handlers can be unreliable in local
// `next dev` (an uncaught error inside one tends to drop the connection
// entirely rather than return a normal error response — which is what
// shows up in the browser as a generic "check your connection" failure).

const WIDTH = 1080;
const HEIGHT = 1920;

/** Keeps arbitrary query-string input from blowing up the rendered card. */
function clip(value: string | null, max: number, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (trimmed.length === 0) return fallback;
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

function clipInt(value: string | null, fallback: number): number {
  const n = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * Renders the recap's outro card as a real, downloadable PNG — the
 * "shareable output" the in-app recap couldn't produce on its own. Every
 * value is passed in as a query param by `OutroSlide` (see
 * `buildCardUrl`), mirroring exactly what the viewer saw rather than
 * re-deriving stats (and risking a different result) on the server.
 *
 * Example: /api/wrapped/card?name=Alex&year=2026&hours=412&games=38&...
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = clip(searchParams.get("name"), 40, "A GameWrapped user");
  const year = clipInt(searchParams.get("year"), new Date().getFullYear());
  const hours = clipInt(searchParams.get("hours"), 0);
  const games = clipInt(searchParams.get("games"), 0);
  const archTitle = clip(searchParams.get("archTitle"), 40, "The Steam Wanderer");
  const archEmoji = clip(searchParams.get("archEmoji"), 8, "🎮");
  const topGame = clip(searchParams.get("topGame"), 60, "");
  const topGameHours = clipInt(searchParams.get("topGameHours"), 0);

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "96px 80px",
            background:
              "radial-gradient(circle at 50% 20%, rgba(255,111,156,0.35), transparent 55%), radial-gradient(circle at 15% 85%, rgba(151,125,255,0.4), transparent 55%), #0b0713",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 30,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {name}&apos;s {year} year, wrapped
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  fontSize: 34,
                  color: "rgba(255,255,255,0.55)",
                  textTransform: "uppercase",
                  letterSpacing: 4,
                }}
              >
                Hours this year
              </div>
              <div
                style={{
                  fontSize: 220,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                {hours.toLocaleString()}
              </div>
            </div>

            <div style={{ display: "flex", gap: 64 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    fontSize: 26,
                    color: "rgba(255,255,255,0.45)",
                    textTransform: "uppercase",
                    letterSpacing: 3,
                  }}
                >
                  Games
                </div>
                <div style={{ fontSize: 56, fontWeight: 600, color: "#ffffff" }}>
                  {games}
                </div>
              </div>
              {topGame ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div
                    style={{
                      fontSize: 26,
                      color: "rgba(255,255,255,0.45)",
                      textTransform: "uppercase",
                      letterSpacing: 3,
                    }}
                  >
                    Most played
                  </div>
                  <div style={{ fontSize: 40, fontWeight: 600, color: "#ffffff" }}>
                    {topGame} · {topGameHours}h
                  </div>
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "36px 40px",
                borderRadius: 32,
                border: "2px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontSize: 72 }}>{archEmoji}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                  style={{
                    fontSize: 24,
                    color: "rgba(255,255,255,0.45)",
                    textTransform: "uppercase",
                    letterSpacing: 3,
                  }}
                >
                  Gaming personality
                </div>
                <div style={{ fontSize: 44, fontWeight: 700, color: "#ffffff" }}>
                  {archTitle}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              color: "rgba(255,255,255,0.65)",
              letterSpacing: 2,
            }}
          >
            GameWrapped
          </div>
        </div>
      ),
      { width: WIDTH, height: HEIGHT },
    );
  } catch (error) {
    // Surface a real, inspectable error instead of letting the connection
    // just drop — a raw ImageResponse/Satori failure otherwise reads in the
    // browser as a generic "check your internet connection" failure with
    // no indication anything went wrong server-side.
    console.error("Failed to render wrapped card image:", error);
    return NextResponse.json(
      { error: "Failed to render recap card image." },
      { status: 500 },
    );
  }
}
