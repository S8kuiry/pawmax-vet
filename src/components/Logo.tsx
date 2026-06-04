import { PawPrint } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid place-items-center size-9 rounded-xl bg-brand-600 text-white shadow-soft">
        <PawPrint className="size-5" />
      </span>
      <span className="font-semibold text-slate-900">PetCare<span className="text-brand-600">Vet</span></span>
    </Link>
  );
}
