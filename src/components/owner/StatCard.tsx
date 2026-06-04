import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, icon: Icon, trend, tone = "blue",
}: {
  label: string; value: string | number; icon: LucideIcon;
  trend?: string; tone?: "blue" | "emerald" | "amber" | "rose";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-5 hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
          {trend && <p className="mt-1 text-xs text-emerald-600">{trend}</p>}
        </div>
        <div className={cn("size-10 rounded-lg grid place-items-center", tones[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
