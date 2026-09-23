"use client";

import React, { useEffect, useState } from "react";
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

export default function Page() {
  const [locale, setLocale] = useState<Locale>("en");
  const [dark, setDark] = useState(true);
  const [input, setInput] = useState<string>(
    getDictionary("en").claims[0].text,
  );
  const [activeTab, setActiveTab] = useState(0);
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
  const [showToast, setShowToast] = useState(false);
  const [domain, setDomain] = useState(0);
  const [socialPlatform, setSocialPlatform] = useState("X / Twitter");
  const [exported, setExported] = useState(false);
  const [repositorySearch, setRepositorySearch] = useState("");
  const [activeInvestigation, setActiveInvestigation] =
    useState<LoadedInvestigation | null>(null);
  const [dossierOpen, setDossierOpen] = useState(false);

  const t = getDictionary(locale);

  // Synchronizacja motywu dark z elementem <html>
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (dark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [dark]);

  const loadRepositoryClaim = (investigation: LoadedInvestigation) => {
    setActiveInvestigation(investigation);
    setInput(investigation.claim);
    setDomain(investigation.domain);
    setActiveClaim(0);
    setActiveFilter(0);
    setActiveView(0);
    setHasResult(true);
    setDossierOpen(false);
  };

  const status = isAnalyzing ? t.pipeline.running : t.pipeline.ready;
  const claimText =
    activeInvestigation?.claim ?? (input.trim() || t.claims[0].text);
  const activeScore = activeInvestigation
    ? Number.parseInt(investigationScore(activeInvestigation.score), 10)
    : defaultScore;

  function investigationScore(rawScore: string): string {
    const parsed = Number.parseInt(rawScore, 10);
    return Number.isNaN(parsed) ? String(defaultScore) : String(parsed);
  }

  const scoreLabel =
    activeScore > 65
      ? t.score.mostly
      : activeScore > 35
        ? t.score.context
        : t.score.fabricated;

  const selectLocale = (next: Locale) => {
    console.log("[VeritasAI] Switching locale to:", next);
    setLocale(next);
    setInput(getDictionary(next).claims[0].text);
  };

  const toggleTheme = () => {
    console.log("[VeritasAI] Toggling dark mode to:", !dark);
    setDark((prev) => !prev);
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("veritasai-consent");
    if (saved) {
      try {
        setConsent(JSON.parse(saved));
        setConsentSeen(true);
      } catch {
        // fallback dla błędnego json
      }
    }
  }, []);

  function saveConsent(next = consent) {
    window.localStorage.setItem("veritasai-consent", JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("veritasai-consent-update", { detail: next }),
    );
    setConsent(next);
    setConsentSeen(true);
    setConsentOpen(false);
  }

  function purgeSession() {
    window.localStorage.removeItem("veritasai-consent");
    setConsent({ analytics: false, ai: false, marketing: false, deep: false });
    setPurged(true);
  }

  async function runVerification() {
    if (!input.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setHasResult(false);
    setAnalysisStep(0);
    setShowToast(false);
    setLogLines([t.pipelineRuntime.init]);

    const stepTimers = [
      window.setTimeout(() => {
        setAnalysisStep(1);
        setLogLines((l) => [...l, t.pipelineRuntime.step1]);
      }, 400),
      window.setTimeout(() => {
        setAnalysisStep(2);
        setLogLines((l) => [...l, t.pipelineRuntime.step2]);
      }, 1000),
      window.setTimeout(() => {
        setAnalysisStep(3);
        setLogLines((l) => [...l, t.pipelineRuntime.step3]);
      }, 1700),
    ];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: input,
          domain: t.dispatch.domains[domain],
        }),
      });

      stepTimers.forEach(clearTimeout);

      if (!response.ok) {
        throw new Error("API failure");
      }

      const data = await response.json();
      const newInvestigation: LoadedInvestigation = {
        title: input.length > 50 ? `${input.slice(0, 47)}...` : input,
        claim: input,
        score: String(data.score ?? 76),
        status: data.status ?? t.views.verified,
        analysis: data.analysis ?? t.report.dossierText,
        sources:
          Array.isArray(data.sources) && data.sources.length > 0
            ? data.sources
            : Array.from(t.sourcesList),
        domain,
      };

      setActiveInvestigation(newInvestigation);
      setAnalysisStep(4);
      setLogLines((l) => [
        ...l,
        `${t.pipelineRuntime.complete} (${data.model ?? "NVIDIA Nemotron"})`,
        t.pipelineRuntime.dossierReady,
      ]);
      setHasResult(true);
      setShowToast(true);
      window.setTimeout(() => setShowToast(false), 4200);
    } catch {
      stepTimers.forEach(clearTimeout);
      setAnalysisStep(4);
      setHasResult(true);
      setLogLines((l) => [
        ...l,
        t.pipelineRuntime.fallback,
        t.pipelineRuntime.dossierReady,
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function copyCard() {
    const prefix = t.exportReport?.cardCopyPrefix ?? "VeritasAI";
    navigator.clipboard?.writeText(
      `${prefix} — ${activeScore}% ${scoreLabel}.`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function exportDossier() {
    const dossierSources =
      activeInvestigation?.sources ??
      t.sourcesList.map((source) => source.split(" · ")[0]);
    const dossierAnalysis =
      activeInvestigation?.analysis ?? t.report.dossierText;

    const reportHeader =
      t.exportReport?.header ?? "VeritasAI Verification Report";
    const generatedLabel = t.exportReport?.generated ?? "Generated";
    const claimLabel = t.exportReport?.claim ?? "Claim";
    const trustScoreLabel = t.exportReport?.trustScore ?? "Trust Score";
    const verdictLabel = t.exportReport?.verdict ?? "Verdict";
    const analysisLabel = t.exportReport?.analysis ?? "Analysis";
    const sourcesLabel = t.exportReport?.sources ?? "Grounded Tavily Sources";

    const reportContent = `${reportHeader}\n${generatedLabel}: ${new Date().toISOString()}\n\n${claimLabel}: ${claimText}\n${trustScoreLabel}: ${activeScore}%\n${verdictLabel}: ${scoreLabel}\n\n${analysisLabel}:\n${dossierAnalysis}\n\n${sourcesLabel}:\n${dossierSources.map((source) => `- ${source}`).join("\n")}\n\n${t.common.disclaimer}`;

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
      className={`${dark ? "dark" : ""} min-h-screen bg-background text-foreground selection:bg-emerald-500/20`}
    >
      <div className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-10">
        {/* Modularny Header */}
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
          onSelectSample={(sampleText) => setInput(sampleText)}
        />

        {/* Widoki pomocnicze */}
        {activeView === 1 && (
          <InvestigationsView
            t={t}
            locale={locale}
            onOpenDossier={(row) => {
              const index = row.caseIndex;
              const record: LoadedInvestigation = {
                title: row.name,
                claim: t.claims[index]?.text ?? row.name,
                score: row.score,
                status: row.status,
                analysis: t.report.dossierText,
                sources: Array.from(t.sourcesList),
                domain: index === 1 ? 2 : index === 2 ? 1 : 0,
              };
              loadRepositoryClaim(record);
            }}
          />
        )}

        {activeView === 2 && (
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
        )}

        {activeView === 3 && <ApiStatusView t={t} locale={locale} />}

        {/* Widok główny (Dashboard) */}
        <div className={activeView === 0 ? "block" : "hidden"}>
          {/* Sekcja Hero z metrykami operacyjnymi */}
          <section className="grid gap-8 pb-9 pt-10 lg:grid-cols-[1fr_370px] lg:pt-14">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                {t.hero.eyebrow}
                <span className="text-zinc-400 dark:text-zinc-500">/</span>
                {t.hero.workspace}
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                {t.hero.title}
                <br />
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  {t.hero.titleMuted}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-700 dark:text-zinc-300 font-normal">
                {t.hero.description}
              </p>
            </div>

            <div className="flex flex-col justify-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                <span>{t.hero.status}</span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                  {t.hero.operational}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
                {metricValues.map((value, i) => (
                  <Metric key={value} value={value} label={t.hero.metrics[i]} />
                ))}
              </div>
            </div>
          </section>

          {/* Główna sekcja operacyjna: Konsola zlecenia + Potok agenta */}
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
            <DispatchConsole
              t={t}
              input={input}
              setInput={setInput}
              domain={domain}
              setDomain={setDomain}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              socialPlatform={socialPlatform}
              setSocialPlatform={setSocialPlatform}
              isAnalyzing={isAnalyzing}
              onRunVerification={runVerification}
            />

            <PipelineTracker
              t={t}
              isAnalyzing={isAnalyzing}
              hasResult={hasResult}
              status={status}
              analysisStep={analysisStep}
              logLines={logLines}
            />
          </section>

          {/* Disclaimer: wyraźny w obu motywach */}
          <p className="mt-3.5 text-center text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            {t.common.disclaimer}
          </p>

          {/* Panel raportu wynikowego */}
          {(hasResult || isAnalyzing) && (
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
          )}
        </div>

        {/* Powiadomienie Toast */}
        {showToast && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-card px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xl shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.toast.complete}</span>
          </div>
        )}

        {/* Modularny Footer */}
        <Footer
          t={t}
          onOpenPrivacy={() => setLegalModal("privacy")}
          onOpenTerms={() => setLegalModal("terms")}
          onOpenGovernance={() => setGovernanceOpen(true)}
        />

        {/* Modale */}
        {!consentSeen && (
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
              title: activeInvestigation?.title ?? t.claims[0].label,
              tag: activeInvestigation?.title
                ? t.common.activeCase
                : t.views.tags[0],
              result: activeInvestigation?.score
                ? `${activeInvestigation.score}%`
                : `${defaultScore}%`,
              status: activeInvestigation?.status ?? t.views.verified,
              excerpt: claimText,
              analysis: activeInvestigation?.analysis ?? t.report.dossierText,
              sources:
                activeInvestigation?.sources ?? Array.from(t.sourcesList),
            }}
            onClose={() => setDossierOpen(false)}
            onLoad={() => setDossierOpen(false)}
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
