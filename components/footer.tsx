"use client";

import React from "react";
import { Settings } from "lucide-react";
import type { Dictionary } from "@/dictionaries";

export interface FooterProps {
  t: Dictionary;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenGovernance: () => void;
}

export function Footer({
  t,
  onOpenPrivacy,
  onOpenTerms,
  onOpenGovernance,
}: FooterProps) {
  return (
    <footer className="border-t border-border py-8 text-xs text-zinc-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-semibold text-foreground text-sm">
            {t.footer.credit}
          </p>
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-300">
            {t.footer.acceleration}
          </p>
        </div>

        <nav
          aria-label="Linki prawne i konfiguracja"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end text-xs font-medium text-zinc-300"
        >
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="transition-colors hover:text-emerald-400 focus-visible:outline-hidden focus-visible:text-emerald-400 cursor-pointer"
          >
            {t.footer.privacy}
          </button>
          <button
            type="button"
            onClick={onOpenTerms}
            className="transition-colors hover:text-emerald-400 focus-visible:outline-hidden focus-visible:text-emerald-400 cursor-pointer"
          >
            {t.footer.terms}
          </button>
          <button
            type="button"
            onClick={onOpenGovernance}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-emerald-400 focus-visible:outline-hidden focus-visible:text-emerald-400 cursor-pointer"
          >
            <Settings className="size-3.5" />
            <span>{t.footer.settings}</span>
          </button>
          <span className="transition-colors hover:text-emerald-400 cursor-pointer">
            {t.footer.documentation}
          </span>
        </nav>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4 text-xs font-mono text-zinc-300">
        <span className="font-semibold text-zinc-200">{t.footer.system}</span>
        <span className="text-zinc-500">/</span>
        <span className="text-zinc-300">{t.footer.version}</span>
        <span className="hidden sm:inline text-zinc-500">·</span>
        <span className="hidden sm:inline text-zinc-300">{t.footer.logs}</span>
      </div>
    </footer>
  );
}
