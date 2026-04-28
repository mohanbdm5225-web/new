import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

interface DeliverableItemPageProps {
  params: {
    projectId: string;
    itemId: string;
  };
}

const deliverableDetails = {
  owner: "Project Controls",
  dueDate: "2026-05-10",
  description: "Submit the complete survey report and quality assurance evidence for the package.",
  nextSteps: "Collect final field checks, compile approvals, and submit the final deliverable package.",
  approval: "Pending review by compliance team.",
  status: "Submitted",
};

export default function DeliverableItemPage({ params }: DeliverableItemPageProps) {
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title={`Deliverable ${params.itemId}`}
        description={`Approval and delivery details for ${projectId.replace(/-/g, " ")}.`}
      >
        <Link
          href={`/projects/nhai/${projectId}/deliverables`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to deliverables
        </Link>
      </PageHeader>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { label: "Owner", value: deliverableDetails.owner },
            { label: "Due date", value: deliverableDetails.dueDate },
            { label: "Status", value: deliverableDetails.status },
            { label: "Approval", value: deliverableDetails.approval },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4 rounded-3xl bg-slate-50 p-5">
          <div>
            <p className="text-sm font-medium text-slate-500">Description</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{deliverableDetails.description}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Next steps</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{deliverableDetails.nextSteps}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
            Upload approval
          </button>
          <button className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Add comment
          </button>
        </div>
      </section>
    </div>
  );
}
