"use client";

import {
  Area,
  AreaChart,
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
import { formatCompactINR } from "@/lib/utils";

const data = [
  { month: "Jan", income: 1800000, expense: 850000 },
  { month: "Feb", income: 2400000, expense: 1200000 },
  { month: "Mar", income: 3100000, expense: 1850000 },
  { month: "Apr", income: 7100000, expense: 2425000 },
  { month: "May", income: 4200000, expense: 2100000 },
  { month: "Jun", income: 5800000, expense: 2600000 },
];

export function RevenueChart() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Income vs expense trend</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
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

              <Area
                type="monotone"
                dataKey="income"
                stroke="#4f46e5"
                fill="url(#income)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f43f5e"
                fill="url(#expense)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}