import { useEffect, useState } from "react";

/** True when the connected wallet is on IDENTITY_TEAM_WALLETS (server env). */
export function useIdentityTeamMintWallet(address?: string | null): boolean {
  const [teamMintWallet, setTeamMintWallet] = useState(false);

  useEffect(() => {
    if (!address) {
      setTeamMintWallet(false);
      return;
    }
    void fetch(`/api/identity/team-wallet?address=${encodeURIComponent(address)}`)
      .then((res) => res.json())
      .then((data: { teamMintWallet?: boolean }) => {
        setTeamMintWallet(Boolean(data.teamMintWallet));
      })
      .catch(() => setTeamMintWallet(false));
  }, [address]);

  return teamMintWallet;
}
