import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl bg-white border border-slate-100 shadow-card", className)} {...p} />;
}
export function CardBody({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...p} />;
}
