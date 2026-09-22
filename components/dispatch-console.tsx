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
    <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
      {/* Pasek tytułowy konsoli */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Sparkles className="size-4 text-emerald-500" />
          <span>{t.dispatch.title}</span>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
          <Clock3 className="size-3" />
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
            className={`rounded-t-lg px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === i
                ? "border-b-2 border-emerald-500 text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
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
              className="min-h-[130px] w-full resize-none rounded-xl border border-border bg-background p-4 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500/50"
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
                  className="rounded-lg border border-border bg-muted/70 px-3 py-2 text-xs text-foreground outline-none cursor-pointer hover:border-border/80"
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
                <span className="text-[10px] text-muted-foreground">
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
              <Link2 className="size-4 shrink-0 text-emerald-500" />
              <input
                aria-label={t.dispatch.urlPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder={t.dispatch.urlPlaceholder}
              />
              <button
                type="button"
                onClick={() => setInput(t.dispatch.sampleUrl)}
                className="shrink-0 rounded-lg bg-emerald-400 px-3 py-2 text-[10px] font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 cursor-pointer"
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
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
                    socialPlatform === platform
                      ? "border-emerald-500/80 bg-emerald-500/10 text-emerald-400"
                      : "border-border bg-card/40 text-muted-foreground hover:text-foreground"
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
              className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-emerald-500/50"
              placeholder={t.dispatch.socialPlaceholder}
            />
          </div>
        )}

        {/* Pasek z licznikiem znaków i głównym przyciskiem wysłania */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <span className="text-[10px] text-muted-foreground">
            {input.length} {t.dispatch.charCount}
          </span>

          <button
            type="button"
            onClick={onRunVerification}
            disabled={isAnalyzing || !input.trim()}
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-xs font-semibold text-emerald-950 shadow-md shadow-emerald-400/10 transition-all hover:bg-emerald-300 hover:shadow-emerald-400/20 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
          >
            {isAnalyzing ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Zap className="size-4 fill-emerald-950" />
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
              className="rounded-full border border-border bg-muted/20 px-3 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-emerald-500/40 hover:text-emerald-400 cursor-pointer"
            >
              {demo.label}
            </button>
          ))}
        </div>

        {/* Dedykowana sekcja z promptami dla jury hackathonu */}
        {t.dispatch.juryPrompts && t.dispatch.juryPrompts.length > 0 && (
          <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              {t.dispatch.jurySectionTitle}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {t.dispatch.juryPrompts.map((item, idx) => (
                <button
                  key={`${item.label}-${idx}`}
                  type="button"
                  onClick={() =>
                    handleSelectJuryPrompt(item.text, item.domainIndex)
                  }
                  className="group rounded-lg border border-border/80 bg-card p-2.5 text-left transition-all hover:border-emerald-500/50 hover:bg-muted/40 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <ArrowUpRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-1 text-xs font-medium text-foreground group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {item.label}
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
