import type { FormatId } from "./formats";
import { FORMATS } from "./formats";

export function pathFor(from: FormatId, to: FormatId) {
  return `/${FORMATS[from].slug}-to-${FORMATS[to].slug}`;
}
