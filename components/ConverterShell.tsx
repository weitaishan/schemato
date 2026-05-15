"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormatId, FormatMeta } from "@/lib/formats";

interface Props {
  from: FormatMeta;
  to: FormatMeta;
  /** 当客户端能力可用时调用 */
  initialSample: string;
  /** 是否真实可用 */
  available: boolean;
}

/**
 * 通用转换器 UI。真实转换逻辑在客户端动态加载（避免把所有 adapter 都塞进每个页面）。
 */
export default function ConverterShell({ from, to, initialSample, available }: Props) {
  const [input, setInput] = useState(initialSample);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!available) return;
    (async () => {
      try {
        // 动态加载注册中心 + 调用对应 adapter
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
              onClick={() => setInput(from.sample)}
            >
              Reset sample
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
