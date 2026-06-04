import { usePrivy } from "@privy-io/react-auth";
import { useCultureWallet } from "./useCultureWallet.js";

export type CultureSignInButtonProps = {
  className?: string;
  label?: string;
  connectingLabel?: string;
  authHubOrigin?: string;
};

/** Shared "Sign in with Culture" — inline Privy or auth-hub redirect when cross-origin. */
export function CultureSignInButton({
  className,
  label = "Sign in",
  connectingLabel = "Signing in…",
  authHubOrigin,
}: CultureSignInButtonProps) {
  const { ready, authenticated, signIn } = useCultureWallet(authHubOrigin);
  const { logout } = usePrivy();

  if (!ready) {
    return (
      <button type="button" className={className} disabled>
        {connectingLabel}
      </button>
    );
  }

  if (authenticated) {
    return (
      <button type="button" className={className} onClick={() => void logout()}>
        Sign out
      </button>
    );
  }

  return (
    <button type="button" className={className} onClick={() => signIn()}>
      {label}
    </button>
  );
}
