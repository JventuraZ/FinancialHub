import { useQuery } from '@tanstack/react-query'
import { fetchQuote } from '../../lib/finnhub/endpoints'
import { FINNHUB_KEYS } from './queryKeys'

export function useQuote(symbol: string | null) {
  return useQuery({
    queryKey: FINNHUB_KEYS.quote(symbol ?? ''),
    queryFn: () => fetchQuote(symbol!),
    enabled: !!symbol,
    staleTime: 30_000,
  })
}
