"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  ClipboardList,
  CalendarDays,
  Users,
  Wrench,
  FileSignature,
  Wallet,
  ReceiptText,
  FileText,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/map", label: "Map View", icon: Map },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dsr", label: "DSR", icon: ClipboardList },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/resources", label: "Team", icon: Users },
  { href: "/equipment", label: "Equipment", icon: Wrench },
  { href: "/tenders", label: "Tenders", icon: FileSignature },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200 lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-slate-200 px-4 py-5 dark:border-slate-800",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm">
          <Compass className="h-5 w-5" />
        </div>

        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              GeoSurvey
            </p>
            <p className="text-xs text-slate-500">Project Management</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0",
                  active ? "text-indigo-600 dark:text-indigo-300" : ""
                )}
                strokeWidth={2.1}
              />

              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}