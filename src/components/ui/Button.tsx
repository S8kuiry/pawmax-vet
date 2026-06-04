"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "outline" | "ghost" | "subtle";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft",
  outline: "border border-brand-200 text-brand-700 hover:bg-brand-50",
  ghost:   "text-slate-700 hover:bg-slate-100",
  subtle:  "bg-brand-50 text-brand-700 hover:bg-brand-100",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant], sizes[size], className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
