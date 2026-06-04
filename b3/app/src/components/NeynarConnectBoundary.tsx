import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

type State = { failed: boolean };

/** Isolates Neynar SIWN UI so a React child bug cannot crash the whole app after wallet connect. */
export class NeynarConnectBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[NeynarConnectBoundary]", error.message, info.componentStack);
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <p className={`text-xs text-zinc-500 ${this.props.className ?? ""}`}>
          Farcaster connect is temporarily unavailable. You can link it later from Profile.
        </p>
      );
    }
    return this.props.children;
  }
}
