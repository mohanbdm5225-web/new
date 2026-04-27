"use client";

import { useState } from "react";
import {
  Bell,
  Building2,
  Check,
  Database,
  Download,
  Globe2,
  Lock,
  Mail,
  Moon,
  Save,
  Shield,
  Smartphone,
  Sun,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("GeoSurvey Project Management");
  const [email, setEmail] = useState("admin@geosurvey.in");
  const [phone, setPhone] = useState("+91 98840 12345");
  const [city, setCity] = useState("Chennai, Tamil Nadu");
  const [darkMode, setDarkMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [mobileAlerts, setMobileAlerts] = useState(true);
  const [tenderAlerts, setTenderAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage company profile, user preferences, notifications, security and application configuration."
      >
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export Settings
        </Button>

        <Button>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Company Profile
                </h2>
                <p className="text-sm text-slate-500">
                  Basic company information used across reports and dashboards.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Company Name
                </label>
                <Input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Admin Email
                </label>
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <Input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Office Location
                </label>
                <Input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Bell className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Notifications
                </h2>
                <p className="text-sm text-slate-500">
                  Control alerts for deadlines, tenders, payments and project updates.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <SettingToggle
                icon={Mail}
                title="Email Alerts"
                description="Receive project updates, task reminders and approval alerts by email."
                enabled={emailAlerts}
                onChange={setEmailAlerts}
              />

              <SettingToggle
                icon={Smartphone}
                title="Mobile Alerts"
                description="Receive important alerts for site work, tenders and payment follow-up."
                enabled={mobileAlerts}
                onChange={setMobileAlerts}
              />

              <SettingToggle
                icon={Globe2}
                title="Tender Deadline Alerts"
                description="Notify before tender submission dates, EMD deadlines and bid opening dates."
                enabled={tenderAlerts}
                onChange={setTenderAlerts}
              />

              <SettingToggle
                icon={Database}
                title="Payment Follow-up Alerts"
                description="Notify when project payments are pending or overdue."
                enabled={paymentAlerts}
                onChange={setPaymentAlerts}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Shield className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Security
                </h2>
                <p className="text-sm text-slate-500">
                  Manage access control and company data protection settings.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SecurityCard
                icon={Lock}
                title="Password Policy"
                description="Strong password required for all users."
                status="Enabled"
              />

              <SecurityCard
                icon={User}
                title="Role-based Access"
                description="Admin, Manager and Staff permission control."
                status="Enabled"
              />

              <SecurityCard
                icon={Database}
                title="Data Backup"
                description="Daily project and document backup configuration."
                status="Mock Only"
              />

              <SecurityCard
                icon={Shield}
                title="Audit Logs"
                description="Track edits, uploads and finance changes."
                status="Planned"
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-base font-semibold text-slate-900">
              Appearance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select dashboard display preference.
            </p>

            <div className="mt-5 grid gap-3">
              <button
                onClick={() => setDarkMode(false)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  !darkMode
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Light Mode
                    </p>
                    <p className="text-xs text-slate-500">
                      Clean office-friendly theme
                    </p>
                  </div>
                </div>

                {!darkMode && <Check className="h-4 w-4 text-indigo-600" />}
              </button>

              <button
                onClick={() => setDarkMode(true)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  darkMode
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Dark Mode
                    </p>
                    <p className="text-xs text-slate-500">
                      Ready structure for future
                    </p>
                  </div>
                </div>

                {darkMode && <Check className="h-4 w-4 text-indigo-600" />}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-base font-semibold text-slate-900">
              Application Status
            </h2>

            <div className="mt-4 space-y-3">
              <StatusRow label="Frontend" value="Active" />
              <StatusRow label="Mock Data" value="Enabled" />
              <StatusRow label="Database" value="Not Connected" />
              <StatusRow label="Authentication" value="Planned" />
              <StatusRow label="File Storage" value="Planned" />
            </div>
          </section>

          <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
            <h2 className="text-base font-semibold text-indigo-900">
              Next Build Stage
            </h2>
            <p className="mt-2 text-sm text-indigo-700">
              After completing UI pages, next step is adding real backend, login,
              database, file upload and live project creation forms.
            </p>

            <Button className="mt-4 w-full">
              Continue Build
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SettingToggle({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <button
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SecurityCard({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <Icon className="h-5 w-5 text-slate-500" />
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {status}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}