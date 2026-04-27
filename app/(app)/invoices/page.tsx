"use client";

import * as XLSX from "xlsx";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Plus,
  Search,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projects } from "@/lib/mock-data";
import {
  addInvoice,
  deleteInvoice,
  getInvoices,
  InvoiceItem,
  InvoiceStatus,
  saveInvoices,
  updateInvoicePayment,
} from "@/lib/invoice-store";
import { daysUntil, formatDate, formatINR } from "@/lib/utils";

const invoiceStatuses: InvoiceStatus[] = [
  "Draft",
  "Raised",
  "Submitted",
  "Approved",
  "Partially Paid",
  "Paid",
  "Overdue",
];

type ExcelInvoiceRow = {
  "Invoice Number"?: string;
  "Project Name"?: string;
  Client?: string;
  Milestone?: string;
  "Invoice Date"?: string | number;
  "Due Date"?: string | number;
  "Invoice Amount"?: string | number;
  "Paid Amount"?: string | number;
  Status?: string;
  Remarks?: string;
};

export default function InvoicesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [importMessage, setImportMessage] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("INV-2026-004");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [milestone, setMilestone] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>("Raised");
  const [remarks, setRemarks] = useState("");

  function loadInvoices() {
    setInvoices(getInvoices());
  }

  useEffect(() => {
    loadInvoices();
    window.addEventListener("invoice-updated", loadInvoices);

    return () => {
      window.removeEventListener("invoice-updated", loadInvoices);
    };
  }, []);

  const totalInvoiceValue = invoices.reduce(
    (sum, invoice) => sum + invoice.invoiceAmount,
    0
  );

  const totalReceived = invoices.reduce(
    (sum, invoice) => sum + invoice.paidAmount,
    0
  );

  const totalPending = totalInvoiceValue - totalReceived;

  const overdueCount = invoices.filter(
    (invoice) => daysUntil(invoice.dueDate) < 0 && invoice.status !== "Paid"
  ).length;

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = `${invoice.invoiceNumber} ${invoice.projectName} ${invoice.client} ${invoice.milestone} ${invoice.status} ${invoice.remarks}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = status === "All" || invoice.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, status]);

  function normalizeDate(value: string | number | undefined): string {
    if (!value) return "";

    if (typeof value === "number") {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (!parsed) return "";
      const year = parsed.y;
      const month = String(parsed.m).padStart(2, "0");
      const day = String(parsed.d).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text;
    }

    const parsedDate = new Date(text);
    if (!Number.isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const day = String(parsedDate.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return "";
  }

  function normalizeStatus(value: string | undefined): InvoiceStatus {
    const cleanValue = String(value || "Raised").trim();

    const matched = invoiceStatuses.find(
      (item) => item.toLowerCase() === cleanValue.toLowerCase()
    );

    return matched ?? "Raised";
  }

  function handleCreateInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedProject = projects.find((project) => project.id === projectId);

    if (!selectedProject) return;

    const amount = Number(invoiceAmount);
    const paid = Number(paidAmount || 0);

    const newInvoice: InvoiceItem = {
      id: crypto.randomUUID(),
      invoiceNumber,
      projectId,
      projectName: selectedProject.name,
      client: selectedProject.client,
      milestone,
      invoiceDate,
      dueDate,
      invoiceAmount: amount,
      paidAmount: paid,
      status: invoiceStatus,
      remarks,
      createdAt: new Date().toISOString(),
    };

    addInvoice(newInvoice);

    setInvoiceNumber("");
    setMilestone("");
    setInvoiceDate("");
    setDueDate("");
    setInvoiceAmount("");
    setPaidAmount("");
    setInvoiceStatus("Raised");
    setRemarks("");
  }

  function handleUpdatePayment(invoice: InvoiceItem, newPaidAmount: number) {
    let nextStatus: InvoiceStatus = invoice.status;

    if (newPaidAmount <= 0) {
      nextStatus = "Submitted";
    } else if (newPaidAmount >= invoice.invoiceAmount) {
      nextStatus = "Paid";
    } else {
      nextStatus = "Partially Paid";
    }

    updateInvoicePayment(invoice.id, newPaidAmount, nextStatus);
  }

  function handleExportCsv() {
    const headers = [
      "Invoice Number",
      "Project",
      "Client",
      "Milestone",
      "Invoice Date",
      "Due Date",
      "Invoice Amount",
      "Paid Amount",
      "Pending Amount",
      "Status",
      "Remarks",
    ];

    const rows = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.projectName,
      invoice.client,
      invoice.milestone,
      invoice.invoiceDate,
      invoice.dueDate,
      invoice.invoiceAmount.toString(),
      invoice.paidAmount.toString(),
      (invoice.invoiceAmount - invoice.paidAmount).toString(),
      invoice.status,
      invoice.remarks,
    ]);

    const csv = [headers, ...rows]
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
    link.download = "invoice-payment-tracker.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function handleDownloadExcelTemplate() {
    const templateRows = [
      {
        "Invoice Number": "INV-2026-005",
        "Project Name": "Chennai Metro Phase-III Corridor Survey",
        Client: "CMRL",
        Milestone: "Milestone 2 - Topographic Survey",
        "Invoice Date": "2026-04-25",
        "Due Date": "2026-05-25",
        "Invoice Amount": 1500000,
        "Paid Amount": 0,
        Status: "Submitted",
        Remarks: "Submitted to client for approval",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, "invoice-import-template.xlsx");
  }

  async function handleExcelImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json<ExcelInvoiceRow>(worksheet, {
        defval: "",
      });

      const importedInvoices: InvoiceItem[] = rows
        .map((row) => {
          const projectName = String(row["Project Name"] || "").trim();
          const matchedProject = projects.find(
            (project) =>
              project.name.toLowerCase() === projectName.toLowerCase()
          );

          const invoiceAmountNumber = Number(row["Invoice Amount"] || 0);
          const paidAmountNumber = Number(row["Paid Amount"] || 0);

          return {
            id: crypto.randomUUID(),
            invoiceNumber: String(row["Invoice Number"] || "").trim(),
            projectId: matchedProject?.id ?? "manual-excel-project",
            projectName: projectName || "Excel Imported Project",
            client: String(row.Client || matchedProject?.client || "").trim(),
            milestone: String(row.Milestone || "").trim(),
            invoiceDate: normalizeDate(row["Invoice Date"]),
            dueDate: normalizeDate(row["Due Date"]),
            invoiceAmount: invoiceAmountNumber,
            paidAmount: paidAmountNumber,
            status: normalizeStatus(row.Status),
            remarks: String(row.Remarks || "").trim(),
            createdAt: new Date().toISOString(),
          };
        })
        .filter((invoice) => {
          return (
            invoice.invoiceNumber &&
            invoice.projectName &&
            invoice.invoiceAmount > 0
          );
        });

      if (importedInvoices.length === 0) {
        setImportMessage(
          "No valid invoice rows found. Please check the Excel column names."
        );
        return;
      }

      const currentInvoices = getInvoices();
      const nextInvoices = [...importedInvoices, ...currentInvoices];

      saveInvoices(nextInvoices);
      setImportMessage(`${importedInvoices.length} invoice(s) imported successfully.`);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setImportMessage("Excel import failed. Please check file format and columns.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Invoice & Payment Tracking"
        description="Track project invoices, payment received, pending amount, due dates and overdue collections."
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelImport}
          className="hidden"
        />

        <Button variant="outline" onClick={handleDownloadExcelTemplate}>
          <FileSpreadsheet className="h-4 w-4" />
          Template
        </Button>

        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Import Excel
        </Button>

        <Button variant="outline" onClick={handleExportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>

        <Button>
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </PageHeader>

      {importMessage && (
        <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold text-indigo-700">
          {importMessage}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Invoice Value"
          value={formatINR(totalInvoiceValue)}
          icon={FileText}
          tone="indigo"
          hint="Total invoices raised"
          index={0}
        />

        <StatCard
          label="Received"
          value={formatINR(totalReceived)}
          icon={CheckCircle2}
          tone="emerald"
          hint="Payment received"
          index={1}
        />

        <StatCard
          label="Pending"
          value={formatINR(totalPending)}
          icon={Wallet}
          tone="amber"
          hint="Balance collection"
          index={2}
        />

        <StatCard
          label="Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          tone="rose"
          hint="Invoices past due"
          index={3}
        />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <form
          onSubmit={handleCreateInvoice}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft xl:col-span-1"
        >
          <h2 className="text-base font-semibold text-slate-900">
            Create Invoice
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add project billing and payment details.
          </p>

          <div className="mt-5 space-y-4">
            <Field label="Invoice Number">
              <Input
                value={invoiceNumber}
                onChange={(event) => setInvoiceNumber(event.target.value)}
                placeholder="INV-2026-004"
                required
              />
            </Field>

            <Field label="Project">
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} — {project.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Milestone / Billing Stage">
              <Input
                value={milestone}
                onChange={(event) => setMilestone(event.target.value)}
                placeholder="Example: Milestone 1 / Final Bill"
                required
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Invoice Date">
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(event) => setInvoiceDate(event.target.value)}
                  required
                />
              </Field>

              <Field label="Due Date">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Invoice Amount">
                <Input
                  type="number"
                  min="1"
                  value={invoiceAmount}
                  onChange={(event) => setInvoiceAmount(event.target.value)}
                  placeholder="Example: 1200000"
                  required
                />
              </Field>

              <Field label="Paid Amount">
                <Input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(event) => setPaidAmount(event.target.value)}
                  placeholder="Example: 300000"
                />
              </Field>
            </div>

            <Field label="Status">
              <select
                value={invoiceStatus}
                onChange={(event) =>
                  setInvoiceStatus(event.target.value as InvoiceStatus)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {invoiceStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Remarks">
              <textarea
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Payment status, approval notes, client follow-up..."
                className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </Field>

            <Button type="submit" className="w-full">
              <IndianRupee className="h-4 w-4" />
              Save Invoice
            </Button>
          </div>
        </form>

        <div className="xl:col-span-2">
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:w-96">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search invoice, project, client..."
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {["All", ...invoiceStatuses].map((item) => (
                  <button
                    key={item}
                    onClick={() => setStatus(item)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      status === item
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div className="col-span-3">Invoice</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Payment</div>
              <div className="col-span-2">Due</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {filteredInvoices.map((invoice) => {
              const pending = invoice.invoiceAmount - invoice.paidAmount;
              const paymentPercent =
                invoice.invoiceAmount > 0
                  ? Math.round((invoice.paidAmount / invoice.invoiceAmount) * 100)
                  : 0;
              const dueDays = daysUntil(invoice.dueDate);

              return (
                <div
                  key={invoice.id}
                  className="grid grid-cols-12 items-center border-b border-slate-100 px-4 py-4 last:border-0"
                >
                  <div className="col-span-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {invoice.projectName}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                      {invoice.milestone}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="font-num text-sm font-bold text-slate-900">
                      {formatINR(invoice.invoiceAmount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Pending: {formatINR(pending)}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      max={invoice.invoiceAmount}
                      value={invoice.paidAmount}
                      onChange={(event) =>
                        handleUpdatePayment(invoice, Number(event.target.value))
                      }
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      {paymentPercent}% received
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm text-slate-600">
                      {formatDate(invoice.dueDate)}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        dueDays < 0 && invoice.status !== "Paid"
                          ? "text-rose-600"
                          : dueDays <= 7 && invoice.status !== "Paid"
                          ? "text-amber-600"
                          : "text-slate-500"
                      }`}
                    >
                      {invoice.status === "Paid"
                        ? "Closed"
                        : dueDays < 0
                        ? `${Math.abs(dueDays)}d overdue`
                        : `${dueDays}d left`}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <StatusBadge status={invoice.status} />
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {invoice.remarks || "No remarks"}
                    </p>
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => deleteInvoice(invoice.id)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredInvoices.length === 0 && (
              <div className="p-10 text-center">
                <FileText className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  No invoices found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create your first project invoice or import from Excel.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}