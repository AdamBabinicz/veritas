"use client";

import React from "react";
import { Activity, Check, Terminal } from "lucide-react";
import type { Dictionary } from "@/dictionaries";

export interface PipelineTrackerProps {
  t: Dictionary;
  isAnalyzing: boolean;
  hasResult: boolean;
  status: string;
  analysisStep: number;
  logLines: string[];
}

export function PipelineTracker({
  t,
  isAnalyzing,
  hasResult,
  status,
  analysisStep,
  logLines,
}: PipelineTrackerProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Nagłówek potoku ze statusem */}
        <div className="mb-5 flex items-center justify-between border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Activity className="size-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>{t.pipeline.title}</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
              isAnalyzing
                ? "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300 animate-pulse"
                : "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {status}
          </span>
        </div>

        {/* Lista kroków weryfikacji */}
        <div className="space-y-4">
          {t.pipeline.steps.map((step, i) => {
            const complete = hasResult || analysisStep > i;
            const active = isAnalyzing && analysisStep === i;

            return (
              <div key={step} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`z-10 grid size-5.5 place-items-center rounded-full border text-[10px] font-semibold transition-all ${
                      active
                        ? "border-amber-500 bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/40 animate-pulse"
                        : complete
                          ? "border-emerald-600/70 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          : "border-border bg-muted text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {complete ? (
                      <Check className="size-3 text-emerald-700 dark:text-emerald-300 stroke-[2.5]" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>

                  {i < t.pipeline.steps.length - 1 && (
                    <div
                      className={`absolute top-5.5 h-10 w-px transition-colors ${
                        complete
                          ? "bg-emerald-600/40 dark:bg-emerald-500/50"
                          : "bg-border"
                      }`}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className={`text-xs leading-snug transition-colors ${
                      complete || active
                        ? "font-semibold text-foreground"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {step}…
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    {t.pipeline.labels[i]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal logów potoku (agent.log) - zawsze ciemny styl terminala z mocnym kontrastem */}
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 font-mono text-[11px] leading-5 text-zinc-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2 text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Terminal className="size-3.5 text-emerald-400" />
            <span className="font-semibold text-zinc-100">
              {t.pipeline.log}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
            // {t.pipeline.stream}
          </span>
        </div>

        <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
          {logLines.length > 0 ? (
            logLines.map((line, idx) => (
              <div
                key={`${line}-${idx}`}
                className="flex items-start gap-1.5 break-all text-zinc-200"
              >
                <span className="text-emerald-400 font-bold shrink-0">›</span>
                <span
                  className={
                    idx === logLines.length - 1
                      ? "text-emerald-300 font-medium"
                      : "text-zinc-200"
                  }
                >
                  {line}
                </span>
              </div>
            ))
          ) : (
            <div className="space-y-1 text-zinc-300">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">›</span>
                <span>
                  {isAnalyzing ? t.pipeline.querying : t.pipeline.synced}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="text-emerald-400/80 font-bold">›</span>
                <span>{t.pipeline.complete}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
