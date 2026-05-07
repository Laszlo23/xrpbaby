/** Gateway for ticket preview loops (pinned IPFS via 4EVERLAND bucket). */
export const TICKET_NFT_VIDEO_BASE =
  "https://buildingculture.4everbucket.com/video-ticketnfts" as const;

export function ticketNftVideo(filename: string): string {
  const safe = filename.replace(/^\/+/, "");
  return `${TICKET_NFT_VIDEO_BASE}/${safe}`;
}
