import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
type Tone = "blue" | "green" | "amber" | "slate" | "rose";
const tones: Record<Tone, string> = {
  blue: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
  rose: "bg-rose-50 text-rose-700",
};
export function Badge({ tone = "blue", className, ...p }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", tones[tone], className)} {...p} />;
}
