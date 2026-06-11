import { prisma } from "@ankommen/database";
import { settleBccForPayment } from "@ankommen/chain";

async function retryPendingSettlements() {
  const pending = await prisma.payment.findMany({
    where: { settlementStatus: "PENDING" },
    include: { subscription: { include: { plan: true } } },
    take: 25,
  });

  for (const payment of pending) {
    const bccAmount =
      payment.bccAmount ??
      payment.subscription?.plan.bccGrantPerMonth ??
      payment.subscription?.plan.bccGrantOnSignup;
    if (!bccAmount) continue;

    await settleBccForPayment({
      userId: payment.userId,
      paymentId: payment.id,
      bccAmount,
      exchangeRate: payment.exchangeRate ?? `${bccAmount} BCC`,
    });
    console.log(`Retried settlement for payment ${payment.id}`);
  }
}

retryPendingSettlements()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
