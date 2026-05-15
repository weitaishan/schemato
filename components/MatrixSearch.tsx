"use client";

import { useMemo, useState } from "react";

interface ConversionEntry {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  href: string;
  live: boolean;
}

interface Props {
  entries: ConversionEntry[];
}

export default function MatrixSearch({ entries }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "live">("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter === "live" && !e.live) return false;
      if (!term) return true;
      const hay = `${e.fromName} ${e.toName} ${e.from} ${e.to}`.toLowerCase();
      return hay.includes(term);
    });
  }, [q, filter, entries]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search e.g. 'json zod' or 'go struct'…"
            className="w-full bg-panel2 border border-border rounded-lg px-4 py-2.5 outline-none focus:border-accent"
            aria-label="Search converters"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-text"
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`btn-ghost ${filter === "all" ? "border-accent text-text" : ""}`}
          >
            All ({entries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("live")}
            className={`btn-ghost ${filter === "live" ? "border-accent text-text" : ""}`}
          >
            Live ({entries.filter((e) => e.live).length})
          </button>
        </div>
      </div>
      <p className="text-mute text-sm mb-3">
        {filtered.length} {filtered.length === 1 ? "match" : "matches"}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {filtered.map((e) => (
          <a
            key={`${e.from}-${e.to}`}
            href={e.href}
            className="card px-3 py-3 hover:border-accent transition flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {e.fromName} → {e.toName}
              </div>
              <div className="text-xs text-mute truncate">{e.live ? "Live" : "Preview"}</div>
            </div>
            {e.live && <span className="h-2 w-2 rounded-full bg-accent2 shrink-0" aria-hidden />}
          </a>
        ))}
      </div>
    </div>
  );
}
