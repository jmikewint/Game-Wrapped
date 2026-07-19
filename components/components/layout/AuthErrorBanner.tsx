const MESSAGES: Record<string, string> = {
  verification_failed:
    "Steam couldn't verify that sign-in request. Try signing in again.",
  profile_unavailable:
    "We verified your Steam sign-in, but couldn't load your public profile. Make sure your Steam profile visibility isn't set to private, then try again.",
  not_signed_in: "Sign in with Steam first, then try refreshing your library.",
  sync_failed:
    "We couldn't refresh your library just now. Try again in a moment.",
};

export default function AuthErrorBanner({ code }: { code: string }) {
  const message = MESSAGES[code] ?? "Something went wrong signing in with Steam.";

  return (
    <div className="border-b border-line/60 bg-coral/10">
      <p className="mx-auto max-w-6xl px-6 py-3 font-body text-sm text-ink-text">
        {message}
      </p>
    </div>
  );
}
