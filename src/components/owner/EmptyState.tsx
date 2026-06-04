import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon, title, description, ctaLabel, ctaHref,
}: {
  icon: LucideIcon; title: string; description: string;
  ctaLabel?: string; ctaHref?: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-12 text-center">
      <div className="mx-auto size-14 rounded-full bg-white grid place-items-center text-blue-500 mb-4">
        <Icon className="size-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex mt-5 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-medium px-4 py-2 hover:bg-blue-700 transition"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
