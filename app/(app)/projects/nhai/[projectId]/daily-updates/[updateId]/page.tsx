import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

interface DailyUpdateDetailsPageProps {
  params: {
    projectId: string;
    updateId: string;
  };
}

const updateDetails = {
  date: "2026-04-24",
  author: "Field Engineer",
  summary:
    "Bridge clearance inspection completed and recorded. Remaining tasks include utility coordination and soil sampling.",
  issues: "Minor clearing delay due to rain in the early morning.",
  actions: "Submit clearance evidence, coordinate utility team, and schedule follow-up survey.",
  attachments: ["bridge-inspection.pdf", "photo-001.jpg"],
};

export default function DailyUpdateDetailsPage({ params }: DailyUpdateDetailsPageProps) {
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title={`Daily update ${params.updateId}`}
        description={`Detailed record for ${projectId.replace(/-/g, " ")}.`}
      >
        <Link
          href={`/projects/nhai/${projectId}/daily-updates`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to updates
        </Link>
      </PageHeader>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Date</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{updateDetails.date}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Author</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{updateDetails.author}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Attachments</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{updateDetails.attachments.length}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 rounded-3xl bg-slate-50 p-5">
          <div>
            <p className="text-sm font-medium text-slate-500">Summary</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{updateDetails.summary}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Issues</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{updateDetails.issues}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Action items</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{updateDetails.actions}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-100 p-5">
          <p className="text-sm font-medium text-slate-500">Attachments</p>
          <div className="mt-3 grid gap-2">
            {updateDetails.attachments.map((file) => (
              <div key={file} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                {file}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
