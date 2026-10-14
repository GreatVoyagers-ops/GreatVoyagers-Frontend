import { LoaderCircle } from "lucide-react";

export default function PageLoader({ label = "Loading", className = "min-h-[60vh]" }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-3 text-sm font-semibold text-ink-600 ${className}`}>
      <LoaderCircle className="h-5 w-5 animate-spin text-terra-500" aria-hidden="true" />
      {label}…
    </div>
  );
}
