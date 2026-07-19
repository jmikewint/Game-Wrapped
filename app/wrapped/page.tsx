import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getWrappedRawData } from "@/lib/wrapped";
import WrappedExperience from "@/components/wrapped/WrappedExperience";

export const metadata: Metadata = {
  title: "Your Wrapped — GameWrapped",
};

export default async function WrappedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const raw = await getWrappedRawData(user.id, user.displayName, user.avatarUrl);

  if (raw.games.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0b0713] px-6 text-center text-white">
        <p className="font-mono text-xs uppercase tracking-widest text-white/50">
          Nothing to wrap yet
        </p>
        <h1 className="max-w-md font-display text-3xl font-semibold">
          We couldn&apos;t find any games in your library.
        </h1>
        <p className="max-w-sm font-body text-white/60">
          Make sure your Steam &quot;game details&quot; privacy setting is
          public, then sync your library to build your recap.
        </p>
        <form action="/api/library/sync" method="POST">
          <input type="hidden" name="redirectTo" value="/wrapped" />
          <button
            type="submit"
            className="rounded-full bg-white px-6 py-2.5 font-display text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
          >
            Sync my library
          </button>
        </form>
        <a
          href="/"
          className="font-body text-sm text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/80"
        >
          Back to GameWrapped
        </a>
      </main>
    );
  }

  return <WrappedExperience raw={raw} />;
}
