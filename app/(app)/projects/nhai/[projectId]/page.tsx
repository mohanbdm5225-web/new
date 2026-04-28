import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ProgressBar } from "@/components/shared/progress-bar";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const project = {
  code: "NHAI-2026",
  client: "NHAI Authority",
  location: "Western Expressway Corridor",
  phase: "Detailed Survey",
  completion: "Dec 2026",
  progress: 68,
  health: 74,
  packages: 5,
  deliverablesDue: 3,
  chainageSegments: 12,
  openIssues: 2,
  nextInspection: "2026-05-04",
};

const milestones = [
  { title: "Survey kickoff", date: "2026-03-15", status: "Completed" },
  { title: "Chainage validation", date: "2026-04-20", status: "Completed" },
  { title: "Bridge clearance review", date: "2026-05-03", status: "Pending" },
  { title: "Final QA report", date: "2026-06-18", status: "Pending" },
];

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const projectLabel = projectId.replace(/-/g, " ");

  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title={projectLabel}
        description="Overview of the selected NHAI project, with quick status, milestones and action shortcuts."
      >
        <Link
          href={`/projects/nhai/${projectId}/daily-updates/new`}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          New update
        </Link>
      </PageHeader>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Project code</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{project.code}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Client</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{project.client}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Current phase</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{project.phase}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Location</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{project.location}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Next inspection</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{project.nextInspection}</p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Progress</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{project.progress}%</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                Project health {project.health}%
              </span>
            </div>
            <ProgressBar value={project.progress} height="h-3" color="bg-slate-900" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">Current status</h3>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Active packages</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{project.packages}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Deliverables due</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{project.deliverablesDue}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Chainage segments</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{project.chainageSegments}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-slate-900">Project alerts</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>• 2 deliverables due within 7 days.</p>
              <p>• 1 chainage segment requires secondary review.</p>
              <p>• Next inspection scheduled for May 4, 2026.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">Milestones</h3>
          <div className="mt-5 space-y-4">
            {milestones.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.date}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">Map preview</h3>
          <div className="mt-5 h-72 rounded-3xl bg-slate-200" />
          <p className="mt-4 text-sm text-slate-500">A map view with chainage segments, inspection points, and path status would appear here.</p>
        </div>
      </section>
    </div>
  );
}
