export type GroveTreeNode = {
  id: string;
  label: string;
  hue: number;
  forestStage: string;
  isYou?: boolean;
  isEmptySlot?: boolean;
  children: GroveTreeNode[];
};

export type TwinBloomNftStatus = {
  status: "none" | "pending" | "minted" | "failed";
  txHash?: string;
  tokenId?: string;
};

export type GroveTreePayload = {
  ok: boolean;
  self: GroveTreeNode;
  directCount: number;
  totalDescendants: number;
  twinBloomUnlocked: boolean;
  isGroveElder?: boolean;
  twinBloomNft?: TwinBloomNftStatus;
  newcomerBonusGranted?: boolean;
  inviterLabel?: string | null;
  story?: string;
};

/** IPFS CID for Building Culture anthem (Twin Bloom reward). */
export const TWIN_BLOOM_AUDIO_CID = "bafybeibxeu27qjq7lv3acq5s47uvhrgiidgzi2wmcin76w7owbrbujlwle";

export const GROVE_ELDER_THRESHOLD = 8;
