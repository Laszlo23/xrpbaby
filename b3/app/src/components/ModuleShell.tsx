import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { getModuleTheme, type ModuleThemeId } from "@/lib/module-themes";

type ModuleShellProps = {
  moduleId: ModuleThemeId;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
  /** Skip hero band when the page has its own hero (e.g. pass mint layout). */
  hideHero?: boolean;
};

export function ModuleShell({
  moduleId,
  title,
  subtitle,
  backTo = "/forest",
  backLabel = "← Forest",
  children,
  hideHero = false,
}: ModuleShellProps) {
  const theme = getModuleTheme(moduleId);
  const Icon = theme.icon;

  return (
    <div className="bc-surface min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <Link
          to={backTo}
          className="text-sm text-zinc-500 transition-colors hover:text-white"
        >
          {backLabel}
        </Link>

        {!hideHero ? (
          <section
            className={`relative mt-6 overflow-hidden rounded-3xl border bg-gradient-to-br p-8 sm:p-10 ${theme.gradient} ${theme.heroClass}`}
          >
            <div className="relative">
              <p className="mono-label" style={{ color: theme.accent }}>
                {theme.eyebrow}
              </p>
              <div className="mt-4 flex items-start gap-4">
                <Icon
                  className="mt-1 h-8 w-8 shrink-0"
                  style={{ color: theme.accent }}
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-3 max-w-2xl text-base text-zinc-400">{subtitle}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <header className="mt-6">
            <p className="mono-label" style={{ color: theme.accent }}>
              {theme.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {subtitle ? <p className="mt-3 max-w-2xl text-zinc-400">{subtitle}</p> : null}
          </header>
        )}

        <div className={hideHero ? "mt-8" : "mt-10"}>{children}</div>
      </div>
    </div>
  );
}
