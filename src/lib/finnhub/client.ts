const BASE = '/api/finnhub'

export async function finnhubGet<T>(
  path: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    qs.set(k, String(v))
  }
  const query = qs.toString() ? `?${qs.toString()}` : ''
  const res = await fetch(`${BASE}${path}${query}`)
  if (!res.ok) throw new Error(`Finnhub ${res.status}: ${path}`)
  return res.json() as Promise<T>
}
