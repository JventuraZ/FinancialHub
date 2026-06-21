import type { FinnhubCandles } from '../../../types/finnhub'
import { hashString, mulberry32, gaussian } from './seededRandom'

// Gerador de candles (OHLCV) SINTÉTICAS com a forma exata da resposta premium do
// endpoint `/stock/candle` da Finnhub. Determinístico: o mesmo (symbol, resolution)
// produz sempre a mesma série → não pisca entre renders, é cache-consistente e
// reproduzível em testes. Substituível pela chamada real premium via flag (ver endpoints.ts).

const STEP_SECONDS: Record<string, number> = {
  '1': 60,
  '5': 5 * 60,
  '15': 15 * 60,
  '30': 30 * 60,
  '60': 60 * 60,
  D: 86_400,
  W: 7 * 86_400,
  M: 30 * 86_400,
}

// Volatilidade por passo, calibrada à resolução (passos maiores → movimentos maiores).
const STEP_VOL: Record<string, number> = {
  '1': 0.0008,
  '5': 0.0015,
  '15': 0.0025,
  '30': 0.0035,
  '60': 0.005,
  D: 0.018,
  W: 0.035,
  M: 0.07,
}

const MAX_POINTS = 200

function isWeekend(unixSec: number): boolean {
  const day = new Date(unixSec * 1000).getUTCDay()
  return day === 0 || day === 6
}

/** Constrói os timestamps na cadência da resolução, saltando fins de semana para D/W. */
function buildTimestamps(resolution: string, from: number, to: number): number[] {
  const step = STEP_SECONDS[resolution] ?? STEP_SECONDS.D
  const skipWeekends = resolution === 'D' || resolution === 'W'
  const out: number[] = []
  for (let t = from; t <= to; t += step) {
    if (skipWeekends && isWeekend(t)) continue
    out.push(t)
  }
  // manter apenas os pontos mais recentes para não gerar arrays enormes (intraday)
  return out.length > MAX_POINTS ? out.slice(out.length - MAX_POINTS) : out
}

/** Preço inicial plausível (20–520) derivado do símbolo, estável entre sessões. */
function startPrice(symbol: string): number {
  const h = hashString(symbol.toUpperCase())
  return 20 + (h % 500)
}

export function mockCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): FinnhubCandles {
  const t = buildTimestamps(resolution, from, to)
  if (t.length === 0) {
    return { s: 'no_data', t: [], o: [], h: [], l: [], c: [], v: [] }
  }

  // Seed combinando símbolo + resolução → série estável por timeframe.
  const rng = mulberry32(hashString(`${symbol.toUpperCase()}|${resolution}`))
  const vol = STEP_VOL[resolution] ?? STEP_VOL.D
  const drift = (rng() - 0.5) * vol * 0.3 // leve viés direcional por símbolo

  const o: number[] = []
  const h: number[] = []
  const l: number[] = []
  const c: number[] = []
  const v: number[] = []

  let prevClose = startPrice(symbol)
  for (let i = 0; i < t.length; i++) {
    const open = i === 0 ? prevClose * (1 - vol * 0.5) : prevClose
    // passo log-normal (GBM discretizado)
    const ret = drift - (vol * vol) / 2 + vol * gaussian(rng)
    const close = Math.max(0.01, open * Math.exp(ret))

    const hi = Math.max(open, close) * (1 + Math.abs(gaussian(rng)) * vol * 0.5)
    const lo = Math.min(open, close) * (1 - Math.abs(gaussian(rng)) * vol * 0.5)
    const volume = Math.round(500_000 + rng() * 5_000_000)

    o.push(round2(open))
    c.push(round2(close))
    h.push(round2(hi))
    l.push(round2(lo))
    v.push(volume)
    prevClose = close
  }

  return { s: 'ok', t, o, h, l, c, v }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
