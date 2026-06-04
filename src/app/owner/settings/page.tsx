"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "notifications" | "security">("profile");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-blue-700">Settings</h1>
      <p className="text-slate-500 mt-1">Manage your account, preferences and security.</p>

      <div className="mt-6 flex gap-1 border-b">
        {(["profile","notifications","security"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
        {tab === "profile" && <ProfileForm />}
        {tab === "notifications" && <NotificationsForm />}
        {tab === "security" && <SecurityForm />}
      </div>
    </div>
  );
}

function ProfileForm() {
  return (
    <form action="/api/owner/profile" method="POST" className="space-y-4">
      <Field label="Full name" name="name" />
      <Field label="Phone" name="phone" type="tel" />
      <Field label="Address" name="address" />
      <Field label="Emergency contact" name="emergencyContact" />
      <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Save</button>
    </form>
  );
}
function NotificationsForm() {
  return (
    <form action="/api/owner/notifications" method="POST" className="space-y-3">
      <Toggle name="emailReminders" label="Email reminders for appointments" defaultChecked />
      <Toggle name="smsReminders" label="SMS reminders" defaultChecked />
      <Toggle name="vaccineAlerts" label="Vaccine due alerts" defaultChecked />
      <Toggle name="marketing" label="Promotions & offers" />
      <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 mt-4">Save</button>
    </form>
  );
}
function SecurityForm() {
  return (
    <form action="/api/owner/password" method="POST" className="space-y-4">
      <Field label="Current password" name="current" type="password" />
      <Field label="New password" name="next" type="password" />
      <Field label="Confirm new password" name="confirm" type="password" />
      <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Update password</button>
    </form>
  );
}
function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input {...p} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none" />
    </label>
  );
}
function Toggle({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" {...p} className="size-4 rounded text-blue-600" />
      <span className="text-sm">{label}</span>
    </label>
  );
}
