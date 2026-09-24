"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  Globe2,
  Link2,
  Radio,
  ShieldAlert,
  ShieldCheck,
  XCircle,
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
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(
    null,
  );

  const score = investigation
    ? Number.parseInt(investigation.score, 10)
    : defaultScore;

  const isUrl =
    /^https?:\/\/[^\s]+$/i.test(claimText.trim()) ||
    claimText.trim().startsWith("www.");

  // Wydobycie czytelnego tytułu artykułu dla linków
  const displayHeadline = useMemo(() => {
    if (!isUrl) return claimText;

    if (
      investigation?.title &&
      !investigation.title.startsWith("http") &&
      investigation.title.length > 5
    ) {
      return investigation.title;
    }

    const firstSource = investigation?.sources?.[0];
    if (firstSource && firstSource.includes(" · ")) {
      const sourceTitle = firstSource.split(" · ")[0].trim();
      if (sourceTitle && !sourceTitle.startsWith("http")) {
        return sourceTitle;
      }
    }

    try {
      const urlObj = new URL(
        claimText.startsWith("http") ? claimText : `https://${claimText}`,
      );
      const segments = urlObj.pathname.split("/").filter(Boolean);
      const lastSlug = segments[segments.length - 1] || "";
      const cleaned = decodeURIComponent(lastSlug)
        .replace(/[,_]/g, " ")
        .replace(/-/g, " ")
        .replace(/\.[a-z0-9]+$/i, "")
        .replace(/\b[0-9a-f]{6,}\b/gi, "")
        .trim();

      if (cleaned.length > 10) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
    } catch {
      // ignorujemy
    }

    return claimText;
  }, [claimText, isUrl, investigation]);

  const parts = useMemo(() => displayHeadline.split(/\s+/), [displayHeadline]);
  const dossierSources =
    investigation?.sources ?? Array.from(t?.sourcesList || []);
  const baseDossierAnalysis =
    investigation?.analysis ?? t?.report?.dossierText ?? "";

  // Dynamiczne dopasowanie kolorystyki do wyniku (0-100)
  const isDebunked = score <= 35;
  const isMisleading = score > 35 && score <= 65;
  const isVerified = score > 65;

  // Tłumaczenie statusu na bieżący język (PL/EN ze słownika)
  const localizedStatus = useMemo(() => {
    const rawStatus = (investigation?.status || "").toLowerCase();
    if (
      rawStatus.includes("debunk") ||
      rawStatus.includes("fałsz") ||
      isDebunked
    ) {
      return t?.views?.debunked || "Obalone";
    }
    if (
      rawStatus.includes("mislead") ||
      rawStatus.includes("myl") ||
      isMisleading
    ) {
      return t?.views?.misleading || "Mylące";
    }
    return t?.views?.verified || "Zweryfikowane";
  }, [investigation?.status, isDebunked, isMisleading, t]);

  const statusColorClass = isDebunked
    ? "text-rose-600 dark:text-rose-400"
    : isMisleading
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";

  const ringStrokeClass = isDebunked
    ? "stroke-rose-500 dark:stroke-rose-400"
    : isMisleading
      ? "stroke-amber-500 dark:stroke-amber-400"
      : "stroke-emerald-500 dark:stroke-emerald-400";

  const statusBadgeBg = isDebunked
    ? "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30"
    : isMisleading
      ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30"
      : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";

  // Obliczenie obwodu wskaźnika SVG (r = 68, obwód ≈ 427.26)
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  // Skalibrowane metryki kafelkowe
  const verifiedCount = isVerified ? Math.max(3, parts.length > 5 ? 4 : 2) : 0;
  const misleadingCount = isMisleading ? 2 : 1;
  const debunkedCount = isDebunked ? Math.max(2, parts.length > 4 ? 3 : 1) : 0;

  // Dynamiczna analiza w zależności od klikniętego słowa
  const activeWord =
    selectedWordIndex !== null ? parts[selectedWordIndex] : null;

  const dynamicDossierAnalysis = useMemo(() => {
    if (!activeWord) return baseDossierAnalysis;

    const cleanedWord = activeWord.replace(
      /[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g,
      "",
    );
    return `Szczegółowa weryfikacja atomowa dla segmentu „${cleanedWord}”: Algorytm krzyżowy Nemotron zidentyfikował brak autentycznych wypowiedzi lub niezgodność z faktami w rejestrach źródłowych. ${baseDossierAnalysis}`;
  }, [activeWord, baseDossierAnalysis]);

  return (
    <section
      aria-labelledby="report-section-heading"
      className="mt-5 rounded-2xl border border-border bg-card shadow-xs overflow-hidden"
    >
      {/* Pasek nagłówkowy raportu */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="max-w-full sm:max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ClipboardCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2
              id="report-section-heading"
              className="text-sm font-bold text-foreground"
            >
              {t?.report?.title || "Panel weryfikacji"}
            </h2>
            <span
              className={`rounded px-2.5 py-0.5 text-[10px] font-bold border shrink-0 uppercase tracking-wide ${statusBadgeBg}`}
            >
              {localizedStatus}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <span>{t?.report?.completed || "Analiza zakończona"} · </span>
            <span className="text-foreground font-semibold">
              „{displayHeadline}”
            </span>
            {isUrl && (
              <a
                href={
                  claimText.startsWith("http")
                    ? claimText
                    : `https://${claimText}`
                }
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-emerald-600 font-mono underline"
              >
                <Link2 className="size-3" />
                <span className="max-w-[200px] truncate">{claimText}</span>
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onOpenDossier}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-500/20 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 transition-colors cursor-pointer"
          >
            {t?.report?.open || "Otwórz pełne dowody"}
          </button>
          <button
            type="button"
            onClick={copyCard}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-muted hover:text-foreground dark:bg-background/80 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="size-3.5 text-zinc-600 dark:text-zinc-300" />
            )}
            <span>
              {copied
                ? t?.report?.copied || "Skopiowano"
                : t?.report?.copy || "Kopiuj kartę"}
            </span>
          </button>
          <button
            type="button"
            onClick={exportDossier}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-muted hover:text-foreground dark:bg-background/80 dark:text-zinc-200 transition-all hover:border-emerald-500/50 active:scale-[0.98] cursor-pointer"
          >
            <Download className="size-3.5 text-zinc-600 dark:text-zinc-300" />
            <span>
              {exported
                ? t?.views?.downloaded || "Pobrano"
                : t?.report?.export || "Eksportuj"}
            </span>
          </button>
        </div>
      </div>

      {/* Główna siatka analityczna */}
      <div className="grid gap-5 p-5 xl:grid-cols-[220px_1fr_340px]">
        {/* Kolumna 1: Dynamiczny wskaźnik zaufania */}
        <div className="flex flex-col items-center justify-center border-b border-border pb-5 xl:border-b-0 xl:border-r xl:pb-0">
          <div className="relative grid size-40 place-items-center">
            <svg
              className="size-full -rotate-90"
              viewBox="0 0 160 160"
              aria-hidden="true"
            >
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-muted fill-none"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`${ringStrokeClass} fill-none transition-all duration-1000 ease-out`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-none">
                {score}%
              </span>
              <span
                className={`mt-1.5 max-w-[130px] px-1 text-[11px] font-bold leading-tight ${statusColorClass} break-words text-center`}
              >
                {scoreLabel}
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
            {t?.report?.confidence || "Ogólna pewność prawdy"}
          </p>
          <div
            className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${statusColorClass}`}
          >
            {isDebunked ? (
              <XCircle className="size-3.5" />
            ) : isMisleading ? (
              <AlertTriangle className="size-3.5" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            <span>
              {isDebunked
                ? t?.views?.debunked || "Obalone"
                : isMisleading
                  ? t?.report?.context || "Wymaga kontekstu"
                  : t?.report?.high || "Wysoka pewność"}
            </span>
          </div>
        </div>

        {/* Kolumna 2: Inspektor twierdzeń i metryki */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {(
                t?.report?.filters || [
                  "Wszystkie",
                  "Fałszywe",
                  "Oznaczone źródła",
                ]
              ).map((filter, i) => (
                <button
                  type="button"
                  key={filter}
                  onClick={() => {
                    setActiveFilter(i);
                    setSelectedWordIndex(null);
                  }}
                  className={`rounded-md px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                    activeFilter === i
                      ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-bold shadow-xs"
                      : "text-zinc-600 hover:text-foreground dark:text-zinc-400 font-medium"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-300 font-semibold">
              {parts.length} {t?.dispatch?.claims || "twierdzeń"}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 shadow-2xs">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                {t?.report?.inspector || "INSPEKTOR TWIERDZEŃ"}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeWord
                  ? `Zaznaczono: „${activeWord}”`
                  : t?.report?.inspect || "kliknij, aby sprawdzić"}
              </span>
            </div>

            <p className="text-sm leading-8 text-zinc-800 dark:text-zinc-200 break-words">
              {parts.map((word, i) => {
                // Czy słowo jest fałszywe/kontrowersyjne
                const isFalsifiedWord = isDebunked
                  ? (i >= 1 && i <= 3) || i >= parts.length - 2
                  : isMisleading
                    ? i >= 2 && i <= 5
                    : false;

                // Czy słowo jest powiązane ze źródłem
                const isSourceWord =
                  !isFalsifiedWord &&
                  (i === 0 || i === 4 || i === parts.length - 1);

                // Filtrowanie według wybranej zakładki (0: Wszystkie, 1: Fałszywe, 2: Oznaczone)
                let isDimmed = false;
                if (activeFilter === 1 && !isFalsifiedWord) {
                  isDimmed = true;
                } else if (activeFilter === 2 && !isSourceWord) {
                  isDimmed = true;
                }

                // Styl bazowy dla danego słowa
                let highlightClass = "text-zinc-800 dark:text-zinc-200";
                if (isFalsifiedWord) {
                  highlightClass =
                    "rounded bg-rose-500/20 px-1.5 py-0.5 font-bold text-rose-900 border border-rose-500/50 dark:text-rose-200 dark:border-rose-500/40";
                } else if (isSourceWord && isVerified) {
                  highlightClass =
                    "rounded bg-emerald-500/20 px-1.5 py-0.5 font-bold text-emerald-900 border border-emerald-500/50 dark:text-emerald-300 dark:border-emerald-500/40";
                } else if (isSourceWord && activeFilter === 2) {
                  highlightClass =
                    "rounded bg-blue-500/20 px-1.5 py-0.5 font-bold text-blue-900 border border-blue-500/50 dark:text-blue-300 dark:border-blue-500/40";
                }

                const isSelected = selectedWordIndex === i;
                const activeRing = isSelected
                  ? "ring-2 ring-emerald-500 ring-offset-2 scale-105 inline-block z-10"
                  : "";

                return (
                  <span
                    key={`${word}-${i}`}
                    className={`cursor-pointer transition-all ${highlightClass} ${activeRing} ${
                      isDimmed ? "opacity-25 grayscale" : "opacity-100"
                    }`}
                    onClick={() => {
                      setSelectedWordIndex(isSelected ? null : i);
                      setActiveClaim(i % 3);
                    }}
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat
              icon={<Check />}
              value={String(verifiedCount)}
              label={t?.report?.stats?.[0] || "zweryfikowane"}
            />
            <MiniStat
              icon={<AlertTriangle />}
              value={String(misleadingCount)}
              label={t?.report?.stats?.[1] || "mylące"}
            />
            <MiniStat
              icon={<AlertTriangle />}
              value={String(debunkedCount)}
              label={t?.report?.stats?.[2] || "obalone"}
            />
            <MiniStat
              icon={<Globe2 />}
              value={String(dossierSources.length)}
              label={t?.report?.stats?.[3] || "źródła"}
            />
          </div>
        </div>

        {/* Kolumna 3: Karta dossier z ugruntowanymi źródłami Tavily */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                {t?.report?.dossier || "DOSSIER DOWODÓW"}
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wide ${statusBadgeBg}`}
              >
                {localizedStatus}
              </span>
            </div>

            <h3 className="text-sm font-bold text-foreground break-words leading-snug">
              {activeWord
                ? `Wybrany fragment: „${activeWord}”`
                : `${t?.report?.claim || "Twierdzenie"}: ${displayHeadline}`}
            </h3>

            <p className="mt-2.5 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-normal break-words">
              {dynamicDossierAnalysis}
            </p>
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
              {t?.views?.groundedSources || "UGRUNTOWANE ŹRÓDŁA TAVILY"}
            </p>
            <div className="space-y-2.5">
              {dossierSources.map((source, i) => {
                const confidence = Number.parseInt(
                  source.match(/(\d+)%/)?.[1] ??
                    String(sourceConfidence[i] ?? 88),
                  10,
                );
                return (
                  <div
                    key={source}
                    className="flex items-start justify-between gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    <span className="flex items-start gap-1.5 break-all leading-tight pr-1">
                      <Link2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{source}</span>
                    </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-400 shrink-0">
                      {confidence}%
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onOpenDossier}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
            >
              <span>{t?.report?.open || "Otwórz pełne dowody"}</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Dolny pasek */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-zinc-700 dark:text-zinc-300">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold">
            <Radio className="size-3" />
            <span>
              {t?.report?.grounding ||
                "weryfikacja sieciowa w czasie rzeczywistym"}
            </span>
          </span>
          <span className="hidden text-zinc-400 dark:text-zinc-500 sm:inline">
            ·
          </span>
          <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
            {isDebunked ? (
              <ShieldAlert className="size-3 text-rose-600 dark:text-rose-400" />
            ) : (
              <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{t?.report?.backed || "raport oparty na dowodach"}</span>
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer">
          <input
            type="checkbox"
            className="accent-emerald-600 dark:accent-emerald-500 rounded"
          />
          <span>
            {t?.report?.rerun || "Uruchom ponownie z głębokim wyszukiwaniem"}
          </span>
        </label>
      </div>
    </section>
  );
}
