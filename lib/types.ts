export type ProjectType =
  | "Drone Survey"
  | "DGPS Survey"
  | "LiDAR"
  | "Bathymetry"
  | "GIS/CAD"
  | "Geospatial"
  | "Tender Work";

export type ProjectStatus =
  | "Planning"
  | "Active"
  | "On Hold"
  | "Completed"
  | "Cancelled";

export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  description: string;
  location: string;
  managerId: string;
  teamIds: string[];
}

export type TaskStatus = "Backlog" | "To Do" | "In Progress" | "Review" | "Done";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  tags: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  workload: number;
  activeProjects: number;
  skills: string[];
}

export type EquipmentStatus =
  | "Available"
  | "In Use"
  | "Maintenance"
  | "Retired";

export type EquipmentCategory =
  | "Drone"
  | "DGPS"
  | "LiDAR Scanner"
  | "Echo Sounder"
  | "Total Station"
  | "Workstation";

export interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  location: string;
  assignedTo: string | null;
  lastMaintenance: string;
  nextMaintenance: string;
  purchaseDate: string;
  value: number;
}

export type TenderStatus =
  | "Draft"
  | "Submitted"
  | "Shortlisted"
  | "Won"
  | "Lost"
  | "Cancelled";

export interface Tender {
  id: string;
  title: string;
  client: string;
  referenceNumber: string;
  status: TenderStatus;
  submissionDate: string;
  openingDate: string;
  estimatedValue: number;
  emdAmount: number;
  location: string;
  scope: string;
  assignedTo: string;
}

export type FinanceType = "Income" | "Expense";
export type FinanceCategory =
  | "Project Payment"
  | "Equipment"
  | "Travel"
  | "Salary"
  | "Software"
  | "Office"
  | "Other";

export interface FinanceRecord {
  id: string;
  date: string;
  type: FinanceType;
  category: FinanceCategory;
  amount: number;
  description: string;
  projectId: string | null;
  status: "Paid" | "Pending" | "Overdue";
}

export type DocumentCategory =
  | "Report"
  | "Drawing"
  | "Map"
  | "Contract"
  | "Invoice"
  | "Data"
  | "Other";

export interface DocumentItem {
  id: string;
  name: string;
  category: DocumentCategory;
  projectId: string | null;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  fileType: string;
}

export type ActivityType =
  | "project"
  | "task"
  | "tender"
  | "document"
  | "team"
  | "finance";

export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId: string;
  timestamp: string;
  entityId: string;
}