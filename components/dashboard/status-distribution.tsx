"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projects } from "@/lib/mock-data";

const COLORS: Record<string, string> = {
  Active: "#4f46e5",
  Completed: "#10b981",
  Planning: "#f59e0b",
  "On Hold": "#64748b",
  Cancelled: "#ef4444",
};

export function StatusDistribution() {
  const data = Object.entries(
    projects.reduce<Record<string, number>>((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
        <CardDescription>Distribution by current status</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-full min-w-0" style={{ width: "100%", height: 320, minWidth: 0, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={72}
                outerRadius={105}
                paddingAngle={4}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || "#94a3b8"}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[item.name] || "#94a3b8" }}
                />
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>

              <span className="font-num text-sm font-bold text-slate-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}