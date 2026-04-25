"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { finance } from "@/lib/mock-data";
import { formatCompactINR } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function FinanceOverview() {
  const income = finance
    .filter((f) => f.type === "Income" && f.status === "Paid")
    .reduce((s, f) => s + f.amount, 0);
  const expense = finance
    .filter((f) => f.type === "Expense" && f.status === "Paid")
    .reduce((s, f) => s + f.amount, 0);
  const pending = finance
    .filter((f) => f.status === "Pending" || f.status === "Overdue")
    .reduce((s, f) => s + f.amount, 0);

  const cats = finance.reduce<Record<string, { income: number; expense: number }>>((acc, f) => {
    acc[f.category] ||= { income: 0, expense: 0 };
    if (f.type === "Income") acc[f.category].income += f.amount;
    else acc[f.category].expense += f.amount;
    return acc;
  }, {});
  const data = Object.entries(cats)
    .map(([name, v]) => ({ name, income: v.income / 100000, expense: v.expense / 100000 }))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Overview</CardTitle>
        <CardDescription>Category breakdown (₹ Lakhs)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 pb-4">
          <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
            <p className="text-[10px] font-semibold uppercase text-emerald-700">Income</p>
            <p className="font-num text-lg font-bold text-emerald-700">{formatCompactINR(income)}</p>
          </div>
          <div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-500/10">
            <p className="text-[10px] font-semibold uppercase text-rose-700">Expense</p>
            <p className="font-num text-lg font-bold text-rose-700">{formatCompactINR(expense)}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
            <p className="text-[10px] font-semibold uppercase text-amber-700">Pending</p>
            <p className="font-num text-lg font-bold text-amber-700">{formatCompactINR(pending)}</p>
          </div>
        </div>

        <div className="h-48 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#fb7185" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}