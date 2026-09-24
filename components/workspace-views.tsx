"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Cpu,
  Eye,
  Globe2,
  Radio,
  Search,
  ShieldCheck,
  TrendingUp,
  Wifi,
  Zap,
} from "lucide-react";
import type { getDictionary, Locale } from "@/dictionaries";
import { DossierModal } from "@/components/modals";

type Dictionary = ReturnType<typeof getDictionary>;

export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-sm font-bold text-foreground">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        {label}
      </div>
    </div>
  );
}

export function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs transition-all hover:border-emerald-500/40">
      <div className="flex items-center justify-between">
        <span className="text-xl font-extrabold text-foreground">{value}</span>
        <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 [&>svg]:size-4">
          {icon}
        </span>
      </div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        {label}
      </div>
    </div>
  );
}

export function ViewShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-8 lg:py-12">
      <div className="mb-8">
        <p className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
          <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
          {eyebrow}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
      </div>
      {children}
    </section>
  );
}

export function InvestigationsView({
  t,
  onOpenDossier,
}: {
  t: Dictionary;
  locale: Locale;
  onOpenDossier: (row: {
    caseIndex: number;
    name: string;
    status: string;
    date: string;
    category: string;
    score: string;
  }) => void;
}) {
  const [activeCategory, setActiveCategory] = useState(0);

  const rows = (t.claims || []).map((claim, index) => {
    const statuses = ["Verified", "Misleading", "Debunked"];
    const scores = ["76%", "42%", "12%", "88%", "94%"];
    const assignedStatus = statuses[index % statuses.length];
    const assignedDate =
      (t.views.dateFormat &&
        t.views.dateFormat[index % t.views.dateFormat.length]) ||
      "Dzisiaj, 14:32 UTC";
    const assignedCategory =
      (t.dispatch.domains &&
        t.dispatch.domains[index % t.dispatch.domains.length]) ||
      t.dispatch.domains[0];
    const assignedScore = scores[index % scores.length];

    return {
      caseIndex: index,
      name: claim.label,
      status: assignedStatus,
      date: assignedDate,
      category: assignedCategory,
      score: assignedScore,
    };
  });

  const labels = [
    t.views.recentCases,
    t.views.status,
    t.views.category,
    t.views.date,
    t.views.confidence,
    t.views.viewDossier,
  ];

  const localeStatus = (status: string) => {
    return status === "Verified"
      ? t.views.verified
      : status === "Misleading"
        ? t.views.misleading
        : t.views.debunked;
  };

  return (
    <ViewShell
      title={t.nav.investigations}
      eyebrow={`${t.nav.dashboard} / ${t.nav.investigations}`}
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {[t.views.all, ...t.dispatch.domains].map((category, i) => (
          <button
            key={category}
            onClick={() => setActiveCategory(i)}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
              activeCategory === i
                ? "border-emerald-600 bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 shadow-xs"
                : "border-border bg-card text-zinc-700 hover:border-emerald-500/50 hover:text-foreground dark:text-zinc-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[1.6fr_0.8fr_1fr_0.8fr_0.6fr_0.8fr] gap-3 border-b border-border bg-muted/60 px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
              {labels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="divide-y divide-border">
              {rows
                .filter(
                  (row) =>
                    activeCategory === 0 ||
                    row.category === t.dispatch.domains[activeCategory - 1],
                )
                .map((row) => (
                  <div
                    key={`${row.caseIndex}-${row.name}`}
                    className="grid cursor-pointer grid-cols-[1.6fr_0.8fr_1fr_0.8fr_0.6fr_0.8fr] items-center gap-3 px-5 py-4 text-xs transition-colors hover:bg-muted/40"
                    onClick={() => onOpenDossier(row)}
                  >
                    <span className="font-semibold text-foreground line-clamp-1">
                      {row.name}
                    </span>
                    <span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          row.status === "Verified"
                            ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                            : row.status === "Misleading"
                              ? "border border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300"
                              : "border border-rose-500/40 bg-rose-500/15 text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        {localeStatus(row.status)}
                      </span>
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                      {row.category}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                      {row.date}
                    </span>
                    <span className="font-bold text-foreground">
                      {row.score}
                    </span>
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-emerald-500/60 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenDossier(row);
                        }}
                      >
                        <span>{labels[5]}</span>
                        <ArrowUpRight className="size-3 text-zinc-500" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </ViewShell>
  );
}

export function InteractiveRepositoryView({
  t,
  search,
  setSearch,
  onLoadClaim,
}: {
  t: Dictionary;
  search: string;
  setSearch: (value: string) => void;
  onLoadClaim: (record: {
    title: string;
    tag: string;
    result: string;
    status: string;
    excerpt: string;
    analysis: string;
    sources: string[];
  }) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const records = (t.claims || []).map((claim, index) => {
    const tags = t.views.tags || [
      "Zdrowie",
      "Finanse",
      "Technologia",
      "Polityka",
    ];
    const results = ["76%", "42%", "12%", "89%"];
    const statuses = [
      t.views.verified,
      t.views.misleading,
      t.views.debunked,
      t.views.verified,
    ];

    return {
      title: claim.label,
      tag: tags[index % tags.length],
      result: results[index % results.length],
      status: statuses[index % statuses.length],
      excerpt: claim.text,
      analysis: t.report.dossierText,
      sources: (t.sourcesList as unknown as string[]) || [
        "PubMed Central (PMC)",
        "Reuters Fact Check",
        "CDC Guidelines",
      ],
    };
  });

  const normalized = search.trim().toLowerCase();
  const recordsFound = records.filter(
    (record) =>
      !normalized ||
      `${record.title} ${record.tag} ${record.excerpt} ${record.analysis}`
        .toLowerCase()
        .includes(normalized),
  );
  const activeRecord = selected === null ? null : records[selected];

  return (
    <ViewShell
      title={t.nav.repository}
      eyebrow={`${t.nav.dashboard} / ${t.nav.repository}`}
    >
      {/* 3 kafelki podsumowujące z wyrazistym kontrastem */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <MiniStat
          icon={<Check />}
          value="1,284"
          label={t.views.verifiedClaims}
        />
        <MiniStat
          icon={<AlertTriangle />}
          value="18.4%"
          label={t.views.flaggedClaims}
        />
        <MiniStat
          icon={<TrendingUp />}
          value="99.98%"
          label={t.views.groundingPrecision}
        />
      </div>

      {/* Pasek wyszukiwania */}
      <div className="mb-3.5 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
        <Search className="size-4.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
        <input
          aria-label={t.views.searchClaims}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
          placeholder={t.views.searchClaims}
        />
      </div>

      {/* Tagi filtrów */}
      <div className="mb-6 flex flex-wrap gap-2">
        {t.views.tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSearch(search === tag ? "" : tag)}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
              search === tag
                ? "border-emerald-600 bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 shadow-xs"
                : "border-border bg-card text-zinc-700 hover:border-emerald-500/50 hover:text-foreground dark:text-zinc-300"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Siatka kart wyników */}
      {recordsFound.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recordsFound.map((record) => {
            const index = records.indexOf(record);
            const scoreNum =
              Number.parseInt(record.result.replace("%", ""), 10) || 50;
            const scoreColor =
              scoreNum > 65
                ? "text-emerald-700 dark:text-emerald-400"
                : scoreNum > 35
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-rose-700 dark:text-rose-400";

            return (
              <button
                key={record.title}
                onClick={() => setSelected(index)}
                className="group flex flex-col justify-between cursor-pointer rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-black/5"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      {record.tag}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-zinc-600 group-hover:text-emerald-700 dark:text-zinc-400 dark:group-hover:text-emerald-300 transition-colors">
                      <Eye className="size-3.5" />
                      <span>Dossier</span>
                    </span>
                  </div>
                  <h2 className="text-sm font-bold leading-snug text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {record.title}
                  </h2>
                  <p className="mt-2.5 text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed font-normal">
                    {record.excerpt}
                  </p>
                </div>

                <div className="mt-5 flex items-end justify-between border-t border-border pt-3.5">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-bold block">
                      {t.report.confidence}
                    </span>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {record.status}
                    </span>
                  </div>
                  <strong className={`text-xl font-extrabold ${scoreColor}`}>
                    {record.result}
                  </strong>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {t.views.searchClaims}
        </div>
      )}

      {activeRecord && (
        <DossierModal
          t={t}
          record={activeRecord}
          onClose={() => setSelected(null)}
          onLoad={() => {
            onLoadClaim(activeRecord);
            setSelected(null);
          }}
        />
      )}
    </ViewShell>
  );
}

export function ApiStatusView({ t }: { t: Dictionary; locale: Locale }) {
  const services = [
    {
      name: "NVIDIA Llama-3.1-Nemotron-70B-Instruct",
      provider: "Nebius Token Factory",
      detail: "Inference Cluster H100 SXM5 · Zero Data Retention",
      latency: "218 ms",
      throughput: "1,842 tok/s",
      icon: <Cpu className="size-4 text-emerald-700 dark:text-emerald-400" />,
    },
    {
      name: "Tavily Web Grounding Engine",
      provider: "Tavily Search API",
      detail: t.views.realTimeRetrieval,
      latency: "482 ms",
      throughput: "12.4k domen",
      icon: (
        <Globe2 className="size-4 text-emerald-700 dark:text-emerald-400" />
      ),
    },
  ];

  const telemetryHeights = [
    "h-[38%]",
    "h-[54%]",
    "h-[45%]",
    "h-[67%]",
    "h-[52%]",
    "h-[72%]",
    "h-[61%]",
    "h-[84%]",
    "h-[68%]",
    "h-[90%]",
    "h-[76%]",
    "h-[94%]",
    "h-[82%]",
    "h-[88%]",
    "h-[97%]",
    "h-[91%]",
    "h-[99%]",
    "h-[93%]",
    "h-[100%]",
    "h-[95%]",
  ];

  return (
    <ViewShell title={t.nav.api} eyebrow={`${t.nav.dashboard} / ${t.nav.api}`}>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <MiniStat icon={<Wifi />} value="99.98%" label={t.views.systemUptime} />
        <MiniStat
          icon={<Zap />}
          value="350 ms"
          label={t.views.averageLatency}
        />
        <MiniStat
          icon={<Radio />}
          value="24/24"
          label={t.views.operationalChecks}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => (
          <article
            key={service.name}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 shrink-0">
                  {service.icon}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    {service.name}
                  </h2>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    {service.provider}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                    {service.detail}
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                {t.views.operational}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <Metric value={service.latency} label={t.views.latency} />
              <Metric
                value={service.throughput}
                label={
                  service.name.includes("Tavily")
                    ? t.views.indexed
                    : t.views.throughput
                }
              />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-foreground">
              {t.views.globalTelemetry}
            </h2>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
            {t.views.live}
          </span>
        </div>
        <div className="flex h-24 items-end gap-1.5 pt-2">
          {telemetryHeights.map((heightClass, index) => (
            <span
              key={index}
              className={`flex-1 rounded-t bg-emerald-500/40 transition-all hover:bg-emerald-500 ${heightClass}`}
            />
          ))}
        </div>
      </div>
    </ViewShell>
  );
}
