export type AdMode = "disabled" | "sponsor" | "adsense" | "carbon";

export interface AdSlotConfig {
  id: string;
  label: "Advertisements" | "Sponsored Links";
  reservedHeight: string;
  allowedModes: AdMode[];
}

export const AD_MODE: AdMode =
  process.env.NEXT_PUBLIC_AD_MODE === "sponsor" ||
  process.env.NEXT_PUBLIC_AD_MODE === "adsense" ||
  process.env.NEXT_PUBLIC_AD_MODE === "carbon"
    ? process.env.NEXT_PUBLIC_AD_MODE
    : "disabled";

export const AD_SLOTS = {
  guideBottomBeforeRelated: {
    id: "guide_bottom_before_related",
    label: "Sponsored Links",
    reservedHeight: "min-h-[96px]",
    allowedModes: ["sponsor", "adsense", "carbon"],
  },
  guideSidebarTop: {
    id: "guide_sidebar_top",
    label: "Advertisements",
    reservedHeight: "min-h-[120px]",
    allowedModes: ["sponsor", "carbon"],
  },
} satisfies Record<string, AdSlotConfig>;

export function isAdSlotEnabled(slot: AdSlotConfig) {
  return AD_MODE !== "disabled" && slot.allowedModes.includes(AD_MODE);
}
