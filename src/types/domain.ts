export interface CandlePoint {
  timestamp: number
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y'
export type ChartType = 'candlestick' | 'line'
export type NewsCategory = 'general' | 'forex' | 'crypto' | 'merger'

export interface MetricDisplay {
  label: string
  value: string
}
