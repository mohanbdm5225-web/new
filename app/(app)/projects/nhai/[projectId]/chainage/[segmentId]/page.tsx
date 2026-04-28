import Link from "next/link";
import { ProgressBar } from "@/components/shared/progress-bar";

interface SegmentPageProps {
  params: {
    projectId: string;
    segmentId: string;
  };
}

const segmentDetails = {
  terrain: "Hilly corridor with two major bridges",
  surveyStatus: "Completed",
  laneCount: "4 lanes",
  progress: 78,
  lastInspection: "2026-04-24",
  nextAction: "Review soil reports and confirm bridge clearances.",
  issues: "Minor drainage obstruction detected near chainage 102.5 km.",
};

export default function ChainageSegmentPage({ params }: SegmentPageProps) {
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;

  return (
    <div className="space-y-8 py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Chainage segment</p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900">{params.segmentId.toUpperCase()}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Detailed status and next steps for this chainage segment.
            </p>
          </div>
          <Link
            href={`/projects/nhai/${projectId}/chainage`}
            className="text-sm font-semibold text-sky-600 transition hover:text-sky-500"
          >
            Back to chainage overview
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Terrain", value: segmentDetails.terrain },
              { label: "Survey status", value: segmentDetails.surveyStatus },
              { label: "Lane count", value: segmentDetails.laneCount },
              { label: "Last inspection", value: segmentDetails.lastInspection },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Completion</p>
            <div className="mt-4">
              <ProgressBar value={segmentDetails.progress} height="h-3" color="bg-slate-900" />
            </div>
            <p className="mt-3 text-sm text-slate-600">{segmentDetails.progress}% complete</p>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-soft">
          <div>
            <p className="text-sm font-medium text-slate-500">Next action</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{segmentDetails.nextAction}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Open issue</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{segmentDetails.issues}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
