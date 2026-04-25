"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { activity, getMemberById } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";
import {
  FileText,
  FolderKanban,
  CheckCircle2,
  FileSignature,
  Wallet,
  Users,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  project: FolderKanban,
  task: CheckCircle2,
  tender: FileSignature,
  document: FileText,
  finance: Wallet,
  team: Users,
};

export function ActivityTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across workspace</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="relative space-y-4 border-l border-slate-200 pl-5 dark:border-slate-800">
          {activity.map((a) => {
            const Icon = iconMap[a.type] || FileText;
            const user = getMemberById(a.userId);
            return (
              <li key={a.id} className="relative">
                <span className="absolute -left-[26px] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 dark:bg-slate-900 dark:border-slate-700">
                  <Icon className="h-3 w-3" />
                </span>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{a.title}</p>
                <p className="text-xs text-slate-500">{a.description}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {user?.name || "System"} · {timeAgo(a.timestamp)}
                </p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}