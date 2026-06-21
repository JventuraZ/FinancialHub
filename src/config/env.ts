export const ENV = {
  FINNHUB_API_KEY: import.meta.env.VITE_FINNHUB_API_KEY ?? 'demo',
  // COUNTRIES_API_KEY is read only by vite.config.ts (server-side proxy) — never sent to the browser

  // `/stock/candle` é premium na Finnhub. Enquanto não houver plano pago, geramos
  // candles sintéticas com a forma exata da resposta real. Default: true (mock ligado).
  // Após upgrade do plano: definir VITE_USE_MOCK_CANDLES=false para usar o endpoint real.
  USE_MOCK_CANDLES: import.meta.env.VITE_USE_MOCK_CANDLES !== 'false',
}
