import { useQuery } from '@tanstack/react-query'
import { fetchCompanyProfile } from '../../lib/finnhub/endpoints'
import { FINNHUB_KEYS } from './queryKeys'

export function useCompanyProfile(symbol: string | null) {
  return useQuery({
    queryKey: FINNHUB_KEYS.profile(symbol ?? ''),
    queryFn: () => fetchCompanyProfile(symbol!),
    enabled: !!symbol,
  })
}
