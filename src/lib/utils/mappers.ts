import type { FinnhubCandles, FinnhubMetrics } from '../../types/finnhub'
import type { CandlePoint, MetricDisplay } from '../../types/domain'
import { formatCandleDate } from './date'

export function mapCandles(raw: FinnhubCandles, resolution: string): CandlePoint[] {
  if (raw.s !== 'ok' || !raw.t?.length) return []
  return raw.t.map((t, i) => ({
    timestamp: t,
    date: formatCandleDate(t, resolution),
    open: raw.o[i] ?? 0,
    high: raw.h[i] ?? 0,
    low: raw.l[i] ?? 0,
    close: raw.c[i] ?? 0,
    volume: raw.v[i] ?? 0,
  }))
}

const METRIC_LABELS: [string, string][] = [
  ['52WeekHigh', '52-Week High'],
  ['52WeekLow', '52-Week Low'],
  ['beta', 'Beta'],
  ['peBasicExclExtraTTM', 'P/E Ratio (TTM)'],
  ['pbQuarterly', 'P/B Ratio'],
  ['dividendYieldIndicatedAnnual', 'Dividend Yield'],
  ['epsBasicExclExtraItemsTTM', 'EPS (TTM)'],
  ['roeTTM', 'ROE (TTM)'],
  ['netMarginTTM', 'Net Margin (TTM)'],
  ['revenueGrowth3Y', 'Revenue Growth (3Y)'],
]

export function mapMetricsToDisplay(raw: FinnhubMetrics): MetricDisplay[] {
  return METRIC_LABELS
    .map(([key, label]) => {
      const val = raw.metric[key]
      if (val === undefined || val === null) return null
      const num = typeof val === 'number' ? val : parseFloat(String(val))
      return { label, value: isNaN(num) ? String(val) : num.toFixed(2) }
    })
    .filter((x): x is MetricDisplay => x !== null)
}
