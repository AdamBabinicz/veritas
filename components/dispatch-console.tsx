"use client";

import React from "react";
import {
  ArrowUpRight,
  Clock3,
  Link2,
  LoaderCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import type { Dictionary } from "@/dictionaries";

export interface DispatchConsoleProps {
  t: Dictionary;
  input: string;
  setInput: (value: string) => void;
  domain: number;
  setDomain: (value: number) => void;
  activeTab: number;
  setActiveTab: (tabIndex: number) => void;
  socialPlatform: string;
  setSocialPlatform: (platform: string) => void;
  isAnalyzing: boolean;
  onRunVerification: () => void;
}

export function DispatchConsole({
  t,
  input,
  setInput,
  domain,
  setDomain,
  activeTab,
  setActiveTab,
  socialPlatform,
  setSocialPlatform,
  isAnalyzing,
  onRunVerification,
}: DispatchConsoleProps) {
  const tabs = t.dispatch.tabs;

  const handleSelectJuryPrompt = (promptText: string, domainIndex: number) => {
    setInput(promptText);
    setDomain(domainIndex);
    setActiveTab(0);
  };

  return (
    <section
      aria-labelledby="dispatch-console-heading"
      className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/5 dark:shadow-black/20"
    >
      {/* Pasek tytułowy konsoli */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
          <h2
            id="dispatch-console-heading"
            className="text-sm font-semibold text-foreground"
          >
            {t.dispatch.title}
          </h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
          <Clock3 className="size-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>{t.dispatch.average}</span>
        </span>
      </div>

      {/* Zakładki: Tekst / URL / Social */}
      <div className="flex gap-1 border-b border-border px-4 pt-3">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === i
                ? "border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300"
                : "text-zinc-500 hover:text-foreground dark:text-zinc-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Zakładka 0: Wklej tekst */}
        {activeTab === 0 && (
          <div>
            <textarea
              aria-label={t.dispatch.textPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[130px] w-full resize-none rounded-xl border border-border bg-background p-4 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500/60"
              placeholder={t.dispatch.textPlaceholder}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="domain-select" className="sr-only">
                  {t.dispatch.selectDomainAria}
                </label>
                <select
                  id="domain-select"
                  aria-label={t.dispatch.selectDomainAria}
                  value={domain}
                  onChange={(e) => setDomain(Number(e.target.value))}
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground outline-none cursor-pointer hover:border-border/90"
                >
                  {t.dispatch.domains.map((item, i) => (
                    <option
                      key={item}
                      value={i}
                      className="bg-popover text-popover-foreground"
                    >
                      {item}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                  {input.length} / 10,000
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Zakładka 1: Wprowadź URL */}
        {activeTab === 1 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3">
              <Link2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <input
                aria-label={t.dispatch.urlPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-zinc-400"
                placeholder={t.dispatch.urlPlaceholder}
              />
              <button
                type="button"
                onClick={() => setInput(t.dispatch.sampleUrl)}
                className="shrink-0 rounded-lg bg-emerald-500 dark:bg-emerald-400 px-3 py-2 text-xs font-semibold text-white dark:text-emerald-950 transition-colors hover:bg-emerald-600 dark:hover:bg-emerald-300 cursor-pointer"
              >
                {t.common.fetchArticle}
              </button>
            </div>
          </div>
        )}

        {/* Zakładka 2: Post społecznościowy */}
        {activeTab === 2 && (
          <div className="space-y-3 rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap gap-2">
              {t.dispatch.socialPlatforms.map((platform) => (
                <button
                  type="button"
                  key={platform}
                  onClick={() => setSocialPlatform(platform)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    socialPlatform === platform
                      ? "border-emerald-600/80 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-card text-zinc-600 hover:text-foreground dark:text-zinc-300"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
            <input
              aria-label={t.dispatch.socialPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground outline-none placeholder:text-zinc-400 focus:border-emerald-500/60"
              placeholder={t.dispatch.socialPlaceholder}
            />
          </div>
        )}

        {/* Pasek z licznikiem znaków i głównym przyciskiem wysłania */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
            {input.length} {t.dispatch.charCount}
          </span>

          <button
            type="button"
            onClick={onRunVerification}
            disabled={isAnalyzing || !input.trim()}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 dark:bg-emerald-400 px-5 py-2.5 text-xs font-semibold text-white dark:text-emerald-950 shadow-md shadow-emerald-500/10 transition-all hover:bg-emerald-600 dark:hover:bg-emerald-300 hover:shadow-emerald-500/20 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
          >
            {isAnalyzing ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Zap className="size-4 fill-white dark:fill-emerald-950" />
            )}
            <span>
              {isAnalyzing ? t.dispatch.reasoning : t.dispatch.deploy}
            </span>
            <ArrowUpRight className="size-4" />
          </button>
        </div>

        {/* Pigułki standardowych próbek */}
        <div className="mt-4 flex flex-wrap gap-2">
          {t.claims.map((demo) => (
            <button
              key={demo.label}
              type="button"
              onClick={() => {
                setInput(demo.text);
                setActiveTab(0);
              }}
              className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-300 cursor-pointer"
            >
              {demo.label}
            </button>
          ))}
        </div>

        {/* Dedykowana sekcja z wzorcowymi scenariuszami */}
        {t.dispatch.juryPrompts && t.dispatch.juryPrompts.length > 0 && (
          <div className="mt-5 rounded-xl border border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              {t.dispatch.jurySectionTitle}
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {t.dispatch.juryPrompts.map((item, idx) => (
                <button
                  key={`${item.label}-${idx}`}
                  type="button"
                  onClick={() =>
                    handleSelectJuryPrompt(item.text, item.domainIndex)
                  }
                  className="group rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-emerald-500/60 hover:bg-muted/50 cursor-pointer block w-full"
                >
                  <span className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <ArrowUpRight className="size-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed font-normal">
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
