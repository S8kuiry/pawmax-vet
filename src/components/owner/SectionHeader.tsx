import type { ReactNode } from "react";

export function SectionHeader({
  title, description, action,
}: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
