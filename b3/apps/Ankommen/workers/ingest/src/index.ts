import { config } from "dotenv";
import { resolve } from "node:path";
import { prisma } from "@ankommen/database";

config({ path: resolve(import.meta.dirname, "../../../.env") });

const SEED_SOURCES = [
  {
    title: "Registration in Austria (Meldezettel)",
    url: "https://www.oesterreich.gv.at/themen/leben_in_oesterreich/aufenthalt/Seite.325001.html",
    content: `In Austria, you must register your residence within 3 days of moving in (Meldepflicht). Visit the Meldeservice or your district office with passport, rental contract, and landlord confirmation (Wohnungsgeberbestätigung). EU citizens need valid ID; third-country nationals need residence permit.`,
  },
  {
    title: "AMS — Public Employment Service",
    url: "https://www.ams.at",
    content: `AMS (Arbeitsmarktservice) helps with job search, unemployment benefits, and career counseling. Register if unemployed within 5 days. Required documents: passport, Meldezettel, social security number. Notstandshilfe may be available for those who exhausted regular unemployment benefits.`,
  },
  {
    title: "ÖGK Health Insurance",
    url: "https://www.oegk.at",
    content: `Österreichische Gesundheitskasse (ÖGK) provides health insurance. Employed persons are automatically insured. Self-employed and others must register. The e-card gives access to doctors. Emergency: 144 ambulance, 112 EU emergency, 141 doctor on call.`,
  },
  {
    title: "MA35 Vienna Immigration",
    url: "https://www.wien.gv.at/amtswege/einwanderung/",
    content: `MA 35 handles immigration matters in Vienna: residence permits, extensions, citizenship applications. Appointments usually required. Bring all previous permits, passport, photos, and proof of income/housing.`,
  },
  {
    title: "Familienbeihilfe (Child Benefit)",
    url: "https://www.bmf.gv.at/themen/familienleistungen/familienbeihilfe.html",
    content: `Familienbeihilfe is a monthly child benefit. EU/EEA citizens with legal residence may qualify. Amount depends on child age. Apply via FinanzOnline or tax office (Finanzamt). Required: birth certificates, registration proof.`,
  },
];

function chunkText(text: string, size = 800, overlap = 100): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return chunks;
}

async function upsertSource(
  source: (typeof SEED_SOURCES)[number],
  createEmbedding: (text: string) => Promise<number[] | null>,
) {
  let parent = await prisma.knowledgeSource.findFirst({
    where: { url: source.url, parentId: null },
    include: { chunks: true },
  });

  if (parent) {
    parent = await prisma.knowledgeSource.update({
      where: { id: parent.id },
      data: { title: source.title, content: source.content, lastSyncedAt: new Date(), isVerified: true },
      include: { chunks: true },
    });
    if (parent.chunks.length > 0) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM knowledge_embeddings WHERE "sourceId" IN (${parent.chunks.map((_, i) => `$${i + 1}`).join(", ")})`,
        ...parent.chunks.map((c) => c.id),
      );
      await prisma.knowledgeSource.deleteMany({ where: { parentId: parent.id } });
    }
  } else {
    parent = await prisma.knowledgeSource.create({
      data: {
        title: source.title,
        url: source.url,
        content: source.content,
        isVerified: true,
        sourceType: "official",
        lastSyncedAt: new Date(),
      },
      include: { chunks: true },
    });
  }

  const chunks = chunkText(source.content);
  for (let i = 0; i < chunks.length; i++) {
    const chunk = await prisma.knowledgeSource.create({
      data: {
        title: `${source.title} (part ${i + 1})`,
        url: source.url,
        content: chunks[i]!,
        parentId: parent.id,
        chunkIndex: i,
        isVerified: true,
        sourceType: "official",
      },
    });

    const embedding = await createEmbedding(chunks[i]!);
    if (embedding) {
      const vectorStr = `[${embedding.join(",")}]`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO knowledge_embeddings (id, "sourceId", embedding) VALUES ($1, $2, $3::vector) ON CONFLICT ("sourceId") DO UPDATE SET embedding = EXCLUDED.embedding`,
        `emb_${chunk.id}`,
        chunk.id,
        vectorStr,
      );
    }
  }
}

async function main() {
  const { createEmbedding } = await import("@ankommen/ai");
  console.log("Ingesting knowledge sources…");
  for (const source of SEED_SOURCES) {
    await upsertSource(source, createEmbedding);
    console.log(`Ingested: ${source.title}`);
  }
  const [{ count: sources }] = await prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*)::bigint AS count FROM "KnowledgeSource"`;
  const [{ count: embeddings }] = await prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*)::bigint AS count FROM knowledge_embeddings`;
  console.log(`Done. ${sources} sources, ${embeddings} embeddings.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
