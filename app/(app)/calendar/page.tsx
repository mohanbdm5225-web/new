"use client";

import { CalendarDays, Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { EquipmentBooking } from "@/components/calendar/equipment-booking";

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Plan project work, field visits, equipment booking, DSR schedule, tender deadlines and team activities."
      >
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export
        </Button>

        <Button>
          <Plus className="h-4 w-4" />
          Add Schedule
        </Button>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MonthCalendar />
        </div>

        <div>
          <EquipmentBooking />
        </div>
      </div>
    </div>
  );
}