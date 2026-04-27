"use client";

import { ClipboardList, Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DsrForm } from "@/components/dsr/dsr-form";
import { DsrList } from "@/components/dsr/dsr-list";

export default function DsrPage() {
  return (
    <div>
      <PageHeader
        title="Daily Status Report"
        description="Create and review daily field reports for drone survey, DGPS, LiDAR, bathymetry, GIS/CAD and tender work."
      >
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export
        </Button>

        <Button>
          <Plus className="h-4 w-4" />
          New DSR
        </Button>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <DsrForm />
        </div>

        <div className="xl:col-span-2">
          <DsrList />
        </div>
      </div>
    </div>
  );
}