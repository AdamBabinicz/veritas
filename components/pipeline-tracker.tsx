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
            <Activity className="size-4 text-emerald-500 animate-pulse" />
            <span>{t.pipeline.title}</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
              isAnalyzing
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400 animate-pulse"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
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
                        ? "border-amber-500 bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/30 animate-pulse"
                        : complete
                          ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-400"
                          : "border-border bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {complete ? (
                      <Check className="size-3 text-emerald-400" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>

                  {i < t.pipeline.steps.length - 1 && (
                    <div
                      className={`absolute top-5.5 h-10 w-px transition-colors ${
                        complete ? "bg-emerald-500/40" : "bg-border"
                      }`}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className={`text-xs leading-snug transition-colors ${
                      complete || active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {step}…
                  </p>
                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t.pipeline.labels[i]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal logów potoku (agent.log) */}
      <div className="mt-6 rounded-xl border border-border bg-background/90 p-3.5 font-mono text-[10px] leading-5 text-muted-foreground">
        <div className="flex items-center justify-between border-b border-border/50 pb-1.5 mb-2 text-[9px] text-muted-foreground/80">
          <div className="flex items-center gap-1.5">
            <Terminal className="size-3 text-emerald-500" />
            <span className="font-semibold text-foreground">
              {t.pipeline.log}
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-emerald-500/80">
            // {t.pipeline.stream}
          </span>
        </div>

        <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
          {logLines.length > 0 ? (
            logLines.map((line, idx) => (
              <div
                key={`${line}-${idx}`}
                className="flex items-start gap-1.5 break-all"
              >
                <span className="text-emerald-500 shrink-0">›</span>
                <span
                  className={
                    idx === logLines.length - 1
                      ? "text-emerald-300 font-medium"
                      : ""
                  }
                >
                  {line}
                </span>
              </div>
            ))
          ) : (
            <div className="space-y-1 text-muted-foreground/60">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500">›</span>
                <span>
                  {isAnalyzing ? t.pipeline.querying : t.pipeline.synced}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground/40">
                <span className="text-emerald-500/60">›</span>
                <span>{t.pipeline.complete}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
