"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Map, Download, Layers } from "lucide-react";

const ProjectMap = dynamic(
  () => import("@/components/map/project-map").then((m) => m.ProjectMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[620px] animate-pulse rounded-2xl bg-slate-100" />
    ),
  }
);

export default function MapPage() {
  return (
    <div>
      <PageHeader
        title="KML / Map View"
        description="View all geospatial, drone, DGPS, LiDAR, bathymetry and GIS projects on a live interactive map."
      >
        <Button variant="outline">
          <Layers className="h-4 w-4" />
          Layers
        </Button>
        <Button>
          <Download className="h-4 w-4" />
          Export KML
        </Button>
      </PageHeader>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Mapped Projects</p>
          <p className="font-num mt-1 text-2xl font-bold">8</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Active Field Sites</p>
          <p className="font-num mt-1 text-2xl font-bold">5</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Survey Coverage</p>
          <p className="font-num mt-1 text-2xl font-bold">Tamil Nadu</p>
        </div>
      </div>

      <ProjectMap />
    </div>
  );
}