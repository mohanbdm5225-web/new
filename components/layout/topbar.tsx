"use client";

import { Bell, Command, Menu, Search, Sun, Moon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function Topbar({
  onOpenCmd,
  onToggleMobile,
}: {
  onOpenCmd: () => void;
  onToggleMobile: () => void;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:bg-slate-950/80 dark:border-slate-800">
      <button
        onClick={onToggleMobile}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onOpenCmd}
        className="flex flex-1 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-500 hover:border-slate-300 hover:bg-white sm:max-w-md dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search projects, tasks, tenders…
        </span>
        <span className="hidden items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-500 sm:inline-flex dark:bg-slate-800 dark:border-slate-700">
          <Command className="h-3 w-3" /> K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" variant="outline" className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" /> New
        </Button>

        <button
          onClick={toggleDark}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        <div className="ml-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">
            MR
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">
              Mohan Raj
            </p>
            <p className="text-[10px] leading-tight text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}