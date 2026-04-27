export type InvoiceStatus =
  | "Draft"
  | "Raised"
  | "Submitted"
  | "Approved"
  | "Partially Paid"
  | "Paid"
  | "Overdue";

export type InvoiceItem = {
  id: string;
  invoiceNumber: string;
  projectId: string;
  projectName: string;
  client: string;
  milestone: string;
  invoiceDate: string;
  dueDate: string;
  invoiceAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  remarks: string;
  createdAt: string;
};

export const INVOICE_STORAGE_KEY = "geo_invoice_records";

export const defaultInvoices: InvoiceItem[] = [
  {
    id: "inv1",
    invoiceNumber: "INV-2026-001",
    projectId: "p1",
    projectName: "Chennai Metro Phase-III Corridor Survey",
    client: "CMRL",
    milestone: "Milestone 1 - DGPS Control Survey",
    invoiceDate: "2026-04-10",
    dueDate: "2026-05-10",
    invoiceAmount: 1200000,
    paidAmount: 600000,
    status: "Partially Paid",
    remarks: "50% payment received. Balance under process.",
    createdAt: "2026-04-10T10:00:00",
  },
  {
    id: "inv2",
    invoiceNumber: "INV-2026-002",
    projectId: "p3",
    projectName: "Ennore Port Bathymetry Survey",
    client: "Kamarajar Port Ltd.",
    milestone: "Advance Payment",
    invoiceDate: "2026-04-05",
    dueDate: "2026-04-25",
    invoiceAmount: 1800000,
    paidAmount: 1800000,
    status: "Paid",
    remarks: "Payment fully received.",
    createdAt: "2026-04-05T10:00:00",
  },
  {
    id: "inv3",
    invoiceNumber: "INV-2026-003",
    projectId: "p5",
    projectName: "Krishnagiri Solar Farm Drone Survey",
    client: "Adani Green Energy",
    milestone: "Final Deliverables Submission",
    invoiceDate: "2026-04-18",
    dueDate: "2026-05-18",
    invoiceAmount: 1600000,
    paidAmount: 0,
    status: "Submitted",
    remarks: "Awaiting client approval.",
    createdAt: "2026-04-18T10:00:00",
  },
];

export function getInvoices(): InvoiceItem[] {
  if (typeof window === "undefined") return defaultInvoices;

  const stored = window.localStorage.getItem(INVOICE_STORAGE_KEY);

  if (!stored) {
    window.localStorage.setItem(
      INVOICE_STORAGE_KEY,
      JSON.stringify(defaultInvoices)
    );
    return defaultInvoices;
  }

  try {
    return JSON.parse(stored) as InvoiceItem[];
  } catch {
    window.localStorage.setItem(
      INVOICE_STORAGE_KEY,
      JSON.stringify(defaultInvoices)
    );
    return defaultInvoices;
  }
}

export function saveInvoices(invoices: InvoiceItem[]) {
  window.localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices));
  window.dispatchEvent(new Event("invoice-updated"));
}

export function addInvoice(invoice: InvoiceItem) {
  const current = getInvoices();
  saveInvoices([invoice, ...current]);
}

export function deleteInvoice(id: string) {
  const current = getInvoices();
  saveInvoices(current.filter((invoice) => invoice.id !== id));
}

export function updateInvoicePayment(
  id: string,
  paidAmount: number,
  status: InvoiceStatus
) {
  const current = getInvoices();

  const updated = current.map((invoice) =>
    invoice.id === id
      ? {
          ...invoice,
          paidAmount,
          status,
        }
      : invoice
  );

  saveInvoices(updated);
}