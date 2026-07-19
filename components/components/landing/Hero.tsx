import type { User } from "@prisma/client";
import LinkButton from "@/components/ui/LinkButton";
import { SteamIcon } from "@/components/ui/icons";
import RecapCardStack from "@/components/landing/RecapCardStack";
import type { LibrarySummary } from "@/lib/library-summary";

export default function Hero({
  user,
  library,
}: {
  user: User | null;
  library: LibrarySummary | null;
}) {
  return (
    <section className="bg-noise relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs uppercase tracking-widest text-volt">
            Your library, recapped
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] text-ink-text sm:text-5xl lg:text-6xl">
            Every hour you played,
            <br />
            turned into a story.
          </h1>
          <p className="mt-6 max-w-md font-body text-lg text-muted">
            GameWrapped connects to your Steam library and builds a personal
            year-in-review — top games, total hours, achievements unlocked,
            and the genres that defined your year.
          </p>

          {user ? (
            <>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- Steam avatar URLs are dynamic per-user */}
                <img
                  src={user.avatarUrl ?? ""}
                  alt=""
                  className="h-11 w-11 rounded-full border border-line"
                />
                <p className="font-body text-ink-text">
                  Signed in as{" "}
                  <span className="font-medium">{user.displayName}</span>
                </p>
              </div>

              {library && library.gameCount > 0 ? (
                <div className="mt-6 flex flex-wrap gap-6 rounded-2xl border border-line bg-panel px-5 py-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      Games owned
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink-text">
                      {library.gameCount}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      Total hours
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold text-volt">
                      {library.totalHours}
                    </p>
                  </div>
                  {library.topGame ? (
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-muted">
                        Most played
                      </p>
                      <p className="mt-1 font-display text-2xl font-semibold text-ink-text">
                        {library.topGame.name}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 font-mono text-xs text-muted">
                  No games found yet — make sure your Steam game details are
                  public, then refresh below.
                </p>
              )}

              <form action="/api/library/sync" method="POST" className="mt-4">
                <button
                  type="submit"
                  className="font-body text-sm font-medium text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink-text"
                >
                  Refresh my library
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <LinkButton
                  href="/api/auth/steam/login"
                  variant="primary"
                  icon={<SteamIcon className="h-4 w-4" />}
                >
                  Sign in with Steam
                </LinkButton>
                <a
                  href="#how-it-works"
                  className="font-body text-sm font-medium text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink-text"
                >
                  See how it works
                </a>
              </div>
              <p className="mt-4 font-mono text-xs text-muted">
                Sign-in and your real library sync as soon as you connect.
              </p>
            </>
          )}
        </div>

        <RecapCardStack />
      </div>
    </section>
  );
}
