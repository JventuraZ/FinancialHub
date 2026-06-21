import type { Timeframe } from '../../types/domain'

export function daysAgo(n: number): number {
  return Math.floor((Date.now() - n * 86_400_000) / 1000)
}

export function timeframeToRange(tf: Timeframe): { from: number; to: number; resolution: string } {
  const to = Math.floor(Date.now() / 1000)
  switch (tf) {
    case '1D': return { from: daysAgo(1), to, resolution: '5' }
    case '1W': return { from: daysAgo(7), to, resolution: '15' }
    case '1M': return { from: daysAgo(30), to, resolution: 'D' }
    case '3M': return { from: daysAgo(90), to, resolution: 'D' }
    case '1Y': return { from: daysAgo(365), to, resolution: 'W' }
  }
}

export function formatCandleDate(unix: number, resolution: string): string {
  const d = new Date(unix * 1000)
  if (resolution === '5' || resolution === '15') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function toDateString(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString([], {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function isoDateDaysAgo(n: number): string {
  const d = new Date(Date.now() - n * 86_400_000)
  return d.toISOString().split('T')[0]
}
