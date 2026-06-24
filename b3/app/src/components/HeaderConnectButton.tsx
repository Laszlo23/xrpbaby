import { WalletAccountMenu } from "@/components/wallet/WalletAccountMenu";

type Props = {
  className?: string;
  /** Show culture ID chips beside the wallet menu (nav bar layout). */
  showIdentity?: boolean;
};

export function HeaderConnectButton({ className = "", showIdentity = false }: Props) {
  return <WalletAccountMenu className={className} showIdentityBar={showIdentity} />;
}
