-- On-chain mint events ingested by scripts/chain-index-events.ts (AgentShareCampaign Minted, etc.)

CREATE TABLE "ChainMintEvent" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "toAddress" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "agentTypeId" INTEGER,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChainMintEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChainMintEvent_chainId_txHash_logIndex_key" ON "ChainMintEvent"("chainId", "txHash", "logIndex");
CREATE INDEX "ChainMintEvent_contractAddress_blockNumber_idx" ON "ChainMintEvent"("contractAddress", "blockNumber");
CREATE INDEX "ChainMintEvent_toAddress_idx" ON "ChainMintEvent"("toAddress");
