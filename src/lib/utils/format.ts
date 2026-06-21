export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  return (value >= 0 ? '+' : '') + value.toFixed(2) + '%'
}

export function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1e12) return (value / 1e12).toFixed(2) + 'T'
  if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(2) + 'B'
  if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(2) + 'M'
  if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(2) + 'K'
  return value.toFixed(2)
}

export function formatPopulation(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}
