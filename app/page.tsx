"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Check } from "lucide-react";
import { getDictionary, type Locale } from "@/dictionaries";
import { metricValues, score as defaultScore } from "@/lib/demo-data";
import {
  ConsentBanner,
  ConsentModal,
  DossierModal,
  GovernanceModal,
  LegalModal,
} from "@/components/modals";
import {
  ApiStatusView,
  InteractiveRepositoryView,
  InvestigationsView,
  Metric,
} from "@/components/workspace-views";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DispatchConsole } from "@/components/dispatch-console";
import { PipelineTracker } from "@/components/pipeline-tracker";
import { ReportView, type LoadedInvestigation } from "@/components/report-view";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const [dark, setDark] = useState(true);

  // Buforowane stany dla każdej z 3 zakładek (tekst / URL / post społecznościowy)
  const [textInput, setTextInput] = useState<string>(
    () => getDictionary("en").claims[0]?.text ?? "",
  );
  const [urlInput, setUrlInput] = useState<string>("");
  const [socialInput, setSocialInput] = useState<string>("");

  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeClaim, setActiveClaim] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(
    null,
  );
  const [consentOpen, setConsentOpen] = useState(false);
  const [governanceOpen, setGovernanceOpen] = useState(false);
  const [consent, setConsent] = useState({
    analytics: false,
    ai: false,
    marketing: false,
    deep: false,
  });
  const [consentSeen, setConsentSeen] = useState(false);
  const [purged, setPurged] = useState(false);
  const [activeView, setActiveView] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [domain, setDomain] = useState(0);
  const [socialPlatform, setSocialPlatform] = useState("X / Twitter");
  const [exported, setExported] = useState(false);
  const [repositorySearch, setRepositorySearch] = useState("");
  const [activeInvestigation, setActiveInvestigation] =
    useState<LoadedInvestigation | null>(null);
  const [dossierOpen, setDossierOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem("veritasai-consent");
      if (saved) {
        setConsent(JSON.parse(saved));
        setConsentSeen(true);
      }
    } catch {
      // ignorujemy brak localStorage w specyficznych środowiskach
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (dark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [dark]);

  const t = useMemo(() => getDictionary(locale), [locale]);

  // Aktywny input zależny od wybranej zakładki
  const currentInput =
    activeTab === 1 ? urlInput : activeTab === 2 ? socialInput : textInput;

  const handleSetCurrentInput = (val: string) => {
    if (activeTab === 1) {
      setUrlInput(val);
    } else if (activeTab === 2) {
      setSocialInput(val);
    } else {
      setTextInput(val);
    }
  };

  const handleTabChange = (nextTab: number) => {
    setActiveTab(nextTab);
    if (nextTab === 1 && !urlInput.trim()) {
      const defaultSampleUrl =
        t?.dispatch?.sampleUrl || "https://pubmed.ncbi.nlm.nih.gov/38215508/";
      setUrlInput(defaultSampleUrl);
    }
  };

  const loadRepositoryClaim = (investigation: LoadedInvestigation) => {
    setActiveInvestigation(investigation);
    setTextInput(investigation.claim);
    setActiveTab(0);
    setDomain(investigation.domain);
    setActiveClaim(0);
    setActiveFilter(0);
    setActiveView(0);
    setHasResult(true);
    setDossierOpen(false);

    setToastMessage(
      locale === "pl"
        ? "Załadowano sprawę z repozytorium"
        : "Investigation loaded from repository",
    );
    window.setTimeout(() => setToastMessage(""), 3500);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  // Obsługa przycisku „Załaduj do konsoli weryfikacji” z okna DossierModal
  const handleLoadActiveToConsole = () => {
    const textToLoad =
      activeInvestigation?.title &&
      !activeInvestigation.title.startsWith("http")
        ? activeInvestigation.title
        : activeInvestigation?.claim || currentInput;

    setTextInput(textToLoad);
    setActiveTab(0);
    setDossierOpen(false);
    setActiveView(0);

    setToastMessage(
      locale === "pl"
        ? "Załadowano treść do konsoli weryfikacji"
        : "Claim loaded into verification console",
    );
    window.setTimeout(() => setToastMessage(""), 3500);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  const status = isAnalyzing
    ? t?.pipeline?.running || "Analizowanie..."
    : t?.pipeline?.ready || "Gotowy";

  const claimText =
    activeInvestigation?.claim ??
    (currentInput.trim() || t?.claims?.[0]?.text || "Brak treści twierdzenia");

  const activeScore = activeInvestigation
    ? Number.parseInt(investigationScore(activeInvestigation.score), 10)
    : defaultScore;

  function investigationScore(rawScore: string): string {
    const parsed = Number.parseInt(rawScore, 10);
    return Number.isNaN(parsed) ? String(defaultScore) : String(parsed);
  }

  const scoreLabel =
    activeScore > 65
      ? t?.score?.mostly || "W większości potwierdzone"
      : activeScore > 35
        ? t?.score?.context || "Wymaga kontekstu"
        : t?.score?.fabricated || "Prawdopodobnie fałszywe";

  const selectLocale = (next: Locale) => {
    setLocale(next);
    const nextDict = getDictionary(next);
    setTextInput(nextDict?.claims?.[0]?.text || "");
  };

  const toggleTheme = () => {
    setDark((prev) => !prev);
  };

  function saveConsent(next = consent) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("veritasai-consent", JSON.stringify(next));
      window.dispatchEvent(
        new CustomEvent("veritasai-consent-update", { detail: next }),
      );
    }
    setConsent(next);
    setConsentSeen(true);
    setConsentOpen(false);
  }

  function purgeSession() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("veritasai-consent");
    }
    setConsent({ analytics: false, ai: false, marketing: false, deep: false });
    setPurged(true);
  }

  async function runVerification() {
    const claimToVerify = currentInput.trim();
    if (!claimToVerify || isAnalyzing) return;

    setIsAnalyzing(true);
    setHasResult(false);
    setAnalysisStep(0);
    setToastMessage("");
    setLogLines([t?.pipelineRuntime?.init || "Inicjalizacja potoku..."]);

    const stepTimers = [
      window.setTimeout(() => {
        setAnalysisStep(1);
        setLogLines((l) => [
          ...l,
          t?.pipelineRuntime?.step1 ||
            "Rozkład tekstu na atomowe twierdzenia...",
        ]);
      }, 400),
      window.setTimeout(() => {
        setAnalysisStep(2);
        setLogLines((l) => [
          ...l,
          t?.pipelineRuntime?.step2 || "Zapytanie do źródeł Tavily...",
        ]);
      }, 1000),
      window.setTimeout(() => {
        setAnalysisStep(3);
        setLogLines((l) => [
          ...l,
          t?.pipelineRuntime?.step3 || "Synteza wiarygodności źródeł...",
        ]);
      }, 1700),
    ];

    try {
      const mode =
        activeTab === 1 ? "url" : activeTab === 2 ? "social" : "text";
      const domainName = t?.dispatch?.domains?.[domain] || "General";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: claimToVerify,
          domain: domainName,
          mode,
          platform: activeTab === 2 ? socialPlatform : undefined,
        }),
      });

      stepTimers.forEach(clearTimeout);

      if (!response.ok) {
        throw new Error("API failure");
      }

      const data = await response.json();
      const newInvestigation: LoadedInvestigation = {
        title:
          data.title ||
          (claimToVerify.length > 50
            ? `${claimToVerify.slice(0, 47)}...`
            : claimToVerify),
        claim: claimToVerify,
        score: String(data.score ?? 76),
        status: data.status ?? t?.views?.verified ?? "Zweryfikowane",
        analysis: data.analysis ?? t?.report?.dossierText ?? "Raport gotowy.",
        sources:
          Array.isArray(data.sources) && data.sources.length > 0
            ? data.sources
            : Array.from(t?.sourcesList || []),
        domain,
      };

      setActiveInvestigation(newInvestigation);
      setAnalysisStep(4);
      setLogLines((l) => [
        ...l,
        `${t?.pipelineRuntime?.complete || "Zakończono"} (${
          data.model ?? "NVIDIA Nemotron / Tavily"
        })`,
        t?.pipelineRuntime?.dossierReady || "Dossier gotowe do wglądu.",
      ]);
      setHasResult(true);
      setToastMessage(t?.toast?.complete || "Analiza zakończona sukcesem");
      window.setTimeout(() => setToastMessage(""), 4200);
    } catch {
      stepTimers.forEach(clearTimeout);
      setAnalysisStep(4);
      setHasResult(true);
      setLogLines((l) => [
        ...l,
        t?.pipelineRuntime?.fallback || "Tryb awaryjny potoku.",
        t?.pipelineRuntime?.dossierReady || "Dossier gotowe.",
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function copyCard() {
    const prefix = t?.exportReport?.cardCopyPrefix ?? "VeritasAI";
    navigator.clipboard?.writeText(
      `${prefix} — ${activeScore}% ${scoreLabel}.`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function exportDossier() {
    const dossierSources =
      activeInvestigation?.sources ??
      (t?.sourcesList || []).map((source) => source.split(" · ")[0]);
    const dossierAnalysis =
      activeInvestigation?.analysis ?? t?.report?.dossierText ?? "";

    const reportHeader =
      t?.exportReport?.header ?? "VeritasAI Verification Report";
    const generatedLabel = t?.exportReport?.generated ?? "Generated";
    const claimLabel = t?.exportReport?.claim ?? "Claim";
    const trustScoreLabel = t?.exportReport?.trustScore ?? "Trust Score";
    const verdictLabel = t?.exportReport?.verdict ?? "Verdict";
    const analysisLabel = t?.exportReport?.analysis ?? "Analysis";
    const sourcesLabel = t?.exportReport?.sources ?? "Grounded Tavily Sources";
    const disclaimerText =
      t?.common?.disclaimer ||
      "Oceny VeritasAI są probabilistycznymi analizami AI i nie stanowią opinii prawnej.";

    const reportContent = `${reportHeader}\n${generatedLabel}: ${new Date().toISOString()}\n\n${claimLabel}: ${claimText}\n${trustScoreLabel}: ${activeScore}%\n${verdictLabel}: ${scoreLabel}\n\n${analysisLabel}:\n${dossierAnalysis}\n\n${sourcesLabel}:\n${dossierSources
      .map((source) => `- ${source}`)
      .join("\n")}\n\n${disclaimerText}`;

    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veritas-dossier-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    window.setTimeout(() => setExported(false), 1600);
  }

  return (
    <main
      id="main-content"
      className={`${
        dark ? "dark" : ""
      } min-h-screen w-full bg-background text-foreground selection:bg-emerald-500/20`}
    >
      {/* Pasek nawigacyjny */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
        <div className="mx-auto max-w-[1500px] w-full px-4 sm:px-6 lg:px-10">
          <Header
            t={t}
            locale={locale}
            onSelectLocale={selectLocale}
            dark={dark}
            onToggleDark={toggleTheme}
            activeView={activeView}
            setActiveView={setActiveView}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onSelectSample={(sampleText) => {
              setTextInput(sampleText);
              setActiveTab(0);
            }}
          />
        </div>
      </header>

      {/* Kontener treści */}
      <div className="mx-auto max-w-[1500px] w-full min-w-0 px-4 pt-[74px] pb-16 sm:px-6 lg:px-10">
        {/* Widoki pomocnicze */}
        {activeView === 1 && (
          <div className="w-full min-w-0 max-w-full pt-6">
            <InvestigationsView
              t={t}
              locale={locale}
              onOpenDossier={(row) => {
                const index = row.caseIndex;
                const record: LoadedInvestigation = {
                  title: row.name,
                  claim: t?.claims?.[index]?.text ?? row.name,
                  score: row.score,
                  status: row.status,
                  analysis: t?.report?.dossierText || "",
                  sources: Array.from(t?.sourcesList || []),
                  domain: index === 1 ? 2 : index === 2 ? 1 : 0,
                };
                loadRepositoryClaim(record);
              }}
            />
          </div>
        )}

        {activeView === 2 && (
          <div className="w-full min-w-0 max-w-full pt-6">
            <InteractiveRepositoryView
              t={t}
              search={repositorySearch}
              setSearch={setRepositorySearch}
              onLoadClaim={(record) =>
                loadRepositoryClaim({
                  title: record.title,
                  claim: record.excerpt,
                  score: record.result,
                  status: record.status,
                  analysis: record.analysis,
                  sources: record.sources,
                  domain: 0,
                })
              }
            />
          </div>
        )}

        {activeView === 3 && (
          <div className="w-full min-w-0 max-w-full pt-6">
            <ApiStatusView t={t} locale={locale} />
          </div>
        )}

        {/* Widok główny (Dashboard) */}
        <div
          className={
            activeView === 0 ? "block w-full min-w-0 max-w-full" : "hidden"
          }
        >
          {/* Sekcja Hero z metrykami operacyjnymi */}
          <section className="grid gap-8 pb-9 pt-8 lg:grid-cols-[1fr_370px] lg:pt-12 w-full min-w-0">
            <div className="min-w-0">
              <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400 break-words">
                <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse shrink-0" />
                <span>
                  {t?.hero?.eyebrow || "AUTONOMICZNA KONSOLA WERYFIKACJI"}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500">/</span>
                <span>{t?.hero?.workspace || "AKTYWNA PRZESTRZEŃ"}</span>
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl break-words">
                {t?.hero?.title || "Oddziel sygnał"}
                <br />
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  {t?.hero?.titleMuted || "od szumu."}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-700 dark:text-zinc-300 font-normal break-words">
                {t?.hero?.description ||
                  "Uruchom autonomicznego agenta badawczego, aby rozłożyć twierdzenia na czynniki pierwsze."}
              </p>
            </div>

            <div className="flex flex-col justify-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs min-w-0">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                <span>{t?.hero?.status || "STATUS SYSTEMU"}</span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse shrink-0" />
                  <span>
                    {t?.hero?.operational || "WSZYSTKIE SYSTEMY DZIAŁAJĄ"}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
                {metricValues.map((value, i) => (
                  <Metric
                    key={value}
                    value={value}
                    label={t?.hero?.metrics?.[i] || ""}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Główna sekcja operacyjna: Konsola i Śledzenie potoku */}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px] w-full min-w-0">
            <div className="min-w-0 max-w-full">
              <DispatchConsole
                t={t}
                input={currentInput}
                setInput={handleSetCurrentInput}
                domain={domain}
                setDomain={setDomain}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                socialPlatform={socialPlatform}
                setSocialPlatform={setSocialPlatform}
                isAnalyzing={isAnalyzing}
                onRunVerification={runVerification}
              />
            </div>

            <div className="min-w-0 max-w-full">
              <PipelineTracker
                t={t}
                isAnalyzing={isAnalyzing}
                hasResult={hasResult}
                status={status}
                analysisStep={analysisStep}
                logLines={logLines}
              />
            </div>
          </div>

          {/* Zastrzeżenie prawne */}
          <p className="mt-3.5 text-center text-xs leading-5 text-zinc-600 dark:text-zinc-400 break-words">
            {t?.common?.disclaimer ||
              "Oceny VeritasAI są probabilistycznymi analizami AI opartymi na otwartych źródłach webowych i nie stanowią opinii prawnej."}
          </p>

          {/* Panel raportu wynikowego */}
          {(hasResult || isAnalyzing) && (
            <div className="w-full min-w-0 max-w-full">
              <ReportView
                t={t}
                scoreLabel={scoreLabel}
                claimText={claimText}
                activeClaim={activeClaim}
                setActiveClaim={setActiveClaim}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                copyCard={copyCard}
                copied={copied}
                exportDossier={exportDossier}
                exported={exported}
                investigation={activeInvestigation}
                onOpenDossier={() => setDossierOpen(true)}
              />
            </div>
          )}
        </div>

        {/* Powiadomienie Toast */}
        {toastMessage && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-card px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xl shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Pływający przycisk przewijania */}
        <ScrollToTop t={t} />

        {/* Stopka */}
        <Footer
          t={t}
          onOpenPrivacy={() => setLegalModal("privacy")}
          onOpenTerms={() => setLegalModal("terms")}
          onOpenGovernance={() => setGovernanceOpen(true)}
        />

        {/* Modale */}
        {mounted && !consentSeen && (
          <ConsentBanner
            t={t}
            onAccept={() =>
              saveConsent({
                analytics: true,
                ai: true,
                marketing: true,
                deep: consent.deep,
              })
            }
            onManage={() => setConsentOpen(true)}
          />
        )}

        {consentOpen && (
          <ConsentModal
            t={t}
            consent={consent}
            setConsent={setConsent}
            onClose={() => setConsentOpen(false)}
            onSave={() => saveConsent()}
          />
        )}

        {governanceOpen && (
          <GovernanceModal
            t={t}
            consent={consent}
            setConsent={setConsent}
            purged={purged}
            onPurge={purgeSession}
            onClose={() => setGovernanceOpen(false)}
          />
        )}

        {dossierOpen && (
          <DossierModal
            t={t}
            record={{
              title:
                activeInvestigation?.title ??
                t?.claims?.[0]?.label ??
                "Śledztwo",
              tag: activeInvestigation?.title
                ? (t?.common?.activeCase ?? "Aktywny raport")
                : (t?.views?.tags?.[0] ?? "Zweryfikowano"),
              result: activeInvestigation?.score
                ? `${activeInvestigation.score}%`
                : `${defaultScore}%`,
              status:
                activeInvestigation?.status ??
                t?.views?.verified ??
                "Zweryfikowano",
              excerpt: claimText,
              analysis:
                activeInvestigation?.analysis ?? (t?.report?.dossierText || ""),
              sources:
                activeInvestigation?.sources ??
                Array.from(t?.sourcesList || []),
            }}
            onClose={() => setDossierOpen(false)}
            onLoad={handleLoadActiveToConsole}
          />
        )}

        {legalModal && (
          <LegalModal
            t={t}
            kind={legalModal}
            onClose={() => setLegalModal(null)}
          />
        )}
      </div>
    </main>
  );
}
