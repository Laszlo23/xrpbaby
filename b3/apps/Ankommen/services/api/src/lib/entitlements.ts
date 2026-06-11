import { prisma, Prisma } from "@ankommen/database";

type RedisClient = {
  get: (key: string) => Promise<string | null>;
  setex: (key: string, seconds: number, value: string) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
};

let redis: RedisClient | null = null;

async function getRedis(): Promise<RedisClient | null> {
  if (redis) return redis;
  if (!process.env.REDIS_URL) return null;
  const mod = await import("ioredis");
  const Client = mod.default as unknown as new (url: string) => RedisClient;
  redis = new Client(process.env.REDIS_URL);
  return redis;
}

export async function getEntitlements(userId: string) {
  const cacheKey = `entitlements:${userId}`;
  const redisClient = await getRedis();
  if (redisClient) {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  const plan = subscription?.plan ?? (await prisma.plan.findUnique({ where: { code: "FREE" } }));
  if (!plan) {
    throw new Error("No plan found");
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const messageCount = await prisma.message.count({
    where: {
      conversation: { userId },
      role: "assistant",
      createdAt: { gte: monthStart },
    },
  });

  const documentCount = await prisma.uploadedDocument.count({
    where: { userId, createdAt: { gte: monthStart } },
  });

  const entitlements = {
    planCode: plan.code,
    planName: plan.name,
    features: plan.features,
    limits: {
      aiMessages: plan.aiMessagesLimit,
      aiMessagesUsed: messageCount,
      documents: plan.documentLimit,
      documentsUsed: documentCount,
    },
    canUseAI: plan.aiMessagesLimit === null || messageCount < plan.aiMessagesLimit,
    canUploadDocument: plan.documentLimit === null || documentCount < plan.documentLimit,
    canAnalyzeDocument: plan.code !== "FREE",
  };

  if (redisClient) {
    await redisClient.setex(cacheKey, 60, JSON.stringify(entitlements));
  }

  return entitlements;
}

export async function invalidateEntitlements(userId: string) {
  const redisClient = await getRedis();
  if (redisClient) {
    await redisClient.del(`entitlements:${userId}`);
  }
}

export async function checkAIQuota(userId: string) {
  const entitlements = await getEntitlements(userId);
  if (!entitlements.canUseAI) {
    throw new Error("AI message limit reached. Upgrade to Premium for unlimited access.");
  }
  return entitlements;
}
