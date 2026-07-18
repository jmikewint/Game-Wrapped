"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { CloseIcon, MenuIcon, SteamIcon } from "@/components/ui/icons";
import { NAV_LINKS } from "@/lib/constants";

export default function Navbar() {
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
          <Button variant="primary" icon={<SteamIcon className="h-4 w-4" />}>
            Sign in with Steam
          </Button>
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
          <Button
            variant="primary"
            icon={<SteamIcon className="h-4 w-4" />}
            className="mt-5 w-full"
          >
            Sign in with Steam
          </Button>
        </div>
      )}
    </header>
  );
}
