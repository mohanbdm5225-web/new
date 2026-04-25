"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { tenders } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCompactINR, formatDate } from "@/lib/utils";
import { FileSignature } from "lucide-react";
import Link from "next/link";

export function TenderTracker() {
  const activeTenders = tenders
    .filter((t) => t.status !== "Cancelled" && t.status !== "Lost")
    .slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-indigo-600" /> Tender Tracker
            </CardTitle>
            <CardDescription>Active bids & submissions</CardDescription>
          </div>
          <Link href="/tenders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            View all →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeTenders.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{t.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {t.client} · {t.referenceNumber}
                </p>
              </div>
              <StatusBadge status={t.status} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Opens {formatDate(t.openingDate)}</span>
              <span className="font-num font-semibold text-slate-900 dark:text-slate-100">
                {formatCompactINR(t.estimatedValue)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}