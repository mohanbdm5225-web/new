"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { finance } from "@/lib/mock-data";
import { formatCompactINR } from "@/lib/utils";

const data = [
  { category: "Income", amount: finance.filter((f) => f.type === "Income").reduce((s, f) => s + f.amount, 0) },
  { category: "Expense", amount: finance.filter((f) => f.type === "Expense").reduce((s, f) => s + f.amount, 0) },
  { category: "Pending", amount: finance.filter((f) => f.status === "Pending").reduce((s, f) => s + f.amount, 0) },
  { category: "Overdue", amount: finance.filter((f) => f.status === "Overdue").reduce((s, f) => s + f.amount, 0) },
];

export function FinanceOverview() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Finance Overview</CardTitle>
        <CardDescription>Income, expense and collection summary</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCompactINR(Number(value))}
              />
              <Tooltip
                formatter={(value) => formatCompactINR(Number(value))}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="amount" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}