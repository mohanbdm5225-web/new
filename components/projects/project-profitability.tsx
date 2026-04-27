"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Download,
  IndianRupee,
  Plus,
  Printer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Project } from "@/lib/types";
import { formatINR } from "@/lib/utils";

type ProjectCostCategory =
  | "Field Team"
  | "Drone Rental"
  | "DGPS Survey"
  | "Travel"
  | "Food & Accommodation"
  | "Data Processing"
  | "Software"
  | "Equipment Maintenance"
  | "Miscellaneous";

type ProjectCostItem = {
  id: string;
  projectId: string;
  category: ProjectCostCategory;
  description: string;
  amount: number;
  date: string;
};

type CostCategoryRow = {
  category: string;
  amount: number;
  percentage: number;
};

const STORAGE_KEY = "geo_project_costs";

const costCategories: ProjectCostCategory[] = [
  "Field Team",
  "Drone Rental",
  "DGPS Survey",
  "Travel",
  "Food & Accommodation",
  "Data Processing",
  "Software",
  "Equipment Maintenance",
  "Miscellaneous",
];

const defaultProjectCosts: ProjectCostItem[] = [
  {
    id: "pc1",
    projectId: "p1",
    category: "Field Team",
    description: "Survey team wages for CMRL corridor work",
    amount: 450000,
    date: "2026-04-10",
  },
  {
    id: "pc2",
    projectId: "p1",
    category: "DGPS Survey",
    description: "DGPS observation and control point establishment",
    amount: 320000,
    date: "2026-04-12",
  },
  {
    id: "pc3",
    projectId: "p1",
    category: "Travel",
    description: "Vehicle, fuel and local travel expenses",
    amount: 180000,
    date: "2026-04-15",
  },
  {
    id: "pc4",
    projectId: "p2",
    category: "Drone Rental",
    description: "LiDAR drone rental for NH-544 mapping",
    amount: 850000,
    date: "2026-04-08",
  },
  {
    id: "pc5",
    projectId: "p2",
    category: "Data Processing",
    description: "Point cloud classification and QA/QC",
    amount: 620000,
    date: "2026-04-18",
  },
  {
    id: "pc6",
    projectId: "p3",
    category: "Equipment Maintenance",
    description: "Bathymetry equipment calibration and service",
    amount: 210000,
    date: "2026-04-11",
  },
  {
    id: "pc7",
    projectId: "p3",
    category: "Food & Accommodation",
    description: "Marine survey team stay and food",
    amount: 160000,
    date: "2026-04-14",
  },
  {
    id: "pc8",
    projectId: "p4",
    category: "Data Processing",
    description: "GIS database creation and CAD digitization",
    amount: 540000,
    date: "2026-04-16",
  },
  {
    id: "pc9",
    projectId: "p5",
    category: "Drone Rental",
    description: "Drone survey and orthomosaic processing cost",
    amount: 280000,
    date: "2026-04-19",
  },
];

export function ProjectProfitability({ project }: { project: Project }) {
  const [allCosts, setAllCosts] = useState<ProjectCostItem[]>([]);
  const [category, setCategory] = useState<ProjectCostCategory>("Field Team");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultProjectCosts)
      );
      setAllCosts(defaultProjectCosts);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as ProjectCostItem[];
      setAllCosts(parsed);
    } catch {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultProjectCosts)
      );
      setAllCosts(defaultProjectCosts);
    }
  }, []);

  const costs = useMemo(() => {
    return allCosts.filter((item) => item.projectId === project.id);
  }, [allCosts, project.id]);

  const totalCost = costs.reduce((sum, item) => sum + item.amount, 0);
  const estimatedRevenue = project.budget;
  const grossProfit = estimatedRevenue - totalCost;

  const margin =
    estimatedRevenue > 0
      ? Math.round((grossProfit / estimatedRevenue) * 100)
      : 0;

  const costUtilization =
    estimatedRevenue > 0
      ? Math.round((totalCost / estimatedRevenue) * 100)
      : 0;

  const categoryRows: CostCategoryRow[] = useMemo(() => {
    const categoryTotals = costs.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([categoryName, categoryAmount]) => ({
      category: categoryName,
      amount: categoryAmount,
      percentage:
        totalCost > 0 ? Math.round((categoryAmount / totalCost) * 100) : 0,
    }));
  }, [costs, totalCost]);

  function updateStorage(nextCosts: ProjectCostItem[]) {
    setAllCosts(nextCosts);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCosts));
  }

  function handleAddCost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!description.trim() || !date || numericAmount <= 0) {
      return;
    }

    const newCost: ProjectCostItem = {
      id: crypto.randomUUID(),
      projectId: project.id,
      category,
      description,
      amount: numericAmount,
      date,
    };

    updateStorage([newCost, ...allCosts]);

    setDescription("");
    setAmount("");
    setDate("");
    setCategory("Field Team");
  }

  function handleDeleteCost(id: string) {
    const nextCosts = allCosts.filter((item) => item.id !== id);
    updateStorage(nextCosts);
  }

  function handleExportCsv() {
    const headers = [
      "Project Code",
      "Project Name",
      "Category",
      "Description",
      "Date",
      "Amount",
    ];

    const rows = costs.map((item) => [
      project.code,
      project.name,
      item.category,
      item.description,
      item.date,
      item.amount.toString(),
    ]);

    const summaryRows = [
      [],
      ["Summary"],
      ["Estimated Revenue", estimatedRevenue.toString()],
      ["Actual Cost", totalCost.toString()],
      ["Gross Profit", grossProfit.toString()],
      ["Profit Margin", `${margin}%`],
    ];

    const csv = [headers, ...rows, ...summaryRows]
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${project.code}-cost-profit-report.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function handlePrintReport() {
    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    const rowsHtml = costs
      .map(
        (item) => `
        <tr>
          <td>${item.category}</td>
          <td>${item.description}</td>
          <td>${item.date}</td>
          <td style="text-align:right;">${formatINR(item.amount)}</td>
        </tr>
      `
      )
      .join("");

    const categoryHtml = categoryRows
      .map(
        (item) => `
        <tr>
          <td>${item.category}</td>
          <td style="text-align:right;">${formatINR(item.amount)}</td>
          <td style="text-align:right;">${item.percentage}%</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${project.code} Cost Profit Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #0f172a;
            }
            h1 {
              margin: 0;
              font-size: 24px;
            }
            h2 {
              margin-top: 28px;
              font-size: 18px;
            }
            p {
              margin: 4px 0;
              color: #475569;
              font-size: 13px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 14px;
              font-size: 13px;
            }
            th {
              text-align: left;
              background: #f1f5f9;
              color: #334155;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 10px;
              vertical-align: top;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-top: 20px;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 14px;
              background: #f8fafc;
            }
            .label {
              font-size: 12px;
              color: #64748b;
            }
            .value {
              margin-top: 6px;
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
            }
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="margin-bottom:20px;padding:10px 16px;border:0;background:#4f46e5;color:white;border-radius:8px;cursor:pointer;">
            Print Report
          </button>

          <h1>Project Cost vs Profit Report</h1>
          <p><strong>Project:</strong> ${project.name}</p>
          <p><strong>Code:</strong> ${project.code}</p>
          <p><strong>Client:</strong> ${project.client}</p>
          <p><strong>Location:</strong> ${project.location}</p>

          <div class="summary">
            <div class="card">
              <div class="label">Estimated Revenue</div>
              <div class="value">${formatINR(estimatedRevenue)}</div>
            </div>
            <div class="card">
              <div class="label">Actual Cost</div>
              <div class="value">${formatINR(totalCost)}</div>
            </div>
            <div class="card">
              <div class="label">Gross Profit</div>
              <div class="value">${formatINR(grossProfit)}</div>
            </div>
            <div class="card">
              <div class="label">Profit Margin</div>
              <div class="value">${margin}%</div>
            </div>
          </div>

          <h2>Category Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align:right;">Amount</th>
                <th style="text-align:right;">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${
                categoryHtml ||
                `<tr><td colspan="3" style="text-align:center;">No category data</td></tr>`
              }
            </tbody>
          </table>

          <h2>Cost Entries</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                `<tr><td colspan="4" style="text-align:center;">No cost entries</td></tr>`
              }
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Project Cost vs Profit Tracking
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track project expenses, margin, cost utilization and export reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePrintReport}>
            <Printer className="h-4 w-4" />
            Print Report
          </Button>

          <Button onClick={handleExportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProfitCard
          title="Estimated Revenue"
          value={formatINR(estimatedRevenue)}
          icon={IndianRupee}
          tone="indigo"
        />

        <ProfitCard
          title="Actual Cost"
          value={formatINR(totalCost)}
          icon={Wallet}
          tone="rose"
        />

        <ProfitCard
          title="Gross Profit"
          value={formatINR(grossProfit)}
          icon={grossProfit >= 0 ? TrendingUp : TrendingDown}
          tone={grossProfit >= 0 ? "emerald" : "rose"}
        />

        <ProfitCard
          title="Profit Margin"
          value={`${margin}%`}
          icon={margin >= 25 ? TrendingUp : AlertTriangle}
          tone={margin >= 25 ? "emerald" : margin >= 10 ? "amber" : "rose"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft xl:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">
            Add Project Cost
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Added costs are saved in browser local storage and remain after
            refresh.
          </p>

          <form
            onSubmit={handleAddCost}
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Cost Category
              </span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ProjectCostCategory)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {costCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Cost Date
              </span>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </span>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Example: Field team travel and fuel expenses"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount
              </span>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Example: 25000"
                required
              />
            </label>

            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4" />
                Add Cost
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-base font-semibold text-slate-900">
            Profit Health
          </h2>

          <div className="mt-5">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-500">Cost Utilization</span>

              <span className="font-num font-bold text-slate-900">
                {costUtilization}%
              </span>
            </div>

            <ProgressBar
              value={costUtilization}
              color={
                costUtilization <= 60
                  ? "bg-emerald-500"
                  : costUtilization <= 80
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }
            />
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              Project Status
            </p>

            <div className="mt-2">
              {margin >= 25 && <StatusBadge status="Healthy Profit" />}

              {margin < 25 && margin >= 10 && (
                <StatusBadge status="Moderate Profit" />
              )}

              {margin < 10 && <StatusBadge status="Low Profit Risk" />}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {margin >= 25
                ? "This project has a good margin. Continue monitoring field and processing costs."
                : margin >= 10
                ? "This project has moderate margin. Control additional expenses carefully."
                : "This project has low margin. Review pricing, pending billing and avoid extra cost leakage."}
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-base font-semibold text-slate-900">
          Cost Breakdown
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Category-wise project cost tracking.
        </p>

        <div className="mt-5 space-y-4">
          {categoryRows.map((item) => (
            <div key={item.category}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">
                  {item.category}
                </span>

                <span className="font-num text-sm font-bold text-slate-900">
                  {formatINR(item.amount)}
                </span>
              </div>

              <ProgressBar value={item.percentage} />
            </div>
          ))}

          {categoryRows.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="text-sm font-semibold text-slate-900">
                No cost entries found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add costs for this project.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Cost Entries
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detailed expense entries for this project.
          </p>
        </div>

        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div className="col-span-3">Category</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {costs.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 items-center border-b border-slate-100 px-4 py-4 last:border-0"
          >
            <div className="col-span-3">
              <StatusBadge status={item.category} />
            </div>

            <div className="col-span-4">
              <p className="text-sm font-medium text-slate-900">
                {item.description}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-slate-500">{item.date}</p>
            </div>

            <div className="col-span-2 text-right">
              <p className="font-num text-sm font-bold text-rose-600">
                {formatINR(item.amount)}
              </p>
            </div>

            <div className="col-span-1 text-right">
              <button
                onClick={() => handleDeleteCost(item.id)}
                className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {costs.length === 0 && (
          <div className="p-10 text-center">
            <Wallet className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              No cost entries found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add your first project cost above.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ProfitCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  tone: "indigo" | "emerald" | "amber" | "rose";
}) {
  const toneClass: Record<"indigo" | "emerald" | "amber" | "rose", string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="font-num mt-3 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}