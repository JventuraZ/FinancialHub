import type {
  FinnhubQuote,
  FinnhubSymbol,
  FinnhubCompanyProfile,
  FinnhubNewsItem,
  FinnhubCandles,
  FinnhubMetrics,
} from '../../types/finnhub'
import { finnhubGet } from './client'
import { ENV } from '../../config/env'
import { mockCandles } from './mock/mockCandles'

export function fetchQuote(symbol: string): Promise<FinnhubQuote> {
  return finnhubGet<FinnhubQuote>('/quote', { symbol })
}

export function fetchSymbols(exchange: string): Promise<FinnhubSymbol[]> {
  return finnhubGet<FinnhubSymbol[]>('/stock/symbol', { exchange })
}

export function fetchCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile> {
  return finnhubGet<FinnhubCompanyProfile>('/stock/profile2', { symbol })
}

export function fetchMarketNews(category: string): Promise<FinnhubNewsItem[]> {
  return finnhubGet<FinnhubNewsItem[]>('/news', { category })
}

export function fetchCompanyNews(
  symbol: string,
  from: string,
  to: string
): Promise<FinnhubNewsItem[]> {
  return finnhubGet<FinnhubNewsItem[]>('/company-news', { symbol, from, to })
}

export function fetchCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<FinnhubCandles> {
  // `/stock/candle` é premium na Finnhub. Em modo mock devolvemos dados sintéticos
  // com a forma exata da resposta premium; ao obter o plano pago, basta
  // VITE_USE_MOCK_CANDLES=false para usar a chamada real abaixo (intacta).
  if (ENV.USE_MOCK_CANDLES) {
    return Promise.resolve(mockCandles(symbol, resolution, from, to))
  }
  return finnhubGet<FinnhubCandles>('/stock/candle', { symbol, resolution, from, to })
}

export function fetchPeers(symbol: string): Promise<string[]> {
  return finnhubGet<string[]>('/stock/peers', { symbol })
}

export function fetchMetrics(symbol: string): Promise<FinnhubMetrics> {
  return finnhubGet<FinnhubMetrics>('/stock/metric', { symbol, metric: 'all' })
}
