import type { ReactNode } from "react";

/**
 * PageHeader
 * -----------------------------------------------------------
 * Top-of-page title block used across every owner page.
 *
 * Usage:
 *   <PageHeader
 *     title="Medical Records"
 *     description="A timeline of every visit..."
 *     actions={<Button>Add pet</Button>}
 *   />
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600 mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm md:text-base text-slate-600 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

/**
 * SectionHeader
 * -----------------------------------------------------------
 * Smaller header used INSIDE a page to introduce a subsection
 * (e.g. "Upcoming appointments", "Recent records").
 *
 * Usage:
 *   <SectionHeader
 *     title="Upcoming appointments"
 *     description="Next 7 days"
 *     action={<Link href="/owner/bookings">View all →</Link>}
 *   />
 */
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 text-sm">{action}</div>}
    </div>
  );
}
