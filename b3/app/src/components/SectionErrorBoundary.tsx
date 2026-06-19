import { Component, type ErrorInfo, type ReactNode } from "react";

import { captureClientException } from "@/lib/sentry";

type Props = {
  children: ReactNode;
  label?: string;
};

type State = { error: Error | null };

/** Isolates section failures so one broken block does not white-screen the route. */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[SectionErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`,
      error,
      info,
    );
    void captureClientException(error, {
      section: this.props.label,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-rose-300">
            {this.props.label ?? "Section"} failed to load
          </p>
          <p className="mt-2 text-sm text-zinc-400">Refresh the page or try again in a moment.</p>
          <button
            type="button"
            className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs text-zinc-300 hover:text-white"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
