"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Globe2,
  Link2,
  LoaderCircle,
  Menu,
  Moon,
  Radio,
  ShieldCheck,
  Sparkles,
  Sun,
  Zap,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { getDictionary, type Locale } from "@/dictionaries";
import {
  metricValues,
  score as defaultScore,
  sourceConfidence,
} from "@/lib/demo-data";
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
  MiniStat,
} from "@/components/workspace-views";

type LoadedInvestigation = {
  title: string;
  claim: string;
  score: string;
  status: string;
  analysis: string;
  sources: string[];
  domain: number;
};

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

  const tabs = t.dispatch.tabs;
  const status = isAnalyzing ? t.pipeline.running : t.pipeline.ready;
  const claimText =
    activeInvestigation?.claim ?? (input.trim() || t.claims[0].text);
  const activeScore = activeInvestigation
    ? Number.parseInt(activeInvestigation.score, 10)
    : defaultScore;
  const scoreLabel =
    activeScore > 65
      ? t.score.mostly
      : activeScore > 35
        ? t.score.context
        : t.score.fabricated;

  const selectLocale = (next: Locale) => {
    setLocale(next);
    setInput(getDictionary(next).claims[0].text);
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("veritasai-consent");
    if (saved) {
      setConsent(JSON.parse(saved));
      setConsentSeen(true);
    }
  }, []);

  function saveConsent(next = consent) {
    window.localStorage.setItem("veritasai-consent", JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("veritasai-consent-update", { detail: next }),
    );
    const telemetryWindow = window as Window & {
      dataLayer?: Record<string, unknown>[];
    };
    telemetryWindow.dataLayer = telemetryWindow.dataLayer || [];
    telemetryWindow.dataLayer.push({
      event: "consent_update",
      essential: true,
      analytics: next.analytics,
      ai_inference: next.ai,
      marketing: next.marketing,
    });
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
    navigator.clipboard?.writeText(
      `VeritasAI — ${activeScore}% ${scoreLabel}.`,
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
    const text = `VeritasAI Verification Report\nGenerated: ${new Date().toISOString()}\n\nClaim: ${claimText}\nTrust Score: ${activeScore}% (${scoreLabel})\n\nAnalysis:\n${dossierAnalysis}\n\nGrounded Tavily sources:\n${dossierSources.map((source) => `- ${source}`).join("\n")}\n\nVerdict: ${scoreLabel}`;
    const blob = new Blob([text], { type: "text/plain" });
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
      className={`${dark ? "dark" : ""} min-h-screen bg-background text-foreground selection:bg-emerald-400/20`}
    >
      <div className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-10">
        <header className="relative flex min-h-[74px] items-center justify-between border-b border-border">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="relative grid size-9 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
                <ShieldCheck
                  className="size-[19px] text-emerald-500"
                  strokeWidth={1.8}
                />
                <span className="absolute right-1 top-1 size-1.5 animate-pulse rounded-full bg-emerald-500" />
              </div>
              <span className="text-[17px] font-semibold tracking-[-0.03em]">
                Veritas<span className="text-emerald-500">AI</span>
              </span>
            </div>
            <nav className="hidden items-center gap-1 lg:flex">
              {[
                t.nav.dashboard,
                t.nav.investigations,
                t.nav.repository,
                t.nav.api,
              ].map((item, i) => (
                <button
                  key={item}
                  onClick={() => setActiveView(i)}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-[12px] transition-all hover:brightness-110 active:scale-[0.98] ${
                    activeView === i
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[10px] text-muted-foreground md:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Nemotron-4 <span className="text-muted-foreground/60">
                ·
              </span>{" "}
              {t.views.tavilyGrounded}
            </div>
            <div className="flex items-center rounded-lg border border-border bg-muted/50 text-[10px]">
              <button
                aria-label="Polski"
                onClick={() => selectLocale("pl")}
                className={`px-2 py-1.5 ${locale === "pl" ? "font-semibold text-emerald-600" : "text-muted-foreground"}`}
              >
                PL
              </button>
              <button
                aria-label="English"
                onClick={() => selectLocale("en")}
                className={`px-2 py-1.5 ${locale === "en" ? "font-semibold text-emerald-600" : "text-muted-foreground"}`}
              >
                EN
              </button>
            </div>
            <button
              aria-label={t.nav.theme}
              onClick={() => setDark(!dark)}
              className="grid size-9 place-items-center rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="size-3.5 text-emerald-500" /> {t.nav.samples}{" "}
              <ChevronDown className="size-3" />
            </button>
            {menuOpen && (
              <div className="absolute right-6 top-[60px] z-20 w-64 rounded-xl border border-border bg-popover p-2 shadow-2xl">
                <p className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t.nav.cases}
                </p>
                {t.claims.map((demo) => (
                  <button
                    key={demo.label}
                    onClick={() => {
                      setInput(demo.text);
                      setMenuOpen(false);
                    }}
                    className="block w-full rounded-lg px-2 py-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            )}
            <button className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground lg:hidden">
              <Menu className="size-4" />
            </button>
          </div>
        </header>

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

        <div className={activeView === 0 ? "block" : "hidden"}>
          <section className="grid gap-8 pb-9 pt-10 lg:grid-cols-[1fr_370px] lg:pt-14">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {t.hero.eyebrow}{" "}
                <span className="text-muted-foreground/50">/</span>{" "}
                {t.hero.workspace}
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-foreground sm:text-6xl">
                {t.hero.title}
                <br />
                <span className="text-muted-foreground">
                  {t.hero.titleMuted}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
                {t.hero.description}
              </p>
            </div>
            <div className="flex flex-col justify-end gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>{t.hero.status}</span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500" />{" "}
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

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Sparkles className="size-4 text-emerald-500" />{" "}
                  {t.dispatch.title}
                </div>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Clock3 className="size-3" /> {t.dispatch.average}
                </span>
              </div>
              <div className="flex gap-1 border-b border-border px-4 pt-3">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`rounded-t-lg px-4 py-2.5 text-[11px] transition ${
                      activeTab === i
                        ? "border-b-2 border-emerald-500 text-emerald-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {activeTab === 0 && (
                  <>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="min-h-[130px] w-full resize-none rounded-xl border border-border bg-background p-4 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-emerald-500/50"
                      placeholder={t.dispatch.textPlaceholder}
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={domain}
                          onChange={(e) => setDomain(Number(e.target.value))}
                          className="rounded-lg border border-border bg-muted px-3 py-2 text-[10px] text-muted-foreground outline-none"
                        >
                          {t.dispatch.domains.map((item, i) => (
                            <option key={item} value={i}>
                              {item}
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-muted-foreground">
                          {input.length} / 10,000
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3">
                      <Link2 className="size-4 shrink-0 text-emerald-500" />
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder={t.dispatch.urlPlaceholder}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setInput("https://www.reuters.com/world/")
                        }
                        className="shrink-0 rounded-lg bg-emerald-400 px-3 py-2 text-[10px] font-semibold text-emerald-950 hover:bg-emerald-300"
                      >
                        {t.common.fetchArticle}
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === 2 && (
                  <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                    <div className="flex flex-wrap gap-2">
                      {["X / Twitter", "Threads", "Facebook", "TikTok"].map(
                        (platform) => (
                          <button
                            type="button"
                            key={platform}
                            onClick={() => setSocialPlatform(platform)}
                            className={`rounded-full border px-3 py-1.5 text-[10px] ${
                              socialPlatform === platform
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            {platform}
                          </button>
                        ),
                      )}
                    </div>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card p-3 text-sm outline-none"
                      placeholder="@handle or post URL"
                    />
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {input.length} {t.dispatch.charCount}
                    </span>
                  </div>
                  <button
                    onClick={runVerification}
                    disabled={isAnalyzing || !input.trim()}
                    className="flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-[11px] font-semibold text-emerald-950 shadow-[0_0_20px_rgba(110,231,183,.12)] transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isAnalyzing ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Zap className="size-3.5" />
                    )}
                    {isAnalyzing ? t.dispatch.reasoning : t.dispatch.deploy}
                    <ArrowUpRight className="size-3.5" />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {t.claims.map((demo) => (
                    <button
                      key={demo.label}
                      onClick={() => setInput(demo.text)}
                      className="rounded-full border border-border px-3 py-1.5 text-[10px] text-muted-foreground transition hover:border-emerald-500/40 hover:text-emerald-600"
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Pipeline
              t={t}
              isAnalyzing={isAnalyzing}
              hasResult={hasResult}
              status={status}
              analysisStep={analysisStep}
              logLines={logLines}
            />
          </section>

          <p className="mt-3 text-center text-[10px] leading-4 text-muted-foreground/70">
            {t.common.disclaimer}
          </p>

          {(hasResult || isAnalyzing) && (
            <Report
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

        {showToast && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-card px-4 py-3 text-xs text-emerald-600 shadow-2xl shadow-emerald-500/10"
          >
            <Check className="size-4" />
            {t.toast.complete}
          </div>
        )}

        <footer className="border-t border-border py-8 text-[10px] text-muted-foreground">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-medium text-foreground">{t.footer.credit}</p>
              <p className="mt-1 max-w-xl leading-5 text-muted-foreground">
                {t.footer.acceleration}
              </p>
            </div>
            <nav
              aria-label="Legal and product links"
              className="flex flex-wrap gap-x-4 gap-y-2 lg:justify-end"
            >
              <button
                onClick={() => setLegalModal("privacy")}
                className="transition hover:text-emerald-600"
              >
                {t.footer.privacy}
              </button>
              <button
                onClick={() => setLegalModal("terms")}
                className="transition hover:text-emerald-600"
              >
                {t.footer.terms}
              </button>
              <button
                onClick={() => setGovernanceOpen(true)}
                className="flex items-center gap-1 transition hover:text-emerald-600"
              >
                <Settings className="size-3" />
                {t.footer.settings}
              </button>
              <button className="transition hover:text-emerald-600">
                {t.footer.documentation}
              </button>
            </nav>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
            <span>{t.footer.system}</span>
            <span className="text-muted-foreground/50">/</span>
            <span>{t.footer.version}</span>
            <span className="hidden sm:inline">{t.footer.logs}</span>
          </div>
        </footer>

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

function Pipeline({
  t,
  isAnalyzing,
  hasResult,
  status,
  analysisStep,
  logLines,
}: {
  t: ReturnType<typeof getDictionary>;
  isAnalyzing: boolean;
  hasResult: boolean;
  status: string;
  analysisStep: number;
  logLines: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Activity className="size-4 text-emerald-500" /> {t.pipeline.title}
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-600">
          {status}
        </span>
      </div>
      <div className="space-y-5">
        {t.pipeline.steps.map((step, i) => {
          const complete = hasResult || analysisStep > i;
          const active = isAnalyzing && analysisStep === i;
          return (
            <div key={step} className="flex gap-3">
              <div className="relative flex flex-col items-center">
                <div
                  className={`z-10 grid size-5 place-items-center rounded-full border text-[9px] ${
                    active
                      ? "animate-pulse border-amber-500 bg-amber-500/10 text-amber-600"
                      : complete
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {complete ? <Check className="size-3" /> : i + 1}
                </div>
                {i < 3 && (
                  <div
                    className={`absolute top-5 h-9 w-px ${complete ? "bg-emerald-500/50" : "bg-border"}`}
                  />
                )}
              </div>
              <div>
                <p
                  className={`text-[11px] leading-5 ${complete || active ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                >
                  {step}…
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  {t.pipeline.labels[i]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 rounded-lg border border-border bg-background p-3 font-mono text-[9px] leading-5 text-muted-foreground">
        <span className="text-emerald-600">›</span> {t.pipeline.log}{" "}
        <span className="text-muted-foreground/50">// {t.pipeline.stream}</span>
        {logLines.length ? (
          logLines.map((line) => <div key={line}>{line}</div>)
        ) : (
          <>
            <br />
            <span>{isAnalyzing ? t.pipeline.querying : t.pipeline.synced}</span>
            <br />
            <span className="text-muted-foreground/60">
              {t.pipeline.complete}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function Report({
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
}: {
  t: ReturnType<typeof getDictionary>;
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
}) {
  const score = investigation
    ? Number.parseInt(investigation.score, 10)
    : defaultScore;
  const parts = useMemo(() => claimText.split(" "), [claimText]);
  const dossierSources = investigation?.sources ?? t.sourcesList;
  const dossierAnalysis = investigation?.analysis ?? t.report.dossierText;

  return (
    <section className="mt-5 rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <ClipboardCheck className="size-4 text-emerald-500" />{" "}
            {t.report.title}{" "}
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-600">
              {t.report.report}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {t.report.completed} · {claimText.slice(0, 52)}…
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={onOpenDossier}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-[10px] text-emerald-600 hover:bg-emerald-500/10"
          >
            {t.report.open}
          </button>
          <button
            onClick={copyCard}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[10px] text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="size-3" />
            ) : (
              <Copy className="size-3" />
            )}{" "}
            {copied ? t.report.copied : t.report.copy}
          </button>
          <button
            onClick={exportDossier}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[10px] text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground active:scale-[0.98]"
          >
            <Download className="size-3" />{" "}
            {exported ? t.views.downloaded : t.report.export}
          </button>
        </div>
      </div>
      <div className="grid gap-5 p-5 xl:grid-cols-[210px_1fr_300px]">
        <div className="flex flex-col items-center justify-center border-b border-border pb-5 xl:border-b-0 xl:border-r xl:pb-0">
          <div className="relative grid size-40 place-items-center rounded-full bg-[conic-gradient(#6ee7b7_273.6deg,#dbe4e2_0deg)] dark:bg-[conic-gradient(#6ee7b7_273.6deg,#1a2530_0deg)]">
            <div className="grid size-[132px] place-items-center rounded-full bg-card">
              <div className="text-center">
                <div className="text-4xl font-semibold tracking-[-0.08em] text-foreground">
                  {score}%
                </div>
                <div className="mt-1 text-[10px] text-emerald-600">
                  {scoreLabel}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-muted-foreground">
            {t.report.confidence}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[9px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />{" "}
            {t.report.high}
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {t.report.filters.map((filter, i) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(i)}
                  className={`rounded-md px-2.5 py-1.5 text-[10px] ${activeFilter === i ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {t.report.count}
            </span>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t.report.inspector}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t.report.inspect}
              </span>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              {parts.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className={
                    i >= 2 && i <= 4
                      ? "cursor-pointer rounded bg-emerald-500/15 px-1 text-emerald-700 dark:text-emerald-300"
                      : i >= 13 && i <= 16
                        ? "cursor-pointer rounded bg-amber-500/15 px-1 text-amber-700 dark:text-amber-200"
                        : i >= parts.length - 2
                          ? "cursor-pointer rounded bg-rose-500/15 px-1 text-rose-700 dark:text-rose-200"
                          : ""
                  }
                  onClick={() => setActiveClaim(i % 3)}
                >
                  {word}{" "}
                </span>
              ))}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat icon={<Check />} value="4" label={t.report.stats[0]} />
            <MiniStat
              icon={<AlertTriangle />}
              value="1"
              label={t.report.stats[1]}
            />
            <MiniStat
              icon={<AlertTriangle />}
              value="1"
              label={t.report.stats[2]}
            />
            <MiniStat icon={<Globe2 />} value="4" label={t.report.stats[3]} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t.report.dossier}
            </span>
            <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[9px] text-amber-600">
              {t.report.context}
            </span>
          </div>
          <h3 className="text-sm font-medium text-foreground">
            {t.report.claim} {activeClaim + 1}:{" "}
            {investigation?.title ?? t.claims[0].label}
          </h3>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
            {dossierAnalysis}
          </p>
          <div className="my-4 border-t border-border pt-3">
            <p className="mb-2 text-[9px] uppercase tracking-widest text-muted-foreground">
              {t.views.groundedSources}
            </p>
            {dossierSources.map((source, i) => (
              <div
                key={source}
                className="mb-2 flex items-center justify-between text-[10px] text-muted-foreground"
              >
                <span className="flex items-center gap-2">
                  <Link2 className="size-3" />
                  {source}
                </span>
                <span className="text-emerald-600">
                  {Number.parseInt(
                    source.match(/(\d+)%/)?.[1] ??
                      String(sourceConfidence[i] ?? 85),
                    10,
                  )}
                  %
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={onOpenDossier}
            className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-500"
          >
            {t.report.open} <ExternalLink className="size-3" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Radio className="size-3 text-emerald-500" /> {t.report.grounding}
          </span>
          <span className="hidden text-muted-foreground/50 sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3 text-emerald-500" />{" "}
            {t.report.backed}
          </span>
        </div>
        <label className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <input type="checkbox" className="accent-emerald-500" />{" "}
          {t.report.rerun}
        </label>
      </div>
    </section>
  );
}
