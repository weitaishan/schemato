"use client";

import { track } from "@/lib/analytics";
import type { ReactNode } from "react";

interface Props {
  href: string;
  event: string;
  params?: Record<string, string | number | boolean | undefined>;
  className?: string;
  target?: string;
  rel?: string;
  children: ReactNode;
  ariaLabel?: string;
}

/**
 * Small tracked anchor wrapper for server-rendered pages that need click analytics.
 */
export default function TrackedLink({
  href,
  event,
  params,
  className,
  target,
  rel,
  children,
  ariaLabel,
}: Props) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      className={className}
      onClick={() => track(event, params)}
    >
      {children}
    </a>
  );
}
