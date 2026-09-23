"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import type { Dictionary, Locale } from "@/dictionaries";

export interface HeaderProps {
  t: Dictionary;
  locale: Locale;
  onSelectLocale: (locale: Locale) => void;
  dark: boolean;
  onToggleDark: () => void;
  activeView: number;
  setActiveView: (viewIndex: number) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onSelectSample: (text: string) => void;
}

export function Header({
  t,
  locale,
  onSelectLocale,
  dark,
  onToggleDark,
  activeView,
  setActiveView,
  menuOpen,
  setMenuOpen,
  onSelectSample,
}: HeaderProps) {
  const [samplesOpen, setSamplesOpen] = useState(false);

  const navItems = [
    t.nav.dashboard,
    t.nav.investigations,
    t.nav.repository,
    t.nav.api,
  ];

  return (
    <div className="relative flex min-h-[74px] items-center justify-between">
      {/* Lewa strona: Logo VeritasAI + Nawigacja desktopowa */}
      <div className="flex items-center gap-8 min-w-0">
        <button
          type="button"
          className="flex items-center gap-2.5 cursor-pointer shrink-0 text-left"
          onClick={() => {
            setActiveView(0);
            setMenuOpen(false);
          }}
        >
          <span className="relative grid size-9 place-items-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 shadow-xs shrink-0">
            <ShieldCheck
              className="size-[19px] text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
            <span className="absolute right-1 top-1 size-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-foreground whitespace-nowrap">
            Veritas
            <span className="text-emerald-600 dark:text-emerald-400">AI</span>
          </span>
        </button>

        {/* Nawigacja desktopowa (lg+) */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Główna nawigacja"
        >
          {navItems.map((item, i) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveView(i)}
              className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-all hover:brightness-105 active:scale-[0.98] ${
                activeView === i
                  ? "bg-muted text-foreground font-bold shadow-2xs border border-border"
                  : "text-zinc-600 hover:bg-muted hover:text-foreground dark:text-zinc-300"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Prawa strona: Kontrolki, silnik, język, motyw i hamburger */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Pigułka silnika hackathonowego (ukryta na małych ekranach) */}
        <div className="hidden items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-zinc-700 font-medium dark:bg-muted/60 dark:text-zinc-300 xl:flex">
          <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
          <span className="font-bold text-foreground">{t.nav.engineBadge}</span>
          <span className="text-zinc-400 dark:text-zinc-500">·</span>
          <span className="text-zinc-600 dark:text-zinc-300 font-medium">
            {t.views.tavilyGrounded}
          </span>
        </div>

        {/* Przełącznik języka PL / EN */}
        <div className="flex items-center rounded-lg border border-border bg-card/80 text-xs font-semibold p-0.5 dark:bg-muted/60">
          <button
            type="button"
            aria-label={t.nav.polish}
            onClick={() => onSelectLocale("pl")}
            className={`px-2 py-1 rounded-md transition-colors cursor-pointer text-[11px] sm:text-xs ${
              locale === "pl"
                ? "bg-muted text-emerald-700 font-bold shadow-2xs dark:bg-background dark:text-emerald-400"
                : "text-zinc-600 hover:text-foreground dark:text-zinc-300"
            }`}
          >
            PL
          </button>
          <button
            type="button"
            aria-label={t.nav.english}
            onClick={() => onSelectLocale("en")}
            className={`px-2 py-1 rounded-md transition-colors cursor-pointer text-[11px] sm:text-xs ${
              locale === "en"
                ? "bg-muted text-emerald-700 font-bold shadow-2xs dark:bg-background dark:text-emerald-400"
                : "text-zinc-600 hover:text-foreground dark:text-zinc-300"
            }`}
          >
            EN
          </button>
        </div>

        {/* Przełącznik motywu Dark / Light */}
        <button
          type="button"
          aria-label={t.nav.theme}
          onClick={onToggleDark}
          className="grid size-8 sm:size-9 place-items-center rounded-lg border border-border bg-card/80 text-zinc-700 transition-colors hover:bg-muted hover:text-foreground dark:bg-muted/60 dark:text-zinc-200 cursor-pointer shrink-0"
        >
          {dark ? (
            <Sun className="size-4 text-zinc-200" />
          ) : (
            <Moon className="size-4 text-zinc-700" />
          )}
        </button>

        {/* Menu próbek dla desktopu */}
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setSamplesOpen(!samplesOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-muted hover:text-foreground dark:bg-muted/60 dark:text-zinc-200 cursor-pointer"
          >
            <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden md:inline">{t.nav.samples}</span>
            <ChevronDown className="size-3 text-zinc-500 dark:text-zinc-400" />
          </button>

          {samplesOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-border bg-popover p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                {t.nav.cases}
              </p>
              <div className="space-y-1">
                {t.claims.map((demo) => (
                  <button
                    key={demo.label}
                    type="button"
                    onClick={() => {
                      onSelectSample(demo.text);
                      setSamplesOpen(false);
                      setActiveView(0);
                    }}
                    className="block w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-muted hover:text-foreground dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Przycisk menu mobilnego */}
        <button
          type="button"
          aria-label={menuOpen ? t.common.close : t.nav.openMenu}
          onClick={() => setMenuOpen(!menuOpen)}
          className="grid size-8 sm:size-9 place-items-center rounded-lg border border-border bg-card/80 text-zinc-800 lg:hidden cursor-pointer hover:bg-muted hover:text-foreground dark:bg-muted/60 dark:text-zinc-200 shrink-0"
        >
          {menuOpen ? (
            <X className="size-4.5" />
          ) : (
            <Menu className="size-4.5" />
          )}
        </button>
      </div>

      {/* Rozwijane menu mobilne */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-2xl border border-border bg-popover/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 lg:hidden">
          <div className="space-y-1 border-b border-border pb-3">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Nawigacja
            </p>
            {navItems.map((item, i) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setActiveView(i);
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                  activeView === i
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-700 hover:bg-muted hover:text-foreground dark:text-zinc-300"
                }`}
              >
                <span>{item}</span>
                {activeView === i && (
                  <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-3">
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t.nav.cases}
            </p>
            <div className="space-y-1">
              {t.claims.map((demo) => (
                <button
                  key={demo.label}
                  type="button"
                  onClick={() => {
                    onSelectSample(demo.text);
                    setActiveView(0);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-left text-xs text-zinc-700 hover:bg-muted hover:text-foreground dark:text-zinc-300 transition-colors"
                >
                  <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{demo.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
