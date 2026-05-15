"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormatId, FormatMeta } from "@/lib/formats";
import { samplesFor, type Sample } from "@/lib/samples";

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

  // 切换样例：刷新输入区
  useEffect(() => {
    if (!activeSample) return;
    setInput(activeSample.code);
    setEdited(false);
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
        } else {
          setOutput("");
          setError(result.error ?? "Conversion failed.");
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [input, from.id, to.id, available]);

  const placeholderOutput = useMemo(() => to.sample, [to]);

  return (
    <div className="card p-0 overflow-hidden">
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
                  onClick={() => setActiveSampleId(s.id)}
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
              }}
            >
              Reset
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setEdited(true);
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
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  /* noop */
                }
              }}
            >
              {copied ? "Copied" : "Copy"}
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
