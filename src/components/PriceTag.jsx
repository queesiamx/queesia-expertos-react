import { formatMXN } from "@/lib/currency";

export default function PriceTag({
  amount,
  showCode = true,
  withCents = false,
  className = "",
}) {
  if (amount == null) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showCode && (
        <span
          className="inline-flex items-center rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 ring-1 ring-slate-200"
          title="Pesos mexicanos"
          aria-label="Pesos mexicanos"
        >
          MXN
        </span>
      )}
      <span className="font-semibold text-slate-900">
        {formatMXN(amount, { withCents })}
      </span>
    </div>
  );
}
