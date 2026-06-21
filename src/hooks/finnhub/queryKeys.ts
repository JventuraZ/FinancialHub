export const FINNHUB_KEYS = {
  quote:       (symbol: string) => ['finnhub', 'quote', symbol] as const,
  symbols:     (exchange: string) => ['finnhub', 'symbols', exchange] as const,
  profile:     (symbol: string) => ['finnhub', 'profile', symbol] as const,
  marketNews:  (category: string) => ['finnhub', 'news', 'market', category] as const,
  companyNews: (symbol: string, from: string, to: string) => ['finnhub', 'news', 'company', symbol, from, to] as const,
  candles:     (symbol: string, resolution: string, from: number, to: number) => ['finnhub', 'candles', symbol, resolution, from, to] as const,
  peers:       (symbol: string) => ['finnhub', 'peers', symbol] as const,
  metrics:     (symbol: string) => ['finnhub', 'metrics', symbol] as const,
} as const
