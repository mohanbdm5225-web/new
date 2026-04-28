import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";

interface PackagePageProps {
  params: {
    projectId: string;
    packageId: string;
  };
}

const packageDetails = {
  description:
    "Package activities include survey coordination, task tracking, and reporting for the selected package.",
  schedule: "Mar 2026 – Aug 2026",
  budget: "₹12.5 Cr",
  manager: "AV Engineer Team",
  tasksCompleted: 18,
  tasksTotal: 24,
  risk: "Medium",
};

const packageTasks = [
  { title: "Survey data collection", status: "Done" },
  { title: "Bridge clearance inspection", status: "In Progress" },
  { title: "Utility coordination", status: "Pending" },
  { title: "Report consolidation", status: "Pending" },
];

export default function ProjectPackagePage({ params }: PackagePageProps) {
  const packageLabel = params.packageId.toUpperCase();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;

  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title={`Package ${packageLabel}`}
        description="Detailed package view with schedule, budget, task progress and action links."
      >
        <Link
          href={`/projects/nhai/${projectId}/packages`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to packages
        </Link>
      </PageHeader>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-slate-500">Description</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{packageDetails.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Schedule", value: packageDetails.schedule },
                { label: "Budget", value: packageDetails.budget },
                { label: "Package manager", value: packageDetails.manager },
                { label: "Risk level", value: packageDetails.risk },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Package progress</p>
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-3xl font-semibold text-slate-900">
                {Math.round((packageDetails.tasksCompleted / packageDetails.tasksTotal) * 100)}%
              </p>
              <p className="text-sm text-slate-500">{packageDetails.tasksCompleted}/{packageDetails.tasksTotal} tasks</p>
            </div>
            <div className="mt-4">
              <ProgressBar
                value={(packageDetails.tasksCompleted / packageDetails.tasksTotal) * 100}
                height="h-3"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-slate-900">Task board</h3>
        <div className="mt-5 space-y-4">
          {packageTasks.map((task) => (
            <div key={task.title} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{task.title}</p>
                <p className="text-sm text-slate-500">Status: {task.status}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  task.status === "Done"
                    ? "bg-emerald-100 text-emerald-700"
                    : task.status === "In Progress"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
