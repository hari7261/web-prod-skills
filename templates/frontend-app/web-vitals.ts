export interface WebVitalSample {
  name: "LCP" | "INP" | "CLS";
  value: number;
  route: string;
}

const TARGETS = { LCP: 2500, INP: 200, CLS: 0.1 } as const;

export function evaluateWebVital(sample: WebVitalSample) {
  const budget = TARGETS[sample.name];
  return { ...sample, budget, withinBudget: sample.value <= budget };
}

