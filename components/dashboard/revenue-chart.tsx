"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Nov", income: 48, expense: 32 },
  { month: "Dec", income: 52, expense: 38 },
  { month: "Jan", income: 61, expense: 41 },
  { month: "Feb", income: 58, expense: 44 },
  { month: "Mar", income: 72, expense: 49 },
  { month: "Apr", income: 88, expense: 52 },
];

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Revenue vs Expense</CardTitle>
            <CardDescription>Last 6 months (₹ Lakhs)</CardDescription>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-indigo-500" /> Income
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> Expense
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="gInc" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={2.4} fill="url(#gInc)" />
              <Area type="monotone" dataKey="expense" stroke="#fb7185" strokeWidth={2.4} fill="url(#gExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}