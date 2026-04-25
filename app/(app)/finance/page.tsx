"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { finance, getProjectById } from "@/lib/mock-data";
import { StatCard } from "@/components/shared/stat-card";
import { formatCompactINR, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { FinanceOverview } from "@/components/dashboard/finance-overview";

export default function FinancePage() {
  const income = finance
    .filter((f) => f.type === "Income" && f.status === "Paid")
    .reduce((s, f) => s + f.amount, 0);
  const expense = finance
    .filter((f) => f.type === "Expense" && f.status === "Paid")
    .reduce((s, f) => s + f.amount, 0);
  const pending = finance
    .filter((f) => f.status === "Pending" || f.status === "Overdue")
    .reduce((s, f) => s + f.amount, 0);
  const net = income - expense;

  return (
    <div>
      <PageHeader
        title="Finance"
        description="Income, expenses, receivables and project-level money flow."
      >
        <Button size="sm">
          <Plus className="h-4 w-4" /> New Entry
        </Button>
      </PageHeader>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Income"
          value={formatCompactINR(income)}
          icon={TrendingUp}
          tone="emerald"
          index={0}
        />
        <StatCard
          label="Expense"
          value={formatCompactINR(expense)}
          icon={TrendingDown}
          tone="rose"
          index={1}
        />
        <StatCard
          label="Pending"
          value={formatCompactINR(pending)}
          icon={Clock}
          tone="amber"
          index={2}
        />
        <StatCard
          label="Net"
          value={formatCompactINR(net)}
          icon={Wallet}
          tone="indigo"
          index={3}
        />
      </section>

      <div className="mt-6">
        <FinanceOverview />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {finance.map((f) => {
                const proj = f.projectId ? getProjectById(f.projectId) : null;
                return (
                  <tr
                    key={f.id}
                    className="border-t border-slate-100 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(f.date)}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                      {f.description}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {proj?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{f.category}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={f.status} />
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-num font-semibold ${
                        f.type === "Income"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {f.type === "Income" ? "+" : "−"}{" "}
                      {formatCompactINR(f.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}