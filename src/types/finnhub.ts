export interface FinnhubQuote {
  c: number   // current price
  d: number   // change
  dp: number  // percent change
  h: number   // high
  l: number   // low
  o: number   // open
  pc: number  // previous close
  t: number   // timestamp
}

export interface FinnhubSymbol {
  currency: string
  description: string
  displaySymbol: string
  figi: string
  mic: string
  symbol: string
  type: string
}

export interface FinnhubCompanyProfile {
  country: string
  currency: string
  exchange: string
  finnhubIndustry: string
  ipo: string
  logo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
}

export interface FinnhubNewsItem {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

export interface FinnhubCandles {
  c: number[]
  h: number[]
  l: number[]
  o: number[]
  s: string
  t: number[]
  v: number[]
}

export type FinnhubPeers = string[]

export interface FinnhubMetricData {
  '52WeekHigh'?: number
  '52WeekLow'?: number
  '52WeekHighDate'?: string
  '52WeekLowDate'?: string
  beta?: number
  peBasicExclExtraTTM?: number
  pbQuarterly?: number
  dividendYieldIndicatedAnnual?: number
  epsBasicExclExtraItemsTTM?: number
  roeTTM?: number
  netMarginTTM?: number
  revenueGrowth3Y?: number
  [key: string]: number | string | undefined
}

export interface FinnhubMetrics {
  metric: FinnhubMetricData
  metricType: string
  symbol: string
}
