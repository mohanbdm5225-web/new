"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useProjects, useTasks, useTenders, useFinance } from "@/lib/use-store";
import { formatCompactINR } from "@/lib/utils";
import { FolderKanban, CheckCircle2, FileSignature, Wallet, Plus, Download } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatusDistribution } from "@/components/dashboard/status-distribution";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { DeadlineAlerts } from "@/components/dashboard/deadline-alerts";
import { TeamWorkload } from "@/components/dashboard/team-workload";
import { TenderTracker } from "@/components/dashboard/tender-tracker";
import { FinanceOverview } from "@/components/dashboard/finance-overview";
import Link from "next/link";

export default function DashboardPage() {
  const { items: projects } = useProjects();
  const { items: tasks } = useTasks();
  const { items: tenders } = useTenders();
  const { items: finance } = useFinance();

  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const completedTasks = tasks.filter((t) => t.status === "Done").length;
  const openTenders = tenders.filter((t) => t.status === "Submitted" || t.status === "Shortlisted").length;
  const netRevenue = finance.filter((f) => f.type === "Income" && f.status === "Paid").reduce((s, f) => s + f.amount, 0);

  return (
    <div>
      <PageHeader
        title="Good day, Mohan 👋"
        description="Here's a quick snapshot of your workspace — projects, field teams, tenders and finance."
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" /> Export
        </Button>
        <Link href="/projects">
          <Button size="sm">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </Link>
      </PageHeader>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Projects" value={activeProjects} delta={12} icon={FolderKanban} hint={`${projects.length} total in portfolio`} index={0} />
        <StatCard label="Tasks Completed" value={completedTasks} delta={8} icon={CheckCircle2} tone="emerald" hint={`of ${tasks.length} total`} index={1} />
        <StatCard label="Open Tenders" value={openTenders} delta={-4} icon={FileSignature} tone="amber" hint="Awaiting decisions" index={2} />
        <StatCard label="Net Revenue" value={formatCompactINR(netRevenue)} delta={18} icon={Wallet} tone="indigo" hint="Last 30 days" index={3} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><RevenueChart /></div>
        <StatusDistribution />
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DeadlineAlerts />
        <TenderTracker />
        <TeamWorkload />
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><FinanceOverview /></div>
        <ActivityTimeline />
      </section>
    </div>
  );
}