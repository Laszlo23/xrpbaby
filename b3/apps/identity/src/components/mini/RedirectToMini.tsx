import { MINI_APP_ORIGIN } from "@/lib/mini/site";

export function RedirectToMini() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">Culture Layer Mini App</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Quests and rewards live in the Farcaster mini app.
      </p>
      <a
        href={MINI_APP_ORIGIN}
        className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Open mini app
      </a>
    </div>
  );
}
