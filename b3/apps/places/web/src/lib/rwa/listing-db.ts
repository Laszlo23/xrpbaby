import { getPool } from "@/lib/db";
import type { ListingMetadata, ListingStatus, OwnershipModel, RwaListing, VerificationEvent } from "./listing-types";

function rowToListing(row: Record<string, unknown>): RwaListing {
  const gaps = row.gaps;
  return {
    id: String(row.id),
    wallet: String(row.wallet),
    status: row.status as ListingStatus,
    ownershipModel: row.ownership_model as OwnershipModel,
    metadata: (row.metadata_json as ListingMetadata) ?? {},
    propertyIdOnchain: row.property_id_onchain != null ? String(row.property_id_onchain) : null,
    shareTokenAddress: row.share_token_address != null ? String(row.share_token_address) : null,
    gaps: Array.isArray(gaps) ? (gaps as string[]) : [],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function createListing(
  wallet: string,
  ownershipModel: OwnershipModel = "fractional",
): Promise<RwaListing | null> {
  const pool = getPool();
  if (!pool) return null;
  const id = crypto.randomUUID();
  const res = await pool.query(
    `INSERT INTO rwa_listings (id, wallet, status, ownership_model, metadata_json)
     VALUES ($1, $2, 'draft', $3, '{}')
     RETURNING *`,
    [id, wallet.toLowerCase(), ownershipModel],
  );
  return rowToListing(res.rows[0]);
}

export async function updateListing(
  id: string,
  wallet: string,
  patch: { metadata?: ListingMetadata; ownershipModel?: OwnershipModel; status?: ListingStatus; gaps?: string[] },
): Promise<RwaListing | null> {
  const pool = getPool();
  if (!pool) return null;
  const sets: string[] = ["updated_at = NOW()"];
  const vals: unknown[] = [id, wallet.toLowerCase()];
  let i = 3;
  if (patch.metadata !== undefined) {
    sets.push(`metadata_json = $${i++}`);
    vals.push(JSON.stringify(patch.metadata));
  }
  if (patch.ownershipModel !== undefined) {
    sets.push(`ownership_model = $${i++}`);
    vals.push(patch.ownershipModel);
  }
  if (patch.status !== undefined) {
    sets.push(`status = $${i++}`);
    vals.push(patch.status);
  }
  if (patch.gaps !== undefined) {
    sets.push(`gaps = $${i++}`);
    vals.push(JSON.stringify(patch.gaps));
  }
  const res = await pool.query(
    `UPDATE rwa_listings SET ${sets.join(", ")} WHERE id = $1 AND wallet = $2 RETURNING *`,
    vals,
  );
  if (!res.rows[0]) return null;
  return rowToListing(res.rows[0]);
}

export async function getListingById(id: string): Promise<RwaListing | null> {
  const pool = getPool();
  if (!pool) return null;
  const res = await pool.query(`SELECT * FROM rwa_listings WHERE id = $1`, [id]);
  if (!res.rows[0]) return null;
  return rowToListing(res.rows[0]);
}

export async function getListingsByWallet(wallet: string): Promise<RwaListing[]> {
  const pool = getPool();
  if (!pool) return [];
  const res = await pool.query(
    `SELECT * FROM rwa_listings WHERE wallet = $1 ORDER BY created_at DESC`,
    [wallet.toLowerCase()],
  );
  return res.rows.map(rowToListing);
}

export async function getListingsForAdmin(status?: ListingStatus): Promise<RwaListing[]> {
  const pool = getPool();
  if (!pool) return [];
  const res = status
    ? await pool.query(`SELECT * FROM rwa_listings WHERE status = $1 ORDER BY updated_at DESC`, [status])
    : await pool.query(`SELECT * FROM rwa_listings ORDER BY updated_at DESC LIMIT 100`);
  return res.rows.map(rowToListing);
}

export async function addVerificationEvent(
  listingId: string,
  stage: string,
  actor: string,
  notes?: string,
): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query(
    `INSERT INTO verification_events (listing_id, stage, actor, notes) VALUES ($1, $2, $3, $4)`,
    [listingId, stage, actor, notes ?? null],
  );
}

export async function getVerificationEvents(listingId: string): Promise<VerificationEvent[]> {
  const pool = getPool();
  if (!pool) return [];
  const res = await pool.query(
    `SELECT * FROM verification_events WHERE listing_id = $1 ORDER BY created_at ASC`,
    [listingId],
  );
  return res.rows.map((r) => ({
    id: Number(r.id),
    listingId: String(r.listing_id),
    stage: String(r.stage),
    actor: String(r.actor),
    notes: r.notes != null ? String(r.notes) : null,
    createdAt: String(r.created_at),
  }));
}

export async function addListingMedia(listingId: string, url: string, sortOrder: number, kind = "photo"): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query(
    `INSERT INTO listing_media (listing_id, url, sort_order, kind) VALUES ($1, $2, $3, $4)`,
    [listingId, url, sortOrder, kind],
  );
}

export async function getListingMedia(listingId: string): Promise<{ url: string; sortOrder: number; kind: string }[]> {
  const pool = getPool();
  if (!pool) return [];
  const res = await pool.query(
    `SELECT url, sort_order, kind FROM listing_media WHERE listing_id = $1 ORDER BY sort_order ASC`,
    [listingId],
  );
  return res.rows.map((r) => ({
    url: String(r.url),
    sortOrder: Number(r.sort_order),
    kind: String(r.kind),
  }));
}

export async function addListingDocument(
  listingId: string,
  docKind: string,
  storageUrl: string,
  hash?: string,
): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query(
    `INSERT INTO listing_documents (listing_id, doc_kind, storage_url, content_hash) VALUES ($1, $2, $3, $4)`,
    [listingId, docKind, storageUrl, hash ?? null],
  );
}

export async function getListingDocuments(
  listingId: string,
): Promise<{ docKind: string; storageUrl: string; hash: string | null }[]> {
  const pool = getPool();
  if (!pool) return [];
  const res = await pool.query(
    `SELECT doc_kind, storage_url, content_hash FROM listing_documents WHERE listing_id = $1`,
    [listingId],
  );
  return res.rows.map((r) => ({
    docKind: String(r.doc_kind),
    storageUrl: String(r.storage_url),
    hash: r.content_hash != null ? String(r.content_hash) : null,
  }));
}

export async function setListingAiSummary(listingId: string, summaryMd: string): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query(
    `INSERT INTO listing_ai_summaries (listing_id, summary_md, generated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (listing_id) DO UPDATE SET summary_md = $2, generated_at = NOW()`,
    [listingId, summaryMd],
  );
}

export async function getListingAiSummary(listingId: string): Promise<string | null> {
  const pool = getPool();
  if (!pool) return null;
  const res = await pool.query(`SELECT summary_md FROM listing_ai_summaries WHERE listing_id = $1`, [listingId]);
  return res.rows[0]?.summary_md != null ? String(res.rows[0].summary_md) : null;
}

export async function getAiSummaryByPropertyId(propertyId: string): Promise<string | null> {
  const pool = getPool();
  if (!pool) return null;
  const res = await pool.query(
    `SELECT s.summary_md FROM listing_ai_summaries s
     JOIN rwa_listings l ON l.id = s.listing_id
     WHERE l.property_id_onchain = $1`,
    [propertyId],
  );
  return res.rows[0]?.summary_md != null ? String(res.rows[0].summary_md) : null;
}

export async function adminUpdateListingStatus(
  id: string,
  status: ListingStatus,
  gaps?: string[],
): Promise<RwaListing | null> {
  const pool = getPool();
  if (!pool) return null;
  const res = await pool.query(
    `UPDATE rwa_listings SET status = $2, gaps = $3, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status, JSON.stringify(gaps ?? [])],
  );
  if (!res.rows[0]) return null;
  return rowToListing(res.rows[0]);
}

export async function setListingMintResult(
  id: string,
  propertyIdOnchain: string,
  shareTokenAddress: string,
): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query(
    `UPDATE rwa_listings SET status = 'minted', property_id_onchain = $2, share_token_address = $3, updated_at = NOW() WHERE id = $1`,
    [id, propertyIdOnchain, shareTokenAddress],
  );
}

export async function addWatchlist(wallet: string, propertyId: string): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query(
    `INSERT INTO watchlist (wallet, property_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [wallet.toLowerCase(), propertyId],
  );
}

export async function removeWatchlist(wallet: string, propertyId: string): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query(`DELETE FROM watchlist WHERE wallet = $1 AND property_id = $2`, [
    wallet.toLowerCase(),
    propertyId,
  ]);
}

export async function getWatchlist(wallet: string): Promise<string[]> {
  const pool = getPool();
  if (!pool) return [];
  const res = await pool.query(`SELECT property_id FROM watchlist WHERE wallet = $1 ORDER BY created_at DESC`, [
    wallet.toLowerCase(),
  ]);
  return res.rows.map((r) => String(r.property_id));
}

export async function isOnWatchlist(wallet: string, propertyId: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) return false;
  const res = await pool.query(`SELECT 1 FROM watchlist WHERE wallet = $1 AND property_id = $2 LIMIT 1`, [
    wallet.toLowerCase(),
    propertyId,
  ]);
  return res.rows.length > 0;
}
