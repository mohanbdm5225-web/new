"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { projects, tasks, tenders } from "@/lib/mock-data";

type Item = {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: "Projects" | "Tasks" | "Tenders" | "Pages";
};

const pages: Item[] = [
  { id: "p-dash", label: "Dashboard", hint: "Main overview", href: "/dashboard", group: "Pages" },
  { id: "p-proj", label: "Projects", hint: "All projects", href: "/projects", group: "Pages" },
  { id: "p-map", label: "Map", hint: "Geographic project view", href: "/map", group: "Pages" },
  { id: "p-task", label: "Tasks", hint: "Kanban board", href: "/tasks", group: "Pages" },
  { id: "p-team", label: "Team", hint: "Members & workload", href: "/resources", group: "Pages" },
  { id: "p-eq", label: "Equipment", hint: "Inventory", href: "/equipment", group: "Pages" },
  { id: "p-tn", label: "Tenders", hint: "Bid tracker", href: "/tenders", group: "Pages" },
  { id: "p-fin", label: "Finance", hint: "Income & expense", href: "/finance", group: "Pages" },
  { id: "p-doc", label: "Documents", hint: "Files & reports", href: "/documents", group: "Pages" },
  { id: "p-set", label: "Settings", hint: "Workspace config", href: "/settings", group: "Pages" },
];

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const items = useMemo<Item[]>(() => {
    const p = projects.map((x) => ({
      id: `pr-${x.id}`,
      label: x.name,
      hint: `${x.client} • ${x.type}`,
      href: `/projects/${x.id}`,
      group: "Projects" as const,
    }));
    const t = tasks.map((x) => ({
      id: `tk-${x.id}`,
      label: x.title,
      hint: `Task • ${x.status}`,
      href: `/tasks`,
      group: "Tasks" as const,
    }));
    const tn = tenders.map((x) => ({
      id: `tn-${x.id}`,
      label: x.title,
      hint: `Tender • ${x.client}`,
      href: `/tenders`,
      group: "Tenders" as const,
    }));
    return [...pages, ...p, ...t, ...tn];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 14);
    return items
      .filter(
        (i) =>
          i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [query, items]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const groups = useMemo(() => {
    const g: Record<string, Item[]> = {};
    results.forEach((r) => {
      (g[r.group] ||= []).push(r);
    });
    return g;
  }, [results]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 top-[15%] z-50 w-[92%] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.10)] dark:bg-slate-950 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anything…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results[0]) {
                    router.push(results[0].href);
                    onClose();
                  }
                }}
              />
              <kbd className="hidden rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 sm:inline-block">
                ESC
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {Object.keys(groups).length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-slate-500">
                  No matches for &ldquo;{query}&rdquo;.
                </p>
              )}
              {Object.entries(groups).map(([name, items]) => (
                <div key={name} className="mb-2">
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {name}
                  </p>
                  <div>
                    {items.map((i) => (
                      <Link
                        key={i.id}
                        href={i.href}
                        onClick={onClose}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {i.label}
                          </p>
                          <p className="text-xs text-slate-500">{i.hint}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}