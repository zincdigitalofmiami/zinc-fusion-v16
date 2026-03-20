export type IsoDateTimeString = string;

export interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
  asOf: IsoDateTimeString;
  source?: string;
  warning?: string;
}

export interface ZlPriceBar {
  symbol: string;
  tradeDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ZlLivePrice {
  symbol: string;
  price: number;
  observedAt: IsoDateTimeString;
}

export interface TargetZone {
  horizonDays: number;
  p30: number;
  p50: number;
  p70: number;
  generatedAt: IsoDateTimeString;
}

export interface ForecastSummary {
  horizonDays: number;
  predictedPrice: number;
  hitProbability: number;
  modelVersion: string;
}

export interface DriverAttribution {
  factor: string;
  contribution: number;
  confidence: number;
}

export interface RegimeState {
  regime: string;
  confidence: number;
  updatedAt: IsoDateTimeString;
}

export interface StrategyPosture {
  posture: "ACCUMULATE" | "WAIT" | "DEFER";
  rationale: string;
  updatedAt: IsoDateTimeString;
}

export interface SentimentOverview {
  headlineCount: number;
  sentimentScore: number;
  cotBias: string;
  updatedAt: IsoDateTimeString;
}

export interface LegislationItem {
  source: string;
  title: string;
  publishedAt: IsoDateTimeString;
  tags: string[];
}

export interface VegasIntelSnapshot {
  activeEvents: number;
  highPriorityAccounts: number;
  updatedAt: IsoDateTimeString;
}

