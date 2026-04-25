"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetAllData } from "@/lib/use-store";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { confirm } = useConfirm();
  const toast = useToast();

  const handleReset = async () => {
    const ok = await confirm({
      title: "Reset all data?",
      description: "All your changes (projects, tasks, tenders, etc.) will be wiped and replaced with the original sample data. This cannot be undone.",
      confirmLabel: "Reset everything",
      danger: true,
    });
    if (ok) {
      toast.info("Resetting data…");
      setTimeout(() => resetAllData(), 500);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Workspace, organisation and personal preferences." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
            <CardDescription>Basic company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Company name" defaultValue="GeoSurvey Solutions Pvt. Ltd." />
            <Field label="GSTIN" defaultValue="33ABCDE1234F1Z5" />
            <Field label="Registered address" defaultValue="Chennai, Tamil Nadu" />
            <Field label="Primary contact email" defaultValue="contact@geosurvey.in" />
            <Button size="sm" className="mt-2">Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace preferences</CardTitle>
            <CardDescription>Defaults for new projects & tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle label="Auto-generate project codes" defaultChecked />
            <Toggle label="Send deadline email reminders" defaultChecked />
            <Toggle label="Show overdue badges on dashboard" defaultChecked />
            <Toggle label="Enable dark mode by default" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>How you get alerted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle label="Email — tender submission reminders" defaultChecked />
            <Toggle label="Email — invoice due alerts" defaultChecked />
            <Toggle label="In-app — task assigned to me" defaultChecked />
            <Toggle label="In-app — equipment maintenance due" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data management</CardTitle>
            <CardDescription>Backup, reset, danger zone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">
              Data is stored in your browser&apos;s local storage. It will persist across sessions but only on this device.
            </p>
            <Button variant="outline" size="sm">Export all data (JSON)</Button>
            <Button variant="danger" size="sm" onClick={handleReset}>
              Reset to sample data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      <Input defaultValue={defaultValue} />
    </label>
  );
}

function Toggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm dark:border-slate-800">
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-8 cursor-pointer appearance-none rounded-full bg-slate-200 transition-colors checked:bg-indigo-600 relative after:absolute after:top-0.5 after:left-0.5 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-all checked:after:left-4"
      />
    </label>
  );
}