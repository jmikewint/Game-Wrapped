import Logo from "@/components/ui/Logo";
import { GithubIcon } from "@/components/ui/icons";
import { FOOTER_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="max-w-sm font-body text-sm text-muted">
            An independent fan project. Not affiliated with Valve or Steam.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm text-muted transition-colors hover:text-ink-text"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com"
            aria-label="View source on GitHub"
            className="text-muted transition-colors hover:text-ink-text"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
      <p className="border-t border-line/60 py-4 text-center font-mono text-xs text-muted">
        © {new Date().getFullYear()} GameWrapped
      </p>
    </footer>
  );
}
