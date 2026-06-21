import { useQuery } from '@tanstack/react-query'
import { fetchSymbols } from '../../lib/finnhub/endpoints'
import { FINNHUB_KEYS } from './queryKeys'

export function useSymbols(exchange = 'US') {
  return useQuery({
    queryKey: FINNHUB_KEYS.symbols(exchange),
    queryFn: () => fetchSymbols(exchange),
    staleTime: 24 * 60 * 60 * 1000,
  })
}
