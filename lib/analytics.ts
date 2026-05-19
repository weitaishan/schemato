// Shared GA4 event wrapper. Guard browser globals because pages also render at build time.

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_MEASUREMENT_ID = "G-EZV1839JH7";

type EventParams = Record<string, string | number | boolean | undefined>;

export function track(eventName: string, params?: EventParams) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  // GA4 standard form: gtag('event', name, params)
  window.gtag("event", eventName, params ?? {});
}

// Product event helpers keep call sites readable and avoid repeated magic strings.

export const events = {
  // Conversion flow
  convertSuccess: (from: string, to: string) =>
    track("convert_success", { from, to }),
  convertError: (from: string, to: string, error: string) =>
    track("convert_error", { from, to, error: error.slice(0, 100) }),
  copyOutput: (from: string, to: string) =>
    track("copy_output", { from, to }),
  changeSample: (from: string, sampleId: string) =>
    track("change_sample", { from, sample_id: sampleId }),
  resetInput: (from: string, to: string) =>
    track("reset_input", { from, to }),
  editInput: (from: string, to: string) =>
    track("edit_input", { from, to }),

  // Navigation
  clickConverterCard: (from: string, to: string, location: string) =>
    track("click_converter_card", { from, to, location }),
  clickRelated: (from: string, to: string) =>
    track("click_related", { from, to }),
  clickHubFromHome: (input: string) =>
    track("click_hub_from_home", { input }),
  search: (query: string) =>
    track("search", { query: query.slice(0, 60) }),

  // Outbound links / feedback
  clickGithub: (location: string) => track("click_github", { location }),
  openBugMenu: () => track("open_bug_menu"),
  clickBugLink: (kind: "bug" | "feature" | "conversion") =>
    track("click_bug_link", { kind }),

  // CTA
  clickHeroCta: (cta: string) => track("click_hero_cta", { cta }),
  clickGuideFromHome: (slug: string) => track("click_guide_from_home", { slug }),
};
