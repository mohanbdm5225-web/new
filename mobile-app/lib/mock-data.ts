import {
  ActivityLog,
  DocumentItem,
  Equipment,
  FinanceRecord,
  Project,
  Task,
  TeamMember,
  Tender,
} from "./types";

export const team: TeamMember[] = [
  { id: "u1", name: "Mohan Raj", role: "Managing Director", email: "mohan@geosurvey.in", phone: "+91 98840 12345", avatar: "", department: "Leadership", workload: 70, activeProjects: 8, skills: ["Strategy", "Client Relations", "Bid Management"] },
  { id: "u2", name: "Arvind Kumar", role: "Senior Surveyor", email: "arvind@geosurvey.in", phone: "+91 98401 23456", avatar: "", department: "Field Operations", workload: 85, activeProjects: 4, skills: ["DGPS", "Total Station", "Topographic Survey"] },
  { id: "u3", name: "Priya Sundaram", role: "GIS Analyst", email: "priya@geosurvey.in", phone: "+91 99520 34567", avatar: "", department: "Data & Analytics", workload: 60, activeProjects: 5, skills: ["ArcGIS", "QGIS", "Remote Sensing"] },
  { id: "u4", name: "Vikram Sethu", role: "Drone Pilot", email: "vikram@geosurvey.in", phone: "+91 98430 45678", avatar: "", department: "Aerial Survey", workload: 90, activeProjects: 3, skills: ["DJI Matrice", "Photogrammetry", "LiDAR"] },
  { id: "u5", name: "Deepa Menon", role: "CAD Engineer", email: "deepa@geosurvey.in", phone: "+91 97860 56789", avatar: "", department: "Design", workload: 55, activeProjects: 6, skills: ["AutoCAD", "Civil 3D", "Drafting"] },
  { id: "u6", name: "Rohit Pillai", role: "Bathymetry Lead", email: "rohit@geosurvey.in", phone: "+91 96770 67890", avatar: "", department: "Marine Survey", workload: 45, activeProjects: 2, skills: ["Multibeam", "Single Beam", "Side Scan Sonar"] },
  { id: "u7", name: "Ananya Iyer", role: "Project Coordinator", email: "ananya@geosurvey.in", phone: "+91 95830 78901", avatar: "", department: "PMO", workload: 75, activeProjects: 9, skills: ["Planning", "Scheduling", "Client Coordination"] },
  { id: "u8", name: "Karthik Nair", role: "Tender Executive", email: "karthik@geosurvey.in", phone: "+91 94440 89012", avatar: "", department: "Business Development", workload: 65, activeProjects: 12, skills: ["GeM Portal", "Bid Writing", "EMD Management"] },
];

export const projects: Project[] = [
  { id: "p1", code: "GS-2026-014", name: "Chennai Metro Phase-III Corridor Survey", client: "CMRL", type: "DGPS Survey", status: "Active", priority: "High", progress: 62, startDate: "2026-01-15", endDate: "2026-06-30", budget: 4800000, spent: 2850000, description: "Topographic and DGPS control survey along 24 km metro corridor including station locations.", location: "Chennai, Tamil Nadu", managerId: "u2", teamIds: ["u2", "u5", "u7"], latitude: 13.0827, longitude: 80.2707 },
  { id: "p2", code: "GS-2026-015", name: "NH-544 Highway LiDAR Mapping", client: "NHAI", type: "LiDAR", status: "Active", priority: "Critical", progress: 38, startDate: "2026-02-10", endDate: "2026-08-20", budget: 12500000, spent: 4100000, description: "High-density LiDAR scanning of 86 km stretch for 6-lane expansion feasibility.", location: "Salem–Kochi", managerId: "u4", teamIds: ["u4", "u3", "u7"], latitude: 11.6643, longitude: 78.1460 },
  { id: "p3", code: "GS-2026-016", name: "Ennore Port Bathymetry Survey", client: "Kamarajar Port Ltd.", type: "Bathymetry", status: "Active", priority: "High", progress: 78, startDate: "2026-01-05", endDate: "2026-05-10", budget: 3600000, spent: 2900000, description: "Pre-dredging multibeam bathymetric survey of port basin and approach channel.", location: "Ennore, Tamil Nadu", managerId: "u6", teamIds: ["u6", "u3"], latitude: 13.2333, longitude: 80.3333 },
  { id: "p4", code: "GS-2026-017", name: "Coimbatore Smart City GIS Mapping", client: "Coimbatore Municipal Corp.", type: "GIS/CAD", status: "Active", priority: "Medium", progress: 45, startDate: "2025-11-20", endDate: "2026-07-15", budget: 6800000, spent: 3200000, description: "Property-level GIS database creation including utilities and asset mapping.", location: "Coimbatore, Tamil Nadu", managerId: "u3", teamIds: ["u3", "u5", "u7"], latitude: 11.0168, longitude: 76.9558 },
  { id: "p5", code: "GS-2026-018", name: "Krishnagiri Solar Farm Drone Survey", client: "Adani Green Energy", type: "Drone Survey", status: "Active", priority: "Medium", progress: 90, startDate: "2026-03-01", endDate: "2026-05-05", budget: 1850000, spent: 1600000, description: "Orthomosaic and DTM generation for 400-acre solar installation site.", location: "Krishnagiri, Tamil Nadu", managerId: "u4", teamIds: ["u4", "u3"], latitude: 12.5186, longitude: 78.2137 },
  { id: "p6", code: "GS-2025-098", name: "Chennai Airport Expansion Topo", client: "AAI", type: "Geospatial", status: "Completed", priority: "High", progress: 100, startDate: "2025-08-01", endDate: "2026-02-28", budget: 7200000, spent: 7050000, description: "Integrated topographic, geotechnical coordination and GIS deliverables.", location: "Meenambakkam, Chennai", managerId: "u7", teamIds: ["u2", "u5", "u3", "u7"], latitude: 12.9941, longitude: 80.1709 },
  { id: "p7", code: "GS-2026-019", name: "Thoothukudi Harbor Dredging Tender Prep", client: "Tuticorin Port Authority", type: "Tender Work", status: "Planning", priority: "Critical", progress: 15, startDate: "2026-04-10", endDate: "2026-05-25", budget: 800000, spent: 120000, description: "Technical bid documentation, EMD and methodology for harbor dredging survey tender.", location: "Thoothukudi, Tamil Nadu", managerId: "u8", teamIds: ["u8", "u6"], latitude: 8.7642, longitude: 78.1348 },
  { id: "p8", code: "GS-2026-020", name: "Madurai Ring Road Alignment Study", client: "TNRDC", type: "DGPS Survey", status: "On Hold", priority: "Low", progress: 22, startDate: "2026-02-01", endDate: "2026-09-15", budget: 5400000, spent: 900000, description: "Alignment feasibility survey for proposed outer ring road — paused pending environmental clearance.", location: "Madurai, Tamil Nadu", managerId: "u2", teamIds: ["u2", "u5"], latitude: 9.9252, longitude: 78.1198 },
];

export const tasks: Task[] = [
  { id: "t1", title: "Set up DGPS base stations at corridor segment A", description: "Reconnaissance and base station installation for Chainage 0-8 km.", projectId: "p1", assigneeId: "u2", status: "Done", priority: "High", dueDate: "2026-02-20", createdAt: "2026-01-18", tags: ["field", "setup"] },
  { id: "t2", title: "Topographic data collection — Segment B", description: "Chainage 8-16 km detailed topo at 5m grid.", projectId: "p1", assigneeId: "u2", status: "In Progress", priority: "High", dueDate: "2026-04-30", createdAt: "2026-03-01", tags: ["field", "topo"] },
  { id: "t3", title: "Cross-sections drawing in AutoCAD", description: "Generate and clean cross-sections every 25m.", projectId: "p1", assigneeId: "u5", status: "To Do", priority: "Medium", dueDate: "2026-05-15", createdAt: "2026-03-10", tags: ["cad", "deliverable"] },
  { id: "t4", title: "LiDAR flight plan for NH-544 Block 1", description: "Mission planning with overlap and altitude settings.", projectId: "p2", assigneeId: "u4", status: "Done", priority: "Urgent", dueDate: "2026-02-25", createdAt: "2026-02-15", tags: ["planning", "aerial"] },
  { id: "t5", title: "Point cloud classification QC", description: "Ground/non-ground classification review for Block 1.", projectId: "p2", assigneeId: "u3", status: "In Progress", priority: "High", dueDate: "2026-04-28", createdAt: "2026-03-20", tags: ["processing", "qc"] },
  { id: "t6", title: "Multibeam calibration at Ennore berth 2", description: "Patch test and sound velocity profile.", projectId: "p3", assigneeId: "u6", status: "Done", priority: "High", dueDate: "2026-01-15", createdAt: "2026-01-10", tags: ["marine", "calibration"] },
  { id: "t7", title: "Bathymetric contour map generation", description: "0.5m contour map of port basin.", projectId: "p3", assigneeId: "u3", status: "Review", priority: "Medium", dueDate: "2026-04-22", createdAt: "2026-03-15", tags: ["deliverable", "marine"] },
  { id: "t8", title: "Utility digitization — Zone 5", description: "Water and sewer lines vectorization.", projectId: "p4", assigneeId: "u3", status: "In Progress", priority: "Medium", dueDate: "2026-05-10", createdAt: "2026-02-12", tags: ["gis", "digitization"] },
  { id: "t9", title: "Property boundary verification site visit", description: "Ground-truth 220 parcels in Ward 48.", projectId: "p4", assigneeId: "u2", status: "To Do", priority: "Low", dueDate: "2026-06-01", createdAt: "2026-03-25", tags: ["field", "verification"] },
  { id: "t10", title: "Orthomosaic generation — Krishnagiri site", description: "2 cm GSD orthomosaic processing.", projectId: "p5", assigneeId: "u4", status: "Done", priority: "Medium", dueDate: "2026-04-10", createdAt: "2026-03-15", tags: ["processing", "aerial"] },
  { id: "t11", title: "Final report draft — Solar farm survey", description: "Client deliverable document with all exhibits.", projectId: "p5", assigneeId: "u7", status: "Review", priority: "High", dueDate: "2026-04-29", createdAt: "2026-04-12", tags: ["report", "deliverable"] },
  { id: "t12", title: "Prepare technical bid document", description: "Thoothukudi harbor dredging tender — methodology.", projectId: "p7", assigneeId: "u8", status: "In Progress", priority: "Urgent", dueDate: "2026-05-08", createdAt: "2026-04-10", tags: ["bid", "documentation"] },
  { id: "t13", title: "EMD bank guarantee arrangement", description: "Coordinate with HDFC Bank for ₹5L EMD BG.", projectId: "p7", assigneeId: "u8", status: "Backlog", priority: "High", dueDate: "2026-05-02", createdAt: "2026-04-18", tags: ["finance", "bid"] },
  { id: "t14", title: "Madurai ring road — resume brief prep", description: "Package pending work summary once clearance is received.", projectId: "p8", assigneeId: "u7", status: "Backlog", priority: "Low", dueDate: "2026-05-30", createdAt: "2026-04-01", tags: ["planning"] },
];

export const equipment: Equipment[] = [
  { id: "eq1", name: "DJI Matrice 350 RTK", serialNumber: "M350-2025-A14", category: "Drone", status: "In Use", location: "Krishnagiri Site", assignedTo: "u4", lastMaintenance: "2026-02-10", nextMaintenance: "2026-06-10", purchaseDate: "2025-03-15", value: 1250000 },
  { id: "eq2", name: "DJI Mavic 3 Enterprise", serialNumber: "MV3E-2024-008", category: "Drone", status: "Available", location: "Chennai HQ", assignedTo: null, lastMaintenance: "2026-03-20", nextMaintenance: "2026-07-20", purchaseDate: "2024-08-10", value: 420000 },
  { id: "eq3", name: "Trimble R12i DGPS", serialNumber: "TR12i-2024-003", category: "DGPS", status: "In Use", location: "CMRL Corridor", assignedTo: "u2", lastMaintenance: "2026-01-15", nextMaintenance: "2026-07-15", purchaseDate: "2024-05-20", value: 1680000 },
  { id: "eq4", name: "Leica GS18 T DGPS", serialNumber: "GS18T-2023-012", category: "DGPS", status: "Maintenance", location: "Service Center", assignedTo: null, lastMaintenance: "2026-04-20", nextMaintenance: "2026-05-05", purchaseDate: "2023-11-08", value: 1450000 },
  { id: "eq5", name: "Riegl VUX-1 LR LiDAR", serialNumber: "VUX1LR-2024-001", category: "LiDAR Scanner", status: "In Use", location: "NH-544 Project", assignedTo: "u4", lastMaintenance: "2026-02-28", nextMaintenance: "2026-08-28", purchaseDate: "2024-01-15", value: 8500000 },
  { id: "eq6", name: "R2Sonic 2024 Multibeam", serialNumber: "R2S-2024-006", category: "Echo Sounder", status: "In Use", location: "Ennore Port", assignedTo: "u6", lastMaintenance: "2025-12-10", nextMaintenance: "2026-06-10", purchaseDate: "2024-02-22", value: 5600000 },
  { id: "eq7", name: "Leica TS16 Total Station", serialNumber: "TS16-2023-009", category: "Total Station", status: "Available", location: "Chennai HQ", assignedTo: null, lastMaintenance: "2026-03-01", nextMaintenance: "2026-09-01", purchaseDate: "2023-06-10", value: 980000 },
  { id: "eq8", name: "Dell Precision 7780 Workstation", serialNumber: "DP7780-2025-004", category: "Workstation", status: "In Use", location: "GIS Lab", assignedTo: "u3", lastMaintenance: "2026-01-20", nextMaintenance: "2026-07-20", purchaseDate: "2025-04-02", value: 385000 },
];

export const tenders: Tender[] = [
  { id: "tn1", title: "Metro Corridor Extension Survey — Phase IV", client: "CMRL", referenceNumber: "CMRL/SUR/2026/0048", status: "Submitted", submissionDate: "2026-04-15", openingDate: "2026-04-30", estimatedValue: 18500000, emdAmount: 370000, location: "Chennai", scope: "DGPS + Topographic survey of 18 km extension corridor.", assignedTo: "u8" },
  { id: "tn2", title: "Port Basin Dredging Pre-Survey", client: "Kamarajar Port Ltd.", referenceNumber: "KPL/2026/HYD/011", status: "Shortlisted", submissionDate: "2026-03-28", openingDate: "2026-04-12", estimatedValue: 4200000, emdAmount: 84000, location: "Ennore", scope: "Multibeam bathymetry and volume calculations.", assignedTo: "u8" },
  { id: "tn3", title: "Smart City Utility GIS — Package 3", client: "Madurai Smart City Ltd.", referenceNumber: "MSCL/GIS/2026/007", status: "Won", submissionDate: "2026-02-10", openingDate: "2026-02-25", estimatedValue: 9800000, emdAmount: 196000, location: "Madurai", scope: "Underground utility mapping and GIS database.", assignedTo: "u8" },
  { id: "tn4", title: "Solar Farm Feasibility Drone Survey", client: "ReNew Power", referenceNumber: "RNW/SUR/2026/022", status: "Lost", submissionDate: "2026-01-20", openingDate: "2026-02-05", estimatedValue: 2200000, emdAmount: 44000, location: "Tirunelveli", scope: "800-acre land feasibility and topographic survey.", assignedTo: "u1" },
  { id: "tn5", title: "Airport Terminal Expansion GIS", client: "AAI", referenceNumber: "AAI/MAA/2026/091", status: "Draft", submissionDate: "2026-05-20", openingDate: "2026-06-05", estimatedValue: 6400000, emdAmount: 128000, location: "Chennai", scope: "Terminal expansion integrated geospatial services.", assignedTo: "u8" },
  { id: "tn6", title: "Coastal Zone LiDAR Mapping", client: "Tamil Nadu Coastal Zone Mgmt. Authority", referenceNumber: "TNCZMA/LIDAR/2026/004", status: "Submitted", submissionDate: "2026-04-22", openingDate: "2026-05-10", estimatedValue: 22400000, emdAmount: 448000, location: "Tamil Nadu Coast", scope: "Airborne LiDAR for 120 km coastline erosion study.", assignedTo: "u1" },
];

export const finance: FinanceRecord[] = [
  { id: "f1", date: "2026-04-18", type: "Income", category: "Project Payment", amount: 1800000, description: "CMRL milestone 2 payment", projectId: "p1", status: "Paid" },
  { id: "f2", date: "2026-04-15", type: "Expense", category: "Travel", amount: 85000, description: "Field team NH-544 mobilization", projectId: "p2", status: "Paid" },
  { id: "f3", date: "2026-04-10", type: "Income", category: "Project Payment", amount: 3500000, description: "Kamarajar Port advance", projectId: "p3", status: "Paid" },
  { id: "f4", date: "2026-04-08", type: "Expense", category: "Equipment", amount: 142000, description: "LiDAR scanner calibration", projectId: null, status: "Paid" },
  { id: "f5", date: "2026-04-05", type: "Expense", category: "Salary", amount: 1850000, description: "March 2026 payroll", projectId: null, status: "Paid" },
  { id: "f6", date: "2026-04-02", type: "Income", category: "Project Payment", amount: 2200000, description: "Coimbatore Smart City M1", projectId: "p4", status: "Paid" },
  { id: "f7", date: "2026-03-30", type: "Expense", category: "Software", amount: 280000, description: "ArcGIS Pro renewal", projectId: null, status: "Paid" },
  { id: "f8", date: "2026-04-20", type: "Income", category: "Project Payment", amount: 1600000, description: "Adani final payment", projectId: "p5", status: "Pending" },
  { id: "f9", date: "2026-03-25", type: "Income", category: "Project Payment", amount: 900000, description: "AAI retention release", projectId: "p6", status: "Overdue" },
  { id: "f10", date: "2026-04-22", type: "Expense", category: "Office", amount: 68000, description: "Chennai office rent", projectId: null, status: "Paid" },
];

export const documents: DocumentItem[] = [
  { id: "d1", name: "CMRL Corridor — Topographic Report v2.pdf", category: "Report", projectId: "p1", size: 18450000, uploadedBy: "u2", uploadedAt: "2026-04-22T09:30:00", fileType: "pdf" },
  { id: "d2", name: "NH-544 LiDAR Raw Point Cloud Block 1.las", category: "Data", projectId: "p2", size: 2450000000, uploadedBy: "u4", uploadedAt: "2026-04-18T14:10:00", fileType: "las" },
  { id: "d3", name: "Ennore Basin Bathymetry Contours.dwg", category: "Drawing", projectId: "p3", size: 12400000, uploadedBy: "u5", uploadedAt: "2026-04-20T11:45:00", fileType: "dwg" },
  { id: "d4", name: "Coimbatore Ward 48 Utility Map.shp", category: "Map", projectId: "p4", size: 68000000, uploadedBy: "u3", uploadedAt: "2026-04-15T10:15:00", fileType: "shp" },
  { id: "d5", name: "Krishnagiri Solar Orthomosaic.tif", category: "Map", projectId: "p5", size: 840000000, uploadedBy: "u4", uploadedAt: "2026-04-19T16:00:00", fileType: "tif" },
  { id: "d6", name: "CMRL Project Agreement Signed.pdf", category: "Contract", projectId: "p1", size: 4200000, uploadedBy: "u1", uploadedAt: "2026-01-16T08:00:00", fileType: "pdf" },
  { id: "d7", name: "Invoice INV-2026-041 CMRL M2.pdf", category: "Invoice", projectId: "p1", size: 280000, uploadedBy: "u7", uploadedAt: "2026-04-18T12:00:00", fileType: "pdf" },
  { id: "d8", name: "Thoothukudi Tender Technical Bid Draft.docx", category: "Report", projectId: "p7", size: 1400000, uploadedBy: "u8", uploadedAt: "2026-04-23T15:20:00", fileType: "docx" },
];

export const activity: ActivityLog[] = [
  { id: "a1", type: "project", title: "Project progress updated", description: "Ennore Port Bathymetry moved to 78%", userId: "u6", timestamp: "2026-04-23T14:32:00", entityId: "p3" },
  { id: "a2", type: "task", title: "Task completed", description: "Orthomosaic generation — Krishnagiri site", userId: "u4", timestamp: "2026-04-23T12:10:00", entityId: "t10" },
  { id: "a3", type: "tender", title: "Tender submitted", description: "Coastal Zone LiDAR Mapping — TNCZMA", userId: "u1", timestamp: "2026-04-22T17:45:00", entityId: "tn6" },
  { id: "a4", type: "document", title: "Document uploaded", description: "CMRL Corridor — Topographic Report v2.pdf", userId: "u2", timestamp: "2026-04-22T09:30:00", entityId: "d1" },
  { id: "a5", type: "finance", title: "Payment received", description: "Kamarajar Port advance ₹35 L credited", userId: "u7", timestamp: "2026-04-10T10:05:00", entityId: "f3" },
];