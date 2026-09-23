"use client";

import React, { useMemo } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  Globe2,
  Link2,
  Radio,
  ShieldCheck,
} from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import { score as defaultScore, sourceConfidence } from "@/lib/demo-data";
import { MiniStat } from "@/components/workspace-views";

export type LoadedInvestigation = {
  title: string;
  claim: string;
  score: string;
  status: string;
  analysis: string;
  sources: string[];
  domain: number;
};

export interface ReportViewProps {
  t: Dictionary;
  scoreLabel: string;
  claimText: string;
  activeClaim: number;
  setActiveClaim: (n: number) => void;
  activeFilter: number;
  setActiveFilter: (n: number) => void;
  copyCard: () => void;
  copied: boolean;
  exportDossier: () => void;
  exported: boolean;
  investigation?: LoadedInvestigation | null;
  onOpenDossier: () => void;
}

export function ReportView({
  t,
  scoreLabel,
  claimText,
  activeClaim,
  setActiveClaim,
  activeFilter,
  setActiveFilter,
  copyCard,
  copied,
  exportDossier,
  exported,
  investigation,
  onOpenDossier,
}: ReportViewProps) {
  const score = investigation
    ? Number.parseInt(investigation.score, 10)
    : defaultScore;

  const parts = useMemo(() => claimText.split(" "), [claimText]);
  const dossierSources = investigation?.sources ?? Array.from(t.sourcesList);
  const dossierAnalysis = investigation?.analysis ?? t.report.dossierText;

  // Obliczenie obwodu dla wskaźnika kołowego SVG (promień r = 68, obwód = 2 * PI * 68 ≈ 427.26)
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <section
      aria-labelledby="report-section-heading"
      className="mt-5 rounded-2xl border border-border bg-card shadow-xs"
    >
      {/* Pasek nagłówkowy raportu z akcjami */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ClipboardCheck className="size-4 text-emerald-400" />
            <h2
              id="report-section-heading"
              className="text-sm font-semibold text-foreground"
            >
              {t.report.title}
            </h2>
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/20">
              {t.report.report}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-300 line-clamp-1">
            {t.report.completed} · {claimText.slice(0, 52)}…
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onOpenDossier}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 cursor-pointer"
          >
            {t.report.open}
          </button>
          <button
            type="button"
            onClick={copyCard}
            className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:text-foreground cursor-pointer"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Copy className="size-3.5 text-zinc-300" />
            )}
            <span>{copied ? t.report.copied : t.report.copy}</span>
          </button>
          <button
            type="button"
            onClick={exportDossier}
            className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-xs font-medium text-zinc-200 transition-all hover:border-emerald-500/50 hover:text-foreground active:scale-[0.98] cursor-pointer"
          >
            <Download className="size-3.5 text-zinc-300" />
            <span>{exported ? t.views.downloaded : t.report.export}</span>
          </button>
        </div>
      </div>

      {/* Główna siatka analityczna: Wskaźnik kołowy | Inspektor tekstu | Dossier */}
      <div className="grid gap-5 p-5 xl:grid-cols-[210px_1fr_300px]">
        {/* Kolumna 1: Wskaźnik zaufania (Circular Truth Meter) */}
        <div className="flex flex-col items-center justify-center border-b border-border pb-5 xl:border-b-0 xl:border-r xl:pb-0">
          <div className="relative grid size-40 place-items-center">
            <svg
              className="size-full -rotate-90"
              viewBox="0 0 160 160"
              aria-hidden="true"
            >
              {/* Tło pierścienia */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-muted/50 fill-none"
                strokeWidth="12"
              />
              {/* Pasek postępu */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-emerald-400 fill-none transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {score}%
              </span>
              <span className="mt-0.5 text-xs font-semibold text-emerald-400">
                {scoreLabel}
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-zinc-300">
            {t.report.confidence}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.report.high}</span>
          </div>
        </div>

        {/* Kolumna 2: Inspektor twierdzeń i kafelki statystyk */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {t.report.filters.map((filter, i) => (
                <button
                  type="button"
                  key={filter}
                  onClick={() => setActiveFilter(i)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    activeFilter === i
                      ? "bg-muted text-foreground border border-border"
                      : "text-zinc-400 hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <span className="text-xs text-zinc-300 font-medium">
              {t.report.count}
            </span>
          </div>

          {/* Rozłożenie tekstu na kolorowane tezy atomowe */}
          <div className="rounded-xl border border-border bg-background/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">
                {t.report.inspector}
              </span>
              <span className="text-xs text-zinc-400">{t.report.inspect}</span>
            </div>
            <p className="text-sm leading-7 text-zinc-200">
              {parts.map((word, i) => {
                const isVerified = i >= 2 && i <= 4;
                const isMisleading = i >= 13 && i <= 16;
                const isDebunked = i >= parts.length - 2;

                const highlightClass = isVerified
                  ? "cursor-pointer rounded bg-emerald-500/20 px-1 font-medium text-emerald-300 dark:text-emerald-300 border border-emerald-500/30"
                  : isMisleading
                    ? "cursor-pointer rounded bg-amber-500/20 px-1 font-medium text-amber-300 dark:text-amber-200 border border-amber-500/30"
                    : isDebunked
                      ? "cursor-pointer rounded bg-rose-500/20 px-1 font-medium text-rose-300 dark:text-rose-200 border border-rose-500/30"
                      : "";

                return (
                  <span
                    key={`${word}-${i}`}
                    className={highlightClass}
                    onClick={() => setActiveClaim(i % 3)}
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Kafelki metryk weryfikacyjnych */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat icon={<Check />} value="4" label={t.report.stats[0]} />
            <MiniStat
              icon={<AlertTriangle />}
              value="1"
              label={t.report.stats[1]}
            />
            <MiniStat
              icon={<AlertTriangle />}
              value="1"
              label={t.report.stats[2]}
            />
            <MiniStat icon={<Globe2 />} value="4" label={t.report.stats[3]} />
          </div>
        </div>

        {/* Kolumna 3: Karta dossier z ugruntowanymi źródłami Tavily */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">
                {t.report.dossier}
              </span>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                {t.report.context}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground line-clamp-2">
              {t.report.claim} {activeClaim + 1}:{" "}
              {investigation?.title ?? t.claims[0].label}
            </h3>
            <p className="mt-2 text-xs leading-5 text-zinc-300">
              {dossierAnalysis}
            </p>
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-300">
              {t.views.groundedSources}
            </p>
            <div className="space-y-2">
              {dossierSources.map((source, i) => {
                const confidence = Number.parseInt(
                  source.match(/(\d+)%/)?.[1] ??
                    String(sourceConfidence[i] ?? 85),
                  10,
                );
                return (
                  <div
                    key={source}
                    className="flex items-center justify-between text-xs text-zinc-300"
                  >
                    <span className="flex items-center gap-2 truncate pr-2">
                      <Link2 className="size-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{source}</span>
                    </span>
                    <span className="font-semibold text-emerald-400 shrink-0">
                      {confidence}%
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onOpenDossier}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <span>{t.report.open}</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Dolny pasek ugruntowania dowodowego */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-zinc-300">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Radio className="size-3" />
            <span>{t.report.grounding}</span>
          </span>
          <span className="hidden text-zinc-500 sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            <ShieldCheck className="size-3 text-emerald-400" />
            <span>{t.report.backed}</span>
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
          <input type="checkbox" className="accent-emerald-500 rounded" />
          <span>{t.report.rerun}</span>
        </label>
      </div>
    </section>
  );
}
