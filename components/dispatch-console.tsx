"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FlaskConical,
  Globe,
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
  activeTab?: number;
  setActiveTab?: (tabIndex: number) => void;
  socialPlatform?: string;
  setSocialPlatform?: (platform: string) => void;
  isAnalyzing: boolean;
  onRunVerification: () => void;
}

export function DispatchConsole({
  t,
  input,
  setInput,
  domain,
  setDomain,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  socialPlatform = "X / Twitter",
  setSocialPlatform,
  isAnalyzing,
  onRunVerification,
}: DispatchConsoleProps) {
  const tabs = t?.dispatch?.tabs || [
    "Wklej tekst",
    "Wprowadź URL",
    "Post społecznościowy",
  ];

  const [currentTab, setCurrentTab] = useState<number>(externalActiveTab ?? 0);
  const prevExternalTabRef = useRef(externalActiveTab);
  const [isFetchingUrl, setIsFetchingUrl] = useState<boolean>(false);
  const [fetchSuccessMessage, setFetchSuccessMessage] = useState<string | null>(
    null,
  );
  const [samplesDropdownOpen, setSamplesDropdownOpen] =
    useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lista wzorcowych linków demonstracyjnych z różnymi werdyktami
  const sampleUrls = [
    {
      label: "Badanie naukowe PubMed",
      tag: "Prawda / 88%",
      tagColor:
        "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      url: "https://pubmed.ncbi.nlm.nih.gov/38215508/",
      domainIndex: 0,
      description: "Recenzowana publikacja kliniczna w bazie NIH",
    },
    {
      label: "Sensacyjny artykuł plotkarski",
      tag: "Fałsz / 12%",
      tagColor:
        "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
      url: "https://www.medonet.pl/zdrowie/zdrowie-dla-kazdego/zaskakujace-efekty-zmian-deana-ho-jego-wiek-biologiczny-jest",
      domainIndex: 0,
      description: "Twierdzenie o ukrywanym leku i cofaniu wieku",
    },
    {
      label: "Plotka giełdowa o przejęciu",
      tag: "Mylące / 42%",
      tagColor:
        "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
      url: "https://bloomberg-reuters-market-rumors.internal/novagrid-acquisition-rumor",
      domainIndex: 2,
      description: "Spekulacje o przejęciu spółki NovaGrid z premią 300%",
    },
  ];

  useEffect(() => {
    if (
      typeof externalActiveTab === "number" &&
      externalActiveTab !== prevExternalTabRef.current
    ) {
      setCurrentTab(externalActiveTab);
      prevExternalTabRef.current = externalActiveTab;
    }
  }, [externalActiveTab]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSamplesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = (index: number) => {
    setCurrentTab(index);
    prevExternalTabRef.current = index;
    if (typeof externalSetActiveTab === "function") {
      externalSetActiveTab(index);
    }
  };

  const handleSelectJuryPrompt = (promptText: string, domainIndex: number) => {
    setInput(promptText);
    setDomain(domainIndex);
    handleTabChange(0);
  };

  const handleSelectSample = (sample: (typeof sampleUrls)[0]) => {
    setInput(sample.url);
    setDomain(sample.domainIndex);
    setSamplesDropdownOpen(false);
    setFetchSuccessMessage(`Załadowano wzorzec: ${sample.label}`);
    window.setTimeout(() => setFetchSuccessMessage(null), 4000);
  };

  const sampleUrl =
    t?.dispatch?.sampleUrl || "https://pubmed.ncbi.nlm.nih.gov/38215508/";

  const fetchArticleLabel =
    t?.common?.fetchArticle ||
    (t?.dispatch as Record<string, any>)?.fetchArticle ||
    "Pobierz treść ze strony";

  const handleFetchArticleContent = async () => {
    const rawUrl = input.trim();

    if (!rawUrl) {
      setInput(sampleUrl);
      return;
    }

    setIsFetchingUrl(true);
    setFetchSuccessMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: rawUrl,
          mode: "extract",
          domain: t?.dispatch?.domains?.[domain] || "General",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.analysis || data.title) {
          setFetchSuccessMessage(
            data.title
              ? `Pobrano artykuł: „${data.title.slice(0, 45)}...”`
              : "Pomyślnie pobrano treść do weryfikacji",
          );
        } else {
          setFetchSuccessMessage("Zweryfikowano adres URL i nagłówki źródła.");
        }
      } else {
        setFetchSuccessMessage("URL zarejestrowany. Kliknij „Uruchom agenta”.");
      }
    } catch {
      setFetchSuccessMessage("URL gotowy do bezpośredniej analizy w potoku.");
    } finally {
      setIsFetchingUrl(false);
      window.setTimeout(() => setFetchSuccessMessage(null), 5000);
    }
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
            {t?.dispatch?.title || "Zleć weryfikację"}
          </h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
          <Clock3 className="size-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>{t?.dispatch?.average || "śr. analiza 8–12 sek."}</span>
        </span>
      </div>

      {/* Zakładki: Tekst / URL / Social */}
      <div
        role="tablist"
        aria-label="Tryby wprowadzania danych"
        className="flex gap-1 border-b border-border px-4 pt-3"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab}
            id={`dispatch-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={currentTab === i}
            aria-controls={`dispatch-tabpanel-${i}`}
            onClick={() => handleTabChange(i)}
            className={`rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
              currentTab === i
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
        <div
          id="dispatch-tabpanel-0"
          role="tabpanel"
          aria-labelledby="dispatch-tab-0"
          hidden={currentTab !== 0}
        >
          {currentTab === 0 && (
            <div>
              <textarea
                aria-label={t?.dispatch?.textPlaceholder || "Wklej tekst"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[130px] w-full resize-none rounded-xl border border-border bg-background p-4 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500/60"
                placeholder={
                  t?.dispatch?.textPlaceholder ||
                  "Wklej tekst do weryfikacji..."
                }
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="domain-select" className="sr-only">
                    {t?.dispatch?.selectDomainAria ||
                      "Wybierz kategorię domeny"}
                  </label>
                  <select
                    id="domain-select"
                    aria-label={
                      t?.dispatch?.selectDomainAria ||
                      "Wybierz kategorię domeny"
                    }
                    value={domain}
                    onChange={(e) => setDomain(Number(e.target.value))}
                    className="rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground outline-none cursor-pointer hover:border-border/90"
                  >
                    {t?.dispatch?.domains?.map((item, i) => (
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
        </div>

        {/* Zakładka 1: Wprowadź URL */}
        <div
          id="dispatch-tabpanel-1"
          role="tabpanel"
          aria-labelledby="dispatch-tab-1"
          hidden={currentTab !== 1}
        >
          {currentTab === 1 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-border bg-background p-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Link2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <input
                    type="url"
                    aria-label={
                      t?.dispatch?.urlPlaceholder || "Wprowadź pełny adres URL"
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-zinc-400"
                    placeholder={
                      t?.dispatch?.urlPlaceholder ||
                      "https://example.com/artykul-lub-post"
                    }
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border relative">
                  <button
                    type="button"
                    disabled={isFetchingUrl}
                    onClick={handleFetchArticleContent}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 dark:bg-emerald-400 px-3.5 py-2 text-xs font-semibold text-white dark:text-emerald-950 transition-colors hover:bg-emerald-600 dark:hover:bg-emerald-300 disabled:opacity-60 cursor-pointer"
                  >
                    {isFetchingUrl ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Globe className="size-3.5" />
                    )}
                    <span>
                      {isFetchingUrl
                        ? "Pobieranie treści..."
                        : fetchArticleLabel}
                    </span>
                  </button>

                  {/* Rozwijany przycisk demonstracyjny "Wzorcowy link" */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={samplesDropdownOpen}
                      onClick={() => setSamplesDropdownOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/80 px-2.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-muted hover:text-foreground dark:text-zinc-200 transition-colors cursor-pointer"
                      title="Wybierz wzorcowy artykuł do demonstracji weryfikacji"
                    >
                      <FlaskConical className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Wzorcowy link</span>
                      <ChevronDown className="size-3 text-zinc-500" />
                    </button>

                    {samplesDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-80 rounded-xl border border-border bg-popover p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                        <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-border/60 mb-1">
                          Wzorcowe scenariusze demonstracyjne (1-Click)
                        </div>
                        <div className="space-y-1">
                          {sampleUrls.map((sample) => (
                            <button
                              key={sample.url}
                              type="button"
                              onClick={() => handleSelectSample(sample)}
                              className="w-full text-left p-2 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer block"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                  {sample.label}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${sample.tagColor}`}
                                >
                                  {sample.tag}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-1">
                                {sample.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Komunikat o statusie pobrania linku */}
              {fetchSuccessMessage && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 animate-in fade-in">
                  <Check className="size-3.5 shrink-0" />
                  <span className="truncate">{fetchSuccessMessage}</span>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="domain-select-url" className="sr-only">
                    {t?.dispatch?.selectDomainAria ||
                      "Wybierz kategorię domeny"}
                  </label>
                  <select
                    id="domain-select-url"
                    aria-label={
                      t?.dispatch?.selectDomainAria ||
                      "Wybierz kategorię domeny"
                    }
                    value={domain}
                    onChange={(e) => setDomain(Number(e.target.value))}
                    className="rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground outline-none cursor-pointer hover:border-border/90"
                  >
                    {t?.dispatch?.domains?.map((item, i) => (
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
        </div>

        {/* Zakładka 2: Post społecznościowy */}
        <div
          id="dispatch-tabpanel-2"
          role="tabpanel"
          aria-labelledby="dispatch-tab-2"
          hidden={currentTab !== 2}
        >
          {currentTab === 2 && (
            <div className="space-y-3 rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap gap-2">
                {(
                  t?.dispatch?.socialPlatforms || [
                    "X / Twitter",
                    "Facebook",
                    "TikTok",
                  ]
                ).map((platform) => (
                  <button
                    type="button"
                    key={platform}
                    onClick={() => setSocialPlatform?.(platform)}
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
                aria-label={
                  t?.dispatch?.socialPlaceholder || "Wklej treść posta"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground outline-none placeholder:text-zinc-400 focus:border-emerald-500/60"
                placeholder={
                  t?.dispatch?.socialPlaceholder ||
                  "Wklej link lub treść posta..."
                }
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="domain-select-social" className="sr-only">
                    {t?.dispatch?.selectDomainAria ||
                      "Wybierz kategorię domeny"}
                  </label>
                  <select
                    id="domain-select-social"
                    aria-label={
                      t?.dispatch?.selectDomainAria ||
                      "Wybierz kategorię domeny"
                    }
                    value={domain}
                    onChange={(e) => setDomain(Number(e.target.value))}
                    className="rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground outline-none cursor-pointer hover:border-border/90"
                  >
                    {t?.dispatch?.domains?.map((item, i) => (
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
        </div>

        {/* Pasek z licznikiem znaków i głównym przyciskiem wysłania */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
            {input.length} {t?.dispatch?.charCount || "znaków"}
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
              {isAnalyzing
                ? t?.dispatch?.reasoning || "Analizuję dowody..."
                : t?.dispatch?.deploy || "Uruchom agenta weryfikacji"}
            </span>
            <ArrowUpRight className="size-4" />
          </button>
        </div>

        {/* Pigułki standardowych próbek */}
        <div className="mt-4 flex flex-wrap gap-2">
          {t?.claims?.map((demo) => (
            <button
              key={demo.label}
              type="button"
              onClick={() => {
                setInput(demo.text);
                handleTabChange(0);
              }}
              className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-300 cursor-pointer"
            >
              {demo.label}
            </button>
          ))}
        </div>

        {/* Wzorcowe scenariusze */}
        {t?.dispatch?.juryPrompts && t.dispatch.juryPrompts.length > 0 && (
          <div className="mt-5 rounded-xl border border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              {t.dispatch.jurySectionTitle ||
                "WZORCOWE SCENARIUSZE WERYFIKACJI:"}
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
