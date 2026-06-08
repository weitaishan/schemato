"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormatId, FormatMeta } from "@/lib/formats";
import { samplesFor, type Sample } from "@/lib/samples";
import { events } from "@/lib/analytics";

interface Props {
  from: FormatMeta;
  to: FormatMeta;
  initialSample: string;
  available: boolean;
}

export default function ConverterShell({ from, to, initialSample, available }: Props) {
  const samples: Sample[] = useMemo(
    () => samplesFor(from.id as FormatId, initialSample),
    [from.id, initialSample],
  );
  const [activeSampleId, setActiveSampleId] = useState<string>(samples[0]?.id ?? "default");
  const activeSample = samples.find((s) => s.id === activeSampleId) ?? samples[0];

  const [input, setInput] = useState(activeSample?.code ?? initialSample);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [edited, setEdited] = useState(false);
  const [reportedSuccess, setReportedSuccess] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  // 切换样例：刷新输入区
  useEffect(() => {
    if (!activeSample) return;
    setInput(activeSample.code);
    setEdited(false);
    setReportedSuccess(false);
  }, [activeSample]);

  useEffect(() => {
    let cancelled = false;
    if (!available) return;
    (async () => {
      try {
        const mod = await import("@/lib/converters");
        const fn = mod.getConverter(from.id as FormatId, to.id as FormatId);
        if (!fn) {
          if (!cancelled) {
            setError("No converter registered.");
            setOutput("");
          }
          return;
        }
        const result = fn(input);
        if (cancelled) return;
        if (result.ok) {
          setOutput(result.code);
          setError(null);
          // 每次成功转换都上报一次（防止刷成功事件，去抖：仅在还没报过这个 sample 时报）
          if (!reportedSuccess) {
            events.convertSuccess(from.id, to.id);
            setReportedSuccess(true);
          }
        } else {
          setOutput("");
          const err = result.error ?? "Conversion failed.";
          setError(err);
          events.convertError(from.id, to.id, err);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = (e as Error).message;
          setError(msg);
          events.convertError(from.id, to.id, msg);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [input, from.id, to.id, available, reportedSuccess]);

  const placeholderOutput = useMemo(() => to.sample, [to]);
  const jsonInputTip =
    from.id === "json"
      ? "Tip: paste one JSON value, a JSON array, or NDJSON samples to infer optional fields."
      : null;
  const issueUrl = useMemo(() => {
    const title = encodeURIComponent(`Improve ${from.name} to ${to.name} conversion`);
    const body = encodeURIComponent(
      [
        `Converter: ${from.name} -> ${to.name}`,
        `Page: ${pageUrl || "current converter page"}`,
        "",
        "What input did you paste?",
        "",
        "```",
        "",
        "```",
        "",
        "What output did you expect?",
        "",
        "```",
        "",
        "```",
      ].join("\n"),
    );
    return `https://github.com/weitaishan/schemato/issues/new?title=${title}&body=${body}`;
  }, [from.name, pageUrl, to.name]);

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-panel2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-dim">
          Runs locally in your browser. Nothing you paste is uploaded to a conversion API.
        </div>
        <a
          href={issueUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => events.clickBugLink("bug")}
          className="text-sm text-accent hover:underline shrink-0"
        >
          Report output issue
        </a>
      </div>

      {/* 样例切换条 */}
      {samples.length > 1 && (
        <div className="px-4 py-3 border-b border-border bg-panel2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-widest text-mute mr-1">Examples:</span>
            {samples.map((s) => {
              const active = s.id === activeSampleId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveSampleId(s.id);
                    events.changeSample(from.id, s.id);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${
                    active
                      ? "border-accent text-text bg-bg"
                      : "border-border text-dim hover:border-accent hover:text-text"
                  }`}
                  title={s.blurb}
                >
                  {s.label}
                </button>
              );
            })}
            {edited && <span className="text-xs text-mute ml-2">(edited)</span>}
          </div>
          {activeSample && (
            <p className="text-xs text-mute mt-2">{activeSample.blurb}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="pill">Input</span>
              <span className="text-sm text-dim">{from.name}</span>
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setInput(activeSample?.code ?? from.sample);
                setEdited(false);
                events.resetInput(from.id, to.id);
              }}
            >
              Reset
            </button>
          </div>
          {jsonInputTip && <p className="text-xs text-mute mb-2">{jsonInputTip}</p>}
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (!edited) {
                events.editInput(from.id, to.id);
                setEdited(true);
              } else {
                setEdited(true);
              }
            }}
            spellCheck={false}
            className="w-full h-[420px] bg-panel2 border border-border rounded-lg p-3 font-mono text-[13px] leading-6 outline-none focus:border-accent resize-none"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="pill">Output</span>
              <span className="text-sm text-dim">{to.name}</span>
              {!available && <span className="pill text-accent border-accent">Preview only</span>}
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={async () => {
                const text = available ? output : placeholderOutput;
                try {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  events.copyOutput(from.id, to.id);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  /* noop */
                }
              }}
            >
              {copied ? "Copied" : "Copy output"}
            </button>
          </div>
          <pre className="w-full h-[420px] bg-panel2 border border-border rounded-lg p-3 code-pre">
            {available ? (
              error ? (
                <span className="text-[#fda4af]">⚠ {error}</span>
              ) : output ? (
                output
              ) : (
                <span className="text-mute">…</span>
              )
            ) : (
              <>
                <span className="text-mute">{`// Live conversion is not yet available for this pair.\n// Showing a typical ${to.name} example so you know what to expect:\n\n`}</span>
                {placeholderOutput}
              </>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
