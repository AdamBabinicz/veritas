"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  Eye,
  Radio,
  Search,
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
      <div className="text-sm font-medium text-foreground">{value}</div>
      <div className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">
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
    <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-emerald-600">
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium">{value}</span>
        <span className="[&>svg]:size-3">{icon}</span>
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">
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
    <section className="py-10 lg:py-14">
      <div className="mb-8">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-600">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
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
  const rows = [
    {
      caseIndex: 0,
      name: t.claims[0].label,
      status: "Verified",
      date: t.views.dateFormat[0],
      category: t.dispatch.domains[0],
      score: "76%",
    },
    {
      caseIndex: 1,
      name: t.claims[1].label,
      status: "Misleading",
      date: t.views.dateFormat[1],
      category: t.dispatch.domains[2],
      score: "42%",
    },
    {
      caseIndex: 2,
      name: t.claims[2].label,
      status: "Debunked",
      date: t.views.dateFormat[2],
      category: t.dispatch.domains[1],
      score: "12%",
    },
  ];
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
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-[10px] transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground ${
              activeCategory === i
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                : "border-border text-muted-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[1.6fr_0.7fr_1fr_0.8fr_0.6fr_0.8fr] gap-3 border-b border-border px-5 py-3 text-[9px] uppercase tracking-widest text-muted-foreground">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        {rows
          .filter(
            (row) =>
              activeCategory === 0 ||
              row.category === t.dispatch.domains[activeCategory - 1],
          )
          .map((row) => (
            <div
              key={row.name}
              className="grid cursor-pointer grid-cols-[1.6fr_0.7fr_1fr_0.8fr_0.6fr_0.8fr] items-center gap-3 border-b border-border px-5 py-4 text-[11px] transition-all last:border-0 hover:bg-muted/50"
              onClick={() => onOpenDossier(row)}
            >
              <span className="font-medium text-foreground">{row.name}</span>
              <span
                className={`w-fit rounded-full px-2 py-1 text-[9px] ${
                  row.status === "Verified"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : row.status === "Misleading"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-rose-500/10 text-rose-600"
                }`}
              >
                {localeStatus(row.status)}
              </span>
              <span className="text-muted-foreground">{row.category}</span>
              <span className="text-muted-foreground">{row.date}</span>
              <span className="text-foreground">{row.score}</span>
              <button
                className="w-fit cursor-pointer rounded-lg border border-border px-2 py-1.5 text-[9px] text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenDossier(row);
                }}
              >
                {labels[5]}
              </button>
            </div>
          ))}
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

  const records = [
    {
      title: t.claims[0].label,
      tag: t.views.tags[0],
      result: "76%",
      status: t.views.verified,
      excerpt: t.claims[0].text,
      analysis: t.report.dossierText,
      sources: t.sourcesList as unknown as string[],
    },
    {
      title: t.claims[1].label,
      tag: t.views.tags[1],
      result: "42%",
      status: t.views.misleading,
      excerpt: t.claims[1].text,
      analysis: t.report.dossierText,
      sources: t.sourcesList as unknown as string[],
    },
    {
      title: t.claims[2].label,
      tag: t.views.tags[2],
      result: "12%",
      status: t.views.debunked,
      excerpt: t.claims[2].text,
      analysis: t.report.dossierText,
      sources: t.sourcesList as unknown as string[],
    },
  ];

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
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          aria-label={t.views.searchClaims}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder={t.views.searchClaims}
        />
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {t.views.tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSearch(tag)}
            className={`rounded-full border px-3 py-1.5 text-[10px] transition ${
              search === tag
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                : "border-border text-muted-foreground hover:border-emerald-500/60 hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      {recordsFound.length ? (
        <div className="grid gap-3 md:grid-cols-3">
          {recordsFound.map((record) => {
            const index = records.indexOf(record);
            return (
              <button
                key={record.title}
                onClick={() => setSelected(index)}
                className="group cursor-pointer rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div className="mb-7 flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-600">
                    {record.tag}
                  </span>
                  <Eye className="size-4 text-muted-foreground transition group-hover:text-emerald-500" />
                </div>
                <h3 className="text-sm font-medium leading-5">
                  {record.title}
                </h3>
                <div className="mt-5 flex items-end justify-between border-t border-border pt-3">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    {t.report.confidence}
                  </span>
                  <strong className="text-lg text-emerald-600">
                    {record.result}
                  </strong>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
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
      name: "NVIDIA Nemotron-4",
      detail: "Nebius Token Factory",
      latency: "218 ms",
      throughput: "1,842 tok/s",
    },
    {
      name: "Tavily Web Grounding Engine",
      detail: t.views.realTimeRetrieval,
      latency: "482 ms",
      throughput: "12.4k domains",
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
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium">{service.name}</h3>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {service.detail}
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {t.views.operational}
              </span>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-border pt-4">
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
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">{t.views.globalTelemetry}</h3>
          <span className="text-[10px] text-emerald-600">{t.views.live}</span>
        </div>
        <div className="flex h-24 items-end gap-1">
          {telemetryHeights.map((heightClass, index) => (
            <span
              key={index}
              className={`flex-1 rounded-t bg-emerald-400/60 transition-all hover:bg-emerald-400 ${heightClass}`}
            />
          ))}
        </div>
      </div>
    </ViewShell>
  );
}
