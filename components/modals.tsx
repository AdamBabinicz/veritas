"use client";

import React, { useEffect } from "react";
import {
  Check,
  Cookie,
  ExternalLink,
  FileText,
  LockKeyhole,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import type { Dictionary } from "@/dictionaries";

export function sourceUrl(label: string): string {
  if (label.startsWith("http://") || label.startsWith("https://")) {
    return label;
  }
  const normalized = label.toLowerCase();
  if (normalized.includes("pubmed")) return "https://pubmed.ncbi.nlm.nih.gov";
  if (normalized.includes("reuters"))
    return "https://www.reuters.com/fact-check";
  if (normalized.includes("cdc")) return "https://www.cdc.gov";
  if (normalized.includes("sec")) return "https://www.sec.gov/edgar";
  if (normalized.includes("bloomberg")) return "https://www.bloomberg.com";
  return "https://www.reuters.com/fact-check";
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-5 w-9 rounded-full border border-border transition-colors cursor-pointer ${
        checked ? "bg-emerald-400" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 size-3.5 rounded-full bg-white transition-all shadow-xs ${
          checked ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export function ModalShell({
  title,
  icon,
  children,
  footer,
  onClose,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
}) {
  // Zamykanie modala klawiszem ESC i blokowanie przewijania tła
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("overflow-hidden");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("overflow-hidden");
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-xs sm:items-center animate-in fade-in duration-150"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-150"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-4 sm:px-8">
          <div
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
            id="modal-title"
          >
            {icon}
            <span>{title}</span>
          </div>
          <button
            type="button"
            aria-label={title}
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6 pr-4 overscroll-contain sm:px-8">
          {children}
        </div>

        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-border px-6 py-4 sm:px-8 bg-muted/20">
            {footer}
          </div>
        )}
      </section>
    </div>
  );
}

export function LegalModal({
  t,
  kind,
  onClose,
}: {
  t: Dictionary;
  kind: "privacy" | "terms";
  onClose: () => void;
}) {
  const isPrivacy = kind === "privacy";
  const paragraphs = isPrivacy ? t.legal.privacy : t.legal.terms;

  return (
    <ModalShell
      title={isPrivacy ? t.legal.privacyTitle : t.legal.termsTitle}
      icon={<FileText className="size-4 text-emerald-500" />}
      onClose={onClose}
    >
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {t.legal.lastUpdated}
      </p>
      <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <div key={`${paragraph.slice(0, 20)}-${index}`}>
            <h3 className="mb-1 text-xs font-semibold text-foreground">
              {t.legal.sections[isPrivacy ? index : index + 1]}
            </h3>
            <p>{paragraph}</p>
          </div>
        ))}
      </div>
      {!isPrivacy && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-5 text-foreground font-medium">
          {t.legal.acknowledgment}
        </div>
      )}
    </ModalShell>
  );
}

export function ConsentRow({
  title,
  description,
  checked,
  locked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4">
      <div>
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {locked ? (
        <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
          <LockKeyhole className="size-3.5" />
        </div>
      ) : (
        <Toggle checked={checked} onChange={onChange!} label={title} />
      )}
    </div>
  );
}

export function ConsentModal({
  t,
  consent,
  setConsent,
  onClose,
  onSave,
}: {
  t: Dictionary;
  consent: {
    analytics: boolean;
    ai: boolean;
    marketing: boolean;
    deep: boolean;
  };
  setConsent: React.Dispatch<
    React.SetStateAction<{
      analytics: boolean;
      ai: boolean;
      marketing: boolean;
      deep: boolean;
    }>
  >;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <ModalShell
      title={t.consent.title}
      icon={<Cookie className="size-4 text-emerald-500" />}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            {t.legal.close}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-300 transition-colors shadow-xs cursor-pointer"
          >
            {t.consent.save}
          </button>
        </>
      }
    >
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        {t.consent.description}
      </p>
      <div className="space-y-3">
        <ConsentRow
          title={t.consent.essential}
          description={t.consent.essentialDesc}
          checked
          locked
        />
        <ConsentRow
          title={t.consent.analytics}
          description={t.consent.analyticsDesc}
          checked={consent.analytics}
          onChange={() =>
            setConsent((prev) => ({ ...prev, analytics: !prev.analytics }))
          }
        />
        <ConsentRow
          title={t.consent.ai}
          description={t.consent.aiDesc}
          checked={consent.ai}
          onChange={() => setConsent((prev) => ({ ...prev, ai: !prev.ai }))}
        />
        <ConsentRow
          title={t.consent.marketing}
          description={t.consent.marketingDesc}
          checked={consent.marketing}
          onChange={() =>
            setConsent((prev) => ({ ...prev, marketing: !prev.marketing }))
          }
        />
      </div>
    </ModalShell>
  );
}

export function ConsentBanner({
  t,
  onAccept,
  onManage,
}: {
  t: Dictionary;
  onAccept: () => void;
  onManage: () => void;
}) {
  return (
    <aside className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-4xl rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md sm:p-5 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Cookie className="mt-0.5 size-4 shrink-0 text-emerald-500" />
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {t.consent.banner}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onManage}
            className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            {t.consent.manage}
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 shadow-xs cursor-pointer"
          >
            {t.consent.accept}
          </button>
        </div>
      </div>
    </aside>
  );
}

export function GovernanceModal({
  t,
  consent,
  setConsent,
  purged,
  onPurge,
  onClose,
}: {
  t: Dictionary;
  consent: {
    analytics: boolean;
    ai: boolean;
    marketing: boolean;
    deep: boolean;
  };
  setConsent: React.Dispatch<
    React.SetStateAction<{
      analytics: boolean;
      ai: boolean;
      marketing: boolean;
      deep: boolean;
    }>
  >;
  purged: boolean;
  onPurge: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title={t.governance.title}
      icon={<Settings className="size-4 text-emerald-500" />}
      onClose={onClose}
    >
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-xs font-semibold text-foreground">
            {t.governance.active}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <span className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span>{t.consent.essential}</span>
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-xl border p-3 text-xs font-medium ${
                consent.analytics
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  consent.analytics ? "bg-emerald-400" : "bg-muted-foreground"
                }`}
              />
              <span>{t.consent.analytics}</span>
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-xl border p-3 text-xs font-medium ${
                consent.ai
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  consent.ai ? "bg-emerald-400" : "bg-muted-foreground"
                }`}
              />
              <span>{t.consent.ai}</span>
            </span>
          </div>
        </div>

        <ConsentRow
          title={t.governance.deep}
          description={t.governance.deepDesc}
          checked={consent.deep}
          onChange={() => setConsent((prev) => ({ ...prev, deep: !prev.deep }))}
        />

        <div>
          <p className="mb-2.5 text-xs font-semibold text-foreground">
            {t.governance.audit}
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {t.governance.auditItems.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onPurge}
          className="rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          {purged ? t.governance.purgeDone : t.governance.purge}
        </button>
      </div>
    </ModalShell>
  );
}

export function DossierModal({
  t,
  record,
  onClose,
  onLoad,
}: {
  t: Dictionary;
  record: {
    title: string;
    tag: string;
    result: string;
    status: string;
    excerpt: string;
    analysis: string;
    sources: string[];
  };
  onClose: () => void;
  onLoad: () => void;
}) {
  const numericScore =
    Number.parseInt(record.result.replace("%", ""), 10) || 76;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (numericScore / 100) * circumference;

  return (
    <ModalShell
      title={t.nav.repository}
      icon={<ShieldCheck className="size-4 text-emerald-500" />}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            {t.legal.close}
          </button>
          <button
            type="button"
            onClick={onLoad}
            className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-300 transition-colors shadow-xs cursor-pointer"
          >
            {t.views.loadToWorkspace}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              {record.tag}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {record.status}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {record.title}
          </h2>
        </div>

        {/* Dynamiczny pierścień zaufania w SVG */}
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-background/80 p-4">
          <div className="relative grid size-24 shrink-0 place-items-center">
            <svg
              className="size-full -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-muted/40 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-emerald-400 fill-none transition-all duration-700 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <strong className="text-lg font-bold text-foreground">
                {record.result}
              </strong>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.report.confidence}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {record.status}
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
              {t.views.aiAnalysis}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {t.views.groundedStatus}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
            {t.report.claim}
          </p>
          <p className="rounded-xl border border-border bg-muted/20 p-4 text-xs leading-relaxed text-foreground">
            {record.excerpt}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
            {t.views.aiAnalysis}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {record.analysis}
          </p>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
            {t.views.groundedSources}
          </p>
          <div className="space-y-2">
            {record.sources.map((source) => (
              <a
                href={sourceUrl(source)}
                target="_blank"
                rel="noopener noreferrer"
                key={source}
                className="flex items-center justify-between rounded-xl border border-border bg-background/80 px-3.5 py-3 text-xs transition-colors hover:border-emerald-500/50 hover:bg-muted/30"
              >
                <span className="flex items-center gap-2 truncate pr-2">
                  <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                    {source.split(" ")[0]}
                  </span>
                  <span className="truncate font-medium text-foreground">
                    {source}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 shrink-0">
                  <span>94%</span>
                  <ExternalLink className="size-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
