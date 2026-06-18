"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Hexagon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { login, loginDemo } from "@/lib/api/member.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => login({ data: { email } }),
    onSuccess: () => {
      toast.success("Welcome back.");
      window.location.assign("/members");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const demoMutation = useMutation({
    mutationFn: () => loginDemo(),
    onSuccess: () => {
      toast.success("Demo account loaded.");
      window.location.assign("/members");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <Hexagon className="h-10 w-10 fill-signal text-signal" />
      <h1 className="mt-6 font-display text-3xl font-bold">Sign in</h1>
      <form
        className="mt-8 w-full max-w-md border border-border bg-surface p-8"
        onSubmit={(e) => {
          e.preventDefault();
          loginMutation.mutate();
        }}
      >
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-signal"
          />
        </label>
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-6 w-full bg-signal py-3 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground"
        >
          {loginMutation.isPending ? "Signing in..." : "Continue"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => demoMutation.mutate()}
        disabled={demoMutation.isPending}
        className="mt-6 border border-signal/40 px-6 py-3 font-mono text-xs uppercase tracking-widest text-signal hover:bg-signal/10"
      >
        {demoMutation.isPending ? "Loading demo..." : "View demo account →"}
      </button>
      <p className="mt-3 font-mono text-[10px] text-muted-foreground">
        Or sign in with <span className="text-foreground">demo@reset.app</span>
      </p>
      <Link to="/join" className="mt-4 font-mono text-xs text-muted-foreground hover:text-signal">
        New here? Join RESET →
      </Link>
    </main>
  );
}
