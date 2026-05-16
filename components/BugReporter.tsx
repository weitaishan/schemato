"use client";

import { useEffect, useState } from "react";

interface Props {
  /** 仓库 issues 链接前缀 */
  repoIssuesUrl: string;
}

/**
 * 右下角浮动按钮：让用户一键到 GitHub Issues 报 bug 或提需求。
 * 自动带上当前 URL 作为 issue 模板的一部分。
 */
export default function BugReporter({ repoIssuesUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  const buildHref = (template: { title: string; body: string; labels?: string[] }) => {
    const params = new URLSearchParams({
      title: template.title,
      body: template.body,
    });
    if (template.labels && template.labels.length > 0) {
      params.append("labels", template.labels.join(","));
    }
    return `${repoIssuesUrl}/new?${params.toString()}`;
  };

  const bugHref = buildHref({
    title: "[Bug] ",
    body: `## What happened\n\n\n## Page\n\n${pageUrl}\n\n## Input that caused the issue\n\n\`\`\`\n\n\`\`\`\n\n## Expected output\n\n\`\`\`\n\n\`\`\`\n`,
    labels: ["bug"],
  });

  const featureHref = buildHref({
    title: "[Feature] ",
    body: `## What you want\n\n\n## Page where this would help\n\n${pageUrl}\n\n## Why\n`,
    labels: ["enhancement"],
  });

  const conversionHref = buildHref({
    title: "[New conversion] ",
    body: `## Conversion\n\nFrom: \nTo: \n\n## Use case\n\n\n## Sample input\n\n\`\`\`\n\n\`\`\`\n\n## Expected output\n\n\`\`\`\n\n\`\`\`\n`,
    labels: ["new-converter"],
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      {open && (
        <div
          className="card p-3 mb-2 w-64 shadow-lg"
          role="dialog"
          aria-label="Report"
        >
          <p className="text-xs uppercase tracking-widest text-mute mb-2">Report</p>
          <a
            href={bugHref}
            target="_blank"
            rel="noreferrer"
            className="block px-3 py-2 rounded-lg hover:bg-panel2 text-sm border border-transparent hover:border-border"
          >
            <div className="font-medium">🐛 Report a bug</div>
            <div className="text-xs text-mute mt-0.5">Wrong output? Crash?</div>
          </a>
          <a
            href={conversionHref}
            target="_blank"
            rel="noreferrer"
            className="block px-3 py-2 rounded-lg hover:bg-panel2 text-sm border border-transparent hover:border-border mt-1"
          >
            <div className="font-medium">➕ Request a conversion</div>
            <div className="text-xs text-mute mt-0.5">Missing X → Y?</div>
          </a>
          <a
            href={featureHref}
            target="_blank"
            rel="noreferrer"
            className="block px-3 py-2 rounded-lg hover:bg-panel2 text-sm border border-transparent hover:border-border mt-1"
          >
            <div className="font-medium">💡 Request a feature</div>
            <div className="text-xs text-mute mt-0.5">Anything else</div>
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-mute hover:text-text mt-2 w-full text-center"
          >
            Close
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-full bg-panel border border-border hover:border-accent transition px-4 py-2.5 shadow-lg text-sm flex items-center gap-2"
        aria-label={open ? "Close report menu" : "Report a bug or request a feature"}
        aria-expanded={open}
      >
        <span aria-hidden>{open ? "×" : "✦"}</span>
        <span className="hidden sm:inline">{open ? "Close" : "Found a bug?"}</span>
      </button>
    </div>
  );
}
