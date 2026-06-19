import { CultureIdentityChip } from "@/components/identity/CultureIdentityChip";
import { ChronicleProgressChip } from "@/components/chronicles/ChronicleProgressChip";

type Props = {
  className?: string;
  size?: "sm" | "md";
  showChronicles?: boolean;
};

/** Global culture ID + chronicle progress chips for nav shells. */
export function WalletIdentityBar({ className = "", size = "sm", showChronicles = true }: Props) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <CultureIdentityChip size={size} />
      {showChronicles ? <ChronicleProgressChip size={size} /> : null}
    </div>
  );
}
