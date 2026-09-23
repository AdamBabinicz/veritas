"use client";

import React from "react";
import { Settings, ExternalLink } from "lucide-react";
import type { Dictionary } from "@/dictionaries";

export interface FooterProps {
  t: Dictionary;
  locale?: "pl" | "en";
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenGovernance: () => void;
}

export function Footer({
  t,
  locale,
  onOpenPrivacy,
  onOpenTerms,
  onOpenGovernance,
}: FooterProps) {
  // Jeśli locale to "pl" lub tekst dokumentacji jest po polsku, kierujemy do wersji polskiej
  const isPolish =
    locale === "pl" ||
    t.footer.documentation.toLowerCase().includes("dokumentacj");
  const docUrl = isPolish
    ? "https://github.com/AdamBabinicz/veritas/blob/main/README.pl.md"
    : "https://github.com/AdamBabinicz/veritas#readme";

  return (
    <footer className="border-t border-border py-8 text-xs text-zinc-600 dark:text-zinc-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-semibold text-foreground text-sm">
            {t.footer.credit}
          </p>
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
            {t.footer.acceleration}
          </p>
        </div>

        <nav
          aria-label="Linki prawne i konfiguracja"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end text-xs font-medium text-zinc-600 dark:text-zinc-300"
        >
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
          >
            {t.footer.privacy}
          </button>
          <button
            type="button"
            onClick={onOpenTerms}
            className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
          >
            {t.footer.terms}
          </button>
          <button
            type="button"
            onClick={onOpenGovernance}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
          >
            <Settings className="size-3.5" />
            <span>{t.footer.settings}</span>
          </button>
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.footer.documentation} (GitHub - ${isPolish ? "wersja polska" : "English version"})`}
            className="inline-flex items-center gap-1 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
          >
            <span>{t.footer.documentation}</span>
            <ExternalLink className="size-3 opacity-70" />
          </a>
        </nav>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4 text-xs font-mono text-zinc-600 dark:text-zinc-300">
        <span className="font-semibold text-foreground">{t.footer.system}</span>
        <span className="text-zinc-400 dark:text-zinc-500">/</span>
        <span className="text-zinc-600 dark:text-zinc-300">
          {t.footer.version}
        </span>
        <span className="hidden sm:inline text-zinc-400 dark:text-zinc-500">
          ·
        </span>
        <span className="hidden sm:inline text-zinc-600 dark:text-zinc-300">
          {t.footer.logs}
        </span>
      </div>
    </footer>
  );
}
