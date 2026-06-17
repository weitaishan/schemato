import { AD_MODE, type AdSlotConfig, isAdSlotEnabled } from "@/lib/ads";

interface Props {
  slot: AdSlotConfig;
  className?: string;
}

export default function AdSlot({ slot, className = "" }: Props) {
  if (!isAdSlotEnabled(slot)) return null;

  return (
    <aside
      className={`card ${slot.reservedHeight} p-4 text-sm text-dim ${className}`}
      aria-label={slot.label}
      data-ad-slot={slot.id}
      data-ad-mode={AD_MODE}
    >
      <div className="text-xs uppercase tracking-widest text-mute">{slot.label}</div>
      {AD_MODE === "sponsor" && (
        <p className="mt-3">
          Sponsor this developer workflow page with a privacy-friendly text ad.
        </p>
      )}
    </aside>
  );
}
