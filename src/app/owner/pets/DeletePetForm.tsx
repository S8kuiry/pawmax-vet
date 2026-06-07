"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";

interface DeletePetFormProps {
  petId: string;
  petName: string;
  removePetAction: (formData: FormData) => Promise<void>;
}

export default function DeletePetForm({ petId, petName, removePetAction }: DeletePetFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Sync mount cycle to avoid Next.js SSR hydration mismatches
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Define the modal layout isolated from the dropdown constraints
  const modalHTML = isOpen && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* Darkened Fullscreen Backdrop Blur */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={() => !isPending && setIsOpen(false)}
      />
      
      {/* High-Contrast Confirmation Card */}
      <div className="relative w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4 z-50 transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Remove {petName}?
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Are you sure you want to delete this pet profile? This action will permanently remove all baseline metrics and associated records from the core ledger.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsOpen(false)}
            className="px-3 py-2 text-[11px] font-bold text-slate-300 bg-[#161f30] border border-slate-800 rounded-lg hover:bg-[#1b263b] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <form 
            action={(formData) => {
              startTransition(async () => {
                await removePetAction(formData);
                setIsOpen(false);
              });
            }}
          >
            <input type="hidden" name="petId" value={petId} />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-md"
            >
              {isPending ? "Removing..." : "Confirm Delete"}
            </button>
          </form>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Safe Trigger Button inside the hover dropdown menu */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full text-left px-3 py-2 text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors relative z-10"
      >
        <Trash2 className="size-3 text-rose-500" />
        Remove
      </button>

      {/* Teleport the modal nodes directly to document.body context */}
      {mounted && typeof window !== "undefined" && modalHTML
        ? createPortal(modalHTML, document.body)
        : null}
    </>
  );
}