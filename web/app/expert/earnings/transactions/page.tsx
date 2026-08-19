import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ClientDate from "@/components/ClientDate";

export const metadata: Metadata = {
  title: "Transactions — Expert earnings",
};

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const transactions = await prisma.walletTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const [creditAgg, debitAgg] = await Promise.all([
    prisma.walletTransaction.aggregate({
      where: { userId: session.user.id, type: "CREDIT" },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.aggregate({
      where: { userId: session.user.id, type: "DEBIT" },
      _sum: { amount: true },
    }),
  ]);

  const totalCredit = creditAgg._sum.amount ?? 0;
  const totalDebit = debitAgg._sum.amount ?? 0;
  const balance = totalCredit - totalDebit;

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <Eyebrow>Earnings</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Transactions</h1>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Available</div>
              <div className="font-display font-bold text-2xl text-charcoal">₹{(balance / 100).toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Total credit</div>
              <div className="font-display font-bold text-2xl text-green-700">₹{(totalCredit / 100).toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">Total debit</div>
              <div className="font-display font-bold text-2xl text-red-700">₹{(totalDebit / 100).toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            {transactions.length === 0 ? (
              <p className="text-inkSoft text-center">No transactions yet.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl bg-cream p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-charcoal text-sm">{t.description || t.type}</p>
                      <p className="text-xs text-inkSoft">
                        <ClientDate date={t.createdAt} options={{ dateStyle: "medium", timeStyle: "short" }} />
                      </p>
                    </div>
                    <span className={`font-semibold ${t.type === "CREDIT" ? "text-green-700" : "text-red-700"}`}>
                      {t.type === "CREDIT" ? "+" : "-"}₹{(t.amount / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
