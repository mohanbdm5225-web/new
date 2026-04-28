import type { ReactNode } from "react";
import Link from "next/link";

export default function NhaiLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8 py-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Projects / NHAI
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              NHAI Project Workspace
            </h1>
          </div>
          <Link
            href="/projects/nhai"
            className="inline-flex rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            Browse NHAI Projects
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
