export type ProjectCostCategory =
  | "Field Team"
  | "Drone Rental"
  | "DGPS Survey"
  | "Travel"
  | "Food & Accommodation"
  | "Data Processing"
  | "Software"
  | "Equipment Maintenance"
  | "Miscellaneous";

export type ProjectCostItem = {
  id: string;
  projectId: string;
  category: ProjectCostCategory;
  description: string;
  amount: number;
  date: string;
};

export const projectCosts: ProjectCostItem[] = [
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
  {
    id: "pc10",
    projectId: "p6",
    category: "Field Team",
    description: "Airport expansion survey field team expense",
    amount: 900000,
    date: "2026-02-15",
  },
  {
    id: "pc11",
    projectId: "p6",
    category: "Travel",
    description: "Airport project travel and local logistics",
    amount: 250000,
    date: "2026-02-18",
  },
];

export function getCostsByProject(projectId: string): ProjectCostItem[] {
  return projectCosts.filter((item) => item.projectId === projectId);
}

export function getTotalProjectCost(projectId: string): number {
  return getCostsByProject(projectId).reduce(
    (sum, item) => sum + item.amount,
    0
  );
}