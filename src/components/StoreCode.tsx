import type { ActiveStoreCode } from "@/lib/store-partner-deals";

/** A partner store's exclusive code, beside its price: a label, never applied to the price or the order. */
export function StoreCode({ code }: { code: ActiveStoreCode | null }) {
  if (!code) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand px-2.5 py-1 text-xs font-semibold text-brand-strong" title={`Checked ${code.checked}`}>
      {code.offer} · code <span className="font-mono">{code.code}</span>
    </span>
  );
}
