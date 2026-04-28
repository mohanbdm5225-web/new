"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

interface NhaiProjectLayoutProps {
  children: ReactNode;
}

const sections = [
  { label: "Overview", href: "" },
  { label: "Packages", href: "packages" },
  { label: "Chainage", href: "chainage" },
  { label: "Daily Updates", href: "daily-updates" },
  { label: "Deliverables", href: "deliverables" },
  { label: "Settings", href: "settings" },
];

export default function NhaiProjectLayout({ children }: NhaiProjectLayoutProps) {
  const pathname = usePathname();
  const activeSection = pathname?.split("/").slice(-1)[0] || "";
  const params = useParams();
  const projectId = Array.isArray(params?.projectId) ? params?.projectId[0] ?? "" : params?.projectId ?? "";
  const projectLabel = projectId.replace(/-/g, " ");

  return (
    <div className="space-y-6 py-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">NHAI Project</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">{projectLabel}</h2>
            <p className="mt-2 text-sm text-slate-600">Project workspace with quick access to NHAI packages, chainage, updates, deliverables and settings.</p>
          </div>
          <Link
            href="/projects/nhai"
            className="text-sm font-semibold text-sky-600 transition hover:text-sky-500"
          >
            Back to NHAI projects
          </Link>
        </div>

        <nav className="mt-6 flex flex-wrap gap-2">
          {sections.map((section) => {
            const href = section.href
              ? `/projects/nhai/${projectId}/${section.href}`
              : `/projects/nhai/${projectId}`;
            const isActive =
              section.href === ""
                ? activeSection === projectId
                : activeSection === section.href;
            return (
              <Link
                key={section.label}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
