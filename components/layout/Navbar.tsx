"use client";

import { useState } from "react";
import type { User } from "@prisma/client";
import LinkButton from "@/components/ui/LinkButton";
import Logo from "@/components/ui/Logo";
import { CloseIcon, MenuIcon, SteamIcon } from "@/components/ui/icons";
import { NAV_LINKS } from "@/lib/constants";

function UserMenu({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Steam avatar URLs are dynamic per-user and not worth a remote-image config entry
        <img
          src={user.avatarUrl}
          alt=""
          className="h-8 w-8 rounded-full border border-line"
        />
      ) : null}
      <span className="font-body text-sm text-ink-text">{user.displayName}</span>
      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="font-body text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink-text"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

export default function Navbar({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      id="top"
      className="sticky top-0 z-50 border-b border-line/60 bg-ink/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm text-muted transition-colors hover:text-ink-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <LinkButton
              href="/api/auth/steam/login"
              variant="primary"
              icon={<SteamIcon className="h-4 w-4" />}
            >
              Sign in with Steam
            </LinkButton>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-text md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line/60 bg-ink px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-body text-sm text-muted transition-colors hover:text-ink-text"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-5">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <LinkButton
                href="/api/auth/steam/login"
                variant="primary"
                icon={<SteamIcon className="h-4 w-4" />}
                className="w-full"
              >
                Sign in with Steam
              </LinkButton>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
