"use client";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Hexagon, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { fulfillCheckout } from "@/lib/api/checkout.functions";

const successSearchSchema = z.object({
  session_id: z.string().optional(),
});

export const Route = createFileRoute("/join/success")({
  validateSearch: successSearchSchema,
  component: JoinSuccessPage,
});

function JoinSuccessPage() {
  const { session_id: sessionId } = Route.useSearch();
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () => {
      if (!sessionId) throw new Error("Missing checkout session");
      return fulfillCheckout({ data: { sessionId } });
    },
    onSuccess: () => {
      toast.success("Payment confirmed — your Day 1 kit is unlocked.");
      navigate({ to: "/members" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const startedRef = useRef(false);
  useEffect(() => {
    if (!sessionId || startedRef.current) return;
    startedRef.current = true;
    mutate();
  }, [sessionId, mutate]);

  if (!sessionId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-muted-foreground">No checkout session found.</p>
        <Link to="/join" className="mt-4 font-mono text-xs text-signal hover:underline">
          Back to join
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <Hexagon className="h-10 w-10 fill-signal text-signal" />
      <h1 className="mt-6 font-display text-3xl font-bold">Confirming your payment</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Hang tight — we&apos;re unlocking your Day 1 kit and signing you in.
      </p>
      {isPending && (
        <div className="mt-8 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </div>
      )}
      {isError && (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-destructive">{error?.message}</p>
          <button
            type="button"
            onClick={() => mutate()}
            className="inline-flex items-center gap-2 bg-signal px-6 py-3 font-mono text-xs uppercase tracking-widest text-signal-foreground"
          >
            Try again
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}
