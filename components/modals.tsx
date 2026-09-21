"use client";

import React from "react";
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
import type { getDictionary } from "@/dictionaries";

type Dictionary = ReturnType<typeof getDictionary>;

export function sourceUrl(label: string): string {
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
      className={`relative h-5 w-9 rounded-full border border-border transition ${checked ? "bg-emerald-400" : "bg-muted"}`}
    >
      <span
        className={`absolute top-0.5 size-3.5 rounded-full bg-white transition ${checked ? "left-[18px]" : "left-0.5"}`}
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
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5 sm:px-8">
          <div
            className="flex items-center gap-2 text-sm font-semibold"
            id="modal-title"
          >
            {icon}
            {title}
          </div>
          <button
            aria-label={title}
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mr-1 max-h-[70vh] overflow-y-auto px-6 py-6 pr-4 overscroll-contain sm:px-8">
          {children}
        </div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-border px-6 py-4 sm:px-8">
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
      <p className="mb-5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {t.legal.lastUpdated}
      </p>
      <div className="space-y-5 text-sm leading-7 text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <div key={paragraph}>
            <h3 className="mb-1 text-xs font-semibold text-foreground">
              {t.legal.sections[isPrivacy ? index : index + 1]}
            </h3>
            <p>{paragraph}</p>
          </div>
        ))}
      </div>
      {!isPrivacy && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-5 text-foreground">
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
        <p className="text-xs font-medium">{title}</p>
        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
          {description}
        </p>
      </div>
      {locked ? (
        <LockKeyhole className="size-4 text-emerald-500" />
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
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted"
          >
            {t.legal.close}
          </button>
          <button
            onClick={onSave}
            className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-300"
          >
            {t.consent.save}
          </button>
        </>
      }
    >
      <p className="mb-5 text-sm leading-6 text-muted-foreground">
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
    <aside className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-4xl rounded-xl border border-border bg-card/90 p-4 shadow-2xl backdrop-blur-md sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Cookie className="mt-0.5 size-4 shrink-0 text-emerald-500" />
          <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
            {t.consent.banner}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onManage}
            className="rounded-lg border border-border px-3 py-2 text-[11px] text-muted-foreground transition hover:text-foreground"
          >
            {t.consent.manage}
          </button>
          <button
            onClick={onAccept}
            className="rounded-lg bg-emerald-400 px-3 py-2 text-[11px] font-semibold text-emerald-950 transition hover:bg-emerald-300"
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
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold">{t.governance.active}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <span className="rounded-lg bg-emerald-500/10 p-3 text-[10px] text-emerald-600">
              {t.consent.essential}
            </span>
            <span className="rounded-lg bg-muted p-3 text-[10px]">
              {consent.analytics ? "GTM / GA4" : "GTM / GA4 off"}
            </span>
            <span className="rounded-lg bg-muted p-3 text-[10px]">
              {consent.ai ? "AI metrics" : "AI metrics off"}
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
          <p className="mb-2 text-xs font-semibold">{t.governance.audit}</p>
          <ul className="space-y-2 text-[11px] text-muted-foreground">
            {t.governance.auditItems.map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="size-3 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onPurge}
          className="rounded-lg border border-rose-500/30 px-3 py-2 text-xs text-rose-600 hover:bg-rose-500/10"
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
  return (
    <ModalShell
      title={t.nav.repository}
      icon={<ShieldCheck className="size-4 text-emerald-500" />}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted"
          >
            {t.legal.close}
          </button>
          <button
            onClick={onLoad}
            className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-300"
          >
            {t.views.loadToWorkspace}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-600">
              {record.tag}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {record.status}
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {record.title}
          </h2>
        </div>
        <div className="flex items-center gap-5 rounded-xl border border-border bg-background p-4">
          <div className="relative grid size-24 shrink-0 place-items-center rounded-full bg-[conic-gradient(#6ee7b7_273deg,#1a2530_0deg)]">
            <div className="grid size-[74px] place-items-center rounded-full bg-card">
              <strong className="text-xl text-emerald-500">
                {record.result}
              </strong>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t.report.confidence}
            </p>
            <p className="mt-1 text-sm font-medium">{record.status}</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-emerald-600">
              {t.views.aiAnalysis}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {t.views.groundedStatus}
            </p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
            {t.report.claim}
          </p>
          <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-7 text-foreground">
            {record.excerpt}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
            {t.views.aiAnalysis}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {record.analysis}
          </p>
        </div>
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
            {t.views.groundedSources}
          </p>
          <div className="space-y-2">
            {record.sources.map((source, index) => (
              <a
                href={sourceUrl(source)}
                target="_blank"
                rel="noopener noreferrer"
                key={source}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-3 text-xs transition hover:border-emerald-500/50"
              >
                <span className="flex items-center gap-2">
                  <span className="rounded bg-emerald-500/10 px-1.5 py-1 text-[9px] text-emerald-600">
                    {source.split(" ")[0]}
                  </span>
                  {source}
                </span>
                <span className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {[94, 89, 86][index] ?? 82}%{" "}
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
