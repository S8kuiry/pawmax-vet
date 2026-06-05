// app/settings/SettingsView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 🟢 Added for auto-refreshing server data on save
import type { ReactNode, InputHTMLAttributes } from "react";

export type OwnerProfile = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  photoUrl?: string;
};

export type OwnerNotifications = {
  emailReminders?: boolean;
  smsReminders?: boolean;
  vaccineAlerts?: boolean;
  marketing?: boolean;
};

type SettingsViewProps = {
  profile: OwnerProfile;
  notifications: OwnerNotifications;
};

type TabKey = "profile" | "notifications" | "security";

export default function SettingsView({ profile, notifications }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const tabs: { key: TabKey; label: string; hint: string }[] = [
    { key: "profile", label: "Profile", hint: "Your personal details" },
    { key: "notifications", label: "Notifications", hint: "Alerts & reminders" },
    { key: "security", label: "Security", hint: "Password & access" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600 mb-2">Account</p>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Settings</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Manage your account, notification preferences and security in one place.
            </p>
          </div>
          <ProfileBadge profile={profile} />
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          
          {/* Navigation Sidebar */}
          <nav className="md:sticky md:top-6 self-start">
            <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible bg-white md:bg-transparent border md:border-0 border-slate-200 rounded-xl p-1 md:p-0">
              {tabs.map((t) => {
                const active = activeTab === t.key;
                return (
                  <li key={t.key} className="flex-1 md:flex-none">
                    <button
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className={`block font-medium ${active ? "text-blue-700" : "text-slate-800"}`}>
                        {t.label}
                      </span>
                      <span className="hidden md:block text-xs text-slate-500 mt-0.5">{t.hint}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Dynamic Content Panel */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {activeTab === "profile" && (
              <Panel title="Profile" description="Update how vets and clinics can reach you.">
                <ProfileForm profile={profile} />
              </Panel>
            )}
            {activeTab === "notifications" && (
              <Panel title="Notifications" description="Choose what we should send and how.">
                <NotificationsForm notifications={notifications} />
              </Panel>
            )}
            {activeTab === "security" && (
              <Panel title="Security" description="Use a strong password you don't reuse elsewhere.">
                <SecurityForm />
              </Panel>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-Components: Forms (Asynchronous Handlers)                             */
/* -------------------------------------------------------------------------- */

function ProfileForm({ profile }: { profile: OwnerProfile }) {
  const router = useRouter(); // 🟢 Used to refresh Server Component layouts seamlessly
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        emergencyContact: formData.get("emergencyContact"),
      };
      
      const res = await fetch("/api/owner/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh(); // 🟢 CRITICAL: Pulls the newly updated data right from the database back into component props
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* key={profile.field} forces React to reset its internal DOM text state when parent updates wrapper props */}
        <Field key={profile.name} label="Full name" name="name" defaultValue={profile.name} placeholder="Jane Doe" disabled={!isEditing || isSaving} />
        <Field key={profile.phone} label="Phone" name="phone" type="tel" defaultValue={profile.phone} placeholder="+1 555 000 0000" disabled={!isEditing || isSaving} />
      </div>
      <Field key={profile.address} label="Address" name="address" defaultValue={profile.address} placeholder="Street, city, postal code" disabled={!isEditing || isSaving} />
      <Field
        key={profile.emergencyContact}
        label="Emergency contact"
        name="emergencyContact"
        defaultValue={profile.emergencyContact}
        placeholder="Name & phone"
        hint="Used only if we can't reach you about an urgent issue."
        disabled={!isEditing || isSaving}
      />
      
      {isEditing ? (
        <FormActions submitLabel={isSaving ? "Saving..." : "Save changes"} onCancel={() => setIsEditing(false)} disabled={isSaving} />
      ) : (
        <div className="flex justify-end pt-2 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition"
          >
            Edit Profile
          </button>
        </div>
      )}
    </form>
  );
}

function NotificationsForm({ notifications }: { notifications: OwnerNotifications }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const items: { name: keyof OwnerNotifications; title: string; description: string }[] = [
    { name: "emailReminders", title: "Email reminders", description: "Appointment confirmations and upcoming visit alerts." },
    { name: "smsReminders", title: "SMS reminders", description: "Short text reminders sent to your phone." },
    { name: "vaccineAlerts", title: "Vaccine due alerts", description: "Get notified before your pet's next vaccination is due." },
    { name: "marketing", title: "Promotions & offers", description: "Occasional deals from partner clinics." },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/owner/notifications", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh(); // 🟢 Auto refresh state layout values
      } else {
        alert("Failed to save preferences.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <ul className="divide-y divide-slate-100 -mx-2">
        {items.map((it) => (
          <li key={it.name} className="flex items-start justify-between gap-4 px-2 py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{it.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{it.description}</p>
            </div>
            <Toggle name={it.name} defaultChecked={notifications[it.name]} disabled={!isEditing || isSaving} />
          </li>
        ))}
      </ul>

      {isEditing ? (
        <FormActions submitLabel={isSaving ? "Saving..." : "Save preferences"} onCancel={() => setIsEditing(false)} disabled={isSaving} />
      ) : (
        <div className="flex justify-end pt-2 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition"
          >
            Edit Preferences
          </button>
        </div>
      )}
    </form>
  );
}

function SecurityForm() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/owner/password", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        e.currentTarget.reset();
        alert("Password updated successfully!");
      } else {
        alert("Failed to update password. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Current password" name="current" type="password" autoComplete="current-password" disabled={isSaving} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="New password" name="next" type="password" autoComplete="new-password" hint="At least 8 characters." disabled={isSaving} />
        <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" disabled={isSaving} />
      </div>
      <div className="flex justify-end pt-2 border-t border-slate-100 mt-6">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-sm transition"
        >
          {isSaving ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-Components: UI Layout Primitives                                       */
/* -------------------------------------------------------------------------- */

function ProfileBadge({ profile }: { profile: OwnerProfile }) {
  const initials = (profile.name ?? "").split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "PO";
  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full pl-1 pr-4 py-1 shadow-sm">
      <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white grid place-content-center text-sm font-semibold">{initials}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{profile.name || "Pet owner"}</p>
        <p className="text-xs text-slate-500 truncate">{profile.email || "—"}</p>
      </div>
    </div>
  );
}

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div>
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, disabled, ...p }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${disabled ? "opacity-80" : ""}`}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        {...p}
        disabled={disabled}
        className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition disabled:bg-slate-50 disabled:text-grey-900 disabled:border-slate-200"
      />
      {hint && <span className="block mt-1 text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

/* Toggle element uses controlled/uncontrolled safe bindings */
function Toggle({ disabled, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`relative inline-flex shrink-0 items-center ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
      <input type="checkbox" disabled={disabled} {...p} className="peer sr-only" />
      <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-blue-600" />
      <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

function FormActions({ submitLabel, onCancel, disabled }: { submitLabel: string; onCancel: () => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 mt-6">
      <button
        type="button"
        onClick={onCancel}
        disabled={disabled}
        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-sm transition"
      >
        {submitLabel}
      </button>
    </div>
  );
}