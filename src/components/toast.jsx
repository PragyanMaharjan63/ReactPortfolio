import { CheckCircle } from "lucide-react";

export default function Toast() {
  return (
    // `fixed`, not `absolute`: the toast should sit in the viewport corner
    // regardless of where the contact section happens to be scrolled to.
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-6 z-50 flex items-center justify-center
                 gap-x-3 rounded-lg border border-line-strong bg-[#1a1a1a]
                 px-6 py-3 shadow-2xl shadow-black/50
                 sm:inset-x-auto sm:right-8 sm:bottom-8 sm:w-auto"
    >
      <CheckCircle className="size-5 shrink-0 text-emerald-400" aria-hidden="true" />
      <span className="text-sm">Form Submitted</span>
    </div>
  );
}
