export const score = 76;

export const sourceConfidence = [94, 89, 86, 91, 88] as const;

export const metricValues = ["1,284", "99.98%", "3.8s"] as const;

export type HighlightTone = "emerald" | "amber" | "rose";

export interface ClaimToneMapping {
  key: string;
  tone: HighlightTone;
  label: string;
}

export const claimParts: readonly ClaimToneMapping[] = [
  { key: "study", tone: "emerald", label: "Zweryfikowane dowody naukowe" },
  {
    key: "mortality",
    tone: "amber",
    label: "Nadinterpretacja / brak kontekstu",
  },
  { key: "boosters", tone: "rose", label: "Teza niepotwierdzona / obalona" },
] as const;

export const telemetryClusters = {
  inferenceNode: "Nebius GPU Cluster · H100 SXM5",
  searchEngine: "Tavily Deep Grounding v2.4",
  edgeLatencyMs: 218,
  groundingLatencyMs: 482,
} as const;
