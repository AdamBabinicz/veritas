"use client";

import React from "react";
import {
  BookOpen,
  ChevronDown,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
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
  const navItems = [
    t.nav.dashboard,
    t.nav.investigations,
    t.nav.repository,
    t.nav.api,
  ];

  return (
    <header className="relative flex min-h-[74px] items-center justify-between border-b border-border">
      {/* Lewa strona: Logo VeritasAI + Nawigacja główna */}
      <div className="flex items-center gap-8">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveView(0)}
        >
          <div className="relative grid size-9 place-items-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 shadow-xs">
            <ShieldCheck
              className="size-[19px] text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
            <span className="absolute right-1 top-1 size-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-foreground">
            Veritas
            <span className="text-emerald-600 dark:text-emerald-400">AI</span>
          </span>
        </div>

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

      {/* Prawa strona: Wskaźnik modelu, przełącznik języków, motyw, menu próbek */}
      <div className="flex items-center gap-2">
        {/* Pigułka silnika hackathonowego */}
        <div className="hidden items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-zinc-700 font-medium dark:bg-muted/60 dark:text-zinc-300 md:flex">
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
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
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
          className="grid size-9 place-items-center rounded-lg border border-border bg-card/80 text-zinc-700 transition-colors hover:bg-muted hover:text-foreground dark:bg-muted/60 dark:text-zinc-200 cursor-pointer"
        >
          {dark ? (
            <Sun className="size-4 text-zinc-200" />
          ) : (
            <Moon className="size-4 text-zinc-700" />
          )}
        </button>

        {/* Menu próbek */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-muted hover:text-foreground dark:bg-muted/60 dark:text-zinc-200 cursor-pointer"
          >
            <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.nav.samples}</span>
            <ChevronDown className="size-3 text-zinc-500 dark:text-zinc-400" />
          </button>

          {menuOpen && (
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
                      setMenuOpen(false);
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
          aria-label={t.nav.openMenu}
          onClick={() => setMenuOpen(!menuOpen)}
          className="grid size-9 place-items-center rounded-lg border border-border text-zinc-700 lg:hidden cursor-pointer hover:bg-muted hover:text-foreground dark:text-zinc-300"
        >
          <Menu className="size-4" />
        </button>
      </div>
    </header>
  );
}
