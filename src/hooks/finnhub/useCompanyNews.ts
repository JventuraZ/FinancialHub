import { useQuery } from '@tanstack/react-query'
import { fetchCompanyNews } from '../../lib/finnhub/endpoints'
import { FINNHUB_KEYS } from './queryKeys'

export function useCompanyNews(symbol: string | null, from: string, to: string) {
  return useQuery({
    queryKey: FINNHUB_KEYS.companyNews(symbol ?? '', from, to),
    queryFn: () => fetchCompanyNews(symbol!, from, to),
    enabled: !!symbol && !!from && !!to,
  })
}
